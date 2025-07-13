'use client';

import { formatDate } from '@/lib/utils';
import {
  useDeleteStudentSelection,
  useMyStudentSelections,
} from '@/services/studentSelectionService';
import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import EnrollmentStatusChip from './EnrollmentStatusChip';

type Selection = {
  id: string;
  priority: number;
  topicTitle?: string | null;
  description?: string | null;
  lecturerId?: string | null;
  lecturer?: {
    id: string;
    name: string;
  };
  status: string;
  createdAt: string;
};

// Type for error responses
type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function RegistrationSummary() {
  // State for dialog and editing
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Selection | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch student selections
  const {
    data: selectionsResponse,
    isLoading,
    refetch,
  } = useMyStudentSelections();

  // Extract selections data
  const selectionData = selectionsResponse?.data?.data;
  const selections = selectionData?.data || [];

  // Delete selection mutation
  const deleteSelection = useDeleteStudentSelection();

  if (isLoading) {
    return <Typography>Đang tải...</Typography>;
  }

  if (!selections || selections.length === 0) {
    return <Typography>Chưa có thông tin đăng ký</Typography>;
  }

  const handleOpenDeleteDialog = (selection: Selection) => {
    setSelectedItem(selection);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenDeleteDialog(false);
    setSelectedItem(null);
    setError('');
  };

  const handleDeleteSelection = async () => {
    if (!selectedItem) return;

    setError('');

    try {
      await deleteSelection.mutateAsync(selectedItem.id);

      setSuccess('Xóa nguyện vọng thành công');
      handleCloseDialogs();
      refetch();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  // Get the overall status
  const getOverallStatus = () => {
    if (selections.some((s) => s.status === 'CONFIRMED')) return 'CONFIRMED';
    if (selections.some((s) => s.status === 'APPROVED')) return 'APPROVED';
    if (selections.some((s) => s.status === 'REQUESTED_CHANGES'))
      return 'REQUESTED_CHANGES';
    if (selections.some((s) => s.status === 'REJECTED')) return 'REJECTED';
    return 'PENDING';
  };

  // Get a confirmed selection if available
  const getConfirmedSelection = () => {
    return selections.find((s) => s.status === 'CONFIRMED');
  };

  const confirmedSelection = getConfirmedSelection();
  const overallStatus = getOverallStatus();

  return (
    <>
      <Card sx={{ mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Tóm tắt đăng ký
            </Typography>
            <EnrollmentStatusChip status={overallStatus} />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Lecturer selections summary */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Đăng ký nguyện vọng ({selections.length})
              </Typography>

              {selections.map((selection, index) => (
                <Box
                  key={selection.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom:
                      index < selections.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Box>
                    <Typography variant="body2">
                      {selection.priority}.{' '}
                      {selection.topicTitle || 'Chưa có tiêu đề'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selection.lecturer?.name || 'Không có giảng viên'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EnrollmentStatusChip
                      status={selection.status}
                      size="small"
                    />

                    {selection.status === 'PENDING' && (
                      <Tooltip title="Xóa nguyện vọng">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(selection)}
                          sx={{ ml: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              ))}
            </Grid>

            {/* Final allocation if available */}
            {confirmedSelection && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Phân công cuối cùng
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {confirmedSelection.topicTitle || 'Chưa có tiêu đề'}
                  </Typography>
                  <Typography variant="body2">
                    Giảng viên:{' '}
                    {confirmedSelection.lecturer?.name || 'Không có giảng viên'}
                  </Typography>
                  <Typography variant="caption">
                    Phân công ngày: {formatDate(confirmedSelection.createdAt)}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Xác nhận xóa nguyện vọng</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            Bạn có chắc chắn muốn xóa nguyện vọng này không? Hành động này không
            thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialogs}
            disabled={deleteSelection.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteSelection}
            variant="contained"
            color="error"
            disabled={deleteSelection.isPending}
          >
            {deleteSelection.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Xóa nguyện vọng'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success message */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        message={success}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
