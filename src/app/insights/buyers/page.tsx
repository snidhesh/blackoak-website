import type { Metadata } from 'next';
import Image from 'next/image';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Buyers Guide',
  description: 'Start your Dubai property journey with confidence. A comprehensive buyers guide.',
};

const guides = [
  { title: 'Why Invest Or Buy', id: 'why-invest' },
  { title: 'Obtaining a Visa', id: 'obtaining-visa' },
  { title: 'Managing Your Property', id: 'managing-property' },
  { title: 'Mortgaging Your Property', id: 'mortgaging-property' },
  { title: 'International Property Buyers', id: 'international-buyers' },
  { title: 'Costs of Buying a Property', id: 'costs-buying' },
];

export default function BuyersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[70vh] overflow-hidden">
        <Image
          src="/images/buyers/hero.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-black/90 to-transparent" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-[50px] font-light leading-tight">
            Built on Trust.<br />Driven by Passion.
          </h1>
        </div>
      </section>

      {/* Property Buyers Guide Intro */}
      <section className="py-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>property buyers guide</SectionLabel>
            <SectionHeading
              title="Start your Dubai property journey with confidence."
              className="mt-5 max-w-[542px] mx-auto"
            />
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <p className="mt-8 text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto">
              Our Property Buyers Guide offers a comprehensive overview of the entire acquisition journey — from selecting the right development and understanding market trends to navigating legal procedures and finalising ownership. Whether you are a first-time buyer or a seasoned investor, this guide is designed to provide clarity, transparency, and strategic insight at every stage. With the right knowledge and expert support, investing in Dubai real estate becomes a seamless and rewarding experience.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Guide Navigation Cards */}
      <section className="pb-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide, i) => (
              <AnimateOnScroll key={guide.id} delay={i * 0.06}>
                <a
                  href={`#${guide.id}`}
                  className="group block border border-gray-200 px-8 py-6 text-center transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  <span className="text-[18px] font-normal leading-[28px] text-gray-800 group-hover:text-white transition-colors">
                    {guide.title}
                  </span>
                </a>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Section 1: Why Invest Or Buy */}
      <section id="why-invest" className="scroll-mt-24">
        <div className="flex flex-col lg:flex-row">
          <div className="relative w-full lg:w-1/2 min-h-[400px] lg:min-h-[748px]">
            <Image
              src="/images/buyers/tab-why-invest.jpg"
              alt="Luxury penthouse overlooking Dubai skyline"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full lg:w-1/2 bg-black text-white flex items-center">
            <div className="px-8 lg:px-16 py-16 max-w-[627px]">
              <AnimateOnScroll>
                <h2 className="text-[32px] lg:text-[42px] font-light leading-[45px] lg:leading-[55px]">
                  Why You Should Invest or Buy Property in Dubai
                </h2>
                <p className="mt-10 text-[18px] font-normal leading-[30px] text-white">
                  Over the past few years, Dubai&apos;s real estate market has greatly matured aligning itself with other established cities. Of course, Dubai is still considered a &ldquo;new&rdquo; city and most real estate projects aren&apos;t even 10 years old! However, this is a great benefit for buyers as buildings are designed and constructed with newer design concepts, advanced engineering techniques and generally, better construction.
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Risk sub-section */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>Minimal Risk</SectionLabel>
              <SectionHeading
                title="Invest with Assured Confidence"
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-10">
              <div className="space-y-6">
                <p>
                  With any real estate investment or purchase, risk must be examined. When it comes to Dubai, risk is minimal. Here&apos;s why:
                </p>
                <p>
                  Great quality assets (in an equally great market which typically, anywhere else should be yielding far lower).
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-1">
                <li>Today, investors can generate property yields of anything between 6-12%.</li>
                <li>When considering capital appreciation, property yields could produce even higher total investor returns.</li>
              </ul>
              <p>
                There&apos;s more too. Dubai is one of the most &ldquo;connected&rdquo; cities, easy to get to by airplane and it&apos;s a superb international business hub that will always see a high level of demand when it comes to property. Additionally, the Dubai government continues to heavily invest in the country, from all perspectives; business, social and entertainment. While there is a large supply of residential projects in Dubai, the stock constantly transacts and it&apos;s no surprise that more and more people consider Dubai as their home.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 2: Obtaining a Visa */}
      <section id="obtaining-visa" className="py-20 bg-[#f0f3f8] scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>Obtaining a Visa</SectionLabel>
              <SectionHeading
                title="Visa options for property investors"
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto">
              <p className="mb-10">
                You can get a visa if you buy a property in Dubai. There are a few types of visas that are ideal for property investors:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visa Card 1 */}
                <div className="bg-white p-8 border border-gray-200">
                  <h3 className="text-[22px] font-normal leading-[32px] text-black mb-6">
                    Six-Month Renewable Residency Visa
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-[#5f6368]">
                    <li>This residential only visa is issued by the relevant immigration authority.</li>
                    <li>It is renewable.</li>
                    <li>The cost is approximately AED 2,500.</li>
                    <li>Property must be at the completion stage and freehold only.</li>
                    <li>Note, this visa is not suited for working in Dubai.</li>
                  </ul>
                </div>
                {/* Visa Card 2 */}
                <div className="bg-white p-8 border border-gray-200">
                  <h3 className="text-[22px] font-normal leading-[32px] text-black mb-6">
                    5-Year Visa — The Golden Visa
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-[#5f6368]">
                    <li>You must invest no less than AED 5 million in property in the UAE (gross).</li>
                    <li>Any amount that you invest cannot be on a loan basis.</li>
                    <li>The property must be retained for at least three years.</li>
                  </ul>
                </div>
                {/* Visa Card 3 */}
                <div className="bg-white p-8 border border-gray-200">
                  <h3 className="text-[22px] font-normal leading-[32px] text-black mb-6">
                    2-Year Renewable Property Investor Visa
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-[#5f6368]">
                    <li>This visa permits you to become a UAE resident only if you&apos;ve made a property investment.</li>
                    <li>You must invest less than AED 1 million in property in the UAE (gross).</li>
                    <li>If jointly owned, the value must exceed AED 1 million.</li>
                    <li>It costs approximately AED 14,000.</li>
                  </ul>
                </div>
                {/* Visa Card 4 */}
                <div className="bg-white p-8 border border-gray-200">
                  <h3 className="text-[22px] font-normal leading-[32px] text-black mb-6">
                    3-Year Investor Visa
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-[#5f6368]">
                    <li>You must invest no less than AED 1 million in property in the UAE (gross).</li>
                    <li>With this visa you are considered eligible to become a UAE resident.</li>
                    <li>Visa costs approximately AED 14,000.</li>
                    <li>You may not stay outside of Dubai for more than 6 months.</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 3: Managing Your Property */}
      <section id="managing-property" className="py-20 scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>Property Management</SectionLabel>
              <SectionHeading
                title="Managing Your Property in Dubai While You Are Outside of the Country"
                className="mt-5 max-w-[700px] mx-auto"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-8">
              <p>
                Black Oak does not just deal in property sales, we also manage properties for our many clients when they are outside Dubai. There are various different options to choose from, as follows:
              </p>
              <ul className="list-disc pl-6 space-y-4">
                <li>The property is empty so our property management team will check it periodically to ensure security and that there are no maintenance issues. Before your return to Dubai, our team will also check and prepare your property ready for your arrival.</li>
                <li>Our property management team can manage everything for you, including leasing your property out to maintaining it on your behalf. This is our full property management service.</li>
                <li>Short-term let management, which increases your investment return. However, as with any letting, appliances, decor and furniture will also need maintenance.</li>
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 4: Mortgaging Your Property */}
      <section id="mortgaging-property" className="py-20 bg-[#f0f3f8] scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>Mortgage Guide</SectionLabel>
              <SectionHeading
                title="Mortgaging Your Property"
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-6">
              <p>
                It&apos;s important to note that most international buyers purchasing properties in Dubai use cash transactions but mortgages are still used to secure a property. Generally, they are not difficult to obtain, UAE nationals, expats and non-residents may apply for a mortgage in Dubai as long as they have valid ID and proof of income. Pre-approvals are fast too, within 4 days and another week for a final mortgage offer. Keep an eye on mortgage rates. They change regularly. Most major UAE banks offer mortgages. You will be asked to put at least a 20% down-payment on the property in question.
              </p>
              <p>
                As for eligibility you must have a stable income, good credit rating and minimum salary income of AED 7,000 for UAE Nationals and AED 10,000 for expats. Mortgage repayments must be repaid monthly and must not exceed 50% of your monthly income. Finally, you must be over 21 years old to apply for a mortgage.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 5: International Property Buyers */}
      <section id="international-buyers" className="py-20 scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>International Buyers</SectionLabel>
              <SectionHeading
                title="International Property Buyers — Your Step-by-Step Guide"
                className="mt-5 max-w-[700px] mx-auto"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-8">
              <p>
                At Black Oak, we want to help you find your perfect Dubai investment property. Contact us to discuss your requirements.
              </p>
              <ol className="list-decimal pl-6 space-y-4">
                <li>Locate your ideal property that matches your own requirements with help from our knowledgeable, experienced property team.</li>
                <li>Be aware of the Free-Zone Areas. As a non-UAE or GCC citizen you are limited to these areas. Rest assured, all of our listed properties are in the free-zone and specifically for international buyers.</li>
                <li>Always negotiate and outline terms with seller — Black Oak can assist with this directly, with the developers.</li>
                <li>Sign an MOU (Memorandum of Understanding) / Form F (available on DLD website).</li>
                <li>Once both you, the buyer and the seller form an agreement, you must both sign it at the registration trustee.</li>
                <li>Obtain an NOC (No Objection Certificate) from the developer to transfer ownership.</li>
                <li>Finally, there will be a meeting at the DLD (Dubai Land Department) to effect transfer with developer.</li>
              </ol>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 6: Costs of Buying a Property */}
      <section id="costs-buying" className="py-20 bg-[#f0f3f8] scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>Buying Costs</SectionLabel>
              <SectionHeading
                title="The Administrative Costs of Buying a Completed Property in Dubai"
                className="mt-5 max-w-[700px] mx-auto"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-8">
              <p>
                We&apos;ve put together a brief explanation of the administrative costs associated with purchasing property in Dubai.
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>4% of the property value goes to the DLD (Dubai Land Department) as a fee payment.</li>
                <li>Additionally, there is an AED 4,200 fee for administrative purposes paid to the DLD.</li>
                <li>There is an AED 520 fee for issuing the Title Deeds.</li>
                <li>The Real Estate Agent will receive 2% of the purchase price for commission.</li>
                <li>There are NOC charges (No Objection Certificate) that range from AED 500 to AED 5,000 and this very much depends on the developer.</li>
                <li>Your mortgage registration fees (if you have a mortgage) will be calculated at a rate of 0.25% of the registered loan amount plus AED 290 (an admin fee). This is paid to the DLD (Dubai Land Department). Note, if you purchase your property with a full cash payment, the DLD Mortgage Registration Fee will not apply.</li>
                <li>Annual Service Charge must be paid in advance to the developers — as the buyer, you should account for this amount.</li>
                <li>There is also a Property Registration Fee, if the property is below AED 500,000 it is AED 2,000 +VAT. Above AED 500,000, the fee is AED 4,000 + VAT.</li>
                <li>Factor in the valuation fees of AED 2,500 to AED 3,500.</li>
                <li>Finally, there is the cost of the Oqood Certificate (which registers the property in the buyer&apos;s name) which costs AED 5,250.</li>
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
