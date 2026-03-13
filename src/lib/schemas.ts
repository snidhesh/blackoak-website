import { z } from 'zod';

const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

export const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
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

export type ContactFormData = z.infer<typeof contactSchema>;
export type ProjectEnquiryFormData = z.infer<typeof projectEnquirySchema>;
export type CareerApplicationFormData = z.infer<typeof careerApplicationSchema>;

// CV file validation (used separately as File isn't in zod natively)
export const MAX_CV_SIZE = 4 * 1024 * 1024; // 4MB
export const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export function validateCVFile(file: File): string | null {
  if (file.size > MAX_CV_SIZE) {
    return 'File size must be less than 4MB';
  }
  if (!ALLOWED_CV_TYPES.includes(file.type)) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_CV_EXTENSIONS.includes(ext)) {
      return 'Only PDF, DOC, and DOCX files are allowed';
    }
  }
  return null;
}
