export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "phone"
  | "url"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "checkbox"
  | "date"
  | "time"
  | "scale"
  | "rating"
  | "nps"
  | "heading"
  | "paragraph"
  | "page_break"
  | "file_upload";

export interface FieldOption {
  id: string;
  label: string;
}

export interface ConditionalRule {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "not_empty" | "empty" | "greater_than" | "less_than";
  value?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[];
  orderIndex: number;
  settings?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    minLabel?: string;
    maxLabel?: string;
    maxRating?: number;
    pattern?: string;
    patternMessage?: string;
    helpText?: string;
    defaultValue?: string;
    randomizeOptions?: boolean;
    width?: "full" | "half";
    conditionalLogic?: {
      enabled: boolean;
      match: "all" | "any";
      rules: ConditionalRule[];
    };
    accept?: string;
    maxFileSizeMB?: number;
  };
}

export interface FormSettings {
  themeColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  collectEmail?: boolean;
  showProgressBar?: boolean;
  confirmationMessage?: string;
  allowMultipleSubmissions?: boolean;
  submitButtonText?: string;
  redirectUrl?: string;
  password?: string;
  closeDate?: string;
  openDate?: string;
  maxSubmissions?: number;
  enableHoneypot?: boolean;
  enableDarkMode?: boolean;
  oneQuestionAtATime?: boolean;
  showEstimatedTime?: boolean;
  hideBranding?: boolean;
  requireConfirmation?: boolean;
  notifyEmail?: string;
  webhookUrl?: string;
  customCssClass?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface Form {
  id: string;
  slug: string;
  title: string;
  description: string;
  isPublished: boolean;
  settings: FormSettings;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  submissionCount?: number;
  viewCount?: number;
}

export interface FormListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  submissionCount: number;
  fieldCount: number;
}

export interface SubmissionAnswer {
  fieldId: string;
  fieldLabel: string;
  fieldType: FieldType;
  value: string | string[];
}

export interface Submission {
  id: string;
  formId: string;
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
  completionTimeMs?: number;
  referrer?: string;
  answers: SubmissionAnswer[];
}

export interface AnalyticsData {
  overview: {
    totalSubmissions: number;
    submissionsToday: number;
    submissionsThisWeek: number;
    submissionsThisMonth: number;
    avgCompletionTime?: number;
    conversionRate: number;
    totalViews?: number;
    bounceRate?: number;
  };
  timeline: { date: string; count: number }[];
  fieldStats: FieldStat[];
  recentSubmissions: Submission[];
  deviceBreakdown: { label: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
}

export interface FieldStat {
  fieldId: string;
  fieldLabel: string;
  fieldType: FieldType;
  responseCount: number;
  options?: { label: string; count: number; percentage: number }[];
  average?: number;
  samples?: string[];
}

export const FIELD_TYPE_META: Record<
  FieldType,
  { label: string; icon: string; description: string; category?: string }
> = {
  short_text: { label: "Short answer", icon: "Type", description: "Single line text", category: "Input" },
  long_text: { label: "Paragraph", icon: "AlignLeft", description: "Multi-line text", category: "Input" },
  email: { label: "Email", icon: "Mail", description: "Email address", category: "Input" },
  number: { label: "Number", icon: "Hash", description: "Numeric input", category: "Input" },
  phone: { label: "Phone", icon: "Phone", description: "Phone number", category: "Input" },
  url: { label: "URL", icon: "Link", description: "Website link", category: "Input" },
  single_choice: { label: "Multiple choice", icon: "CircleDot", description: "Pick one option", category: "Choice" },
  multiple_choice: { label: "Checkboxes", icon: "CheckSquare", description: "Pick multiple", category: "Choice" },
  dropdown: { label: "Dropdown", icon: "ChevronDown", description: "Select from list", category: "Choice" },
  checkbox: { label: "Yes / No", icon: "ToggleLeft", description: "Toggle checkbox", category: "Choice" },
  date: { label: "Date", icon: "Calendar", description: "Date picker", category: "Input" },
  time: { label: "Time", icon: "Clock", description: "Time picker", category: "Input" },
  scale: { label: "Linear scale", icon: "SlidersHorizontal", description: "Scale rating", category: "Rating" },
  rating: { label: "Star rating", icon: "Star", description: "Star rating", category: "Rating" },
  nps: { label: "NPS Score", icon: "TrendingUp", description: "0-10 recommendation score", category: "Rating" },
  heading: { label: "Section heading", icon: "Heading", description: "Title divider", category: "Layout" },
  paragraph: { label: "Description", icon: "FileText", description: "Static text block", category: "Layout" },
  page_break: { label: "Page break", icon: "SeparatorHorizontal", description: "Multi-step divider", category: "Layout" },
  file_upload: { label: "File upload", icon: "Upload", description: "Upload a file", category: "Input" },
};

export const THEME_PRESETS = [
  { name: "Indigo", color: "#6366f1" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Pink", color: "#ec4899" },
  { name: "Rose", color: "#f43f5e" },
  { name: "Orange", color: "#f97316" },
  { name: "Emerald", color: "#10b981" },
  { name: "Sky", color: "#0ea5e9" },
  { name: "Slate", color: "#475569" },
];

export const FONT_PRESETS = [
  { name: "System", value: "system-ui, sans-serif" },
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Monospace", value: "ui-monospace, monospace" },
];
