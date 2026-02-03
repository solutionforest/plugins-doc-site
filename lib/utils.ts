import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string): string {
  return str
    // Split the string into words
    .split(' ')
    // Capitalize the first letter of each word and lowercase the rest
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    // Join the words back into a single string
    .join(' ');
}