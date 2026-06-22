import { v4 as uuidv4 } from "uuid";
import type { FormField, FormSettings } from "@/types/form";

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  settings: FormSettings;
  fields: Omit<FormField, "id">[];
}

function opt(label: string) {
  return { id: uuidv4(), label };
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "contact",
    name: "Contact Form",
    description: "Collect name, email, and message",
    category: "Business",
    icon: "Mail",
    settings: { themeColor: "#6366f1", confirmationMessage: "Thanks! We'll be in touch soon." },
    fields: [
      { type: "short_text", label: "Full Name", required: true, orderIndex: 0, placeholder: "John Doe" },
      { type: "email", label: "Email", required: true, orderIndex: 1, placeholder: "john@example.com" },
      { type: "phone", label: "Phone", required: false, orderIndex: 2, placeholder: "+1 555 0000" },
      { type: "long_text", label: "Message", required: true, orderIndex: 3, placeholder: "How can we help?" },
    ],
  },
  {
    id: "feedback",
    name: "Customer Feedback",
    description: "NPS and satisfaction survey",
    category: "Survey",
    icon: "Star",
    settings: { themeColor: "#8b5cf6", showProgressBar: true },
    fields: [
      { type: "nps", label: "How likely are you to recommend us?", required: true, orderIndex: 0 },
      { type: "rating", label: "Overall satisfaction", required: true, orderIndex: 1, settings: { maxRating: 5 } },
      { type: "long_text", label: "What could we improve?", required: false, orderIndex: 2 },
    ],
  },
  {
    id: "event-rsvp",
    name: "Event RSVP",
    description: "Registration for events",
    category: "Events",
    icon: "Calendar",
    settings: { themeColor: "#ec4899", confirmationMessage: "You're registered!" },
    fields: [
      { type: "short_text", label: "Name", required: true, orderIndex: 0 },
      { type: "email", label: "Email", required: true, orderIndex: 1 },
      { type: "single_choice", label: "Will you attend?", required: true, orderIndex: 2, options: [opt("Yes"), opt("No"), opt("Maybe")] },
      { type: "number", label: "Number of guests", required: false, orderIndex: 3, settings: { min: 0, max: 10 } },
    ],
  },
  {
    id: "job-application",
    name: "Job Application",
    description: "Collect applicant information",
    category: "HR",
    icon: "Briefcase",
    settings: { themeColor: "#0ea5e9", showProgressBar: true },
    fields: [
      { type: "heading", label: "Personal Information", required: false, orderIndex: 0 },
      { type: "short_text", label: "Full Name", required: true, orderIndex: 1 },
      { type: "email", label: "Email", required: true, orderIndex: 2 },
      { type: "url", label: "LinkedIn Profile", required: false, orderIndex: 3 },
      { type: "page_break", label: "Experience", required: false, orderIndex: 4 },
      { type: "long_text", label: "Why do you want this role?", required: true, orderIndex: 5 },
      { type: "dropdown", label: "Years of experience", required: true, orderIndex: 6, options: [opt("0-1"), opt("1-3"), opt("3-5"), opt("5+")] },
    ],
  },
  {
    id: "quiz",
    name: "Quick Quiz",
    description: "Multiple choice quiz template",
    category: "Education",
    icon: "GraduationCap",
    settings: { themeColor: "#f59e0b", oneQuestionAtATime: true },
    fields: [
      { type: "single_choice", label: "What is 2 + 2?", required: true, orderIndex: 0, options: [opt("3"), opt("4"), opt("5")] },
      { type: "single_choice", label: "Capital of France?", required: true, orderIndex: 1, options: [opt("London"), opt("Paris"), opt("Berlin")] },
      { type: "short_text", label: "Your name", required: true, orderIndex: 2 },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter Signup",
    description: "Simple email capture",
    category: "Marketing",
    icon: "Newspaper",
    settings: { themeColor: "#10b981", submitButtonText: "Subscribe" },
    fields: [
      { type: "short_text", label: "First Name", required: true, orderIndex: 0 },
      { type: "email", label: "Email Address", required: true, orderIndex: 1 },
      { type: "checkbox", label: "I agree to receive emails", required: true, orderIndex: 2 },
    ],
  },
];

export function templateToFields(template: FormTemplate): FormField[] {
  return template.fields.map((f, i) => ({
    ...f,
    id: uuidv4(),
    orderIndex: i,
    options: f.options?.map((o) => ({ ...o, id: uuidv4() })),
  }));
}
