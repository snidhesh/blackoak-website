export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  secondaryImage?: string;
  publishedDate: string;
  category: string;
  author: string;
  tags?: string[];
}
