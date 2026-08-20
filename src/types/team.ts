export interface TeamMember {
  id: string;
  name: string;
  title: string;
  image: string;
  category: 'partner' | 'real-estate' | 'creative-ops';
  linkedIn?: string;
  bio?: string;
  email?: string;
  phone?: string;
}
