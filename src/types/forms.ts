export interface ContactSubmission {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  _honeypot: string;
}

export interface CareerApplicationSubmission {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  cvFile: File | null;
  jobSlug: string;
  jobTitle: string;
  _honeypot: string;
}

export interface ProjectEnquirySubmission {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  projectSlug: string;
  projectName: string;
  _honeypot: string;
}
