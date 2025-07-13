/**
 * Format a date object to a localized string
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | undefined | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
): string {
  if (!date) return 'N/A';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('vi-VN', options).format(dateObj);
}

/**
 * Format a date object to a relative time string
 * @param date The date to format
 * @returns Relative time string (e.g., "2 days ago", "just now")
 */
export function formatRelativeTime(
  date: Date | string | undefined | null,
): string {
  if (!date) return 'N/A';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} năm trước`;
  }
}

/**
 * Format a date object to a time string
 * @param date The date to format
 * @returns Time string (HH:MM)
 */
export function formatTime(date: Date | string | undefined | null): string {
  if (!date) return 'N/A';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format a date to show both date and time
 * @param date The date to format
 * @returns Date and time string
 */
export function formatDateTime(date: Date | string | undefined | null): string {
  if (!date) return 'N/A';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Check if a date is today
 * @param date The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date | string | undefined | null): boolean {
  if (!date) return false;

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Calculate time remaining until a date
 * @param targetDate The target date
 * @returns Time remaining object
 */
export function getTimeRemaining(targetDate: Date | string): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const total = new Date(targetDate).getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
}
