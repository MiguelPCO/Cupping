"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal, ExternalLink, Pencil, ArrowRightLeft, Trash2, Check } from "lucide-react";
import { RatingCups } from "@/components/coffee";
import { cn } from "@/lib/utils";
import { removeFromCollection, moveToCollection } from "@/lib/actions/coffee";
import { toast } from "sonner";

const COLLECTION_LABELS: Record<string, string> = {
  at_home: "En casa",
  favorites: "Favoritos",
  to_try: "Por probar",
  tried: "Probados",
};

export interface OtherCollection {
  id: string;
  type: string;
}

interface CollectionCoffeeCardProps {
  id: string;
  name: string;
  brand: string;
  avg_rating: number | null;
  collectionId: string;
  entryId: string | undefined;
  otherCollections: OtherCollection[];
}

export function CollectionCoffeeCard({
  id,
  name,
  brand,
  avg_rating,
  collectionId,
  entryId,
  otherCollections,
}: CollectionCoffeeCardProps) {
  const [open, setOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMoveOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleRemove = () => {
    setOpen(false);
    startTransition(async () => {
      const result = await removeFromCollection(collectionId, id);
      if (result.error) toast.error(result.error);
      else toast.success("Eliminado de la colección");
    });
  };

  const handleMove = (toCollectionId: string, toLabel: string) => {
    setOpen(false);
    setMoveOpen(false);
    startTransition(async () => {
      const result = await moveToCollection(collectionId, toCollectionId, id);
      if (result.error) toast.error(result.error);
      else toast.success(`Movido a ${toLabel}`);
    });
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-parchment p-4 hover:shadow-sm transition-shadow relative",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Main content — clickable to detail */}
      <Link href={`/explore/${id}`} className="block group">
        <h3 className="font-display text-lg text-espresso truncate group-hover:text-copper-600 transition-colors">
          {name}
        </h3>
        <p className="text-xs text-espresso-light mt-0.5 truncate">{brand}</p>
        {avg_rating !== null && (
          <div className="mt-2">
            <RatingCups value={avg_rating} readOnly size="sm" showValue />
          </div>
        )}
      </Link>

      {/* Kebab menu */}
      <div ref={menuRef} className="absolute top-3 right-3">
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); setMoveOpen(false); }}
          aria-label="Opciones"
          className="flex items-center justify-center size-8 rounded-lg text-parchment hover:text-espresso hover:bg-linen transition-colors"
        >
          <MoreHorizontal className="size-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-8 z-50 w-52 bg-card rounded-xl border border-border shadow-lg py-1 text-sm">
            {/* Ver detalle */}
            <Link
              href={`/explore/${id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-espresso hover:bg-linen transition-colors"
            >
              <ExternalLink className="size-3.5 text-parchment shrink-0" />
              Ver detalle
            </Link>

            {/* Editar reseña */}
            {entryId ? (
              <Link
                href={`/coffee/${entryId}/edit`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-espresso hover:bg-linen transition-colors"
              >
                <Pencil className="size-3.5 text-parchment shrink-0" />
                Editar reseña
              </Link>
            ) : (
              <span className="flex items-center gap-2.5 px-3 py-2 text-parchment cursor-default">
                <Pencil className="size-3.5 shrink-0" />
                Sin reseña
              </span>
            )}

            {/* Mover a colección */}
            {otherCollections.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoveOpen((v) => !v)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-espresso hover:bg-linen transition-colors"
                >
                  <ArrowRightLeft className="size-3.5 text-parchment shrink-0" />
                  <span className="flex-1 text-left">Mover a…</span>
                  <Check className={cn("size-3 text-copper-500 shrink-0", !moveOpen && "invisible")} />
                </button>
                {moveOpen && (
                  <div className="absolute left-full top-0 ml-1 w-44 bg-card rounded-xl border border-border shadow-lg py-1 text-sm">
                    {otherCollections.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleMove(col.id, COLLECTION_LABELS[col.type] ?? col.type)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-espresso hover:bg-linen transition-colors text-left"
                      >
                        {COLLECTION_LABELS[col.type] ?? col.type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-parchment/60 my-1" />

            {/* Eliminar */}
            <button
              type="button"
              onClick={handleRemove}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="size-3.5 shrink-0" />
              Eliminar de colección
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
