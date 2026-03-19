import type { Metadata } from 'next';
import { CheckCircle } from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Your request has been successfully submitted. Our team will review your enquiry and get back to you shortly.',
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4 max-w-xl">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <SectionLabel>THANK YOU</SectionLabel>
        <h1 className="text-3xl md:text-4xl font-semibold mt-4 mb-6">
          Your request has been successfully submitted.
        </h1>
        <p className="text-gray-600 mb-2">
          Our team will review your enquiry and get back to you shortly. At BlackOak, we are committed to providing prompt support and personalized assistance for all your real estate needs.
        </p>
        <p className="text-gray-600 mb-2">
          If your enquiry is urgent, please call us at <strong>+971 4 398 9055</strong>.
        </p>
        <p className="text-gray-600 mb-8">
          We appreciate your interest and look forward to assisting you.
        </p>
        <Button href="/" variant="outline">
          RETURN TO HOMEPAGE
        </Button>
      </div>
    </section>
  );
}
