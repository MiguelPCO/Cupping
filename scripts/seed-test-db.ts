import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.test" });

import { getAdminClient } from "../tests/e2e/helpers/admin-client";

const BASELINE_COFFEES = [
  { name: "Yirgacheffe", brand: "Stumptown", type: "bean" as const, origin: "Ethiopia", roast_level: "light" as const },
  { name: "Colombia Supremo", brand: "Lavazza", type: "ground" as const, origin: "Colombia", roast_level: "medium" as const },
];

async function main() {
  const admin = getAdminClient();

  for (const coffee of BASELINE_COFFEES) {
    const { data: existing } = await admin
      .from("coffees")
      .select("id")
      .ilike("name", coffee.name)
      .ilike("brand", coffee.brand)
      .eq("type", coffee.type)
      .maybeSingle();

    if (existing) {
      console.log(`skip (exists): ${coffee.brand} ${coffee.name}`);
      continue;
    }

    const { error } = await admin.from("coffees").insert(coffee);
    if (error) {
      console.error(`failed to seed ${coffee.brand} ${coffee.name}:`, error.message);
      process.exitCode = 1;
      continue;
    }
    console.log(`seeded: ${coffee.brand} ${coffee.name}`);
  }
}

main();
