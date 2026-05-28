import { z } from 'zod';

const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

// UTM allowlist + sanitizer (mirrors the JPJ4J2 sibling project)
export const ALLOWED_UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export function sanitizeUtm(
  input?: Record<string, string>
): Record<string, string> | undefined {
  if (!input) return undefined;
  const out: Record<string, string> = {};
  for (const key of ALLOWED_UTM_KEYS) {
    const v = input[key];
    if (typeof v === 'string' && v.length > 0) {
      out[key] = v.slice(0, 200);
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

const utmField = z
  .record(z.string().max(40), z.string().max(200))
  .optional();

// ---------- Static schemas (used by API routes — English-only, server-side) ----------

export const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  utm: utmField,
  consent: z.boolean().refine((v) => v === true, { message: 'consentRequired' }),
  _honeypot: z.string().max(0, 'Bot detected'),
});

export const projectEnquirySchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  projectSlug: z.string().min(1),
  projectName: z.string().min(1),
  reference: z.string().max(200).optional(),
  utm: utmField,
  consent: z.boolean().refine((v) => v === true, { message: 'consentRequired' }),
  _honeypot: z.string().max(0, 'Bot detected'),
});

export const careerApplicationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  jobSlug: z.string().min(1),
  jobTitle: z.string().min(1),
  _honeypot: z.string().max(0, 'Bot detected'),
});

export const listPropertySchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  propertyType: z.enum(['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Land', 'Commercial'], { message: 'Please select a property type' }),
  bedrooms: z.string().min(1, 'Please select number of bedrooms'),
  listingType: z.enum(['Sell', 'Rent'], { message: 'Please select a listing type' }),
  location: z.string().min(2, 'Please enter the property location'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  _honeypot: z.string().max(0, 'Bot detected'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type ProjectEnquiryFormData = z.infer<typeof projectEnquirySchema>;
export type CareerApplicationFormData = z.infer<typeof careerApplicationSchema>;
export type ListPropertyFormData = z.infer<typeof listPropertySchema>;

// ---------- Factory schemas (used by client forms — accept translated messages) ----------

export interface ValidationMessages {
  firstNameMin: string;
  lastNameMin: string;
  phoneInvalid: string;
  emailInvalid: string;
  messageMin: string;
  consentRequired?: string;
  selectPropertyType?: string;
  selectBedrooms?: string;
  selectListingType?: string;
  enterLocation?: string;
}

export function createContactSchema(msgs: ValidationMessages) {
  return z.object({
    firstName: z.string().min(2, msgs.firstNameMin),
    lastName: z.string().min(2, msgs.lastNameMin),
    phone: z.string().regex(phoneRegex, msgs.phoneInvalid),
    email: z.string().email(msgs.emailInvalid),
    message: z.string().min(10, msgs.messageMin),
    utm: utmField,
    consent: z.boolean().refine((v) => v === true, { message: msgs.consentRequired }),
    _honeypot: z.string().max(0),
  });
}

export function createProjectEnquirySchema(msgs: ValidationMessages) {
  return z.object({
    firstName: z.string().min(2, msgs.firstNameMin),
    lastName: z.string().min(2, msgs.lastNameMin),
    phone: z.string().regex(phoneRegex, msgs.phoneInvalid),
    email: z.string().email(msgs.emailInvalid),
    message: z.string().min(10, msgs.messageMin),
    projectSlug: z.string().min(1),
    projectName: z.string().min(1),
    reference: z.string().max(200).optional(),
    utm: utmField,
    consent: z.boolean().refine((v) => v === true, { message: msgs.consentRequired }),
    _honeypot: z.string().max(0),
  });
}

export function createCareerApplicationSchema(msgs: ValidationMessages) {
  return z.object({
    firstName: z.string().min(2, msgs.firstNameMin),
    lastName: z.string().min(2, msgs.lastNameMin),
    phone: z.string().regex(phoneRegex, msgs.phoneInvalid),
    email: z.string().email(msgs.emailInvalid),
    message: z.string().min(10, msgs.messageMin),
    jobSlug: z.string().min(1),
    jobTitle: z.string().min(1),
    _honeypot: z.string().max(0),
  });
}

export function createListPropertySchema(msgs: ValidationMessages) {
  return z.object({
    firstName: z.string().min(2, msgs.firstNameMin),
    lastName: z.string().min(2, msgs.lastNameMin),
    phone: z.string().regex(phoneRegex, msgs.phoneInvalid),
    email: z.string().email(msgs.emailInvalid),
    propertyType: z.enum(['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Land', 'Commercial'], { message: msgs.selectPropertyType }),
    bedrooms: z.string().min(1, msgs.selectBedrooms ?? 'Required'),
    listingType: z.enum(['Sell', 'Rent'], { message: msgs.selectListingType }),
    location: z.string().min(2, msgs.enterLocation ?? 'Required'),
    message: z.string().min(10, msgs.messageMin),
    _honeypot: z.string().max(0),
  });
}

// CV file validation (used separately as File isn't in zod natively)
export const MAX_CV_SIZE = 4 * 1024 * 1024; // 4MB
export const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export interface CVValidationMessages {
  fileTooLarge: string;
  fileTypeInvalid: string;
}

export function validateCVFile(file: File, msgs?: CVValidationMessages): string | null {
  if (file.size > MAX_CV_SIZE) {
    return msgs?.fileTooLarge ?? 'File size must be less than 4MB';
  }
  if (!ALLOWED_CV_TYPES.includes(file.type)) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_CV_EXTENSIONS.includes(ext)) {
      return msgs?.fileTypeInvalid ?? 'Only PDF, DOC, and DOCX files are allowed';
    }
  }
  return null;
}
