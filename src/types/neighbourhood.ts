export interface Neighbourhood {
  id: string;
  slug: string;
  name: string;
  heroImage: string;
  tagline: string;
  description: string;
  properties: string[]; // project slugs
  attractions: { name: string; description: string; image: string }[];
  whyInvest: { title: string; description: string }[];
  seo: { title: string; description: string };
}
