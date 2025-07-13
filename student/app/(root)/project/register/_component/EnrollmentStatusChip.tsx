import { StudentSelectionStatus } from '@/services/studentSelectionService';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';

interface StatusChipProps {
  status: StudentSelectionStatus | string;
  size?: 'small' | 'medium';
}

export default function EnrollmentStatusChip({
  status,
  size = 'small',
}: StatusChipProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'CONFIRMED':
      case 'COMPLETED':
        return {
          color: 'success' as const,
          icon: <CheckCircleIcon />,
          label: getStatusText(status),
        };
      case 'REJECTED':
        return {
          color: 'error' as const,
          icon: <CancelIcon />,
          label: getStatusText(status),
        };
      case 'PENDING':
      case 'IN_PROGRESS':
        return {
          color: 'warning' as const,
          icon: <PendingIcon />,
          label: getStatusText(status),
        };
      case 'NOT_STARTED':
      case 'REQUESTED_CHANGES':
        return {
          color: 'info' as const,
          icon: <ErrorIcon />,
          label: getStatusText(status),
        };
      default:
        return {
          color: 'default' as const,
          icon: <PendingIcon />,
          label: status,
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'REJECTED':
        return 'Đã từ chối';
      case 'PENDING':
        return 'Đang chờ';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'NOT_STARTED':
        return 'Chưa bắt đầu';
      case 'REQUESTED_CHANGES':
        return 'Cần chỉnh sửa';
      default:
        return status;
    }
  };

  const config = getStatusConfig(status);

  return (
    <Tooltip title={config.label}>
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size={size}
      />
    </Tooltip>
  );
}
