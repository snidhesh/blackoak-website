'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { listPropertySchema, type ListPropertyFormData } from '@/lib/schemas';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Land', 'Commercial'] as const;
const bedroomOptions = ['Studio', '1', '2', '3', '4', '5', '6', '7+'] as const;

export default function ListPropertyForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListPropertyFormData>({
    resolver: zodResolver(listPropertySchema),
    defaultValues: { _honeypot: '' },
  });

  const onSubmit = async (data: ListPropertyFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      try {
        await fetch('/api/list-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch {
        // Static export — API routes unavailable; continue to thank-you
      }

      router.push('/thank-you');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First name"
          placeholder="Enter"
          required
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <Input
          label="Last name"
          placeholder="Enter"
          required
          {...register('lastName')}
          error={errors.lastName?.message}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <div className="flex items-center gap-1.5 px-3 bg-[#f5f5f5] border border-[#d1d5db] border-r-0 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/contact/uae-flag.svg" alt="UAE" className="w-5 h-5" />
              <span className="text-[13.7px] text-[#374151]">+971</span>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Enter"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>
          </div>
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="Enter"
          required
          {...register('email')}
          error={errors.email?.message}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Listing type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('listingType')}
            className={`w-full px-4 py-3 border border-gray-300 rounded-none text-sm transition-colors focus:outline-none focus:border-black focus:ring-0 bg-white ${errors.listingType ? 'border-red-500' : ''}`}
          >
            <option value="">Select</option>
            <option value="Sell">Sell</option>
            <option value="Rent">Rent</option>
          </select>
          {errors.listingType && <p className="text-xs text-red-500">{errors.listingType.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Property type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('propertyType')}
            className={`w-full px-4 py-3 border border-gray-300 rounded-none text-sm transition-colors focus:outline-none focus:border-black focus:ring-0 bg-white ${errors.propertyType ? 'border-red-500' : ''}`}
          >
            <option value="">Select</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.propertyType && <p className="text-xs text-red-500">{errors.propertyType.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Bedrooms <span className="text-red-500">*</span>
          </label>
          <select
            {...register('bedrooms')}
            className={`w-full px-4 py-3 border border-gray-300 rounded-none text-sm transition-colors focus:outline-none focus:border-black focus:ring-0 bg-white ${errors.bedrooms ? 'border-red-500' : ''}`}
          >
            <option value="">Select</option>
            {bedroomOptions.map((opt) => (
              <option key={opt} value={opt}>{opt === 'Studio' ? 'Studio' : `${opt} Bedroom${opt === '1' ? '' : 's'}`}</option>
            ))}
          </select>
          {errors.bedrooms && <p className="text-xs text-red-500">{errors.bedrooms.message}</p>}
        </div>
        <Input
          label="Location / Area"
          placeholder="e.g. Dubai Marina"
          required
          {...register('location')}
          error={errors.location?.message}
        />
      </div>
      <Textarea
        label="Additional details"
        placeholder="Tell us about your property — size, features, asking price, etc."
        required
        {...register('message')}
        error={errors.message?.message}
      />

      {/* Honeypot */}
      <div className="hp-field" aria-hidden="true">
        <input type="text" {...register('_honeypot')} tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <p className="text-[12px] leading-[16px] text-[#525252]">
        By submitting this form, you acknowledge that you accept the BlackOak Real Estate&apos;s{' '}
        <a href="/privacy-policy" className="underline text-[#0a0a0a]">Privacy Policy</a> and{' '}
        <a href="/terms-of-service" className="underline text-[#0a0a0a]">Terms of Use</a>.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="bg-black border-2 border-[#030303] text-white text-[12px] font-medium uppercase tracking-wider h-[48px] w-[200px] flex items-center justify-center hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'SUBMITTING...' : 'LIST MY PROPERTY'}
      </button>
    </form>
  );
}
