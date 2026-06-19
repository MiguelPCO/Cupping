import Link from "next/link";
import type { Coffee } from "@/types/coffee";
import { CoffeeCommunityCard } from "@/components/coffee/coffee-community-card";

interface ExploreSectionProps {
  title: string;
  coffees: Coffee[];
  reviewedIds?: string[];
  viewAllHref?: string;
}

export function ExploreSection({
  title,
  coffees,
  reviewedIds = [],
  viewAllHref,
}: ExploreSectionProps) {
  if (coffees.length === 0) return null;

  const reviewedSet = new Set(reviewedIds);

  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-xl text-espresso">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs text-copper-600 hover:text-copper-700 font-medium transition-colors"
          >
            Ver todos
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
        {coffees.map((coffee) => (
          <div key={coffee.id} className="w-[200px] sm:w-[220px] shrink-0 snap-start">
            <CoffeeCommunityCard
              coffee={coffee}
              isReviewed={reviewedSet.has(coffee.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
