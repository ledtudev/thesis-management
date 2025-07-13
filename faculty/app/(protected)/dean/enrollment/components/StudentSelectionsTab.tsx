import {
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

import {
  StudentSelection,
  StudentSelectionStatusT,
  enrollmentHooks,
} from '@/services/enrollmentService';

const statusMap = {
  PENDING: { label: 'Chờ duyệt', color: 'warning' as const },
  APPROVED: { label: 'Đã duyệt', color: 'success' as const },
  REJECTED: { label: 'Từ chối', color: 'error' as const },
};

interface StudentSelectionsTabProps {
  selections: StudentSelection[];
  loading: boolean;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  onUpdateStatus: (id: string, status: StudentSelectionStatusT) => void;
}

export default function StudentSelectionsTab({
  selections,
  loading,
  selectedItems,
  onSelectionChange,
  onUpdateStatus,
}: StudentSelectionsTabProps) {
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StudentSelectionStatusT>(
    StudentSelectionStatusT.APPROVED,
  );
  const [comment, setComment] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { mutate: bulkUpdateStatus } =
    enrollmentHooks.useBulkUpdateStudentSelectionStatus();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(selections?.map((s) => s.id) || []);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, id]);
    } else {
      onSelectionChange(selectedItems.filter((item) => item !== id));
    }
  };

  const handleBulkStatusUpdate = () => {
    bulkUpdateStatus(
      {
        selectionIds: selectedItems,
        status: selectedStatus,
        comment,
      },
      {
        onSuccess: () => {
          setBulkStatusDialogOpen(false);
          onSelectionChange([]);
          toast.success('Trạng thái hàng loạt đã được cập nhật thành công');
        },
        onError: (error) => {
          setBulkStatusDialogOpen(false);
          onSelectionChange([]);
          toast.error(
            `Có lỗi xảy ra khi cập nhật trạng thái: ${error.message}`,
          );
        },
      },
    );
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selections || selections.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Không có nguyện vọng nào
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Chưa có sinh viên nào đăng ký nguyện vọng
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography>Đã chọn {selectedItems.length} nguyện vọng</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => onSelectionChange([])}>
                Bỏ chọn tất cả
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => setBulkStatusDialogOpen(true)}
              >
                Cập nhật trạng thái
              </Button>
            </Box>
          </Box>
        </Alert>
      )}

      {/* Select All */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedItems.length === selections.length}
              indeterminate={
                selectedItems.length > 0 &&
                selectedItems.length < selections.length
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          }
          label={`Chọn tất cả (${selections.length})`}
        />
      </Box>

      {/* Selections Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.length === selections.length}
                  indeterminate={
                    selectedItems.length > 0 &&
                    selectedItems.length < selections.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>Ưu tiên</TableCell>
              <TableCell>Sinh viên</TableCell>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Đề tài</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selections
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((selection) => (
                <TableRow
                  key={selection.id}
                  hover
                  selected={selectedItems.includes(selection.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedItems.includes(selection.id)}
                      onChange={(e) =>
                        handleSelectItem(selection.id, e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>{selection.priority}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={selection.student?.profilePicture}
                        sx={{ width: 32, height: 32 }}
                      >
                        <SchoolIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {selection.student?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selection.student?.studentCode}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {selection.lecturer && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Avatar
                          src={selection.lecturer.profilePicture}
                          sx={{ width: 32, height: 32 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {selection.lecturer.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selection.lecturer.facultyCode}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {selection.topicTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[selection.status].label}
                      color={statusMap[selection.status].color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {selection.status === 'PENDING' && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Tooltip title="Duyệt">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() =>
                              onUpdateStatus(
                                selection.id,
                                StudentSelectionStatusT.APPROVED,
                              )
                            }
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Từ chối">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              onUpdateStatus(
                                selection.id,
                                StudentSelectionStatusT.REJECTED,
                              )
                            }
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={selections.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trên ${count}`
          }
        />
      </TableContainer>

      {/* Bulk Status Update Dialog */}
      <Dialog
        open={bulkStatusDialogOpen}
        onClose={() => setBulkStatusDialogOpen(false)}
      >
        <DialogTitle>Cập nhật trạng thái hàng loạt</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bạn đang cập nhật trạng thái cho {selectedItems.length} nguyện vọng
          </DialogContentText>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Trạng thái
            </Typography>
            <Select
              fullWidth
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as StudentSelectionStatusT)
              }
            >
              <MenuItem value={StudentSelectionStatusT.APPROVED}>
                {statusMap[StudentSelectionStatusT.APPROVED].label}
              </MenuItem>
              <MenuItem value={StudentSelectionStatusT.REJECTED}>
                {statusMap[StudentSelectionStatusT.REJECTED].label}
              </MenuItem>
            </Select>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ghi chú (tùy chọn)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập ghi chú nếu cần..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkStatusDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleBulkStatusUpdate} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
