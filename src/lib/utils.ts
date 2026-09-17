import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Props that make an element `inert` (unfocusable, unclickable, hidden from
 * screen readers). Spread onto the element: `<div {...inertProps(locked)}>`.
 *
 * Do NOT write `inert={true}`. It type-checks, because next/types pulls in
 * react/experimental which declares `inert?: boolean`, but the React DOM that
 * Next 14 bundles (18.3.0-canary) has no inert support and silently drops a
 * boolean value. Only the string form reaches the DOM (`inert=""`), and the
 * types reject a string, hence the cast. Revisit on React 19 / Next 15, where
 * the boolean form works natively.
 */
export function inertProps(on: boolean): { inert?: boolean } {
  return on ? ({ inert: '' } as unknown as { inert?: boolean }) : {};
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
