// The verification email sent to a visitor unlocking BlackOak intelligence content.
// Copy lives here rather than in src/messages because it is rendered server-side
// in a route handler, outside next-intl, and must not carry ICU escaping.

import { escapeHtml } from '@/lib/email';
import { CODE_TTL_MS } from '@/lib/newsletter-token';

type EmailLocale = 'en' | 'fr' | 'ar';

interface Copy {
  subject: (code: string) => string;
  greeting: (firstName: string) => string;
  intro: string;
  expiry: (minutes: number) => string;
  ignore: string;
  signoff: string;
}

const COPY: Record<EmailLocale, Copy> = {
  en: {
    subject: (code) => `${code} is your BlackOak verification code`,
    greeting: (name) => `Hello ${name},`,
    intro: 'Enter this code on the BlackOak website to unlock the full analysis:',
    expiry: (m) => `The code expires in ${m} minutes.`,
    ignore: "If you didn't request this, you can ignore this email. Nobody is subscribed until the code is entered.",
    signoff: 'BlackOak Real Estate',
  },
  fr: {
    subject: (code) => `${code} est votre code de vérification BlackOak`,
    greeting: (name) => `Bonjour ${name},`,
    intro: "Saisissez ce code sur le site BlackOak pour débloquer l'analyse complète :",
    expiry: (m) => `Ce code expire dans ${m} minutes.`,
    ignore:
      "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Aucun abonnement n'est créé tant que le code n'est pas saisi.",
    signoff: 'BlackOak Real Estate',
  },
  ar: {
    subject: (code) => `${code} هو رمز التحقق الخاص بك من BlackOak`,
    greeting: (name) => `مرحباً ${name}،`,
    intro: 'أدخل هذا الرمز في موقع BlackOak للاطّلاع على التحليل الكامل:',
    expiry: (m) => `تنتهي صلاحية الرمز خلال ${m} دقيقة.`,
    ignore: 'إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة. لن يتم أي اشتراك ما لم يُدخَل الرمز.',
    signoff: 'BlackOak للعقارات',
  },
};

export function renderVerificationEmail(input: { firstName: string; code: string; locale?: EmailLocale }): {
  subject: string;
  html: string;
  text: string;
} {
  const locale = input.locale ?? 'en';
  const copy = COPY[locale];
  const minutes = Math.round(CODE_TTL_MS / 60_000);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const name = escapeHtml(input.firstName);

  const text = [
    copy.greeting(input.firstName),
    '',
    copy.intro,
    '',
    `    ${input.code}`,
    '',
    copy.expiry(minutes),
    '',
    copy.ignore,
    '',
    copy.signoff,
  ].join('\n');

  // Table-free, inline-styled, and light enough for every mail client. The code
  // itself is always left-to-right, including inside the Arabic email.
  const html = `
    <div dir="${dir}" style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#181a20">
      <div style="max-width:480px;margin:0 auto;background:#ffffff">
        <div style="background:#181a20;padding:24px 32px;color:#ffffff;font-size:15px;letter-spacing:2px;text-transform:uppercase" dir="ltr">BlackOak Real Estate</div>
        <div style="padding:32px">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5">${copy.greeting(name)}</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5">${escapeHtml(copy.intro)}</p>
          <div dir="ltr" style="margin:0 0 24px;padding:20px 0;border-top:1px solid #C6A55C;border-bottom:1px solid #C6A55C;text-align:center;font-size:34px;letter-spacing:10px;font-weight:300;color:#181a20">${escapeHtml(
            input.code
          )}</div>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#5F6368">${escapeHtml(copy.expiry(minutes))}</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#5F6368">${escapeHtml(copy.ignore)}</p>
        </div>
      </div>
    </div>
  `;

  return { subject: copy.subject(input.code), html, text };
}
