import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price in Indian currency format (Crores and Lakhs)
 * @param price - Price value as string or number
 * @param includeSymbol - Whether to include the ₹ symbol (default: true)
 * @returns Formatted price string
 */
export const formatPriceInCrores = (price: string | number | null, includeSymbol: boolean = true) => {
  // Handle empty/zero/null cases
  if (price === null || (typeof price === 'string' && (price === '0' || price === '0.00' || !price))) {
    return '· · ·';
  }

  const priceNum = typeof price === 'string' ? Number(price) : price;
  
  // Handle invalid numbers
  if (isNaN(priceNum) || priceNum === 0) {
    return '· · ·';
  }

  const crores = priceNum / 10000000;
  const lakhs = priceNum / 100000;

  const symbol = includeSymbol ? '₹' : '';
  
  if (crores >= 1) {
    return `${symbol}${crores.toFixed(2)}Cr`;
  } else {
    return `${symbol}${lakhs.toFixed(1)}L`;
  }
};
