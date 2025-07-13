'use client';
import { MarkEmailRead, NotificationImportant } from '@mui/icons-material';
import {
  Badge,
  Box,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import NotificationDetail from './_component/NotificationDetail';

const mockNotifications = [
  {
    id: '1',
    title: 'Thông báo nộp đề cương',
    content:
      'Bạn cần nộp đề cương cho dự án "Nghiên cứu AI trong y tế" trước ngày 10/04/2025.',
    type: 'PROPOSAL',
    createdAt: new Date('2025-03-01T10:00:00'),
    isRead: false,
  },
  {
    id: '2',
    title: 'Hội đồng bảo vệ được lên lịch',
    content:
      'Hội đồng bảo vệ cho dự án "Phân tích dữ liệu lớn" đã được lên lịch vào 15/03/2025.',
    type: 'DEFENSE',
    createdAt: new Date('2025-02-28T15:00:00'),
    isRead: true,
  },
  {
    id: '3',
    title: 'Cập nhật hệ thống',
    content: 'Hệ thống sẽ bảo trì từ 00:00 đến 02:00 ngày 05/03/2025.',
    type: 'SYSTEM',
    createdAt: new Date('2025-02-27T09:00:00'),
    isRead: false,
  },
];

const notificationTypes = ['ALL', 'PROJECT', 'PROPOSAL', 'DEFENSE', 'SYSTEM'];
const readStatusOptions = ['ALL', 'READ', 'UNREAD'];

export default function Notifications() {
  const [selectedNotification, setSelectedNotification] = React.useState(null);
  const [notifications, setNotifications] = React.useState(mockNotifications);
  const [filterType, setFilterType] = React.useState('ALL');
  const [filterReadStatus, setFilterReadStatus] = React.useState('ALL');
  const [filteredNotifications, setFilteredNotifications] =
    React.useState(mockNotifications);

  const handleSelectNotification = (notification) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );
    }
    setSelectedNotification(notification);
  };

  const handleFilter = () => {
    let result = notifications;
    if (filterType !== 'ALL') {
      result = result.filter((n) => n.type === filterType);
    }
    if (filterReadStatus !== 'ALL') {
      result = result.filter((n) =>
        filterReadStatus === 'READ' ? n.isRead : !n.isRead,
      );
    }
    setFilteredNotifications(result);
  };

  React.useEffect(() => {
    handleFilter();
  }, [filterType, filterReadStatus, notifications]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Thông báo
      </Typography>
      <Grid container spacing={3}>
        {/* Bộ lọc */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Loại thông báo"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  variant="outlined"
                >
                  {notificationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === 'ALL' ? 'Tất cả' : type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Trạng thái đọc"
                  value={filterReadStatus}
                  onChange={(e) => setFilterReadStatus(e.target.value)}
                  variant="outlined"
                >
                  {readStatusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'ALL'
                        ? 'Tất cả'
                        : status === 'READ'
                        ? 'Đã đọc'
                        : 'Chưa đọc'}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Danh sách thông báo */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '70vh', overflowY: 'auto' }}>
            <Typography variant="h6" color="secondary" gutterBottom>
              Danh sách thông báo
            </Typography>
            <List>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      onClick={() => handleSelectNotification(notification)}
                      sx={{
                        bgcolor:
                          selectedNotification?.id === notification.id
                            ? 'grey.200'
                            : 'transparent',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      <ListItemIcon>
                        {notification.isRead ? (
                          <MarkEmailRead color="action" />
                        ) : (
                          <Badge variant="dot" color="error">
                            <NotificationImportant color="primary" />
                          </Badge>
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={new Date(
                          notification.createdAt,
                        ).toLocaleString()}
                        primaryTypographyProps={{
                          fontWeight: notification.isRead ? 400 : 500,
                        }}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: 'center', mt: 4 }}
                >
                  Không có thông báo nào.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chi tiết thông báo */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '70vh', overflowY: 'auto' }}>
            {selectedNotification ? (
              <NotificationDetail notification={selectedNotification} />
            ) : (
              <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Typography color="text.secondary">
                  Chọn một thông báo để xem chi tiết
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
