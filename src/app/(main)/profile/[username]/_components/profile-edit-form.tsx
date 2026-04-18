"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/social";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, X, Check, Loader2 } from "lucide-react";

const schema = z.object({
  display_name: z.string().min(1, "Nombre requerido").max(100),
  username: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(50)
    .regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y _"),
  bio: z.string().max(300).optional(),
});
type FormData = z.infer<typeof schema>;

interface ProfileEditFormProps {
  displayName: string;
  username: string;
  bio: string | null;
}

export function ProfileEditForm({
  displayName,
  username,
  bio,
}: ProfileEditFormProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: displayName, username, bio: bio ?? "" },
  });

  function onCancel() {
    reset({ display_name: displayName, username, bio: bio ?? "" });
    setServerError(null);
    setOpen(false);
  }

  function onSubmit(data: FormData) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="border border-parchment text-espresso bg-white hover:bg-linen text-sm"
      >
        <Pencil className="size-4 mr-1.5" />
        Editar perfil
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full bg-white border border-parchment rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-espresso">Editar perfil</h3>
        <button type="button" onClick={onCancel}>
          <X className="size-4 text-espresso-light" />
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-espresso-light">
          Nombre visible
        </label>
        <Input {...register("display_name")} placeholder="Tu nombre" />
        {errors.display_name && (
          <p className="text-xs text-destructive">{errors.display_name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-espresso-light">
          Nombre de usuario
        </label>
        <div className="flex items-center gap-1">
          <span className="text-espresso-light text-sm">@</span>
          <Input {...register("username")} placeholder="usuario" />
        </div>
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-espresso-light">Bio</label>
        <textarea
          {...register("bio")}
          placeholder="Cuéntanos algo sobre ti..."
          rows={3}
          className="w-full rounded-none border-0 border-b border-parchment px-0 py-2 text-sm text-espresso placeholder:text-parchment focus:outline-none focus:border-copper-500 bg-transparent resize-none transition-colors"
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-xs text-destructive">{serverError}</p>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-copper-500 hover:bg-copper-600 text-white flex-1"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Check className="size-4 mr-1.5" />
              Guardar
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="border border-parchment text-espresso bg-white hover:bg-linen"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
