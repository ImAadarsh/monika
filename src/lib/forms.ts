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
  if (typeof value !== "string") return fallback;
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
  const params: Record<string, string | number | boolean | null> = { id };

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

export async function duplicateForm(id: string): Promise<Form | null> {
  const existing = await getFormById(id);
  if (!existing) return null;
  const newFields = existing.fields.map((f) => ({
    ...f,
    id: uuidv4(),
    options: f.options?.map((o) => ({ ...o, id: uuidv4() })),
  }));
  return createForm({
    title: `${existing.title} (Copy)`,
    description: existing.description,
    settings: existing.settings,
    fields: newFields,
  });
}

export async function updateFormSlug(id: string, slug: string): Promise<Form | null> {
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  if (!clean) return null;
  const rows = await query<RowDataPacket[]>(
    "SELECT id FROM forms WHERE slug = :slug AND id != :id LIMIT 1",
    { slug: clean, id }
  );
  if (rows.length) return null;
  await execute("UPDATE forms SET slug = :slug WHERE id = :id", { slug: clean, id });
  return getFormById(id);
}

export async function recordFormView(
  formId: string,
  meta?: { ip?: string; userAgent?: string }
): Promise<void> {
  try {
    await execute(
      `INSERT INTO form_views (id, form_id, ip_address, user_agent) VALUES (:id, :formId, :ip, :ua)`,
      { id: uuidv4(), formId, ip: meta?.ip || null, ua: meta?.userAgent || null }
    );
  } catch {
    /* table may not exist yet */
  }
}

const BASE_SUBMISSION_COLUMNS =
  "id, form_id, submitted_at, ip_address, user_agent";

let hasOptionalSubmissionColumns: boolean | null = null;

async function submissionSelectColumns(): Promise<string> {
  if (hasOptionalSubmissionColumns === null) {
    try {
      await query<RowDataPacket[]>(
        "SELECT completion_time_ms, referrer FROM form_submissions LIMIT 0"
      );
      hasOptionalSubmissionColumns = true;
    } catch {
      hasOptionalSubmissionColumns = false;
    }
  }
  return hasOptionalSubmissionColumns
    ? `${BASE_SUBMISSION_COLUMNS}, completion_time_ms, referrer`
    : BASE_SUBMISSION_COLUMNS;
}

async function getSubmissionCount(formId: string): Promise<number> {
  const rows = await query<RowDataPacket[]>(
    "SELECT COUNT(*) AS cnt FROM form_submissions WHERE form_id = :formId",
    { formId }
  );
  return Number(rows[0]?.cnt || 0);
}

async function getRecentSubmissionFromIp(formId: string, ip: string): Promise<boolean> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id FROM form_submissions WHERE form_id = :formId AND ip_address = :ip
     AND submitted_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) LIMIT 1`,
    { formId, ip }
  );
  return rows.length > 0;
}

export async function submitForm(
  slug: string,
  answers: Record<string, string | string[]>,
  meta?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    completionTimeMs?: number;
    honeypot?: string;
    password?: string;
  }
): Promise<{ success: boolean; message?: string; redirectUrl?: string }> {
  const form = await getFormBySlug(slug);
  if (!form || !form.isPublished) {
    return { success: false, message: "Form not found or not published" };
  }

  const settings = form.settings;

  if (settings.openDate && new Date(settings.openDate) > new Date()) {
    return { success: false, message: "This form is not open yet" };
  }
  if (settings.closeDate && new Date(settings.closeDate) < new Date()) {
    return { success: false, message: "This form has closed" };
  }
  if (settings.password && meta?.password !== settings.password) {
    return { success: false, message: "Incorrect password" };
  }
  if (settings.enableHoneypot && meta?.honeypot) {
    return { success: false, message: "Submission rejected" };
  }
  if (settings.maxSubmissions) {
    const count = await getSubmissionCount(form.id);
    if (count >= settings.maxSubmissions) {
      return { success: false, message: "This form has reached its submission limit" };
    }
  }
  if (!settings.allowMultipleSubmissions && meta?.ip) {
    const recent = await getRecentSubmissionFromIp(form.id, meta.ip);
    if (recent) {
      return { success: false, message: "You have already submitted this form recently" };
    }
  }

  const inputFields = form.fields.filter(
    (f) => !["heading", "paragraph", "page_break"].includes(f.type)
  );

  for (const field of inputFields) {
    if (field.required) {
      const val = answers[field.id];
      if (!val || (Array.isArray(val) && val.length === 0)) {
        return { success: false, message: `"${field.label}" is required` };
      }
    }
  }

  const submissionId = uuidv4();
  try {
    await execute(
      `INSERT INTO form_submissions (id, form_id, ip_address, user_agent, completion_time_ms, referrer)
       VALUES (:id, :formId, :ip, :ua, :completionTime, :referrer)`,
      {
        id: submissionId,
        formId: form.id,
        ip: meta?.ip || null,
        ua: meta?.userAgent || null,
        completionTime: meta?.completionTimeMs || null,
        referrer: meta?.referrer || null,
      }
    );
  } catch {
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
  }

  for (const field of inputFields) {
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

  if (settings.webhookUrl) {
    fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "form.submitted",
        formId: form.id,
        submissionId,
        answers,
        submittedAt: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  return { success: true, redirectUrl: settings.redirectUrl };
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

  let totalViews = 0;
  let avgCompletion = 0;
  try {
    const viewRows = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS cnt FROM form_views WHERE form_id = :formId",
      { formId }
    );
    totalViews = Number(viewRows[0]?.cnt || 0);
    const avgRows = await query<RowDataPacket[]>(
      "SELECT AVG(completion_time_ms) AS avg_ms FROM form_submissions WHERE form_id = :formId AND completion_time_ms IS NOT NULL",
      { formId }
    );
    avgCompletion = Number(avgRows[0]?.avg_ms || 0);
  } catch {
    /* optional columns */
  }

  const conversionRate = totalViews > 0 ? Math.round((total / totalViews) * 100) : (total > 0 ? 100 : 0);

  return {
    overview: {
      totalSubmissions: total,
      submissionsToday: Number(overview.today || 0),
      submissionsThisWeek: Number(overview.week || 0),
      submissionsThisMonth: Number(overview.month || 0),
      avgCompletionTime: avgCompletion || undefined,
      conversionRate,
      totalViews,
      bounceRate: totalViews > 0 ? Math.round(((totalViews - total) / totalViews) * 100) : undefined,
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
  } else if (["number", "scale", "rating", "nps"].includes(field.type)) {
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

async function mapSubmissionRow(sub: RowDataPacket): Promise<Submission> {
  const answerRows = await query<RowDataPacket[]>(
    `SELECT sa.field_id, sa.value, ff.label, ff.type
     FROM submission_answers sa
     JOIN form_fields ff ON ff.id = sa.field_id
     WHERE sa.submission_id = :submissionId`,
    { submissionId: sub.id }
  );
  return {
    id: sub.id,
    formId: sub.form_id,
    submittedAt: sub.submitted_at.toISOString(),
    ipAddress: sub.ip_address || undefined,
    userAgent: sub.user_agent || undefined,
    completionTimeMs: sub.completion_time_ms ? Number(sub.completion_time_ms) : undefined,
    referrer: sub.referrer || undefined,
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
  };
}

async function getRecentSubmissions(
  formId: string,
  limit: number
): Promise<Submission[]> {
  const cols = await submissionSelectColumns();
  const subRows = await query<RowDataPacket[]>(
    `SELECT ${cols}
     FROM form_submissions
     WHERE form_id = :formId ORDER BY submitted_at DESC LIMIT ${limit}`,
    { formId }
  );
  return Promise.all(subRows.map(mapSubmissionRow));
}

export async function getSubmissions(
  formId: string,
  options?: { limit?: number; offset?: number; search?: string; from?: string; to?: string }
): Promise<{ submissions: Submission[]; total: number }> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  let where = "form_id = :formId";
  const params: Record<string, string | number | boolean | null> = { formId };

  if (options?.from) {
    where += " AND submitted_at >= :from";
    params.from = options.from;
  }
  if (options?.to) {
    where += " AND submitted_at <= :to";
    params.to = options.to;
  }

  const countRows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM form_submissions WHERE ${where}`,
    params
  );
  const total = Number(countRows[0]?.cnt || 0);

  const cols = await submissionSelectColumns();
  const subRows = await query<RowDataPacket[]>(
    `SELECT ${cols}
     FROM form_submissions WHERE ${where}
     ORDER BY submitted_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  let submissions = await Promise.all(subRows.map(mapSubmissionRow));

  if (options?.search) {
    const q = options.search.toLowerCase();
    submissions = submissions.filter((s) =>
      s.answers.some((a) =>
        (Array.isArray(a.value) ? a.value.join(" ") : a.value).toLowerCase().includes(q)
      )
    );
  }

  return { submissions, total };
}

export async function deleteSubmission(submissionId: string, formId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM form_submissions WHERE id = :id AND form_id = :formId",
    { id: submissionId, formId }
  );
  return result.affectedRows > 0;
}

export async function getSubmissionById(submissionId: string, formId: string): Promise<Submission | null> {
  const cols = await submissionSelectColumns();
  const rows = await query<RowDataPacket[]>(
    `SELECT ${cols}
     FROM form_submissions WHERE id = :id AND form_id = :formId LIMIT 1`,
    { id: submissionId, formId }
  );
  if (!rows.length) return null;
  return mapSubmissionRow(rows[0]);
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