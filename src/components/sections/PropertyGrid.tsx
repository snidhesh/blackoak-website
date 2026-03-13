import PropertyCard from './PropertyCard';

interface Project {
  slug: string;
  name: string;
  mainImage: string;
  price: number;
  currency: string;
  developer: string;
  neighbourhood: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
}

interface PropertyGridProps {
  projects: Project[];
  columns?: 2 | 3;
}

export default function PropertyGrid({ projects, columns = 3 }: PropertyGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No properties found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''} gap-8`}>
      {projects.map((project) => (
        <PropertyCard key={project.slug} {...project} />
      ))}
    </div>
  );
}
