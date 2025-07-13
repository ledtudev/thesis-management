'use client';

import { domainHooks } from '@/services/domainService';
import { useEnrollmentStatus } from '@/services/enrollmentStatusService';
import { Domain, FieldPool, useFieldPools } from '@/services/fieldPoolService';
import { formatDate } from '@/utils/dateUtils';
import {
  FilterAlt as FilterAltIcon,
  LibraryBooks as LibraryBooksIcon,
  Search as SearchIcon,
  SortRounded as SortIcon,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import EnrollmentStatusChip from '../_component/EnrollmentStatusChip';

interface FieldPoolResponse {
  data: {
    data: FieldPool[];
  };
}

interface DomainResponse {
  data: {
    data: Domain[];
  };
}

export default function Page() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<Domain | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: fieldPoolsResponse, isLoading: fieldPoolsLoading } =
    useFieldPools({
      name: searchTerm,
      domain: domainFilter?.id,
      page: 1,
      limit: 100, // Increased limit to show more items
    }) as { data: FieldPoolResponse | undefined; isLoading: boolean };
  const fieldPools = fieldPoolsResponse?.data?.data || [];

  const { data: domainsResponse, isLoading: domainsLoading } =
    domainHooks.useDomains({
      page: 1,
      limit: 50,
    }) as { data: DomainResponse | undefined; isLoading: boolean };
  const domains = domainsResponse?.data?.data || [];

  // Use enrollment status service to check registration status
  const {
    isFieldPoolRegistered,
    getFieldPoolRegistrationStatus,
    isLoading: enrollmentStatusLoading,
  } = useEnrollmentStatus();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleThemeClick = (fieldPool: FieldPool) => {
    router.push(`/project/register/theme/${fieldPool.id}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getRemainingDays = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Sort field pools
  const sortedFieldPools = [...fieldPools].sort((a, b) => {
    const daysA = getRemainingDays(a.registrationDeadline);
    const daysB = getRemainingDays(b.registrationDeadline);

    if (sortOrder === 'asc') {
      return daysA - daysB; // Sort by closest deadline first
    } else {
      return daysB - daysA; // Sort by furthest deadline first
    }
  });

  const isLoading =
    fieldPoolsLoading || domainsLoading || enrollmentStatusLoading;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: 'primary.main',
          borderRadius: '16px 16px 0 0',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LibraryBooksIcon sx={{ fontSize: 28, mr: 1.5 }} />
          <Typography variant="h5" fontWeight="bold">
            Danh Sách Lĩnh Vực Đề Tài
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Dưới đây là danh sách các lĩnh vực đề tài hiện đang mở đăng ký. Chọn
          một lĩnh vực để xem chi tiết và tham gia.
        </Typography>
      </Paper>

      {/* Bộ lọc và tìm kiếm */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mx: 3,
          mb: 4,
          mt: -2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên lĩnh vực đề tài..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ borderRadius: 2, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            ),
          }}
        />
        <Autocomplete
          options={domains}
          getOptionLabel={(option) => option.name}
          loading={domainsLoading}
          value={domainFilter}
          onChange={(_, newValue) => setDomainFilter(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Lọc theo lĩnh vực"
              variant="outlined"
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 250 } }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <FilterAltIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Tooltip
          title={
            sortOrder === 'asc'
              ? 'Sắp xếp theo thời gian gần nhất trước'
              : 'Sắp xếp theo thời gian xa nhất trước'
          }
        >
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={toggleSortOrder}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
            }}
          >
            {sortOrder === 'asc' ? 'Gần nhất trước' : 'Xa nhất trước'}
          </Button>
        </Tooltip>
      </Paper>

      {/* Danh sách lĩnh vực */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress size={40} />
        </Box>
      ) : sortedFieldPools.length === 0 ? (
        <Alert severity="info" sx={{ mx: 3, borderRadius: 2, py: 2 }}>
          Không tìm thấy lĩnh vực đề tài nào. Vui lòng thử lại với bộ lọc khác!
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            mx: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell width="40%">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Lĩnh vực đề tài
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Mô tả
                  </Typography>
                </TableCell>
                <TableCell align="center" width="15%">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Hạn đăng ký
                  </Typography>
                </TableCell>
                <TableCell align="center" width="15%">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Trạng thái
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFieldPools.map((fieldPool) => {
                const remainingDays = getRemainingDays(
                  fieldPool.registrationDeadline,
                );
                const isActive = remainingDays > 0;
                const isRegistered = isFieldPoolRegistered(fieldPool.id);
                const registrationStatus = getFieldPoolRegistrationStatus(
                  fieldPool.id,
                );

                return (
                  <TableRow
                    key={fieldPool.id}
                    hover
                    onClick={() => handleThemeClick(fieldPool)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    component={motion.tr}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {fieldPool.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={isActive ? 'Đang mở' : 'Đã đóng'}
                          color={isActive ? 'success' : 'error'}
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                        {isRegistered && registrationStatus && (
                          <EnrollmentStatusChip
                            status={registrationStatus}
                            size="small"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {fieldPool.description || 'Không có mô tả.'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(fieldPool.registrationDeadline)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={isActive ? 'success.main' : 'error.main'}
                          sx={{ mt: 0.5, fontWeight: 'medium' }}
                        >
                          {isActive ? `Còn ${remainingDays} ngày` : `Đã đóng`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant={isRegistered ? 'outlined' : 'contained'}
                        color={isActive ? 'primary' : 'inherit'}
                        disabled={!isActive}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        {isRegistered
                          ? 'Xem chi tiết'
                          : isActive
                          ? 'Đăng ký'
                          : 'Đã đóng'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
