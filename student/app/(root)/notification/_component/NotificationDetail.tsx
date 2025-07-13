import { Box, Chip, Typography } from '@mui/material';

const typeColors = {
  PROJECT: 'primary',
  PROPOSAL: 'secondary',
  DEFENSE: 'success',
  SYSTEM: 'warning',
};

export default function NotificationDetail({ notification }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {notification.title}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Chip
          label={notification.type}
          size="small"
          color={typeColors[notification.type]}
          sx={{ mr: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {new Date(notification.createdAt).toLocaleString()}
        </Typography>
      </Box>
      <Typography variant="body1">{notification.content}</Typography>
    </Box>
  );
}
