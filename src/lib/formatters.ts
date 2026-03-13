export function formatPrice(price: number, currency: string = 'AED'): string {
  return `${currency} ${price.toLocaleString('en-US')}`;
}

export function formatPriceNumber(price: number): string {
  return price.toLocaleString('en-US');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
