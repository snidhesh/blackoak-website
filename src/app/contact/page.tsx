import type { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import HeroSection from '@/components/sections/HeroSection';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import ContactForm from '@/components/sections/ContactForm';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with BlackOak Real Estate. Visit our offices in Dubai and London.',
};

const offices = [
  {
    city: 'DUBAI',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    address: 'Office 1406, Marina Plaza, Dubai Marina, Dubai, United Arab Emirates',
    phone: '+971 04 398 9055',
    email: 'info@blackoak-re.com',
  },
  {
    city: 'LONDON',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    address: '71-75 Shelton Street, London WC2H 9JQ, United Kingdom',
    phone: '+44 (0) 203 905 5901',
    email: 'uk@blackoak-re.com',
  },
];

export default function ContactPage() {
  return (
    <>
      <HeroSection
        title="Let us help you find your extraordinary."
        label="CONTACT US"
        image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80"
        height="medium"
      />

      {/* Offices */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>LOCATIONS</SectionLabel>
            <SectionHeading
              title="Visit us and experience personalized service firsthand."
              className="mt-4 mb-12"
            />
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offices.map((office, i) => (
              <AnimateOnScroll key={office.city} delay={i * 0.15}>
                <div className="border border-gray-200 overflow-hidden">
                  <div className="relative h-48 bg-gray-200">
                    <Image src={office.image} alt={`${office.city} office`} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{office.city}</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {office.address}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="hover:text-black">{office.phone}</a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a href={`mailto:${office.email}`} className="hover:text-black">{office.email}</a>
                      </p>
                    </div>
                    <a href="#" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-black hover:text-gray-600">
                      VIEW LOCATION <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="container-narrow">
          <AnimateOnScroll>
            <SectionLabel>LET&apos;S CONNECT</SectionLabel>
            <SectionHeading
              title="Connect with our specialists in luxury real estate."
              className="mt-4 mb-10"
            />
          </AnimateOnScroll>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
