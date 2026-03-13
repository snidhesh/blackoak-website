import { NextRequest, NextResponse } from 'next/server';
import { careerApplicationSchema, MAX_CV_SIZE, ALLOWED_CV_TYPES, ALLOWED_CV_EXTENSIONS } from '@/lib/schemas';
import { forwardMultipartToWebhook } from '@/lib/webhook';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(ip, 'careers-apply');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', message: 'Too many requests. Please try again later.' }] },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    // Honeypot check
    const honeypot = formData.get('_honeypot') as string;
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Extract text fields
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

    // Validate text fields
    const result = careerApplicationSchema.safeParse(textData);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Validate CV file if present
    const cvFile = formData.get('cvFile') as File | null;
    if (cvFile && cvFile.size > 0) {
      if (cvFile.size > MAX_CV_SIZE) {
        return NextResponse.json(
          { success: false, errors: [{ field: 'cvFile', message: 'File size must be less than 4MB' }] },
          { status: 400 }
        );
      }

      const isValidType = ALLOWED_CV_TYPES.includes(cvFile.type);
      const ext = '.' + cvFile.name.split('.').pop()?.toLowerCase();
      const isValidExt = ALLOWED_CV_EXTENSIONS.includes(ext);

      if (!isValidType && !isValidExt) {
        return NextResponse.json(
          { success: false, errors: [{ field: 'cvFile', message: 'Only PDF, DOC, and DOCX files are allowed' }] },
          { status: 400 }
        );
      }
    }

    // Forward multipart to webhook (pass-through)
    const forwardData = new FormData();
    formData.forEach((value, key) => {
      forwardData.append(key, value);
    });

    const webhookResult = await forwardMultipartToWebhook(forwardData, 'career-application');

    if (!webhookResult.success) {
      console.error('[api/careers/apply] Webhook failed:', webhookResult.error);
      return NextResponse.json(
        { success: false, errors: [{ field: '_form', message: 'Failed to submit. Please try again.' }] },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/careers/apply] Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ field: '_form', message: 'An unexpected error occurred.' }] },
      { status: 500 }
    );
  }
}
