'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { createNewsletterSchema, ALLOWED_UTM_KEYS, type NewsletterFormData } from '@/lib/schemas';
import { FORM_ERROR_CODES, NEWSLETTER_ERROR_CODES } from '@/lib/error-codes';
import type { SubscribeSource } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  loadPending,
  rememberSubscription,
  savePending,
  type Pending,
  type SignupBody,
} from '@/lib/unlock-storage';
import Input from '@/components/ui/Input';

// Posted with the trailing slash (next.config has trailingSlash: true), which
// skips the 308 hop the other forms take.
const REQUEST_CODE_ENDPOINT = '/api/newsletter/';
const VERIFY_ENDPOINT = '/api/newsletter/verify/';

const CODE_PATTERN = /^\d{6}$/;
const RESEND_COOLDOWN_MS = 30_000;
const FIELD_NAMES = new Set(['firstName', 'lastName', 'email', 'consent']);

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

interface SubscribeUnlockPanelProps {
  open: boolean;
  onToggle: () => void;
  panelId: string;
  unlockLabel: string;
  children: React.ReactNode;
}

// The black band with the "unlock" toggle and the white card that holds the form.
// Hidden by globals.css once <html data-mi-unlocked> is set for returning subscribers.
export function SubscribeUnlockPanel({ open, onToggle, panelId, unlockLabel, children }: SubscribeUnlockPanelProps) {
  return (
    <section className="mi-gate-panel bg-black text-white pb-20 md:pb-28">
      <div className="container-wide">
        <div className="relative flex items-center justify-center">
          <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className="relative inline-flex h-14 items-center gap-3 rounded-full bg-white px-8 text-[13px] font-medium uppercase tracking-wider text-black transition-colors [@media(hover:hover)]:hover:bg-gold [@media(hover:hover)]:hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            {unlockLabel}
            <ChevronDown
              aria-hidden="true"
              className={cn('h-4 w-4 transition-transform duration-300 motion-reduce:transition-none', open && 'rotate-180')}
            />
          </button>
        </div>

        <div id={panelId} hidden={!open} className="mx-auto mt-10 max-w-xl bg-white p-6 text-black sm:p-10">
          {children}
        </div>
      </div>
    </section>
  );
}

interface SubscribeUnlockFormProps {
  /** Which page is asking; travels with the sign-up so the team knows. */
  source: SubscribeSource;
  /** Whether the surrounding panel is open: drives focus management. */
  open: boolean;
  /** Page-specific heading and pitch for the details step. */
  title: string;
  body: string;
  titleId: string;
  /** Called once the code has verified and the subscription is remembered. */
  onUnlocked: () => void;
}

// Two steps: details (name, email, consent) -> code (the 6 digits from the email).
// Verifying sets the server cookie for /briefing and the localStorage flag the
// pages read; what happens next is the wrapper's call via onUnlocked.
export default function SubscribeUnlockForm({ source, open, title, body, titleId, onUnlocked }: SubscribeUnlockFormProps) {
  const t = useTranslations('pages.insights.gate');
  const tf = useTranslations('forms');
  const tv = useTranslations('validation');
  const locale = useLocale();

  const [pending, setPending] = useState<Pending | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);

  const codeInputRef = useRef<HTMLInputElement>(null);
  const resendTimer = useRef<ReturnType<typeof setTimeout>>();

  // Pick up a code that was requested before a reload.
  useEffect(() => {
    const restored = loadPending();
    if (restored) setPending(restored);
  }, []);

  useEffect(() => () => clearTimeout(resendTimer.current), []);

  const schema = useMemo(
    () =>
      createNewsletterSchema({
        firstNameMin: tv('firstNameMin'),
        lastNameMin: tv('lastNameMin'),
        emailInvalid: tv('emailInvalid'),
        // Gate-specific: the shared message refers to "terms", which this checkbox does not.
        consentRequired: t('consentRequired'),
      }),
    [t, tv]
  );

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    setFocus,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', consent: false, _honeypot: '' },
  });

  const step = pending ? 'code' : 'details';

  useEffect(() => {
    if (!open) return;
    if (step === 'code') codeInputRef.current?.focus();
    else setFocus('firstName');
  }, [open, step, setFocus]);

  const formErrorMessage = useCallback(
    (errorCode: unknown) =>
      tf(
        Object.values(FORM_ERROR_CODES).includes(errorCode as never)
          ? (errorCode as (typeof FORM_ERROR_CODES)[keyof typeof FORM_ERROR_CODES])
          : FORM_ERROR_CODES.unexpectedError
      ),
    [tf]
  );

  const startResendCooldown = () => {
    setCanResend(false);
    clearTimeout(resendTimer.current);
    resendTimer.current = setTimeout(() => setCanResend(true), RESEND_COOLDOWN_MS);
  };

  // Step 1: ask the server to email a code. Returns true once a code is pending.
  const requestCode = async (requestBody: SignupBody): Promise<boolean> => {
    const response = await fetch(REQUEST_CODE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      if (result?.errors) {
        for (const err of result.errors) {
          if (err.field === '_form') setError(formErrorMessage(err.code));
          else if (FIELD_NAMES.has(err.field)) {
            setFieldError(err.field as keyof NewsletterFormData, { message: tv(err.code) });
          }
        }
      } else {
        setError(tf('errorGeneric'));
      }
      return false;
    }

    if (typeof result?.challenge !== 'string' || typeof result?.expiresAt !== 'number') {
      setError(tf('errorGeneric'));
      return false;
    }

    const next: Pending = { challenge: result.challenge, expiresAt: result.expiresAt, body: requestBody };
    savePending(next);
    setPending(next);
    setCode('');
    setCodeError(null);
    startResendCooldown();
    return true;
  };

  const onSubmitDetails = async (data: NewsletterFormData) => {
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const requestBody: SignupBody = { ...data, locale, source };
      const utm = readUtmFromLocation();
      if (utm) requestBody.utm = utm;
      await requestCode(requestBody);
    } catch {
      setError(tf('errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!pending || !canResend || submitting) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      if (await requestCode(pending.body)) setNotice(t('resent'));
    } catch {
      setError(tf('errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const onChangeEmail = () => {
    savePending(null);
    setPending(null);
    setCode('');
    setCodeError(null);
    setError(null);
    setNotice(null);
  };

  // Step 2: prove the address by returning the emailed code. Only a verified
  // address unlocks anything, and only then is the team notified (server-side).
  const onVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pending || submitting) return;
    setError(null);
    setNotice(null);

    if (!CODE_PATTERN.test(code)) {
      setCodeError(t('codeFormat'));
      return;
    }

    setSubmitting(true);
    setCodeError(null);
    try {
      const response = await fetch(VERIFY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: pending.challenge, code }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const err = result?.errors?.[0];
        if (err?.field === 'code') {
          setCodeError(err.code === NEWSLETTER_ERROR_CODES.codeExpired ? t('codeExpired') : t('codeInvalid'));
        } else {
          setError(formErrorMessage(err?.code));
        }
        return;
      }

      savePending(null);
      rememberSubscription();
      // Event name kept stable for GTM triggers; `source` tells the pages apart.
      window.dataLayer?.push({ event: 'market_intelligence_subscribe', source });
      onUnlocked();
    } catch {
      setError(tf('errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitButtonClass =
    'flex h-[48px] w-full items-center justify-center border-2 border-[#030303] bg-black px-8 text-[12px] font-medium uppercase tracking-wider text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto';
  const textButtonClass =
    'text-[13px] text-[#0a0a0a] underline underline-offset-2 disabled:cursor-not-allowed disabled:text-[#9aa0a6] disabled:no-underline';

  return (
    <>
      <h2 id={titleId} className="text-[24px] font-light leading-[1.25] tracking-tight md:text-[28px]">
        {step === 'code' ? t('codeTitle') : title}
      </h2>

      {step === 'details' && (
        <>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5F6368]">{body}</p>

          <form onSubmit={handleSubmit(onSubmitDetails)} aria-labelledby={titleId} noValidate className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={tf('firstName')}
                aria-label={tf('firstName')}
                placeholder={tf('placeholder')}
                autoComplete="given-name"
                required
                {...register('firstName')}
                error={errors.firstName?.message}
              />
              <Input
                label={tf('lastName')}
                aria-label={tf('lastName')}
                placeholder={tf('placeholder')}
                autoComplete="family-name"
                required
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </div>
            <Input
              label={tf('email')}
              aria-label={tf('email')}
              type="email"
              placeholder={tf('placeholder')}
              autoComplete="email"
              required
              {...register('email')}
              error={errors.email?.message}
            />

            {/* Honeypot */}
            <div className="hp-field" aria-hidden="true">
              <input type="text" {...register('_honeypot')} tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-2">
                <input type="checkbox" {...register('consent')} className="mt-[3px] h-4 w-4 shrink-0 accent-black" />
                <span className="text-[12px] leading-[16px] text-[#525252]">
                  {t.rich('consent', {
                    privacyPolicy: (chunks) => (
                      <Link href="/privacy-policy" className="text-[#0a0a0a] underline">
                        {chunks}
                      </Link>
                    ),
                  })}
                </span>
              </label>
              {errors.consent && <p className="mt-1 text-xs text-red-500">{errors.consent.message}</p>}
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className={submitButtonClass}>
              {submitting ? tf('submitting') : t('submit')}
            </button>

            <p className="text-[12px] leading-[16px] text-[#5F6368]">{t('note')}</p>
          </form>
        </>
      )}

      {step === 'code' && pending && (
        <>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5F6368]">{t('codeBody', { email: pending.body.email })}</p>

          <form onSubmit={onVerify} aria-labelledby={titleId} noValidate className="mt-8 space-y-4">
            <div dir="ltr">
              <Input
                ref={codeInputRef}
                aria-label={t('codeLabel')}
                name="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setCodeError(null);
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                className="py-4 text-center text-[24px] font-light tracking-[0.5em]"
                error={codeError ?? undefined}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-500">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="text-sm text-[#5F6368]">
                {notice}
              </p>
            )}

            <button type="submit" disabled={submitting} className={submitButtonClass}>
              {submitting ? t('verifying') : t('verify')}
            </button>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
              <button type="button" onClick={onResend} disabled={!canResend || submitting} className={textButtonClass}>
                {t('resend')}
              </button>
              <button type="button" onClick={onChangeEmail} disabled={submitting} className={textButtonClass}>
                {t('changeEmail')}
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
}
