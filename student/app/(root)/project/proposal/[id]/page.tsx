'use client';
import { useProposedProjectById } from '@/services/proposalService';
import { ArrowBack, Refresh } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import toast from 'react-hot-toast';
import ProposalDetail from '../../_component/ProposalDetail';

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const router = useRouter();

  // Fetch the specific proposal by ID
  const {
    data: proposalData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProposedProjectById(proposalId);

  // Display any fetch errors using toast
  React.useEffect(() => {
    if (isError && error) {
      toast.error(
        `Lỗi khi tải thông tin đề xuất: ${
          error instanceof Error ? error.message : 'Lỗi không xác định'
        }`,
      );
    }
  }, [isError, error]);

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
    toast.success('Đang làm mới dữ liệu...');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/project/proposal')}
              startIcon={<ArrowBack />}
            >
              Quay lại
            </Button>
            <Typography variant="h4" color="primary" fontWeight="bold">
              Chi tiết đề cương
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Main content */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 0, minHeight: '80vh', borderRadius: 1 }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography color="error" variant="h6" gutterBottom>
                Đã xảy ra lỗi khi tải thông tin đề xuất
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Vui lòng thử lại sau hoặc kiểm tra ID đề xuất
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleRefresh}
                startIcon={<Refresh />}
                sx={{ mt: 2 }}
              >
                Thử lại
              </Button>
            </Box>
          ) : proposalData ? (
            <ProposalDetail proposal={proposalData} />
          ) : (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography color="text.secondary" variant="h6" gutterBottom>
                Không tìm thấy đề xuất
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Không tìm thấy đề xuất với ID đã cung cấp
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/project/proposal')}
              >
                Quay lại danh sách đề xuất
              </Button>
            </Box>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
