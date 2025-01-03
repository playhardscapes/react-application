import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// A utility function to merge Tailwind CSS classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
