// Reader-facing labels for values that arrive from the CRM in English
// ("Apartment", "Sq.Ft.", 0 bedrooms), so French and Arabic listing pages do
// not mix languages. Works with both the server and client next-intl
// translators, which is why the translator types are loose.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Translator = { (key: any): string; has(key: any): boolean };
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * CRM property type in the reader's language.
 * @param tTypes translator for the `forms.propertyTypes` namespace
 * Falls back to the CRM value for a type with no translation yet.
 */
export function propertyTypeLabel(type: string, tTypes: Translator): string {
  const key = type.toLowerCase();
  return tTypes.has(key) ? tTypes(key) : type;
}

/**
 * A listing with no bedrooms is a studio only when it is an apartment —
 * offices have no bedrooms either.
 */
export function isStudio(listing: { bedrooms: number; propertyType: string }): boolean {
  return listing.bedrooms === 0 && listing.propertyType.toLowerCase() === 'apartment';
}

/**
 * Area unit in the reader's language.
 * @param tCommon translator for the `common` namespace
 */
export function areaUnitLabel(unit: string, tCommon: Translator): string {
  return unit === 'Sq.Ft.' ? tCommon('sqFt') : unit;
}
