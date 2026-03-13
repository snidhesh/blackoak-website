export interface NavigationItem {
  label: string;
  href?: string;
  dropdown?: NavigationItem[];
}
