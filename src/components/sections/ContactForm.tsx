'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { contactSchema, type ContactFormData } from '@/lib/schemas';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

interface ContactFormProps {
  endpoint?: string;
  projectSlug?: string;
  projectName?: string;
  submitLabel?: string;
}

export default function ContactForm({
  endpoint = '/api/contact',
  projectSlug,
  projectName,
  submitLabel = 'SUBMIT ENQUIRY',
}: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { _honeypot: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, string> = { ...data };
      if (projectSlug) body.projectSlug = projectSlug;
      if (projectName) body.projectName = projectName;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (result.success) {
        router.push('/thank-you');
      } else {
        setError(result.errors?.[0]?.message || 'Something went wrong. Please try again.');
      }
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
        <div className="flex gap-2">
          <div className="w-20 flex-shrink-0">
            <Input value="+971" readOnly className="text-center bg-gray-50" label="Phone" required />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Enter"
              label="&nbsp;"
              {...register('phone')}
              error={errors.phone?.message}
            />
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
      <Textarea
        label="Message"
        placeholder="Enter"
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

      <p className="text-xs text-gray-500">
        By submitting the form, you acknowledge that you accept the BlackOak Real Estate&apos;s{' '}
        <a href="/privacy-policy" className="underline">Privacy Policy</a> and{' '}
        <a href="/terms-of-service" className="underline">Terms of Use</a>.
      </p>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'SUBMITTING...' : submitLabel}
      </Button>
    </form>
  );
}
