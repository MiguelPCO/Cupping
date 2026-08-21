"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { deleteCoffeeEntry } from "@/lib/actions/coffee";

interface EntryActionsProps {
  entryId: string;
}

export function EntryActions({ entryId }: EntryActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCoffeeEntry(entryId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.push("/dashboard");
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
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
            />
          }
        >
          <Trash2 className="size-3.5" />
          {isPending ? "Eliminando…" : "Eliminar"}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta reseña?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
