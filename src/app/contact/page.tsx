import type { Metadata } from 'next';
import Image from 'next/image';
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
    city: 'Dubai',
    image: '/images/contact/dubai-map.png',
    address: 'Office 1406, Marina Plaza, Dubai Marina, Dubai, United Arab Emirates',
    phone: '+971 (0) 4 398 9055',
    phoneHref: 'tel:+97143989055',
    email: 'info@blackoak-re.com',
    mapLink: 'https://maps.google.com/?q=Marina+Plaza+Dubai+Marina',
  },
  {
    city: 'London',
    image: '/images/contact/london-map.png',
    address: '71-75 Shelton Street London WC2H 9JQ United Kingdom',
    phone: '+44 (0) 203 905 5501',
    phoneHref: 'tel:+442039055501',
    email: 'info@blackoak-re.com',
    mapLink: 'https://maps.google.com/?q=71-75+Shelton+Street+London+WC2H+9JQ',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Header Label + Heading */}
      <section className="pt-[156px] pb-8">
        <div className="container-narrow text-center">
          <SectionLabel>Contact Us</SectionLabel>
          <h1 className="mt-5 text-[50px] font-light leading-[1.2] text-black">
            Let us help you find your
            <br />
            extraordinary.
          </h1>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <Image
          src="/images/contact/hero.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-[rgba(7,35,75,0.9)] to-transparent" />
      </section>

      {/* Locations */}
      <section className="py-20">
        <div className="container-narrow text-center mb-12">
          <AnimateOnScroll>
            <SectionLabel>Locations</SectionLabel>
            <SectionHeading
              title="Visit us and experience personalized service firsthand."
              className="mt-5 max-w-[538px] mx-auto"
            />
          </AnimateOnScroll>
        </div>

        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {offices.map((office, i) => (
              <AnimateOnScroll key={office.city} delay={i * 0.15}>
                <div className="border-t border-b border-[#ccc] h-auto md:h-[308px] flex flex-col md:flex-row">
                  {/* Map Image */}
                  <div className="relative w-full md:w-[320px] h-[200px] md:h-full shrink-0 overflow-hidden m-5 md:my-[29px] md:mx-5">
                    <Image
                      src={office.image}
                      alt={`${office.city} office location`}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-6 px-5 pb-5 md:p-0 md:pt-[49px]">
                    <h3 className="text-[18px] font-normal uppercase text-black">
                      {office.city}
                    </h3>
                    <div className="flex flex-col gap-[10px] text-[16px] font-light leading-[28px] text-[#5f6368]">
                      <p className="max-w-[279px]">{office.address}</p>
                      <a href={office.phoneHref} className="hover:text-black transition-colors">
                        {office.phone}
                      </a>
                      <a href={`mailto:${office.email}`} className="hover:text-black transition-colors">
                        {office.email}
                      </a>
                    </div>
                    <a
                      href={office.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-medium uppercase text-black underline tracking-wider"
                    >
                      View Location
                    </a>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-[#f0f3f8]">
        <div className="container-narrow">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <SectionLabel>Let&apos;s Connect</SectionLabel>
              <SectionHeading
                title="Connect with our specialists in luxury real estate."
                className="mt-5 max-w-[434px] mx-auto"
              />
            </div>
          </AnimateOnScroll>
          <div className="max-w-[864px] mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
