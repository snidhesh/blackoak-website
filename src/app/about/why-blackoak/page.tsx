import type { Metadata } from 'next';
import Image from 'next/image';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import CountUp from '@/components/ui/CountUp';

export const metadata: Metadata = {
  title: 'Why BlackOak',
  description: 'Discover why BlackOak Real Estate is your trusted partner in Dubai luxury real estate.',
};

const featureCards = [
  {
    title: 'High Quality Projects',
    description:
      'We select only the best projects in the market to work with. We are selective in what we sell and choose to only work with a select number of high quality developers.',
    image: '/images/about/high-quality-projects.png',
  },
  {
    title: 'Beyond Advisory',
    description:
      'We provide a full service brokerage. We can support with the full spectrum of ancillary services such as mortgage advice, relocation assistance, visa, tax and legal.',
    image: '/images/about/beyond-advisory.png',
  },
  {
    title: 'Expert Knowledge',
    description:
      'All agents have been professionally trained in real estate and further undergo regular training sessions and market knowledge workshops.',
    image: '/images/about/expert-knowledge.png',
  },
];

const stats = [
  { end: 12, suffix: '+', label: 'Years', sublabel: 'experience' },
  { end: 15, suffix: 'k+', label: 'Success', sublabel: 'Journey' },
  { end: 9, suffix: '+', label: 'Award', sublabel: 'Winnings' },
];

export default function WhyBlackOakPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[70vh]">
        <Image
          src="/images/about/hero.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-[50px] font-light leading-tight">
            Built on Trust.<br />Driven by Passion.
          </h1>
        </div>
      </section>

      {/* About / Legacy */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>A Legacy of Excellence</SectionLabel>
            <div className="text-center mt-5">
              <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                BlackOak Real Estate
              </h2>
              <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                UAE&apos;s Premier Property Authority
              </h2>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.2}>
            <div className="mt-12 text-gray-500 text-base leading-7 tracking-wide text-center max-w-[1208px] mx-auto space-y-6">
              <p>
                At BlackOak Real Estate, we operate at the pinnacle of the UAE&apos;s most dynamic property market — built on one unwavering principle: that every client deserves an experience as exceptional as the properties we represent.
              </p>
              <p>
                Our team of seasoned professionals brings decades of collective expertise, backed by over $5 billion in successfully executed transactions. Through exclusive partnerships with the UAE&apos;s most prestigious developers, we offer privileged access to the market&apos;s finest opportunities — many of which remain beyond the reach of conventional agencies.
              </p>
              <p>
                At the core of our approach lies rigorous market intelligence and deep regional expertise. We anticipate shifts, identify opportunities, and guide you with clarity and confidence at every step — ensuring every decision you make is informed, strategic, and aligned with your vision. At BlackOak, we understand that property acquisition at this level is more than a transaction. It is a defining decision — and one that deserves the utmost discretion, expertise, and a truly bespoke approach.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>A Legacy of Excellence</SectionLabel>
            <div className="text-center mt-5">
              <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                BlackOak Real Estate
              </h2>
              <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                UAE&apos;s Premier Property Authority
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="mt-12 flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
            {featureCards.map((card, i) => (
              <AnimateOnScroll key={card.title} delay={i * 0.15}>
                <div className="flex shrink-0 w-[1156px] max-w-[calc(100vw-130px)]">
                  <div className="bg-[#f0f3f8] flex flex-col justify-between px-10 py-16 w-[400px] shrink-0">
                    <div>
                      <h3 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                        {card.title}
                      </h3>
                      <p className="mt-8 text-gray-500 text-base leading-7 tracking-wide">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="relative w-[756px] h-[480px] overflow-hidden shrink-0">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12">
              {/* Left text */}
              <div className="lg:w-1/2">
                <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                  Save more with our best details
                </h2>
                <p className="mt-3 text-gray-500 text-base leading-7 tracking-wide max-w-[548px]">
                  Lorem ipsum dolor sit amet consectetur. Mattis viverra felis aenean gravida odio laoreet quis mattis. Blandit tellus venenatis eros et
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-0 lg:w-1/2 justify-center">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-center">
                    {i > 0 && (
                      <div className="h-[180px] w-px bg-gray-200 mx-8 lg:mx-12" />
                    )}
                    <div>
                      <p className="text-[60px] md:text-[70px] font-semibold leading-none text-black">
                        <CountUp end={stat.end} suffix={stat.suffix} duration={2} />
                      </p>
                      <div className="mt-3 text-gray-500 text-lg md:text-xl leading-[26px]">
                        <p>{stat.label}</p>
                        <p>{stat.sublabel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Why Choose Us heading */}
      <section className="py-16">
        <div className="container-narrow">
          <AnimateOnScroll>
            <SectionLabel>Why Choose Us</SectionLabel>
            <SectionHeading
              title="A legacy of excellence in curating extraordinary"
              className="mt-5 max-w-[499px] mx-auto"
            />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Technologically Enhanced */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Image
            src="/images/about/pattern.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="container-wide relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimateOnScroll>
              <div className="lg:w-[496px]">
                <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                  Technologically Enhanced
                </h2>
                <p className="mt-6 text-gray-500 text-base leading-7 tracking-wide">
                  At BlackOak, we seamlessly blend cutting-edge technology with unparalleled market expertise to deliver an experience that is as sophisticated as it is effortless. Our proprietary AI-driven marketing platform ensures your property receives unrivaled visibility — connecting the right opportunities with the right clientele, with remarkable precision and speed. By embracing the very forefront of technological innovation, we don&apos;t simply keep pace with the future of real estate — we define it.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div className="relative w-full lg:w-[600px] aspect-[4/3]">
                <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                  <Image
                    src="/images/about/tech-enhanced.png"
                    alt="Technologically enhanced real estate"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Experienced Team */}
      <section className="py-20 overflow-hidden">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimateOnScroll>
              <div className="relative w-full lg:w-[600px] aspect-[4/3]">
                <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                  <Image
                    src="/images/about/experienced-team.png"
                    alt="BlackOak experienced team"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div className="lg:w-[557px]">
                <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                  Experienced Team
                </h2>
                <p className="mt-6 text-gray-500 text-base leading-7 tracking-wide">
                  At BlackOak, our expertise transcends the conventional — serving an exclusive clientele that spans both distinguished private investors and the world&apos;s most prominent institutional players. Our seasoned team brings a rare depth of experience in navigating complex, high-value mandates with the precision and discretion that sophisticated clients demand. From sourcing landmark assets to identifying exceptional development opportunities, we act as a trusted partner to institutions who require not just a service provider — but a strategic ally of the highest caliber.
                </p>
                <div className="mt-8">
                  <Button href="/about/our-team" variant="outline">
                    Meet Our Team
                  </Button>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Large Investor Network */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Image
            src="/images/about/pattern.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="container-wide relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimateOnScroll>
              <div className="lg:w-[572px]">
                <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                  Large Investor Network
                </h2>
                <p className="mt-6 text-gray-500 text-base leading-7 tracking-wide">
                  At BlackOak, we have cultivated an expansive and highly exclusive network of distinguished international investors — a community built on trust, discretion, and a shared pursuit of exceptional opportunity. This privileged network affords us unparalleled access to off-market assets and rare investment prospects, while simultaneously providing our projects with the global reach and visibility that only a truly connected agency can offer. Whether sourcing or placing capital, our investor relationships are not merely transactional — they are enduring partnerships that consistently unlock value at the highest level of the market.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div className="relative w-full lg:w-[600px] aspect-[4/3]">
                <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                  <Image
                    src="/images/about/investor-network.png"
                    alt="Large investor network"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
