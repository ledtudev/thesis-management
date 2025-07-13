'use client';

import {
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Title as TitleIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { formatDate } from '@/lib/utils';
import { ProjectAllocation } from '@/services/service';

interface AllocationDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  allocation: ProjectAllocation;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function AllocationDetailDrawer({
  open,
  onClose,
  allocation,
  onEdit,
  onDelete,
}: AllocationDetailDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 } },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Chi tiết phân công đề tài</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Thông tin đề tài
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <TitleIcon color="primary" sx={{ mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tên đề tài
              </Typography>
              <Typography variant="body1">{allocation.topicTitle}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <CalendarIcon color="primary" sx={{ mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Ngày phân công
              </Typography>
              <Typography variant="body1">
                {formatDate(allocation.allocatedAt)}
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Thông tin sinh viên
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <PersonIcon color="primary" sx={{ mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tên sinh viên
              </Typography>
              <Typography variant="body1">
                {allocation.Student?.fullName || 'Không có thông tin'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <SchoolIcon color="primary" sx={{ mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Mã số sinh viên
              </Typography>
              <Typography variant="body1">
                {allocation.Student?.studentCode || 'Không có thông tin'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <BusinessIcon color="primary" sx={{ mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Khoa
              </Typography>
              <Typography variant="body1">
                {allocation.Student?.Department?.name || 'Không có thông tin'}
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Thông tin giảng viên hướng dẫn
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <PersonIcon color="primary" sx={{ mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tên giảng viên
              </Typography>
              <Typography variant="body1">
                {allocation.Lecturer?.fullName || 'Không có thông tin'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <SchoolIcon color="primary" sx={{ mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Mã giảng viên
              </Typography>
              <Typography variant="body1">
                {allocation.Lecturer?.facultyCode || 'Không có thông tin'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <BusinessIcon color="primary" sx={{ mr: 1, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Bộ môn
              </Typography>
              <Typography variant="body1">
                {allocation.Lecturer?.Department?.name || 'Không có thông tin'}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onEdit && (
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={onEdit}
            >
              Chỉnh sửa
            </Button>
          )}
          {onDelete && (
            <Button
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              onClick={onDelete}
            >
              Xóa
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
