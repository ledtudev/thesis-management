import * as React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

const statusColors = {
  PREPARING: 'default',
  SCHEDULED: 'primary',
  ONGOING: 'warning',
  FINISHED: 'success',
  PENDING: 'default',
  APPROVED: 'success',
  REJECTED: 'error',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
};

export default function DefenseDetail({ project }) {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {project.title} ({project.status})
      </Typography>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Hội đồng bảo vệ" />
        <Tab label="Kết quả & Điểm" />
      </Tabs>

      {/* Tab Hội đồng bảo vệ */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Thông tin hội đồng
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>
                <strong>Tên hội đồng:</strong> {project.defenseCommittee.name}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <strong>Mô tả:</strong>{' '}
                {project.defenseCommittee.description || 'Không có'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <strong>Ngày bảo vệ:</strong>{' '}
                {new Date(
                  project.defenseCommittee.defenseDate,
                ).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <strong>Trạng thái:</strong>{' '}
                <Chip
                  label={project.defenseCommittee.status}
                  size="small"
                  color={statusColors[project.defenseCommittee.status]}
                />
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Thành viên hội đồng
          </Typography>
          <List>
            {project.defenseCommittee.members.map((member, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={member.facultyMember.fullName}
                    secondary={member.role}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Tab Kết quả & Điểm */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Báo cáo chính
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>
                <strong>File báo cáo:</strong>{' '}
                {project.resultOutline.mainReport}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <strong>Kích thước:</strong>{' '}
                {(project.resultOutline.fileSize / 1048576).toFixed(2)} MB
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            File liên quan
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Loại file</TableCell>
                <TableCell>Tên file</TableCell>
                <TableCell>Kích thước</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {project.resultOutline.relatedFiles.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file.fileType}</TableCell>
                  <TableCell>{file.fileUrl}</TableCell>
                  <TableCell>
                    {(file.fileSize / 1048576).toFixed(2)} MB
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={file.status}
                      size="small"
                      color={statusColors[file.status]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Điểm đánh giá
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>
                <strong>Điểm cuối cùng:</strong>{' '}
                {project.evaluation.finalScore || 'Chưa có'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                <strong>Trạng thái:</strong>{' '}
                <Chip
                  label={project.evaluation.status}
                  size="small"
                  color={statusColors[project.evaluation.status]}
                />
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                <strong>Điểm giảng viên:</strong>{' '}
                {project.evaluation.teacherScore || 'Chưa có'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                <strong>Điểm trung bình hội đồng:</strong>{' '}
                {project.evaluation.committeeAverageScore || 'Chưa có'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
