// The welcome email sent once to a new subscriber, right after they are added to
// the list (verified code, or straight away when the code is switched off).
// Copy lives here for the same reason as newsletter-email.ts: it is rendered in a
// route handler, outside next-intl.

import { escapeHtml, sendVisitorEmail } from '@/lib/email';
import { createUnsubscribeToken } from '@/lib/briefing-link';
import { BRIEFING_PUBLIC_ORIGIN, BRIEFING_UNSUBSCRIBE_PATH } from '@/lib/constants';

type EmailLocale = 'en' | 'fr' | 'ar';

interface Copy {
  subject: string;
  greeting: (firstName: string) => string;
  paragraphs: string[];
  regards: string;
  team: string;
  footer: string;
  unsubscribe: string;
}

const COPY: Record<EmailLocale, Copy> = {
  en: {
    subject: 'Welcome to the BlackOak Briefing',
    greeting: (name) => `Hi ${name},`,
    paragraphs: [
      'Thank you for subscribing to the BlackOak Briefing.',
      'You’ll receive our weekly email every Monday, featuring the latest research, market updates and perspectives on Dubai’s property market, including emerging trends, new developments and the factors shaping investment decisions.',
      'Our aim is simple: to help you cut through the noise and make more informed property decisions.',
      'Thank you for joining us. We look forward to keeping you informed.',
    ],
    regards: 'Kind regards,',
    team: 'The BlackOak Team',
    footer:
      'You’re receiving this email because you subscribed to the BlackOak Briefing. You can unsubscribe at any time using the link below.',
    unsubscribe: 'Unsubscribe',
  },
  fr: {
    subject: 'Bienvenue au BlackOak Briefing',
    greeting: (name) => `Bonjour ${name},`,
    paragraphs: [
      'Merci de vous être abonné(e) au BlackOak Briefing.',
      'Vous recevrez notre e-mail hebdomadaire chaque lundi, avec les dernières études, actualités et analyses du marché immobilier de Dubaï, notamment les tendances émergentes, les nouveaux projets et les facteurs qui orientent les décisions d’investissement.',
      'Notre objectif est simple : vous aider à faire le tri dans l’information et à prendre des décisions immobilières plus éclairées.',
      'Merci de nous avoir rejoints. Nous serons heureux de vous tenir informé(e).',
    ],
    regards: 'Cordialement,',
    team: 'L’équipe BlackOak',
    footer:
      'Vous recevez cet e-mail parce que vous vous êtes abonné(e) au BlackOak Briefing. Vous pouvez vous désabonner à tout moment à l’aide du lien ci-dessous.',
    unsubscribe: 'Se désabonner',
  },
  ar: {
    subject: 'مرحباً بك في موجز BlackOak',
    greeting: (name) => `مرحباً ${name}،`,
    paragraphs: [
      'نشكرك على اشتراكك في موجز BlackOak.',
      'ستصلك رسالتنا الأسبوعية كل يوم اثنين، وتتضمن أحدث الأبحاث ومستجدات السوق والرؤى حول سوق العقارات في دبي، بما في ذلك الاتجاهات الناشئة والمشاريع الجديدة والعوامل التي تؤثر في قرارات الاستثمار.',
      'هدفنا بسيط: أن نساعدك على تجاوز الضجيج واتخاذ قرارات عقارية أكثر استنارة.',
      'شكراً لانضمامك إلينا. نتطلع إلى إبقائك على اطّلاع.',
    ],
    regards: 'مع أطيب التحيات،',
    team: 'فريق BlackOak',
    footer:
      'تصلك هذه الرسالة لأنك اشتركت في موجز BlackOak. يمكنك إلغاء الاشتراك في أي وقت باستخدام الرابط أدناه.',
    unsubscribe: 'إلغاء الاشتراك',
  },
};

export function renderWelcomeEmail(input: { firstName: string; unsubscribeLink: string; locale?: EmailLocale }): {
  subject: string;
  html: string;
  text: string;
} {
  const locale = input.locale ?? 'en';
  const copy = COPY[locale];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const text = [
    copy.greeting(input.firstName),
    '',
    ...copy.paragraphs.flatMap((p) => [p, '']),
    copy.regards,
    copy.team,
    '',
    copy.footer,
    '',
    `${copy.unsubscribe}: ${input.unsubscribeLink}`,
  ].join('\n');

  const paragraph = (value: string) =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5">${escapeHtml(value)}</p>`;

  // Same light, inline-styled layout as the verification email it follows.
  const html = `
    <div dir="${dir}" style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#181a20">
      <div style="max-width:480px;margin:0 auto;background:#ffffff">
        <div style="background:#181a20;padding:24px 32px;color:#ffffff;font-size:15px;letter-spacing:2px;text-transform:uppercase" dir="ltr">BlackOak Real Estate</div>
        <div style="padding:32px">
          ${paragraph(copy.greeting(input.firstName))}
          ${copy.paragraphs.map(paragraph).join('\n          ')}
          <p style="margin:8px 0 0;font-size:16px;line-height:1.5">${escapeHtml(copy.regards)}<br>${escapeHtml(copy.team)}</p>
        </div>
        <div style="padding:20px 32px 24px;border-top:1px solid #C6A55C;font-size:12px;line-height:1.6;color:#5F6368">
          <p style="margin:0 0 10px">${escapeHtml(copy.footer)}</p>
          <p style="margin:0"><a href="${escapeHtml(input.unsubscribeLink)}" style="color:#5F6368;text-decoration:underline">${escapeHtml(copy.unsubscribe)}</a></p>
        </div>
      </div>
    </div>
  `;

  return { subject: copy.subject, html, text };
}

/**
 * Best-effort: the subscription already succeeded, so a failure here is logged
 * and never surfaced to the visitor.
 */
export async function sendWelcomeEmail(input: { email: string; firstName: string; locale?: EmailLocale }): Promise<void> {
  try {
    const token = await createUnsubscribeToken(input.email);
    if (!token) {
      console.error('[newsletter-welcome] No unsubscribe token (INTEL_ACCESS_SECRET); welcome email not sent');
      return;
    }
    const unsubscribeLink = `${BRIEFING_PUBLIC_ORIGIN}${BRIEFING_UNSUBSCRIBE_PATH}?u=${token}`;
    const email = renderWelcomeEmail({ firstName: input.firstName, unsubscribeLink, locale: input.locale });
    const result = await sendVisitorEmail({
      to: input.email,
      ...email,
      headers: {
        'List-Unsubscribe': `<${unsubscribeLink}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      devConsoleFallback: true,
    });
    if (!result.success) console.error('[newsletter-welcome] Welcome email failed:', result.error);
  } catch (error) {
    console.error('[newsletter-welcome] Welcome email failed:', error);
  }
}
