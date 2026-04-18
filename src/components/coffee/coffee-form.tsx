"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { coffeeFormSchema, type CoffeeFormInput } from "@/lib/validations/coffee";
import {
  COFFEE_TYPES,
  ROAST_LEVELS,
  BREW_METHODS,
  FLAVOR_TAGS,
  FLAVOR_FAMILIES,
} from "@/types/coffee";
import type { FlavorTag } from "@/types/coffee";
import {
  getCoffeeTypeLabel,
  getRoastLabel,
  getBrewMethodLabel,
  cn,
} from "@/lib/utils";
import type { Coffee } from "@/types/coffee";
import { ChevronDown } from "lucide-react";
import { RatingCups } from "./rating-cups";
import { FlavorTag as FlavorTagChip } from "./flavor-tag";
import { SubRatingInput } from "./sub-rating-input";
import { PhotoUpload } from "./photo-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateCoffeeEntry, useUpdateCoffeeEntry, useCurrentUser } from "@/lib/hooks";
import { uploadCoffeePhoto } from "@/lib/supabase/storage";

const ROAST_BG: Record<string, string> = {
  light: "bg-roast-light",
  medium: "bg-roast-medium",
  medium_dark: "bg-roast-medium-dark",
  dark: "bg-roast-dark",
};

const SUB_RATINGS = [
  { name: "rating_aroma",      label: "Aroma",      minLabel: "Débil",      maxLabel: "Intenso"      },
  { name: "rating_body",       label: "Cuerpo",      minLabel: "Ligero",     maxLabel: "Pesado"       },
  { name: "rating_acidity",    label: "Acidez",      minLabel: "Plana",      maxLabel: "Brillante"    },
  { name: "rating_sweetness",  label: "Dulzor",      minLabel: "Seco",       maxLabel: "Dulce"        },
  { name: "rating_bitterness", label: "Amargor",     minLabel: "Suave",      maxLabel: "Intenso"      },
  { name: "rating_aftertaste", label: "Retrogusto",  minLabel: "Corto",      maxLabel: "Persistente"  },
] as const satisfies readonly { name: keyof CoffeeFormInput; label: string; minLabel: string; maxLabel: string }[];

interface CoffeeFormProps {
  mode?: "create" | "edit";
  defaultValues?: Partial<CoffeeFormInput>;
  entryId?: string;
  preselectedCoffee?: Coffee | null;
}

export function CoffeeForm({
  mode = "create",
  defaultValues,
  entryId,
  preselectedCoffee,
}: CoffeeFormProps) {
  const initialStep = preselectedCoffee ? 2 : 1;
  const [step, setStep] = useState(initialStep);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const createMutation = useCreateCoffeeEntry();
  const updateMutation = useUpdateCoffeeEntry();

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<CoffeeFormInput>({
    resolver: zodResolver(coffeeFormSchema),
    defaultValues: {
      type: "bean",
      rating_global: 3,
      flavor_tags: [],
      // Pre-fill from community coffee if provided
      ...(preselectedCoffee
        ? {
            name: preselectedCoffee.name,
            brand: preselectedCoffee.brand,
            type: preselectedCoffee.type,
            origin: preselectedCoffee.origin ?? undefined,
            roast_level: preselectedCoffee.roast_level ?? undefined,
          }
        : {}),
      ...defaultValues,
    },
  });

  const currentType = watch("type");
  const currentRoast = watch("roast_level");
  const currentBrewMethod = watch("brew_method");
  const currentFlavors = watch("flavor_tags");
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const goNext = async () => {
    const stepFields: Partial<Record<number, (keyof CoffeeFormInput)[]>> = {
      1: ["name", "brand", "type"],
      2: ["rating_global"],
    };
    const fields = stepFields[step];
    const valid = fields ? await trigger(fields) : true;
    if (valid) setStep((s) => Math.min(s + 1, 4));
  };

  const onSubmit = async (data: CoffeeFormInput) => {
    let photo_url = data.photo_url;

    if (photoFile && currentUser?.user) {
      const url = await uploadCoffeePhoto(photoFile, currentUser.user.id);
      if (url) photo_url = url;
    }

    const payload: CoffeeFormInput = { ...data, photo_url };

    if (mode === "edit" && entryId) {
      const result = await updateMutation.mutateAsync({ entryId, data: payload });
      if (result.data) router.push(`/coffee/${result.data.entryId}`);
    } else {
      const result = await createMutation.mutateAsync(payload);
      if (result.data) router.push(`/coffee/${result.data.entryId}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto px-4 py-6"
    >
      {/* Step progress */}
      <div className="flex gap-2 justify-center mb-8" aria-hidden="true">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              s === step
                ? "w-8 bg-copper-500"
                : s < step
                  ? "w-4 bg-copper-300"
                  : "w-4 bg-parchment"
            )}
          />
        ))}
      </div>

      {/* ── Step 1: Info básica ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-espresso mb-1">
              ¿Qué café es este?
            </h2>
            <p className="text-sm text-espresso-light">
              Nombre, marca y tipo
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-espresso">
                Nombre del café *
              </label>
              <Input
                {...register("name")}
                placeholder="Ej. Ethiopian Yirgacheffe"
                className={cn(errors.name && "border-destructive/50")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-espresso">
                Marca *
              </label>
              <Input
                {...register("brand")}
                placeholder="Ej. Stumptown, Lavazza…"
                className={cn(errors.brand && "border-destructive/50")}
              />
              {errors.brand && (
                <p className="text-xs text-destructive">{errors.brand.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-espresso">
                Tipo *
              </label>
              <div className="flex flex-wrap gap-2">
                {COFFEE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("type", type)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      currentType === type
                        ? "bg-copper-500 text-white border-copper-500"
                        : "bg-white text-espresso-light border-parchment hover:border-copper-300"
                    )}
                  >
                    {getCoffeeTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-espresso">
                Origen{" "}
                <span className="font-normal text-parchment">(opcional)</span>
              </label>
              <Input
                {...register("origin")}
                placeholder="Ej. Etiopía, Colombia…"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-espresso">
                Tueste{" "}
                <span className="font-normal text-parchment">(opcional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ROAST_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setValue(
                        "roast_level",
                        currentRoast === level ? undefined : level
                      )
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium text-white transition-all",
                      ROAST_BG[level],
                      currentRoast === level
                        ? "ring-2 ring-offset-2 ring-espresso/40 scale-105"
                        : "opacity-70 hover:opacity-100"
                    )}
                  >
                    {getRoastLabel(level)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Calificación ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-espresso mb-1">
              ¿Cómo lo valoras?
            </h2>
            <p className="text-sm text-espresso-light">
              Puntuación global y notas de cata
            </p>
          </div>

          {preselectedCoffee && (
            <div className="bg-linen rounded-lg px-3 py-2 text-sm text-espresso-light">
              Reseñando:{" "}
              <span className="font-medium text-espresso">
                {preselectedCoffee.brand} · {preselectedCoffee.name}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-espresso">
              Puntuación global *
            </label>
            <Controller
              control={control}
              name="rating_global"
              render={({ field }) => (
                <RatingCups
                  value={field.value}
                  onChange={field.onChange}
                  size="lg"
                />
              )}
            />
            {errors.rating_global && (
              <p className="text-xs text-destructive">
                {errors.rating_global.message}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-xs font-medium uppercase tracking-wider text-parchment">
              Desglose de notas{" "}
              <span className="normal-case">(opcional)</span>
            </p>
            {SUB_RATINGS.map(({ name, label, minLabel, maxLabel }) => (
              <SubRatingInput
                key={name}
                name={name}
                label={label}
                minLabel={minLabel}
                maxLabel={maxLabel}
                control={control}
              />
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-espresso">
              Notas de cata{" "}
              <span className="font-normal text-parchment">(opcional)</span>
            </label>
            <textarea
              {...register("notes")}
              placeholder="Describe lo que sientes al tomar este café…"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-parchment bg-white text-sm text-espresso placeholder:text-parchment focus:outline-none focus:ring-2 focus:ring-copper-300 resize-none"
            />
          </div>
        </div>
      )}

      {/* ── Step 3: Sabores + método ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-espresso mb-1">
              Notas de sabor
            </h2>
            <p className="text-sm text-espresso-light">
              Selecciona todas las que encuentres
            </p>
          </div>

          <div className="space-y-1">
            {Object.entries(FLAVOR_FAMILIES).map(([family, familyTags]) => {
              // Only include tags that exist in the DB enum
              const validTags = familyTags.filter((t) =>
                (FLAVOR_TAGS as readonly string[]).includes(t)
              ) as FlavorTag[];
              if (validTags.length === 0) return null;

              const selectedInFamily = validTags.filter((t) =>
                currentFlavors.includes(t)
              );

              return (
                <details
                  key={family}
                  open={selectedInFamily.length > 0}
                  className="group rounded-lg border border-parchment overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none py-2.5 px-3 hover:bg-linen transition-colors">
                    <span className="text-sm font-medium text-espresso">
                      {family}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedInFamily.length > 0 && (
                        <span className="text-[10px] bg-copper-100 text-copper-700 rounded-full px-2 py-0.5 font-medium">
                          {selectedInFamily.length}
                        </span>
                      )}
                      <ChevronDown className="size-4 text-parchment group-open:rotate-180 transition-transform" />
                    </div>
                  </summary>
                  <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1">
                    {validTags.map((tag) => (
                      <FlavorTagChip
                        key={tag}
                        flavor={tag}
                        selected={currentFlavors.includes(tag)}
                        onToggle={(t) => {
                          const current = currentFlavors;
                          setValue(
                            "flavor_tags",
                            current.includes(t)
                              ? current.filter((f: FlavorTag) => f !== t)
                              : [...current, t]
                          );
                        }}
                        size="sm"
                      />
                    ))}
                  </div>
                </details>
              );
            })}
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-espresso">
              Método de preparación{" "}
              <span className="font-normal text-parchment">(opcional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BREW_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() =>
                    setValue(
                      "brew_method",
                      currentBrewMethod === method ? undefined : method
                    )
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    currentBrewMethod === method
                      ? "bg-copper-500 text-white border-copper-500"
                      : "bg-white text-espresso-light border-parchment hover:border-copper-300"
                  )}
                >
                  {getBrewMethodLabel(method)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Foto ── */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-espresso mb-1">
              Una foto del café
            </h2>
            <p className="text-sm text-espresso-light">
              Opcional — añade una imagen para recordarlo mejor
            </p>
          </div>
          <PhotoUpload onFileSelect={setPhotoFile} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1"
          >
            Atrás
          </Button>
        )}
        {step < 4 ? (
          <Button
            type="button"
            onClick={goNext}
            className="flex-1 bg-copper-500 hover:bg-copper-600 text-white border-0"
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-copper-500 hover:bg-copper-600 text-white border-0 disabled:opacity-60"
          >
            {isLoading
              ? "Guardando…"
              : mode === "edit"
                ? "Guardar cambios"
                : "Guardar reseña"}
          </Button>
        )}
      </div>
    </form>
  );
}
