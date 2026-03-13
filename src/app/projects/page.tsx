import type { Metadata } from 'next';
import { getProjects } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore luxury real estate projects across Dubai\'s most prestigious neighbourhoods.',
};

export default function ProjectsPage() {
  const projects = getProjects();

  const neighbourhoodSlugs = [...new Set(projects.map((p) => p.neighbourhood))];
  const propertyTypes = [...new Set(projects.map((p) => p.propertyType))];

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
          />
        </div>
      </section>
    </>
  );
}
