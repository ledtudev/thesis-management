import {
  StudentSelectionStatus,
  useUpdateStudentSelectionStatus,
} from '@/services/studentSelectionService';
import { getRelativeTime } from '@/utils/dateUtils';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import EnrollmentStatusChip from './EnrollmentStatusChip';
import { EnrollmentLecturerSelection } from '@/services/service';

interface LecturerSelectionCardProps {
  selection: EnrollmentLecturerSelection;
  onStatusChange: () => void;
}

export default function LecturerSelectionCard({
  selection,
  onStatusChange,
}: LecturerSelectionCardProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const updateStatusMutation = useUpdateStudentSelectionStatus();

  const handleConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: selection.id,
        status: StudentSelectionStatus.CONFIRMED,
      });
      toast.success('Xác nhận nguyện vọng thành công!');
      setConfirmDialogOpen(false);
      onStatusChange();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xác nhận nguyện vọng.');
    }
  };

  const handleReject = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: selection.id,
        status: StudentSelectionStatus.REJECTED,
      });
      toast.success('Từ chối nguyện vọng thành công!');
      setRejectDialogOpen(false);
      onStatusChange();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi từ chối nguyện vọng.');
    }
  };

  // Only show actions if the selection is approved
  const showActions = selection.status === StudentSelectionStatus.APPROVED;

  return (
    <>
      <Card sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {selection.topicTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Giảng viên: {selection.lecturerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Nguyện vọng {selection.priority} • Cập nhật{' '}
                {getRelativeTime(selection.updatedAt)}
              </Typography>
            </Box>
            <EnrollmentStatusChip status={selection.status} />
          </Box>

          {showActions && (
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
              }}
            >
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setRejectDialogOpen(true)}
                disabled={updateStatusMutation.isPending}
              >
                Từ chối
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => setConfirmDialogOpen(true)}
                disabled={updateStatusMutation.isPending}
              >
                Xác nhận
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Xác nhận nguyện vọng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xác nhận nguyện vọng này? Sau khi xác nhận,
            bạn sẽ làm việc với giảng viên này trong dự án.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={updateStatusMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            color="success"
            variant="contained"
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Xác nhận'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Từ chối nguyện vọng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn từ chối nguyện vọng này? Hành động này sẽ báo
            cho giảng viên biết rằng bạn không muốn làm việc với họ.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            disabled={updateStatusMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Từ chối'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
