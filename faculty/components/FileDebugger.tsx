'use client';

import {
  debugFileAccess,
  downloadFile,
  openFileInNewTab,
} from '@/services/storageService';
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

export const FileDebugger: React.FC = () => {
  const [fileId, setFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDebug = async () => {
    if (!fileId.trim()) {
      setError('Please enter a file ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await debugFileAccess(fileId.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Debug failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileId.trim()) {
      setError('Please enter a file ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await downloadFile(fileId.trim());
      console.log('Download completed');
    } catch (err) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInTab = () => {
    if (!fileId.trim()) {
      setError('Please enter a file ID');
      return;
    }

    setError(null);
    try {
      openFileInNewTab(fileId.trim());
    } catch (err) {
      console.error('Open in tab failed:', err);
      setError(err instanceof Error ? err.message : 'Open in tab failed');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        File Download Debugger
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="File ID"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          placeholder="Enter file ID to test"
          variant="outlined"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={handleDebug} disabled={loading}>
          Debug File Access
        </Button>

        <Button variant="contained" onClick={handleDownload} disabled={loading}>
          Download File
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenInTab}
          disabled={loading}
        >
          Open in New Tab
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Open browser console to see debug information and error details.
      </Typography>
    </Paper>
  );
};
