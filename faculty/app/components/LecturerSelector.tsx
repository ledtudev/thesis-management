'use client';

import { useDebounce } from '@/hooks/useDebounce';
import {
    Lecturer,
    lecturerSelectionHooks,
} from '@/services/lecturerSelectionService';
import { useAuthStore } from '@/state/authStore';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

interface LecturerSelectorProps {
  value: Lecturer | null;
  onChange: (lecturer: Lecturer | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  departmentId?: string; // Optional departmentId override
}

export default function LecturerSelector({
  value,
  onChange,
  label = 'Giảng viên',
  placeholder = 'Tìm kiếm giảng viên...',
  error,
  fullWidth = true,
  required = false,
  disabled = false,
  departmentId: departmentIdProp,
}: LecturerSelectorProps) {
  const { user } = useAuthStore();
  const departmentId = departmentIdProp || user?.departmentId;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: lecturersData,
    isLoading,
    refetch,
  } = lecturerSelectionHooks.useLecturersByDepartment(
    departmentId || '',
    {
      keyword: debouncedSearchTerm,
      page: 1,
      limit: 30,
    },
    { enabled: !!departmentId },
  );

  useEffect(() => {
    if (departmentId && debouncedSearchTerm.length > 2) {
      refetch();
    }
  }, [debouncedSearchTerm, departmentId, refetch]);

  const lecturers = lecturersData?.data || [];

  return (
    <Autocomplete
      id="lecturer-selector"
      options={lecturers}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={(option) =>
        `${option.fullName}${
          option.facultyCode ? ` (${option.facultyCode})` : ''
        }`
      }
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={isLoading}
      onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
      filterOptions={(x) => x}
      noOptionsText="Không có kết quả"
      loadingText="Đang tìm kiếm..."
      disabled={disabled}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
