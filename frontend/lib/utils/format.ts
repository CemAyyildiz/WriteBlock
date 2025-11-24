/**
 * Formatting utilities
 * Centralized formatting functions used across the application
 */

/**
 * Format Sui address to short version
 * @param address - Full Sui address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Formatted address (e.g., "0x1234...abcd")
 */
export function formatAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars)}...${address.substring(
    address.length - endChars
  )}`;
}

/**
 * Format timestamp to readable date
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Date(timestamp).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format timestamp to relative time (e.g., "2 days ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Generate slug from title
 * @param title - Article title
 * @param maxLength - Maximum slug length (default: 100)
 * @returns URL-friendly slug
 */
export function generateSlug(title: string, maxLength: number = 100): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, maxLength);
}

/**
 * Validate Sui address format
 * @param address - Address to validate
 * @returns true if valid Sui address
 */
export function isValidSuiAddress(address: string): boolean {
  return address.startsWith('0x') && address.length === 66;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Detect if running on Walrus Sites
 */
export function isWalrusSite(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return (
    hostname.includes('walrus.site') ||
    hostname.includes('walrus.space') ||
    hostname.includes('trwal.app')
  );
}

/**
 * Get API base URL - use Vercel proxy when on Walrus Sites
 */
export function getApiBase(): string {
  return isWalrusSite() ? 'https://writeblock.vercel.app' : '';
}


