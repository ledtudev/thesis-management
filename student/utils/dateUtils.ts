/**
 * Format a date string to localized format
 * @param dateString Date string to format
 * @param options Intl.DateTimeFormatOptions to customize the format
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param dateString Date string to format
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      if (diffMinutes < 1) return 'Vừa xong';
      return `${diffMinutes} phút trước`;
    }
    return `${diffHours} giờ trước`;
  }
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatDate(dateString);
};
