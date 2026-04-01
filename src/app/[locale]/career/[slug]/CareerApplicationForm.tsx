'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createCareerApplicationSchema, type CareerApplicationFormData, validateCVFile } from '@/lib/schemas';
import { FORM_ERROR_CODES } from '@/lib/error-codes';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import Button from '@/components/ui/Button';

interface CareerApplicationFormProps {
  jobSlug: string;
  jobTitle: string;
}

export default function CareerApplicationForm({ jobSlug, jobTitle }: CareerApplicationFormProps) {
  const t = useTranslations('forms');
  const tv = useTranslations('validation');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const router = useRouter();

  const schema = useMemo(() => createCareerApplicationSchema({
    firstNameMin: tv('firstNameMin'),
    lastNameMin: tv('lastNameMin'),
    phoneInvalid: tv('phoneInvalid'),
    emailInvalid: tv('emailInvalid'),
    messageMin: tv('messageMin'),
  }), [tv]);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<CareerApplicationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      _honeypot: '',
      jobSlug,
      jobTitle,
    },
  });

  const handleFileChange = (file: File | null) => {
    setCvFile(file);
    if (file) {
      const validationError = validateCVFile(file, {
        fileTooLarge: tv('fileTooLarge'),
        fileTypeInvalid: tv('fileTypeInvalid'),
      });
      setCvError(validationError);
    } else {
      setCvError(null);
    }
  };

  const onSubmit = async (data: CareerApplicationFormData) => {
    if (cvError) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      if (cvFile) {
        formData.append('cvFile', cvFile);
      }

      let response: Response | undefined;
      try {
        response = await fetch('/api/careers/apply', {
          method: 'POST',
          body: formData,
        });
      } catch {
        // Static export — API routes unavailable; continue to thank-you
      }

      if (response && !response.ok) {
        const result = await response.json().catch(() => null);
        if (result?.errors) {
          const validFields = new Set(['firstName', 'lastName', 'phone', 'email', 'message', 'cvFile']);
          for (const err of result.errors) {
            if (err.field === '_form') {
              const code = Object.values(FORM_ERROR_CODES).includes(err.code)
                ? err.code
                : FORM_ERROR_CODES.unexpectedError;
              setError(t(code));
            } else if (err.field === 'cvFile') {
              setCvError(tv(err.code));
            } else if (validFields.has(err.field)) {
              setFieldError(err.field as keyof CareerApplicationFormData, { message: tv(err.code) });
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
      <input type="hidden" {...register('jobSlug')} />
      <input type="hidden" {...register('jobTitle')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label={t('firstName')} placeholder={t('placeholder')} required {...register('firstName')} error={errors.firstName ? tv('firstNameMin') : undefined} />
        <Input label={t('lastName')} placeholder={t('placeholder')} required {...register('lastName')} error={errors.lastName ? tv('lastNameMin') : undefined} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2">
          <div className="w-20 flex-shrink-0">
            <Input value={t('phoneCountryCode')} readOnly className="text-center bg-gray-50" label={t('phone')} required />
          </div>
          <div className="flex-1">
            <Input placeholder={t('placeholder')} label="&nbsp;" {...register('phone')} error={errors.phone ? tv('phoneInvalid') : undefined} />
          </div>
        </div>
        <Input label={t('email')} type="email" placeholder={t('placeholder')} required {...register('email')} error={errors.email ? tv('emailInvalid') : undefined} />
      </div>
      <Textarea label={t('message')} placeholder={t('placeholder')} required {...register('message')} error={errors.message ? tv('messageMin') : undefined} />

      <FileUpload
        label={t('uploadCv')}
        accept=".pdf,.doc,.docx"
        maxSize={4 * 1024 * 1024}
        onChange={handleFileChange}
        error={cvError || undefined}
      />

      {/* Honeypot */}
      <div className="hp-field" aria-hidden="true">
        <input type="text" {...register('_honeypot')} tabIndex={-1} autoComplete="off" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-xs text-gray-500">
        {t.rich('consentText', {
          privacyPolicy: (chunks) => <Link href="/privacy-policy" className="underline">{chunks}</Link>,
          termsOfUse: (chunks) => <Link href="/terms-of-service" className="underline">{chunks}</Link>,
        })}
      </p>

      <Button type="submit" disabled={submitting}>
        {submitting ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
