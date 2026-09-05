/**
 * Formatting utilities — PKR currency, dates
 */

export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getImageUrl(imageRef: string): string {
  if (!imageRef) return 'https://placehold.co/600x800/efefef/000000?text=No+Image';
  if (imageRef.startsWith('http')) return imageRef;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${base}/api/images/${imageRef}`;
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'received':
      return { bg: 'var(--status-info-bg)', text: 'var(--status-info)' };
    case 'packing':
      return { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)' };
    case 'dispatched':
      return { bg: 'var(--chip-gray)', text: 'var(--uber-black)' };
    case 'delivered':
      return { bg: 'var(--status-success-bg)', text: 'var(--status-success)' };
    case 'pending':
      return { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)' };
    case 'paid':
      return { bg: 'var(--status-success-bg)', text: 'var(--status-success)' };
    case 'refunded':
      return { bg: 'var(--status-error-bg)', text: 'var(--status-error)' };
    default:
      return { bg: 'var(--chip-gray)', text: 'var(--uber-black)' };
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
