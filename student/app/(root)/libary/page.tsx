'use client';
import {
  Box,
  Container,
  Grid2,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import TopicCard from './_component/TopicCard';

const mockTopics = [
  {
    id: '1',
    title: 'Nghiên cứu AI trong y tế',
    type: 'RESEARCH',
    field: 'Công nghệ thông tin',
    status: 'COMPLETED',
    mainReport: 'report_ai_y_te.pdf',
    fileSize: 5242880, // 5MB
    description: 'Ứng dụng AI để chẩn đoán bệnh',
  },
  {
    id: '2',
    title: 'Phân tích dữ liệu lớn',
    type: 'COMPETITION',
    field: 'Khoa học dữ liệu',
    status: 'COMPLETED',
    mainReport: 'report_du_lieu_lon.pdf',
    fileSize: 7340032, // 7MB
    description: 'Phân tích dữ liệu giao thông',
  },
  {
    id: '3',
    title: 'Thiết kế cầu thép',
    type: 'GRADUATED',
    field: 'Xây dựng',
    status: 'COMPLETED',
    mainReport: 'report_cau_thep.pdf',
    fileSize: 3145728, // 3MB
    description: 'Thiết kế cầu thép tối ưu',
  },
];

const projectTypes = ['GRADUATED', 'RESEARCH', 'COMPETITION', 'COLLABORATION'];
const fields = ['Công nghệ thông tin', 'Khoa học dữ liệu', 'Xây dựng'];

export default function ReferenceTopics() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('');
  const [filterField, setFilterField] = React.useState('');
  const [filteredTopics, setFilteredTopics] = React.useState(mockTopics);

  const handleFilter = React.useCallback(() => {
    let result = mockTopics;
    if (searchTerm) {
      result = result.filter((topic) =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (filterType) {
      result = result.filter((topic) => topic.type === filterType);
    }
    if (filterField) {
      result = result.filter((topic) => topic.field === filterField);
    }
    setFilteredTopics(result);
  }, [searchTerm, filterType, filterField]);

  React.useEffect(() => {
    handleFilter();
  }, [searchTerm, filterType, filterField, handleFilter]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Kho đề tài tham khảo
      </Typography>

      {/* Bộ lọc và tìm kiếm */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Tìm kiếm theo tên"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              select
              label="Loại đề tài"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {projectTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              select
              label="Lĩnh vực"
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {fields.map((field) => (
                <MenuItem key={field} value={field}>
                  {field}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
        </Grid2>
      </Paper>

      {/* Danh sách đề tài */}
      <Grid2 container spacing={3}>
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <Grid2
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
              key={topic.id}
            >
              <TopicCard topic={topic} />
            </Grid2>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', width: '100%', mt: 4 }}>
            <Typography color="text.secondary">
              Không tìm thấy đề tài nào phù hợp.
            </Typography>
          </Box>
        )}
      </Grid2>
    </Container>
  );
}
