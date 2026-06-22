import type { Submission, FormField } from "@/types/form";

export function submissionsToCSV(
  submissions: Submission[],
  fields: FormField[]
): string {
  const answerFields = fields.filter(
    (f) => !["heading", "paragraph", "page_break"].includes(f.type)
  );
  const headers = ["Submission ID", "Submitted At", ...answerFields.map((f) => f.label)];
  const rows = submissions.map((sub) => {
    const cells = [
      sub.id,
      sub.submittedAt,
      ...answerFields.map((f) => {
        const ans = sub.answers.find((a) => a.fieldId === f.id);
        const val = ans?.value ?? "";
        const str = Array.isArray(val) ? val.join("; ") : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }),
    ];
    return cells.join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export function submissionsToJSON(submissions: Submission[]): string {
  return JSON.stringify(submissions, null, 2);
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
