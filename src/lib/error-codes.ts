// Field-level codes -> client resolves via useTranslations('validation')
export const FIELD_ERROR_CODES = {
  firstNameMin: 'firstNameMin',
  lastNameMin: 'lastNameMin',
  phoneInvalid: 'phoneInvalid',
  emailInvalid: 'emailInvalid',
  messageMin: 'messageMin',
  selectPropertyType: 'selectPropertyType',
  selectBedrooms: 'selectBedrooms',
  selectListingType: 'selectListingType',
  enterLocation: 'enterLocation',
  fileTooLarge: 'fileTooLarge',
  fileTypeInvalid: 'fileTypeInvalid',
} as const;

// Form-level codes -> client resolves via useTranslations('forms')
export const FORM_ERROR_CODES = {
  rateLimited: 'errorRateLimited',
  submitFailed: 'errorSubmitFailed',
  unexpectedError: 'errorGeneric',
} as const;

export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[keyof typeof FIELD_ERROR_CODES];
export type FormErrorCode = (typeof FORM_ERROR_CODES)[keyof typeof FORM_ERROR_CODES];
