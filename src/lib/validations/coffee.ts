import { z } from "zod";

export const coffeeFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100),
  brand: z.string().min(1, "Requerido").max(100),
  type: z.enum(["bean", "ground", "capsule", "instant", "cold_brew"]),
  origin: z.string().max(100).optional(),
  roast_level: z.enum(["light", "medium", "medium_dark", "dark"]).optional(),
  rating_global: z.number().min(0.5).max(5),
  rating_aroma: z.number().min(0).max(10).int().nullable().optional(),
  rating_body: z.number().min(0).max(10).int().nullable().optional(),
  rating_acidity: z.number().min(0).max(10).int().nullable().optional(),
  rating_sweetness: z.number().min(0).max(10).int().nullable().optional(),
  rating_bitterness: z.number().min(0).max(10).int().nullable().optional(),
  rating_aftertaste: z.number().min(0).max(10).int().nullable().optional(),
  flavor_tags: z
    .array(
      z.enum([
        "chocolate", "nutty", "fruity", "floral", "citrus", "spicy",
        "herbal", "sweet", "earthy", "smoky", "vanilla", "honey",
        "berry", "tropical", "wine",
      ])
    )
    .default([]),
  notes: z.string().max(1000).optional(),
  brew_method: z
    .enum([
      "espresso", "pour_over", "french_press", "aeropress",
      "moka", "drip", "cold_brew", "capsule_machine",
    ])
    .optional(),
  photo_url: z.string().optional(),
});

export type CoffeeFormInput = z.infer<typeof coffeeFormSchema>;
