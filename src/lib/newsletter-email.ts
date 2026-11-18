// The verification email sent to a visitor unlocking BlackOak intelligence content.
// Copy lives here rather than in src/messages because it is rendered server-side
// in a route handler, outside next-intl, and must not carry ICU escaping.

import { escapeHtml } from '@/lib/email';
import { CODE_TTL_MS } from '@/lib/newsletter-token';
import { BRIEFING_PUBLIC_ORIGIN } from '@/lib/constants';

// White wordmark, the same file the Monday edition email uses. Mail clients do not
// render SVG, hence the PNG; the alt text carries the name when images are off.
const LOGO_URL = `${BRIEFING_PUBLIC_ORIGIN}/images/logo-white.png`;

type EmailLocale = 'en' | 'fr' | 'ar';

interface Copy {
  subject: (code: string) => string;
  greeting: (firstName: string) => string;
  thanks: string;
  intro: string;
  closing: (minutes: number) => string;
  signoff: string;
}

const COPY: Record<EmailLocale, Copy> = {
  en: {
    subject: (code) => `${code} is your BlackOak verification code`,
    greeting: (name) => `Dear ${name},`,
    thanks: 'Thank you for your interest in the BlackOak market briefing.',
    intro:
      'To confirm your email address and unlock the full analysis, please enter the verification code below on the BlackOak website:',
    closing: (m) => `It expires in ${m} minutes. If you didn't request it, please ignore this email.`,
    signoff: 'BlackOak Real Estate',
  },
  fr: {
    subject: (code) => `${code} est votre code de vérification BlackOak`,
    greeting: (name) => `Bonjour ${name},`,
    thanks: "Nous vous remercions de l'intérêt que vous portez au briefing de marché BlackOak.",
    intro:
      "Pour confirmer votre adresse e-mail et débloquer l'analyse complète, veuillez saisir le code de vérification ci-dessous sur le site BlackOak :",
    closing: (m) =>
      `Il expire dans ${m} minutes. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.`,
    signoff: 'BlackOak Real Estate',
  },
  ar: {
    subject: (code) => `${code} هو رمز التحقق الخاص بك من BlackOak`,
    greeting: (name) => `عزيزي/عزيزتي ${name}،`,
    thanks: 'نشكرك على اهتمامك بموجز السوق من BlackOak.',
    intro:
      'لتأكيد عنوان بريدك الإلكتروني والاطّلاع على التحليل الكامل، يُرجى إدخال رمز التحقق أدناه في موقع BlackOak:',
    closing: (m) => `تنتهي صلاحية الرمز خلال ${m} دقيقة. إذا لم تطلبه، يُرجى تجاهل هذه الرسالة.`,
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
    copy.thanks,
    '',
    copy.intro,
    '',
    `    ${input.code}`,
    '',
    copy.closing(minutes),
    '',
    copy.signoff,
  ].join('\n');

  // Table-free, inline-styled, and light enough for every mail client. The code
  // itself is always left-to-right, including inside the Arabic email.
  const html = `
    <div dir="${dir}" style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#181a20">
      <div style="max-width:480px;margin:0 auto;background:#ffffff">
        <div style="background:#181a20;padding:24px 32px" dir="ltr"><img src="${LOGO_URL}" width="150" height="35" alt="BlackOak Real Estate" style="display:block;border:0;width:150px;height:35px;color:#ffffff;font-size:15px;letter-spacing:2px;text-transform:uppercase"></div>
        <div style="padding:32px">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5">${copy.greeting(name)}</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5">${escapeHtml(copy.thanks)}</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5">${escapeHtml(copy.intro)}</p>
          <div dir="ltr" style="margin:0 0 24px;padding:20px 0;border-top:1px solid #C6A55C;border-bottom:1px solid #C6A55C;text-align:center;font-size:34px;letter-spacing:10px;font-weight:300;color:#181a20">${escapeHtml(
            input.code
          )}</div>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#5F6368">${escapeHtml(copy.closing(minutes))}</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#181a20">${escapeHtml(copy.signoff)}</p>
        </div>
      </div>
    </div>
  `;

  return { subject: copy.subject(input.code), html, text };
}
