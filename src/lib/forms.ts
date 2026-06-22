import { v4 as uuidv4 } from "uuid";
import { query, execute, RowDataPacket } from "./db";
import type {
  Form,
  FormField,
  FormListItem,
  FormSettings,
  AnalyticsData,
  FieldStat,
  Submission,
  FieldType,
} from "@/types/form";

interface FormRow extends RowDataPacket {
  id: string;
  slug: string;
  title: string;
  description: string;
  settings: string | FormSettings;
  is_published: number;
  created_at: Date;
  updated_at: Date;
  submission_count?: number;
  field_count?: number;
}

interface FieldRow extends RowDataPacket {
  id: string;
  form_id: string;
  type: string;
  label: string;
  placeholder: string | null;
  required: number;
  options: string | null;
  settings: string | null;
  order_index: number;
}

function parseJson<T>(value: string | T | null, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base) || "form";
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const rows = await query<RowDataPacket[]>(
      "SELECT id FROM forms WHERE slug = :slug LIMIT 1",
      { slug: candidate }
    );
    if (rows.length === 0) return candidate;
    attempt++;
  }
}

function mapField(row: FieldRow): FormField {
  return {
    id: row.id,
    type: row.type as FieldType,
    label: row.label,
    placeholder: row.placeholder || undefined,
    required: Boolean(row.required),
    options: parseJson(row.options, undefined),
    settings: parseJson(row.settings, undefined),
    orderIndex: row.order_index,
  };
}

function mapForm(row: FormRow, fields: FormField[] = []): Form {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    isPublished: Boolean(row.is_published),
    settings: parseJson<FormSettings>(row.settings, {}),
    fields,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    submissionCount: row.submission_count,
  };
}

export async function listForms(): Promise<FormListItem[]> {
  const rows = await query<FormRow[]>(`
    SELECT f.*,
      (SELECT COUNT(*) FROM form_submissions s WHERE s.form_id = f.id) AS submission_count,
      (SELECT COUNT(*) FROM form_fields ff WHERE ff.form_id = f.id) AS field_count
    FROM forms f
    ORDER BY f.updated_at DESC
  `);
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    submissionCount: Number(row.submission_count || 0),
    fieldCount: Number(row.field_count || 0),
  }));
}

export async function getFormById(id: string): Promise<Form | null> {
  const rows = await query<FormRow[]>(
    "SELECT * FROM forms WHERE id = :id LIMIT 1",
    { id }
  );
  if (!rows.length) return null;
  const fieldRows = await query<FieldRow[]>(
    "SELECT * FROM form_fields WHERE form_id = :id ORDER BY order_index ASC",
    { id }
  );
  return mapForm(rows[0], fieldRows.map(mapField));
}

export async function getFormBySlug(slug: string): Promise<Form | null> {
  const rows = await query<FormRow[]>(
    "SELECT * FROM forms WHERE slug = :slug LIMIT 1",
    { slug }
  );
  if (!rows.length) return null;
  const fieldRows = await query<FieldRow[]>(
    "SELECT * FROM form_fields WHERE form_id = :id ORDER BY order_index ASC",
    { id: rows[0].id }
  );
  return mapForm(rows[0], fieldRows.map(mapField));
}

export async function createForm(data: {
  title: string;
  description?: string;
  settings?: FormSettings;
  fields?: FormField[];
}): Promise<Form> {
  const id = uuidv4();
  const slug = await uniqueSlug(data.title);
  await execute(
    `INSERT INTO forms (id, slug, title, description, settings, is_published)
     VALUES (:id, :slug, :title, :description, :settings, 0)`,
    {
      id,
      slug,
      title: data.title,
      description: data.description || "",
      settings: JSON.stringify(data.settings || {}),
    }
  );
  if (data.fields?.length) {
    for (const field of data.fields) {
      await saveField(id, field);
    }
  }
  const form = await getFormById(id);
  return form!;
}

export async function updateForm(
  id: string,
  data: {
    title?: string;
    description?: string;
    settings?: FormSettings;
    isPublished?: boolean;
    fields?: FormField[];
  }
): Promise<Form | null> {
  const existing = await getFormById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const params: Record<string, unknown> = { id };

  if (data.title !== undefined) {
    updates.push("title = :title");
    params.title = data.title;
  }
  if (data.description !== undefined) {
    updates.push("description = :description");
    params.description = data.description;
  }
  if (data.settings !== undefined) {
    updates.push("settings = :settings");
    params.settings = JSON.stringify(data.settings);
  }
  if (data.isPublished !== undefined) {
    updates.push("is_published = :isPublished");
    params.isPublished = data.isPublished ? 1 : 0;
  }

  if (updates.length) {
    await execute(`UPDATE forms SET ${updates.join(", ")} WHERE id = :id`, params);
  }

  if (data.fields !== undefined) {
    await execute("DELETE FROM form_fields WHERE form_id = :id", { id });
    for (const field of data.fields) {
      await saveField(id, field);
    }
  }

  return getFormById(id);
}

async function saveField(formId: string, field: FormField) {
  const fieldId = field.id || uuidv4();
  await execute(
    `INSERT INTO form_fields (id, form_id, type, label, placeholder, required, options, settings, order_index)
     VALUES (:id, :formId, :type, :label, :placeholder, :required, :options, :settings, :orderIndex)`,
    {
      id: fieldId,
      formId,
      type: field.type,
      label: field.label,
      placeholder: field.placeholder || null,
      required: field.required ? 1 : 0,
      options: field.options ? JSON.stringify(field.options) : null,
      settings: field.settings ? JSON.stringify(field.settings) : null,
      orderIndex: field.orderIndex,
    }
  );
}

export async function deleteForm(id: string): Promise<boolean> {
  const result = await execute("DELETE FROM forms WHERE id = :id", { id });
  return result.affectedRows > 0;
}

export async function submitForm(
  slug: string,
  answers: Record<string, string | string[]>,
  meta?: { ip?: string; userAgent?: string }
): Promise<{ success: boolean; message?: string }> {
  const form = await getFormBySlug(slug);
  if (!form || !form.isPublished) {
    return { success: false, message: "Form not found or not published" };
  }

  for (const field of form.fields) {
    if (field.required) {
      const val = answers[field.id];
      if (!val || (Array.isArray(val) && val.length === 0)) {
        return { success: false, message: `"${field.label}" is required` };
      }
    }
  }

  const submissionId = uuidv4();
  await execute(
    `INSERT INTO form_submissions (id, form_id, ip_address, user_agent)
     VALUES (:id, :formId, :ip, :ua)`,
    {
      id: submissionId,
      formId: form.id,
      ip: meta?.ip || null,
      ua: meta?.userAgent || null,
    }
  );

  for (const field of form.fields) {
    const val = answers[field.id];
    if (val === undefined || val === null) continue;
    const value = Array.isArray(val) ? JSON.stringify(val) : String(val);
    await execute(
      `INSERT INTO submission_answers (id, submission_id, field_id, value)
       VALUES (:id, :submissionId, :fieldId, :value)`,
      {
        id: uuidv4(),
        submissionId,
        fieldId: field.id,
        value,
      }
    );
  }

  return { success: true };
}

export async function getAnalytics(formId: string): Promise<AnalyticsData | null> {
  const form = await getFormById(formId);
  if (!form) return null;

  const [overviewRows] = await Promise.all([
    query<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN DATE(submitted_at) = CURDATE() THEN 1 ELSE 0 END) AS today,
        SUM(CASE WHEN submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS week,
        SUM(CASE WHEN submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS month
       FROM form_submissions WHERE form_id = :formId`,
      { formId }
    ),
  ]);

  const overview = overviewRows[0] || {};
  const total = Number(overview.total || 0);

  const timelineRows = await query<RowDataPacket[]>(
    `SELECT DATE(submitted_at) AS date, COUNT(*) AS count
     FROM form_submissions
     WHERE form_id = :formId AND submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(submitted_at)
     ORDER BY date ASC`,
    { formId }
  );

  const hourlyRows = await query<RowDataPacket[]>(
    `SELECT HOUR(submitted_at) AS hour, COUNT(*) AS count
     FROM form_submissions WHERE form_id = :formId
     GROUP BY HOUR(submitted_at) ORDER BY hour ASC`,
    { formId }
  );

  const fieldStats: FieldStat[] = [];
  for (const field of form.fields) {
    const stat = await getFieldStat(formId, field);
    fieldStats.push(stat);
  }

  const recentSubmissions = await getRecentSubmissions(formId, 10);

  const deviceRows = await query<RowDataPacket[]>(
    `SELECT
      CASE
        WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
        WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
        ELSE 'Desktop'
      END AS label,
      COUNT(*) AS count
     FROM form_submissions WHERE form_id = :formId
     GROUP BY label`,
    { formId }
  );

  return {
    overview: {
      totalSubmissions: total,
      submissionsToday: Number(overview.today || 0),
      submissionsThisWeek: Number(overview.week || 0),
      submissionsThisMonth: Number(overview.month || 0),
      conversionRate: form.isPublished ? 100 : 0,
    },
    timeline: timelineRows.map((r) => ({
      date: String(r.date),
      count: Number(r.count),
    })),
    fieldStats,
    recentSubmissions,
    deviceBreakdown: deviceRows.map((r) => ({
      label: String(r.label),
      count: Number(r.count),
    })),
    hourlyDistribution: hourlyRows.map((r) => ({
      hour: Number(r.hour),
      count: Number(r.count),
    })),
  };
}

async function getFieldStat(
  formId: string,
  field: FormField
): Promise<FieldStat> {
  const answerRows = await query<RowDataPacket[]>(
    `SELECT sa.value FROM submission_answers sa
     JOIN form_submissions fs ON fs.id = sa.submission_id
     WHERE sa.field_id = :fieldId AND fs.form_id = :formId AND sa.value IS NOT NULL AND sa.value != ''`,
    { fieldId: field.id, formId }
  );

  const stat: FieldStat = {
    fieldId: field.id,
    fieldLabel: field.label,
    fieldType: field.type,
    responseCount: answerRows.length,
  };

  if (["single_choice", "dropdown", "multiple_choice"].includes(field.type)) {
    const counts: Record<string, number> = {};
    for (const row of answerRows) {
      let values: string[] = [];
      try {
        const parsed = JSON.parse(String(row.value));
        values = Array.isArray(parsed) ? parsed : [String(row.value)];
      } catch {
        values = [String(row.value)];
      }
      for (const v of values) {
        counts[v] = (counts[v] || 0) + 1;
      }
    }
    stat.options = Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percentage: answerRows.length ? Math.round((count / answerRows.length) * 100) : 0,
    }));
  } else if (["number", "scale", "rating"].includes(field.type)) {
    const nums = answerRows
      .map((r) => Number(r.value))
      .filter((n) => !isNaN(n));
    stat.average =
      nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : undefined;
  } else {
    stat.samples = answerRows.slice(0, 5).map((r) => String(r.value));
  }

  return stat;
}

async function getRecentSubmissions(
  formId: string,
  limit: number
): Promise<Submission[]> {
  const subRows = await query<RowDataPacket[]>(
    `SELECT id, form_id, submitted_at FROM form_submissions
     WHERE form_id = :formId ORDER BY submitted_at DESC LIMIT ${limit}`,
    { formId }
  );

  const submissions: Submission[] = [];
  for (const sub of subRows) {
    const answerRows = await query<RowDataPacket[]>(
      `SELECT sa.field_id, sa.value, ff.label, ff.type
       FROM submission_answers sa
       JOIN form_fields ff ON ff.id = sa.field_id
       WHERE sa.submission_id = :submissionId`,
      { submissionId: sub.id }
    );
    submissions.push({
      id: sub.id,
      formId: sub.form_id,
      submittedAt: sub.submitted_at.toISOString(),
      answers: answerRows.map((a) => {
        let value: string | string[] = String(a.value);
        try {
          const parsed = JSON.parse(String(a.value));
          if (Array.isArray(parsed)) value = parsed;
        } catch {
          /* keep string */
        }
        return {
          fieldId: a.field_id,
          fieldLabel: a.label,
          fieldType: a.type as FieldType,
          value,
        };
      }),
    });
  }
  return submissions;
}

export async function getDashboardStats() {
  const rows = await query<RowDataPacket[]>(`
    SELECT
      (SELECT COUNT(*) FROM forms) AS total_forms,
      (SELECT COUNT(*) FROM forms WHERE is_published = 1) AS published_forms,
      (SELECT COUNT(*) FROM form_submissions) AS total_submissions,
      (SELECT COUNT(*) FROM form_submissions WHERE DATE(submitted_at) = CURDATE()) AS submissions_today
  `);
  return {
    totalForms: Number(rows[0]?.total_forms || 0),
    publishedForms: Number(rows[0]?.published_forms || 0),
    totalSubmissions: Number(rows[0]?.total_submissions || 0),
    submissionsToday: Number(rows[0]?.submissions_today || 0),
  };
}

export async function authenticateAdmin(email: string, password: string) {
  const rows = await query<RowDataPacket[]>(
    "SELECT id, email, password_hash, name FROM admins WHERE email = :email LIMIT 1",
    { email }
  );
  if (!rows.length) return null;
  const bcrypt = await import("bcryptjs");
  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) return null;
  return {
    id: rows[0].id,
    email: rows[0].email,
    name: rows[0].name,
  };
}
