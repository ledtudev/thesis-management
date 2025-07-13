export const dataGridClassNames =
  'border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200';

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    '& .MuiDataGrid-columnHeaders': {
      color: `${isDarkMode ? '#e5e7eb' : ''}`,
      '& [role="row"] > *': {
        backgroundColor: `${isDarkMode ? '#1d1f21' : 'white'}`,
        borderColor: `${isDarkMode ? '#2d3135' : ''}`,
      },
    },
    '& .MuiIconbutton-root': {
      color: `${isDarkMode ? '#a3a3a3' : ''}`,
    },
    '& .MuiTablePagination-root': {
      color: `${isDarkMode ? '#a3a3a3' : ''}`,
    },
    '& .MuiTablePagination-selectIcon': {
      color: `${isDarkMode ? '#a3a3a3' : ''}`,
    },
    '& .MuiDataGrid-cell': {
      border: 'none',
    },
    '& .MuiDataGrid-row': {
      borderBottom: `1px solid ${isDarkMode ? '#2d3135' : 'e5e7eb'}`,
    },
    '& .MuiDataGrid-withBorderColor': {
      borderColor: `${isDarkMode ? '#2d3135' : 'e5e7eb'}`,
    },
  };
};

/**
 * Formats a date string into a localized format
 * @param dateString Date string to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString?: string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export const getRemainingDays = (dateString: string) => {
  const deadline = new Date(dateString);
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Gets the initials from a name (up to 2 characters)
 * @param name Full name to get initials from
 * @returns Initials string
 */
export function getInitials(name: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    // If only one word, return the first two characters
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Get first character of first and last parts
  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
}
