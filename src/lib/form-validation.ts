import type { FormField } from "@/types/form";

export interface ValidationError {
  fieldId: string;
  message: string;
}

export function validateField(
  field: FormField,
  value: string | string[] | undefined
): string | null {
  if (field.type === "heading" || field.type === "paragraph" || field.type === "page_break") {
    return null;
  }

  const strVal = Array.isArray(value) ? value.join(", ") : (value ?? "");
  const isEmpty = Array.isArray(value) ? value.length === 0 : !strVal.trim();

  if (field.required && isEmpty) {
    return `"${field.label}" is required`;
  }
  if (isEmpty) return null;

  const s = field.settings;

  if (field.type === "email" && strVal) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
      return "Please enter a valid email address";
    }
  }

  if (field.type === "url" && strVal) {
    try {
      new URL(strVal.startsWith("http") ? strVal : `https://${strVal}`);
    } catch {
      return "Please enter a valid URL";
    }
  }

  if (field.type === "phone" && strVal) {
    if (!/^[\d\s+\-().]{7,}$/.test(strVal)) {
      return "Please enter a valid phone number";
    }
  }

  if (["short_text", "long_text"].includes(field.type)) {
    if (s?.minLength && strVal.length < s.minLength) {
      return `Minimum ${s.minLength} characters required`;
    }
    if (s?.maxLength && strVal.length > s.maxLength) {
      return `Maximum ${s.maxLength} characters allowed`;
    }
    if (s?.pattern) {
      try {
        if (!new RegExp(s.pattern).test(strVal)) {
          return s.patternMessage || "Invalid format";
        }
      } catch {
        /* invalid regex */
      }
    }
  }

  if (field.type === "number" && strVal) {
    const num = Number(strVal);
    if (isNaN(num)) return "Please enter a valid number";
    if (s?.min !== undefined && num < s.min) return `Minimum value is ${s.min}`;
    if (s?.max !== undefined && num > s.max) return `Maximum value is ${s.max}`;
  }

  return null;
}

export function validateAnswers(
  fields: FormField[],
  answers: Record<string, string | string[]>,
  visibleFieldIds?: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const field of fields) {
    if (visibleFieldIds && !visibleFieldIds.has(field.id)) continue;
    const err = validateField(field, answers[field.id]);
    if (err) errors.push({ fieldId: field.id, message: err });
  }
  return errors;
}
