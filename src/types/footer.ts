export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterData {
  logo: string;
  tagline: string;
  columns: FooterColumn[];
  address: {
    dubai: { label: string; lines: string[] };
    london: { label: string; lines: string[] };
  };
  contact: {
    email: string;
    phone: string;
  };
  social: { platform: string; url: string; icon: string }[];
  awards: { name: string; image: string }[];
  bottomBar: {
    copyright: string;
    links: { label: string; href: string }[];
  };
}
