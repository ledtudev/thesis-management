'use client';

import { downloadFileAsBlob, getFileViewUrl } from '@/services/storageService';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

interface PDFViewerProps {
  fileId: string;
  fileName?: string;
  height?: string | number;
  width?: string | number;
  showControls?: boolean;
  onClose?: () => void;
}

interface PDFViewerDialogProps {
  open: boolean;
  onClose: () => void;
  fileId: string;
  fileName?: string;
}

// Inline PDF Viewer Component
export const PDFViewer: React.FC<PDFViewerProps> = ({
  fileId,
  fileName = 'Document',
  height = 600,
  width = '100%',
  showControls = true,
  onClose,
}) => {
  const [zoom, setZoom] = useState(100);

  const handleDownload = async () => {
    try {
      const blob = await downloadFileAsBlob(fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  return (
    <Paper sx={{ width, height, position: 'relative' }}>
      {showControls && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
            {fileName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={handleZoomOut} title="Thu nhỏ">
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="caption"
              sx={{ alignSelf: 'center', minWidth: 40 }}
            >
              {zoom}%
            </Typography>
            <IconButton size="small" onClick={handleZoomIn} title="Phóng to">
              <ZoomInIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDownload} title="Tải xuống">
              <DownloadIcon fontSize="small" />
            </IconButton>
            {onClose && (
              <IconButton size="small" onClick={onClose} title="Đóng">
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      )}
      <Box
        sx={{
          height: showControls ? 'calc(100% - 48px)' : '100%',
          overflow: 'auto',
        }}
      >
        <iframe
          src={`${getFileViewUrl(
            fileId,
          )}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title={fileName}
        />
      </Box>
    </Paper>
  );
};

// PDF Viewer Dialog Component
export const PDFViewerDialog: React.FC<PDFViewerDialogProps> = ({
  open,
  onClose,
  fileId,
  fileName = 'Document',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <PDFViewer
          fileId={fileId}
          fileName={fileName}
          height="100%"
          showControls={true}
          onClose={onClose}
        />
      </DialogTitle>
    </Dialog>
  );
};

// Simple PDF Preview Button Component
interface PDFPreviewButtonProps {
  fileId: string;
  fileName?: string;
  variant?: 'button' | 'icon';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

export const PDFPreviewButton: React.FC<PDFPreviewButtonProps> = ({
  fileId,
  fileName = 'Document',
  variant = 'button',
  size = 'medium',
  children,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      {variant === 'button' ? (
        <Button
          variant="outlined"
          size={size}
          startIcon={<FullscreenIcon />}
          onClick={handleClick}
        >
          {children || 'Xem PDF'}
        </Button>
      ) : (
        <IconButton size={size} onClick={handleClick} title="Xem PDF">
          <FullscreenIcon />
        </IconButton>
      )}

      <PDFViewerDialog
        open={dialogOpen}
        onClose={handleClose}
        fileId={fileId}
        fileName={fileName}
      />
    </>
  );
};

export default PDFViewer;
