import type { FormField } from "@/types/form";

export function isFieldVisible(
  field: FormField,
  answers: Record<string, string | string[]>
): boolean {
  const logic = field.settings?.conditionalLogic;
  if (!logic?.enabled || !logic.rules?.length) return true;

  const results = logic.rules.map((rule) => {
    const answer = answers[rule.fieldId];
    const strVal = Array.isArray(answer) ? answer.join(", ") : (answer ?? "");

    switch (rule.operator) {
      case "equals":
        return strVal === rule.value;
      case "not_equals":
        return strVal !== rule.value;
      case "contains":
        return strVal.toLowerCase().includes(String(rule.value).toLowerCase());
      case "not_empty":
        return strVal.trim().length > 0;
      case "empty":
        return strVal.trim().length === 0;
      case "greater_than":
        return Number(strVal) > Number(rule.value);
      case "less_than":
        return Number(strVal) < Number(rule.value);
      default:
        return true;
    }
  });

  return logic.match === "all" ? results.every(Boolean) : results.some(Boolean);
}

export function getVisibleFields(
  fields: FormField[],
  answers: Record<string, string | string[]>
): FormField[] {
  return fields.filter((f) => isFieldVisible(f, answers));
}

export function getFormPages(fields: FormField[]): FormField[][] {
  const pages: FormField[][] = [[]];
  for (const field of fields) {
    if (field.type === "page_break") {
      pages.push([]);
    } else {
      pages[pages.length - 1].push(field);
    }
  }
  return pages.filter((p) => p.length > 0);
}
