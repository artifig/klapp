import { twMerge } from 'tailwind-merge'
import clsx from "clsx";

export function cn(...inputs) {
  // Merge class names
  return merge(clsx(inputs));
}