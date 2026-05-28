'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createContactSchema, ALLOWED_UTM_KEYS, type ContactFormData } from '@/lib/schemas';
import { FORM_ERROR_CODES } from '@/lib/error-codes';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface ContactFormProps {
  endpoint?: string;
  projectSlug?: string;
  projectName?: string;
  reference?: string;
  submitLabel?: string;
}

function readUtmFromLocation(): Record<string, string> | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ALLOWED_UTM_KEYS) {
    const v = params.get(key);
    if (v) out[key] = v.slice(0, 200);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export default function ContactForm({
  endpoint = '/api/contact',
  projectSlug,
  projectName,
  reference,
  submitLabel,
}: ContactFormProps) {
  const t = useTranslations('forms');
  const tv = useTranslations('validation');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const schema = useMemo(() => createContactSchema({
    firstNameMin: tv('firstNameMin'),
    lastNameMin: tv('lastNameMin'),
    phoneInvalid: tv('phoneInvalid'),
    emailInvalid: tv('emailInvalid'),
    messageMin: tv('messageMin'),
    consentRequired: tv('consentRequired'),
  }), [tv]);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: { _honeypot: '', consent: false },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = { ...data };
      if (projectSlug) body.projectSlug = projectSlug;
      if (projectName) body.projectName = projectName;
      if (reference) body.reference = reference;
      const utm = readUtmFromLocation();
      if (utm) body.utm = utm;

      let response: Response | undefined;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch {
        // Static export — API routes unavailable; continue to thank-you
      }

      if (response && !response.ok) {
        const result = await response.json().catch(() => null);
        if (result?.errors) {
          const validFields = new Set(['firstName', 'lastName', 'phone', 'email', 'message', 'consent']);
          for (const err of result.errors) {
            if (err.field === '_form') {
              const code = Object.values(FORM_ERROR_CODES).includes(err.code)
                ? err.code
                : FORM_ERROR_CODES.unexpectedError;
              setError(t(code));
            } else if (validFields.has(err.field)) {
              setFieldError(err.field as keyof ContactFormData, { message: tv(err.code) });
            }
          }
        } else {
          setError(t('errorGeneric'));
        }
        return;
      }

      router.push('/thank-you');
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('firstName')}
          placeholder={t('placeholder')}
          required
          {...register('firstName')}
          error={errors.firstName ? tv('firstNameMin') : undefined}
        />
        <Input
          label={t('lastName')}
          placeholder={t('placeholder')}
          required
          {...register('lastName')}
          error={errors.lastName ? tv('lastNameMin') : undefined}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('phone')} <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <div className="flex items-center gap-1.5 px-3 bg-[#f5f5f5] border border-[#d1d5db] border-e-0 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/contact/uae-flag.svg" alt={t('phoneCountryFlag')} className="w-5 h-5" />
              <span className="text-[13.7px] text-[#374151]">{t('phoneCountryCode')}</span>
            </div>
            <div className="flex-1" dir="ltr">
              <Input
                placeholder={t('placeholder')}
                {...register('phone')}
                error={errors.phone ? tv('phoneInvalid') : undefined}
              />
            </div>
          </div>
        </div>
        <Input
          label={t('email')}
          type="email"
          placeholder={t('placeholder')}
          required
          {...register('email')}
          error={errors.email ? tv('emailInvalid') : undefined}
        />
      </div>
      <Textarea
        label={t('message')}
        placeholder={t('placeholder')}
        required
        {...register('message')}
        error={errors.message ? tv('messageMin') : undefined}
      />

      {/* Honeypot */}
      <div className="hp-field" aria-hidden="true">
        <input type="text" {...register('_honeypot')} tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('consent')}
            className="mt-[3px] h-4 w-4 shrink-0 accent-black"
          />
          <span className="text-[12px] leading-[16px] text-[#525252]">
            {t.rich('consentText', {
              privacyPolicy: (chunks) => <Link href="/privacy-policy" className="underline text-[#0a0a0a]">{chunks}</Link>,
              termsOfUse: (chunks) => <Link href="/terms-of-service" className="underline text-[#0a0a0a]">{chunks}</Link>,
            })}
          </span>
        </label>
        {errors.consent && (
          <p className="mt-1 text-sm text-red-500">{tv('consentRequired')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-black border-2 border-[#030303] text-white text-[12px] font-medium uppercase tracking-wider h-[48px] w-[200px] flex items-center justify-center hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? t('submitting') : (submitLabel || t('submitEnquiry'))}
      </button>
    </form>
  );
}
