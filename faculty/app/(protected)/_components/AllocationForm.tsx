'use client';

import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { NewAllocationData, ProjectAllocation } from '@/services/service';
import {
  Lecturer,
  Student,
  useLecturers,
  useStudents,
} from '@/services/userService';

interface AllocationFormProps {
  initialData?: ProjectAllocation;
  onSubmit: (data: NewAllocationData | Partial<ProjectAllocation>) => void;
  departmentId?: string;
  isUpdate?: boolean;
}

export default function AllocationForm({
  initialData,
  onSubmit,
  departmentId,
  isUpdate = false,
}: AllocationFormProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<NewAllocationData>>({
    topicTitle: initialData?.topicTitle || '',
    studentId: initialData?.studentId || '',
    lecturerId: initialData?.lecturerId || '',
  });

  // Search terms
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [lecturerSearchTerm, setLecturerSearchTerm] = useState<string>('');

  // Debounced search terms
  const debouncedStudentSearch = useDebounce(studentSearchTerm, 500);
  const debouncedLecturerSearch = useDebounce(lecturerSearchTerm, 500);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data
  const { data: lecturers, isLoading: isLoadingLecturers } = useLecturers({
    departmentId,
    keyword: debouncedLecturerSearch,
  });

  const { data: students, isLoading: isLoadingStudents } = useStudents({
    departmentId,
    keyword: debouncedStudentSearch,
  });

  // Selected student and lecturer
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(
    null,
  );

  // Set initial values for dropdowns
  useEffect(() => {
    if (initialData) {
      if (initialData.Student) {
        setSelectedStudent(initialData.Student as Student);
      }

      if (initialData.Lecturer) {
        setSelectedLecturer(initialData.Lecturer as Lecturer);
      }
    }
  }, [initialData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle student selection
  const handleStudentChange = (
    _event: React.SyntheticEvent,
    value: Student | null,
  ) => {
    setSelectedStudent(value);
    setFormData((prev) => ({ ...prev, studentId: value?.id || '' }));

    if (errors.studentId) {
      setErrors((prev) => ({ ...prev, studentId: '' }));
    }
  };

  // Handle lecturer selection
  const handleLecturerChange = (
    _event: React.SyntheticEvent,
    value: Lecturer | null,
  ) => {
    setSelectedLecturer(value);
    setFormData((prev) => ({ ...prev, lecturerId: value?.id || '' }));

    if (errors.lecturerId) {
      setErrors((prev) => ({ ...prev, lecturerId: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.topicTitle?.trim()) {
      newErrors.topicTitle = 'Tên đề tài không được để trống';
    }

    if (!isUpdate) {
      if (!formData.studentId) {
        newErrors.studentId = 'Vui lòng chọn sinh viên';
      }
    }

    if (!formData.lecturerId) {
      newErrors.lecturerId = 'Vui lòng chọn giảng viên hướng dẫn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="topicTitle"
            name="topicTitle"
            label="Tên đề tài"
            value={formData.topicTitle}
            onChange={handleInputChange}
            error={!!errors.topicTitle}
            helperText={errors.topicTitle}
          />
        </Grid>

        {!isUpdate && (
          <Grid item xs={12}>
            <Autocomplete
              id="studentId"
              options={students || []}
              loading={isLoadingStudents}
              value={selectedStudent}
              onChange={handleStudentChange}
              getOptionLabel={(option) =>
                `${option.fullName} (${option.studentCode || 'N/A'})`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onInputChange={(_, value) => setStudentSearchTerm(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Chọn sinh viên"
                  error={!!errors.studentId}
                  helperText={errors.studentId}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingStudents ? (
                          <CircularProgress size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Autocomplete
            id="lecturerId"
            options={lecturers || []}
            loading={isLoadingLecturers}
            value={selectedLecturer}
            onChange={handleLecturerChange}
            getOptionLabel={(option) =>
              `${option.fullName} (${option.facultyCode || 'N/A'})`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(_, value) => setLecturerSearchTerm(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Chọn giảng viên hướng dẫn"
                error={!!errors.lecturerId}
                helperText={errors.lecturerId}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingLecturers ? (
                        <CircularProgress size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" fullWidth>
            {isUpdate ? 'Cập nhật' : 'Tạo phân công'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
