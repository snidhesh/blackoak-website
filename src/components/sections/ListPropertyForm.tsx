'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createListPropertySchema, type ListPropertyFormData } from '@/lib/schemas';
import { FORM_ERROR_CODES } from '@/lib/error-codes';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

const propertyTypeKeys = ['apartment', 'villa', 'townhouse', 'penthouse', 'land', 'commercial'] as const;
const bedroomOptionKeys = ['studio', 'one', 'two', 'three', 'four', 'five', 'six', 'sevenPlus'] as const;
const bedroomValues = ['Studio', '1', '2', '3', '4', '5', '6', '7+'] as const;

export default function ListPropertyForm() {
  const t = useTranslations('forms');
  const tv = useTranslations('validation');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const schema = useMemo(() => createListPropertySchema({
    firstNameMin: tv('firstNameMin'),
    lastNameMin: tv('lastNameMin'),
    phoneInvalid: tv('phoneInvalid'),
    emailInvalid: tv('emailInvalid'),
    messageMin: tv('messageMin'),
    selectPropertyType: tv('selectPropertyType'),
    selectBedrooms: tv('selectBedrooms'),
    selectListingType: tv('selectListingType'),
    enterLocation: tv('enterLocation'),
  }), [tv]);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<ListPropertyFormData>({
    resolver: zodResolver(schema),
    defaultValues: { _honeypot: '' },
  });

  const onSubmit = async (data: ListPropertyFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      let response: Response | undefined;
      try {
        response = await fetch('/api/list-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch {
        // Static export — API routes unavailable; continue to thank-you
      }

      if (response && !response.ok) {
        const result = await response.json().catch(() => null);
        if (result?.errors) {
          const validFields = new Set(['firstName', 'lastName', 'phone', 'email', 'message', 'propertyType', 'bedrooms', 'listingType', 'location']);
          for (const err of result.errors) {
            if (err.field === '_form') {
              const code = Object.values(FORM_ERROR_CODES).includes(err.code)
                ? err.code
                : FORM_ERROR_CODES.unexpectedError;
              setError(t(code));
            } else if (validFields.has(err.field)) {
              setFieldError(err.field as keyof ListPropertyFormData, { message: tv(err.code) });
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
            <div className="flex items-center gap-1.5 px-3 bg-[#f5f5f5] border border-[#d1d5db] border-r-0 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/contact/uae-flag.svg" alt={t('phoneCountryFlag')} className="w-5 h-5" />
              <span className="text-[13.7px] text-[#374151]">{t('phoneCountryCode')}</span>
            </div>
            <div className="flex-1">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {t('listingType')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('listingType')}
            className={`w-full px-4 py-3 border border-gray-300 rounded-none text-sm transition-colors focus:outline-none focus:border-black focus:ring-0 bg-white ${errors.listingType ? 'border-red-500' : ''}`}
          >
            <option value="">{t('select')}</option>
            <option value="Sell">{t('sell')}</option>
            <option value="Rent">{t('rent')}</option>
          </select>
          {errors.listingType && <p className="text-xs text-red-500">{tv('selectListingType')}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {t('propertyType')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('propertyType')}
            className={`w-full px-4 py-3 border border-gray-300 rounded-none text-sm transition-colors focus:outline-none focus:border-black focus:ring-0 bg-white ${errors.propertyType ? 'border-red-500' : ''}`}
          >
            <option value="">{t('select')}</option>
            {propertyTypeKeys.map((key, i) => {
              const values = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Land', 'Commercial'];
              return (
                <option key={key} value={values[i]}>{t(`propertyTypes.${key}`)}</option>
              );
            })}
          </select>
          {errors.propertyType && <p className="text-xs text-red-500">{tv('selectPropertyType')}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {t('bedroomsLabel')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('bedrooms')}
            className={`w-full px-4 py-3 border border-gray-300 rounded-none text-sm transition-colors focus:outline-none focus:border-black focus:ring-0 bg-white ${errors.bedrooms ? 'border-red-500' : ''}`}
          >
            <option value="">{t('select')}</option>
            {bedroomOptionKeys.map((key, i) => (
              <option key={key} value={bedroomValues[i]}>{t(`bedroomOptions.${key}`)}</option>
            ))}
          </select>
          {errors.bedrooms && <p className="text-xs text-red-500">{tv('selectBedrooms')}</p>}
        </div>
        <Input
          label={t('locationArea')}
          placeholder={t('placeholderLocation')}
          required
          {...register('location')}
          error={errors.location ? tv('enterLocation') : undefined}
        />
      </div>
      <Textarea
        label={t('additionalDetails')}
        placeholder={t('placeholderAdditionalDetails')}
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

      <p className="text-[12px] leading-[16px] text-[#525252]">
        {t.rich('consentText', {
          privacyPolicy: (chunks) => <Link href="/privacy-policy" className="underline text-[#0a0a0a]">{chunks}</Link>,
          termsOfUse: (chunks) => <Link href="/terms-of-service" className="underline text-[#0a0a0a]">{chunks}</Link>,
        })}
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="bg-black border-2 border-[#030303] text-white text-[12px] font-medium uppercase tracking-wider h-[48px] w-[200px] flex items-center justify-center hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? t('submitting') : t('listMyProperty')}
      </button>
    </form>
  );
}
