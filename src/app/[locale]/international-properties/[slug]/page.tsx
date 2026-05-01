import { notFound } from 'next/navigation';

// All individual country/property pages are temporarily disabled (coming soon).
// Return 404 for all slugs.
export default function InternationalSlugPage() {
  notFound();
}
