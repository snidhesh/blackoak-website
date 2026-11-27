'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { createNewsletterSchema, type NewsletterFormData } from '@/lib/schemas';
import { FORM_ERROR_CODES } from '@/lib/error-codes';
import Input from '@/components/ui/Input';
import PhoneCountryCodeSelect, { DEFAULT_DIAL_ISO, getDialCodeForIso } from '@/components/ui/PhoneCountryCodeSelect';
import { readUtmFromLocation, readUnitFromLocation } from '@/components/sections/ContactForm';
import AgentCard from '@/components/sections/AgentCard';
import type { ProjectAgent } from '@/types/project';

interface ListingContactCardProps {
  projectSlug: string;
  projectName: string;
  reference?: string;
  /** Listing agent, shown in the card when the listing has one */
  agent?: Pick<ProjectAgent, 'name' | 'position' | 'brn' | 'profileImage'> | null;
  /** wa.me link with the enquiry message already filled in */
  whatsappUrl: string;
}

const FIELD_NAMES = new Set(['firstName', 'lastName', 'email', 'phone', 'consent']);

/**
 * Contact card on a listing page: the listing agent, a "Contact us" button and
 * a WhatsApp button. "Contact us" swaps in a short enquiry form in place (name,
 * email, optional phone, consent). The form sends to /api/project-enquiry like
 * the full enquiry form, so the lead reaches the CRM with the listing attached.
 */
export default function ListingContactCard({
  projectSlug,
  projectName,
  reference,
  agent,
  whatsappUrl,
}: ListingContactCardProps) {
  const t = useTranslations('pages.projectDetail.contactCard');
  const tForms = useTranslations('forms');
  const tv = useTranslations('validation');
  const router = useRouter();

  // The button addresses the agent by first name ("Contact Flora"); with no
  // agent on the listing it falls back to "Contact us".
  const agentFirstName = agent?.name.trim().split(/\s+/)[0];

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneCountryIso, setPhoneCountryIso] = useState(DEFAULT_DIAL_ISO);

  // Same fields as the subscribe form: name, email, optional phone, consent.
  const schema = useMemo(
    () =>
      createNewsletterSchema({
        firstNameMin: tv('firstNameMin'),
        lastNameMin: tv('lastNameMin'),
        emailInvalid: tv('emailInvalid'),
        phoneInvalid: tv('phoneInvalid'),
        consentRequired: tv('consentRequired'),
      }),
    [tv]
  );

  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', consent: false, _honeypot: '' },
  });

  const close = () => {
    setOpen(false);
    setError(null);
    reset();
  };

  const onSubmit = async (data: NewsletterFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const phone = data.phone?.trim();
      const body: Record<string, unknown> = {
        ...data,
        phone: phone ? `${getDialCodeForIso(phoneCountryIso)} ${phone}` : '',
        projectSlug,
        projectName,
      };
      const unit = readUnitFromLocation();
      const effectiveReference = [reference, unit].filter(Boolean).join(' — ') || undefined;
      if (effectiveReference) body.reference = effectiveReference;
      const utm = readUtmFromLocation();
      if (utm) body.utm = utm;

      const response = await fetch('/api/project-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        if (result?.errors) {
          for (const err of result.errors) {
            if (err.field === '_form') {
              const code = Object.values(FORM_ERROR_CODES).includes(err.code)
                ? err.code
                : FORM_ERROR_CODES.unexpectedError;
              setError(tForms(code));
            } else if (FIELD_NAMES.has(err.field)) {
              setFieldError(err.field as keyof NewsletterFormData, { message: tv(err.code) });
            }
          }
        } else {
          setError(tForms('errorGeneric'));
        }
        return;
      }

      router.push('/thank-you');
    } catch {
      setError(tForms('errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 bg-white p-7 md:p-8">
      <p className="text-[11px] tracking-[3px] uppercase text-gray-500">{t('label')}</p>
      <h2 className="text-[28px] font-light leading-tight mt-3">{t('heading')}</h2>
      <p className="text-sm text-[#5f6368] leading-relaxed mt-3">{t('description')}</p>

      {agent && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <AgentCard agent={agent} />
        </div>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 flex items-center justify-center w-full h-[50px] bg-black border-2 border-black text-white text-xs font-medium uppercase tracking-[2px] hover:bg-transparent hover:text-black transition-colors"
        >
          {agentFirstName ? t('buttonAgent', { name: agentFirstName }) : t('button')}
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder={tForms('firstName')}
              aria-label={tForms('firstName')}
              autoComplete="given-name"
              autoFocus
              {...register('firstName')}
              error={errors.firstName ? tv('firstNameMin') : undefined}
            />
            <Input
              placeholder={tForms('lastName')}
              aria-label={tForms('lastName')}
              autoComplete="family-name"
              {...register('lastName')}
              error={errors.lastName ? tv('lastNameMin') : undefined}
            />
          </div>
          <Input
            type="email"
            placeholder={tForms('email')}
            aria-label={tForms('email')}
            autoComplete="email"
            {...register('email')}
            error={errors.email ? tv('emailInvalid') : undefined}
          />
          <div className="flex">
            <PhoneCountryCodeSelect
              value={phoneCountryIso}
              onChange={setPhoneCountryIso}
              ariaLabel={tForms('phoneCountryFlag')}
            />
            <div className="flex-1 min-w-0" dir="ltr">
              <Input
                type="tel"
                placeholder={t('phoneOptional')}
                aria-label={t('phoneOptional')}
                autoComplete="tel-national"
                {...register('phone')}
                error={errors.phone ? tv('phoneInvalid') : undefined}
              />
            </div>
          </div>

          {/* Honeypot */}
          <div className="hp-field" aria-hidden="true">
            <input type="text" {...register('_honeypot')} tabIndex={-1} autoComplete="off" />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" {...register('consent')} className="mt-[3px] h-4 w-4 shrink-0 accent-black" />
              <span className="text-[12px] leading-[16px] text-[#525252]">
                {tForms.rich('consentText', {
                  privacyPolicy: (chunks) => (
                    <Link href="/privacy-policy" className="underline text-[#0a0a0a]">
                      {chunks}
                    </Link>
                  ),
                  termsOfUse: (chunks) => (
                    <Link href="/terms-of-service" className="underline text-[#0a0a0a]">
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>
            {errors.consent && <p className="mt-1 text-xs text-red-500">{tv('consentRequired')}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center gap-5 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center h-[50px] bg-black border-2 border-black text-white text-xs font-medium uppercase tracking-[2px] hover:bg-transparent hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? tForms('submitting') : t('submit')}
            </button>
            <button
              type="button"
              onClick={close}
              className="h-[50px] px-1 text-xs font-medium uppercase tracking-[2px] text-gray-500 hover:text-black transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 w-full h-[50px] bg-[#25D366] text-white text-xs font-medium uppercase tracking-[2px] hover:bg-[#1ebe57] transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {t('whatsapp')}
      </a>
    </div>
  );
}
