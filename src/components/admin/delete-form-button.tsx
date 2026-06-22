"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteFormButton({ formId }: { formId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this form and all its responses?")) return;
    const res = await fetch(`/api/forms/${formId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Form deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={handleDelete}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
