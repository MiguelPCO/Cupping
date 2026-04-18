import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRoastLabel(level: string): string {
  const labels: Record<string, string> = {
    light: "Ligero",
    medium: "Medio",
    medium_dark: "Medio-oscuro",
    dark: "Oscuro",
  };
  return labels[level] ?? level;
}

export function getCoffeeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bean: "En grano",
    ground: "Molido",
    capsule: "Cápsula",
    instant: "Instantáneo",
    cold_brew: "Cold brew",
  };
  return labels[type] ?? type;
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function getBrewMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    espresso: "Espresso",
    pour_over: "Pour over",
    french_press: "French press",
    aeropress: "AeroPress",
    moka: "Moka",
    drip: "Cafetera de filtro",
    cold_brew: "Cold brew",
    capsule_machine: "Cápsula",
  };
  return labels[method] ?? method;
}
