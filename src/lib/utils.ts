import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return formatCurrency(numericPrice);
} 