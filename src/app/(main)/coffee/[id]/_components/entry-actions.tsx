"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCoffeeEntry } from "@/lib/actions/coffee";

interface EntryActionsProps {
  entryId: string;
}

export function EntryActions({ entryId }: EntryActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("¿Eliminar esta reseña? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      const result = await deleteCoffeeEntry(entryId);
      if (!result.error) router.push("/dashboard");
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/coffee/${entryId}/edit`)}
        className="gap-1.5"
      >
        <Pencil className="size-3.5" />
        Editar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
      >
        <Trash2 className="size-3.5" />
        {isPending ? "Eliminando…" : "Eliminar"}
      </Button>
    </div>
  );
}
