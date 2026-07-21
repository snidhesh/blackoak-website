import { NextRequest, NextResponse } from 'next/server';
import { careerApplicationSchema, MAX_CV_SIZE, ALLOWED_CV_TYPES, ALLOWED_CV_EXTENSIONS } from '@/lib/schemas';
import { sendFormEmail, renderFieldsTable, escapeHtml } from '@/lib/email';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { FIELD_ERROR_CODES, FORM_ERROR_CODES } from '@/lib/error-codes';

const FIELD_CODE_MAP: Record<string, string> = {
  firstName: FIELD_ERROR_CODES.firstNameMin,
  lastName: FIELD_ERROR_CODES.lastNameMin,
  phone: FIELD_ERROR_CODES.phoneInvalid,
  email: FIELD_ERROR_CODES.emailInvalid,
  message: FIELD_ERROR_CODES.messageMin,
};

// Magic-byte signatures for the three CV formats we accept.
// Defends against renamed executables that spoof both MIME and extension.
async function hasValidMagicBytes(file: File, ext: string): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (ext === '.pdf') {
    // "%PDF-"
    return header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
  }
  if (ext === '.docx') {
    // ZIP archive header (docx is a zip container): "PK\x03\x04"
    return header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;
  }
  if (ext === '.doc') {
    // Microsoft OLE compound file: D0 CF 11 E0 A1 B1 1A E1
    return (
      header[0] === 0xd0 && header[1] === 0xcf && header[2] === 0x11 && header[3] === 0xe0 &&
      header[4] === 0xa1 && header[5] === 0xb1 && header[6] === 0x1a && header[7] === 0xe1
    );
  }
  return false;
}

// Strip path components, control chars, and shell metacharacters from the
// uploaded filename before it becomes an email attachment name.
function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'cv';
  return base.replace(/[\x00-\x1f<>:"|?*]/g, '_').slice(0, 120) || 'cv';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'careers-apply');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.rateLimited }] },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const honeypot = formData.get('_honeypot') as string;
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    const textData = {
      firstName: formData.get('firstName') as string || '',
      lastName: formData.get('lastName') as string || '',
      phone: formData.get('phone') as string || '',
      email: formData.get('email') as string || '',
      message: formData.get('message') as string || '',
      jobSlug: formData.get('jobSlug') as string || '',
      jobTitle: formData.get('jobTitle') as string || '',
      _honeypot: '',
    };

    const result = careerApplicationSchema.safeParse(textData);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        code: FIELD_CODE_MAP[issue.path[0] as string] ?? FIELD_ERROR_CODES.firstNameMin,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const cvFile = formData.get('cvFile') as File | null;
    if (cvFile && cvFile.size > 0) {
      if (cvFile.size > MAX_CV_SIZE) {
        return NextResponse.json(
          { success: false, errors: [{ field: 'cvFile', code: FIELD_ERROR_CODES.fileTooLarge }] },
          { status: 400 }
        );
      }

      const ext = '.' + (cvFile.name.split('.').pop()?.toLowerCase() ?? '');
      const isValidType = ALLOWED_CV_TYPES.includes(cvFile.type);
      const isValidExt = ALLOWED_CV_EXTENSIONS.includes(ext);
      const isValidMagic = await hasValidMagicBytes(cvFile, ext);

      if (!isValidType || !isValidExt || !isValidMagic) {
        return NextResponse.json(
          { success: false, errors: [{ field: 'cvFile', code: FIELD_ERROR_CODES.fileTypeInvalid }] },
          { status: 400 }
        );
      }
    }

    const data = result.data;
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const safeCvName = cvFile && cvFile.size > 0 ? sanitizeFilename(cvFile.name) : null;
    const table = renderFieldsTable([
      ['Name', fullName],
      ['Email', data.email],
      ['Phone', data.phone],
      ['Position', data.jobTitle],
      ['Slug', data.jobSlug],
      ['CV', safeCvName ? `${safeCvName} (attached)` : 'Not provided'],
      ['Submitted', new Date().toISOString()],
    ]);
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111">
        <h2 style="margin:0 0 12px;font-size:18px">New Career Application</h2>
        ${table}
        <h3 style="margin:20px 0 6px;font-size:15px">Message</h3>
        <div style="white-space:pre-wrap;font-size:14px;line-height:1.5;color:#333">${escapeHtml(data.message)}</div>
      </div>
    `;

    const attachments = cvFile && cvFile.size > 0 && safeCvName
      ? [{ filename: safeCvName, content: Buffer.from(await cvFile.arrayBuffer()) }]
      : undefined;

    const emailResult = await sendFormEmail({
      subject: `Career Application — ${data.jobTitle} — ${fullName}`,
      html,
      replyTo: data.email,
      attachments,
    });

    if (!emailResult.success) {
      console.error('[api/careers/apply] Email send failed:', emailResult.error);
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.submitFailed }] },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/careers/apply] Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ field: '_form', code: FORM_ERROR_CODES.unexpectedError }] },
      { status: 500 }
    );
  }
}
