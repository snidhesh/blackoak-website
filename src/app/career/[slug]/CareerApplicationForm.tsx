'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { careerApplicationSchema, type CareerApplicationFormData, validateCVFile } from '@/lib/schemas';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import Button from '@/components/ui/Button';

interface CareerApplicationFormProps {
  jobSlug: string;
  jobTitle: string;
}

export default function CareerApplicationForm({ jobSlug, jobTitle }: CareerApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CareerApplicationFormData>({
    resolver: zodResolver(careerApplicationSchema),
    defaultValues: {
      _honeypot: '',
      jobSlug,
      jobTitle,
    },
  });

  const handleFileChange = (file: File | null) => {
    setCvFile(file);
    if (file) {
      const validationError = validateCVFile(file);
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

      // Try to submit to the API endpoint (works in server mode)
      try {
        await fetch('/api/careers/apply', {
          method: 'POST',
          body: formData,
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
      <input type="hidden" {...register('jobSlug')} />
      <input type="hidden" {...register('jobTitle')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First name" placeholder="Enter" required {...register('firstName')} error={errors.firstName?.message} />
        <Input label="Last name" placeholder="Enter" required {...register('lastName')} error={errors.lastName?.message} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2">
          <div className="w-20 flex-shrink-0">
            <Input value="+971" readOnly className="text-center bg-gray-50" label="Phone" required />
          </div>
          <div className="flex-1">
            <Input placeholder="Enter" label="&nbsp;" {...register('phone')} error={errors.phone?.message} />
          </div>
        </div>
        <Input label="Email" type="email" placeholder="Enter" required {...register('email')} error={errors.email?.message} />
      </div>
      <Textarea label="Message" placeholder="Enter" required {...register('message')} error={errors.message?.message} />

      <FileUpload
        label="Upload your CV (PDF/DOC)"
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
        By submitting this form, you acknowledge that you accept the BlackOak Real Estate&apos;s{' '}
        <a href="/privacy-policy" className="underline">Privacy Policy</a> and{' '}
        <a href="/terms-of-service" className="underline">Terms of Use</a>.
      </p>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'SUBMITTING...' : 'SUBMIT'}
      </Button>
    </form>
  );
}
