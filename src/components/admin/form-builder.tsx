"use client";

import { v4 as uuidv4 } from "uuid";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Clock,
  GripVertical,
  Hash,
  Mail,
  Phone,
  Plus,
  SlidersHorizontal,
  Star,
  ToggleLeft,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FormField, FieldType } from "@/types/form";
import { FIELD_TYPE_META } from "@/types/form";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Type, AlignLeft, Mail, Hash, Phone, CircleDot, CheckSquare,
  ChevronDown, ToggleLeft, Calendar, Clock, SlidersHorizontal, Star,
};

const FIELD_TYPES: FieldType[] = [
  "short_text", "long_text", "email", "number", "phone",
  "single_choice", "multiple_choice", "dropdown", "checkbox",
  "date", "time", "scale", "rating",
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
      ? [
          { id: uuidv4(), label: "Option 1" },
          { id: uuidv4(), label: "Option 2" },
        ]
      : undefined,
    settings: type === "scale"
      ? { min: 1, max: 5, minLabel: "Poor", maxLabel: "Excellent" }
      : type === "rating"
        ? { maxRating: 5 }
        : undefined,
  };
}

export function FormBuilder({
  fields,
  onChange,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}) {
  function addField(type: FieldType) {
    onChange([...fields, defaultField(type, fields.length)]);
  }

  function updateField(id: string, updates: Partial<FormField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  function removeField(id: string) {
    onChange(fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, orderIndex: i })));
  }

  function moveField(index: number, direction: -1 | 1) {
    const next = [...fields];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((f, i) => ({ ...f, orderIndex: i })));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold">Add Field</p>
          <div className="grid gap-1">
            {FIELD_TYPES.map((type) => {
              const meta = FIELD_TYPE_META[type];
              const Icon = ICONS[meta.icon] || Type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addField(type)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
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
            <Card key={field.id} className="group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {FIELD_TYPE_META[field.type].label}
                  </span>
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => moveField(index, -1)} disabled={index === 0}>↑</Button>
                    <Button variant="ghost" size="sm" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1}>↓</Button>
                    <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <Label>Question</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  {["short_text", "long_text", "email", "number", "phone"].includes(field.type) && (
                    <div>
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  )}
                  {field.options && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {field.options.map((opt, oi) => (
                        <div key={opt.id} className="flex gap-2">
                          <Input
                            value={opt.label}
                            onChange={(e) => {
                              const options = [...(field.options || [])];
                              options[oi] = { ...opt, label: e.target.value };
                              updateField(field.id, { options });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              updateField(field.id, {
                                options: field.options?.filter((o) => o.id !== opt.id),
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateField(field.id, {
                            options: [...(field.options || []), { id: uuidv4(), label: `Option ${(field.options?.length || 0) + 1}` }],
                          })
                        }
                      >
                        <Plus className="h-4 w-4" /> Add option
                      </Button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="rounded border-input"
                    />
                    Required
                  </label>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
