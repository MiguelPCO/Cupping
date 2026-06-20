interface Item {
  label: string;
  count: number;
}

interface TopItemsListProps {
  title: string;
  items: Item[];
  emptyText?: string;
}

export function TopItemsList({
  title,
  items,
  emptyText = "Sin datos aún",
}: TopItemsListProps) {
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="bg-card rounded-xl border border-parchment p-4">
      <h3 className="text-sm font-medium text-espresso mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-parchment text-center py-4">{emptyText}</p>
      ) : (
        <ol className="space-y-2.5">
          {items.map(({ label, count }, i) => (
            <li key={label} className="flex items-center gap-2">
              <span className="font-mono text-xs text-parchment w-4 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-espresso truncate">
                    {label}
                  </span>
                  <span className="font-mono text-xs text-copper-600 ml-2 shrink-0">
                    {count}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-linen overflow-hidden">
                  <div
                    className="h-full rounded-full bg-copper-400 transition-[width] duration-500"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
