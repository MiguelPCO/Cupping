"use client";

export function SteamAnimation() {
  return (
    <div
      className="absolute inset-x-0 top-0 flex justify-center gap-2 pointer-events-none overflow-hidden h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          viewBox="0 0 10 40"
          className="w-2 h-10 animate-steam"
          style={{
            animationDelay: `${i * 0.3}s`,
            animationDuration: "1.8s",
          }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 38 C3 32, 7 26, 5 20 S3 12, 5 4"
            stroke="var(--color-parchment)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}
