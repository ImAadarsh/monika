"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Clock,
  Copy,
  FileText,
  GripVertical,
  Hash,
  Heading,
  Link,
  Mail,
  Phone,
  Plus,
  Search,
  SeparatorHorizontal,
  SlidersHorizontal,
  Star,
  ToggleLeft,
  Trash2,
  TrendingUp,
  Type,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FormField, FieldType } from "@/types/form";
import { FIELD_TYPE_META } from "@/types/form";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Type, AlignLeft, Mail, Hash, Phone, Link, CircleDot, CheckSquare,
  ChevronDown, ToggleLeft, Calendar, Clock, SlidersHorizontal, Star,
  TrendingUp, Heading, FileText, SeparatorHorizontal, Upload,
};

const FIELD_TYPES: FieldType[] = [
  "short_text", "long_text", "email", "number", "phone", "url",
  "single_choice", "multiple_choice", "dropdown", "checkbox",
  "date", "time", "scale", "rating", "nps",
  "heading", "paragraph", "page_break", "file_upload",
];

function defaultField(type: FieldType, index: number): FormField {
  const meta = FIELD_TYPE_META[type];
  return {
    id: uuidv4(),
    type,
    label: meta.label,
    placeholder: "",
    required: false,
    orderIndex: index,
    options: ["single_choice", "multiple_choice", "dropdown"].includes(type)
      ? [{ id: uuidv4(), label: "Option 1" }, { id: uuidv4(), label: "Option 2" }]
      : undefined,
    settings: type === "scale"
      ? { min: 1, max: 5, minLabel: "Poor", maxLabel: "Excellent" }
      : type === "rating"
        ? { maxRating: 5 }
        : type === "nps"
          ? { min: 0, max: 10 }
          : type === "file_upload"
            ? { accept: "image/*,.pdf", maxFileSizeMB: 5 }
            : undefined,
  };
}

export function FormBuilder({
  fields,
  onChange,
  allFields = fields,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  allFields?: FormField[];
}) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function addField(type: FieldType) {
    onChange([...fields, defaultField(type, fields.length)]);
  }

  function updateField(id: string, updates: Partial<FormField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  function removeField(id: string) {
    onChange(fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, orderIndex: i })));
  }

  function cloneField(id: string) {
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    const clone: FormField = {
      ...field,
      id: uuidv4(),
      label: `${field.label} (copy)`,
      options: field.options?.map((o) => ({ ...o, id: uuidv4() })),
      orderIndex: fields.length,
    };
    const idx = fields.findIndex((f) => f.id === id);
    const next = [...fields];
    next.splice(idx + 1, 0, clone);
    onChange(next.map((f, i) => ({ ...f, orderIndex: i })));
  }

  function moveField(index: number, direction: -1 | 1) {
    const next = [...fields];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((f, i) => ({ ...f, orderIndex: i })));
  }

  function bulkAddOptions(fieldId: string, text: string) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const newOpts = lines.map((label) => ({ id: uuidv4(), label }));
    updateField(fieldId, { options: [...(field.options || []), ...newOpts] });
  }

  const filteredTypes = FIELD_TYPES.filter((type) => {
    if (!search) return true;
    const meta = FIELD_TYPE_META[type];
    return meta.label.toLowerCase().includes(search.toLowerCase()) ||
      meta.description.toLowerCase().includes(search.toLowerCase());
  });

  const categories = [...new Set(filteredTypes.map((t) => FIELD_TYPE_META[t].category || "Other"))];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold">Add Field</p>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fields..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="grid gap-3 max-h-[60vh] overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat}>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{cat}</p>
                <div className="grid gap-0.5">
                  {filteredTypes.filter((t) => (FIELD_TYPE_META[t].category || "Other") === cat).map((type) => {
                    const meta = FIELD_TYPE_META[type];
                    const Icon = ICONS[meta.icon] || Type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addField(type)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="font-medium">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">{meta.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Plus className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No fields yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add fields from the sidebar to build your form
              </p>
            </CardContent>
          </Card>
        ) : (
          fields.map((field, index) => (
            <Card key={field.id} className={cn("group overflow-hidden", field.type === "page_break" && "border-dashed border-primary/40")}>
              <CardContent className="p-0">
                <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {FIELD_TYPE_META[field.type].label}
                  </span>
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => cloneField(field.id)} title="Duplicate">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveField(index, -1)} disabled={index === 0}>↑</Button>
                    <Button variant="ghost" size="sm" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1}>↓</Button>
                    <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <Label>{field.type === "paragraph" ? "Content" : "Question"}</Label>
                    {field.type === "paragraph" ? (
                      <Textarea
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="mt-1.5"
                        rows={3}
                      />
                    ) : (
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="mt-1.5"
                      />
                    )}
                  </div>

                  {["short_text", "long_text", "email", "number", "phone", "url"].includes(field.type) && (
                    <div>
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Help text</Label>
                    <Input
                      value={field.settings?.helpText || ""}
                      onChange={(e) => updateField(field.id, { settings: { ...field.settings, helpText: e.target.value } })}
                      className="mt-1.5"
                      placeholder="Optional hint for respondents"
                    />
                  </div>

                  {["short_text", "long_text"].includes(field.type) && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Min length</Label>
                        <Input type="number" value={field.settings?.minLength ?? ""} onChange={(e) => updateField(field.id, { settings: { ...field.settings, minLength: e.target.value ? Number(e.target.value) : undefined } })} className="mt-1.5" />
                      </div>
                      <div>
                        <Label>Max length</Label>
                        <Input type="number" value={field.settings?.maxLength ?? ""} onChange={(e) => updateField(field.id, { settings: { ...field.settings, maxLength: e.target.value ? Number(e.target.value) : undefined } })} className="mt-1.5" />
                      </div>
                    </div>
                  )}

                  {field.type === "number" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Min value</Label>
                        <Input type="number" value={field.settings?.min ?? ""} onChange={(e) => updateField(field.id, { settings: { ...field.settings, min: e.target.value ? Number(e.target.value) : undefined } })} className="mt-1.5" />
                      </div>
                      <div>
                        <Label>Max value</Label>
                        <Input type="number" value={field.settings?.max ?? ""} onChange={(e) => updateField(field.id, { settings: { ...field.settings, max: e.target.value ? Number(e.target.value) : undefined } })} className="mt-1.5" />
                      </div>
                    </div>
                  )}

                  {field.type === "scale" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div><Label>Min</Label><Input type="number" value={field.settings?.min ?? 1} onChange={(e) => updateField(field.id, { settings: { ...field.settings, min: Number(e.target.value) } })} className="mt-1.5" /></div>
                      <div><Label>Max</Label><Input type="number" value={field.settings?.max ?? 5} onChange={(e) => updateField(field.id, { settings: { ...field.settings, max: Number(e.target.value) } })} className="mt-1.5" /></div>
                      <div><Label>Min label</Label><Input value={field.settings?.minLabel || ""} onChange={(e) => updateField(field.id, { settings: { ...field.settings, minLabel: e.target.value } })} className="mt-1.5" /></div>
                      <div><Label>Max label</Label><Input value={field.settings?.maxLabel || ""} onChange={(e) => updateField(field.id, { settings: { ...field.settings, maxLabel: e.target.value } })} className="mt-1.5" /></div>
                    </div>
                  )}

                  {field.type === "rating" && (
                    <div>
                      <Label>Max stars</Label>
                      <Input type="number" min={1} max={10} value={field.settings?.maxRating ?? 5} onChange={(e) => updateField(field.id, { settings: { ...field.settings, maxRating: Number(e.target.value) } })} className="mt-1.5 w-24" />
                    </div>
                  )}

                  {field.options && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <label className="flex items-center gap-1.5 text-xs">
                          <input type="checkbox" checked={field.settings?.randomizeOptions || false} onChange={(e) => updateField(field.id, { settings: { ...field.settings, randomizeOptions: e.target.checked } })} className="rounded" />
                          Randomize order
                        </label>
                      </div>
                      {field.options.map((opt, oi) => (
                        <div key={opt.id} className="flex gap-2">
                          <Input value={opt.label} onChange={(e) => {
                            const options = [...(field.options || [])];
                            options[oi] = { ...opt, label: e.target.value };
                            updateField(field.id, { options });
                          }} />
                          <Button variant="ghost" size="icon" onClick={() => updateField(field.id, { options: field.options?.filter((o) => o.id !== opt.id) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => updateField(field.id, { options: [...(field.options || []), { id: uuidv4(), label: `Option ${(field.options?.length || 0) + 1}` }] })}>
                          <Plus className="h-4 w-4" /> Add option
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === field.id ? null : field.id)}>
                          Bulk paste
                        </Button>
                      </div>
                      {expandedId === field.id && (
                        <div>
                          <Textarea placeholder="One option per line" rows={3} onBlur={(e) => { if (e.target.value) bulkAddOptions(field.id, e.target.value); e.target.value = ""; setExpandedId(null); }} />
                        </div>
                      )}
                    </div>
                  )}

                  {!["heading", "paragraph", "page_break"].includes(field.type) && (
                    <>
                      <div>
                        <Label>Default value</Label>
                        <Input value={field.settings?.defaultValue || ""} onChange={(e) => updateField(field.id, { settings: { ...field.settings, defaultValue: e.target.value } })} className="mt-1.5" />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} className="rounded border-input" />
                        Required
                      </label>
                    </>
                  )}

                  {!["heading", "paragraph", "page_break"].includes(field.type) && allFields.filter((f) => f.id !== field.id && !["heading", "paragraph", "page_break"].includes(f.type)).length > 0 && (
                    <details className="rounded-lg border border-border p-3">
                      <summary className="cursor-pointer text-sm font-medium">Conditional logic</summary>
                      <div className="mt-3 space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={field.settings?.conditionalLogic?.enabled || false} onChange={(e) => updateField(field.id, { settings: { ...field.settings, conditionalLogic: { enabled: e.target.checked, match: field.settings?.conditionalLogic?.match || "all", rules: field.settings?.conditionalLogic?.rules || [] } } })} className="rounded" />
                          Show only when conditions match
                        </label>
                        {field.settings?.conditionalLogic?.enabled && (
                          <>
                            <select className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm" value={field.settings.conditionalLogic.match} onChange={(e) => updateField(field.id, { settings: { ...field.settings, conditionalLogic: { ...field.settings!.conditionalLogic!, match: e.target.value as "all" | "any" } } })}>
                              <option value="all">All conditions</option>
                              <option value="any">Any condition</option>
                            </select>
                            {(field.settings.conditionalLogic.rules.length ? field.settings.conditionalLogic.rules : [{ fieldId: allFields[0]?.id || "", operator: "not_empty" as const }]).map((rule, ri) => (
                              <div key={ri} className="flex flex-wrap gap-2">
                                <select className="rounded-lg border px-2 py-1 text-sm" value={rule.fieldId} onChange={(e) => {
                                  const rules = [...(field.settings?.conditionalLogic?.rules || [])];
                                  rules[ri] = { ...rule, fieldId: e.target.value };
                                  updateField(field.id, { settings: { ...field.settings, conditionalLogic: { ...field.settings!.conditionalLogic!, rules } } });
                                }}>
                                  {allFields.filter((f) => f.id !== field.id && !["heading", "paragraph", "page_break"].includes(f.type)).map((f) => (
                                    <option key={f.id} value={f.id}>{f.label}</option>
                                  ))}
                                </select>
                                <select className="rounded-lg border px-2 py-1 text-sm" value={rule.operator} onChange={(e) => {
                                  const rules = [...(field.settings?.conditionalLogic?.rules || [])];
                                  rules[ri] = { ...rule, operator: e.target.value as typeof rule.operator };
                                  updateField(field.id, { settings: { ...field.settings, conditionalLogic: { ...field.settings!.conditionalLogic!, rules } } });
                                }}>
                                  <option value="equals">equals</option>
                                  <option value="not_equals">not equals</option>
                                  <option value="contains">contains</option>
                                  <option value="not_empty">is not empty</option>
                                  <option value="empty">is empty</option>
                                </select>
                                {!["not_empty", "empty"].includes(rule.operator) && (
                                  <Input className="w-32" value={rule.value || ""} onChange={(e) => {
                                    const rules = [...(field.settings?.conditionalLogic?.rules || [])];
                                    rules[ri] = { ...rule, value: e.target.value };
                                    updateField(field.id, { settings: { ...field.settings, conditionalLogic: { ...field.settings!.conditionalLogic!, rules } } });
                                  }} />
                                )}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}