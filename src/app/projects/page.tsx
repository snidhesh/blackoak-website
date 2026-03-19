import type { Metadata } from 'next';
import { getProjects } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import ProjectsClient from './ProjectsClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Luxury Properties for Sale & Rent in Dubai',
  description:
    'Explore luxury villas, apartments & penthouses for sale and rent across Palm Jumeirah, Emirates Hills, Downtown Dubai & more. Off-plan and ready properties curated by BlackOak.',
  alternates: { canonical: 'https://blackoak-re.com/projects' },
  openGraph: {
    title: 'Luxury Properties for Sale & Rent in Dubai',
    description:
      'Explore luxury villas, apartments & penthouses for sale and rent across Palm Jumeirah, Emirates Hills, Downtown Dubai & more.',
    type: 'website',
    url: 'https://blackoak-re.com/projects',
    images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: 'BlackOak Luxury Properties in Dubai' }],
  },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  const neighbourhoodSlugs = [...new Set(projects.map((p) => p.neighbourhood))];
  const propertyTypes = [...new Set(projects.map((p) => p.propertyType))];
  const offerings = [...new Set(projects.map((p) => p.offering).filter(Boolean))] as string[];

  return (
    <>
      {/* Black navbar backdrop */}
      <div className="bg-black h-16 lg:h-20" />

      {/* Hero - white bg */}
      <section className="bg-white pt-12 pb-16">
        <div className="container-wide text-center">
          <SectionLabel>Discover Projects</SectionLabel>
          <h1 className="text-4xl md:text-[50px] font-light leading-tight text-black mt-5">
            Live Beyond Ordinary,<br />Designed for the Extraordinary
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <ProjectsClient
            projects={projects}
            neighbourhoodSlugs={neighbourhoodSlugs}
            propertyTypes={propertyTypes}
            offerings={offerings}
          />
        </div>
      </section>
    </>
  );
}
