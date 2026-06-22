export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "phone"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "checkbox"
  | "date"
  | "time"
  | "scale"
  | "rating";

export interface FieldOption {
  id: string;
  label: string;
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
    minLabel?: string;
    maxLabel?: string;
    maxRating?: number;
  };
}

export interface FormSettings {
  themeColor?: string;
  collectEmail?: boolean;
  showProgressBar?: boolean;
  confirmationMessage?: string;
  allowMultipleSubmissions?: boolean;
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
  { label: string; icon: string; description: string }
> = {
  short_text: { label: "Short answer", icon: "Type", description: "Single line text" },
  long_text: { label: "Paragraph", icon: "AlignLeft", description: "Multi-line text" },
  email: { label: "Email", icon: "Mail", description: "Email address" },
  number: { label: "Number", icon: "Hash", description: "Numeric input" },
  phone: { label: "Phone", icon: "Phone", description: "Phone number" },
  single_choice: { label: "Multiple choice", icon: "CircleDot", description: "Pick one option" },
  multiple_choice: { label: "Checkboxes", icon: "CheckSquare", description: "Pick multiple" },
  dropdown: { label: "Dropdown", icon: "ChevronDown", description: "Select from list" },
  checkbox: { label: "Yes / No", icon: "ToggleLeft", description: "Toggle checkbox" },
  date: { label: "Date", icon: "Calendar", description: "Date picker" },
  time: { label: "Time", icon: "Clock", description: "Time picker" },
  scale: { label: "Linear scale", icon: "SlidersHorizontal", description: "Scale rating" },
  rating: { label: "Star rating", icon: "Star", description: "Star rating" },
};
