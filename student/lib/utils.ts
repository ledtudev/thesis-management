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

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
export const getRemainingDays = (dateString: string) => {
  const deadline = new Date(dateString);
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
