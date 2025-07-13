// components/TopicCard.js
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { Download } from 'lucide-react';

const statusColors = {
  COMPLETED: 'success',
};

export default function TopicCard({ topic }) {
  const handleDownload = () => {
    console.log(`Tải file: ${topic.mainReport}`);
  };

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        '&:hover': { boxShadow: 6 },
        transition: 'box-shadow 0.3s',
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {topic.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {topic.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={topic.type} size="small" color="primary" />
          <Chip label={topic.field} size="small" variant="outlined" />
          <Chip
            label={topic.status}
            size="small"
            color={statusColors[topic.status]}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Kích thước file: {(topic.fileSize / 1048576).toFixed(2)} MB
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Download />}
          onClick={handleDownload}
          size="small"
        >
          Tải PDF
        </Button>
      </CardContent>
    </Card>
  );
}
