'use client';
import { useSubmitProjectReport } from '@/services/projectService';
import { useFileUpload } from '@/services/storageService';
import { CloudUpload, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import toast from 'react-hot-toast';

interface SubmitReportFormProps {
  projectId: string;
}

export default function SubmitReportForm({ projectId }: SubmitReportFormProps) {
  const [mainReportFile, setMainReportFile] = React.useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = React.useState<File[]>([]);
  const [mainReportFileId, setMainReportFileId] = React.useState<string | null>(
    null,
  );
  const [attachmentFileIds, setAttachmentFileIds] = React.useState<string[]>(
    [],
  );
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [currentFileIndex, setCurrentFileIndex] = React.useState<number>(0);
  const [totalFiles, setTotalFiles] = React.useState<number>(0);

  const fileUploadMutation = useFileUpload();
  const submitReportMutation = useSubmitProjectReport();
  const queryClient = useQueryClient();

  const handleMainReportFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setMainReportFile(e.target.files[0]);
      setMainReportFileId(null);
    }
  };

  const handleAttachmentFilesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachmentFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachmentFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    setAttachmentFileIds((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setMainReportFile(null);
    setAttachmentFiles([]);
    setMainReportFileId(null);
    setAttachmentFileIds([]);
    setUploadProgress(0);
    setIsUploading(false);
    setCurrentFileIndex(0);
    setTotalFiles(0);
  };

  const handleSubmit = async () => {
    try {
      if (!mainReportFile && attachmentFiles.length === 0) {
        toast.error('Vui lòng chọn ít nhất một tập tin để nộp');
        return;
      }

      setIsUploading(true);
      // Calculate total files to upload
      const filesToUpload = [mainReportFile, ...attachmentFiles].filter(
        Boolean,
      );
      setTotalFiles(filesToUpload.length);

      // Upload main report file if exists
      let mainReportId = null;
      if (mainReportFile) {
        setCurrentFileIndex(1);
        const uploadResult = await fileUploadMutation.mutateAsync({
          file: mainReportFile,
          context: 'REPORT',
          description: 'Báo cáo chính của dự án',
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        });
        mainReportId = uploadResult.id;
        setMainReportFileId(mainReportId);
      }

      // Upload attachment files if any
      const attachmentIds: string[] = [];
      for (let i = 0; i < attachmentFiles.length; i++) {
        setCurrentFileIndex(i + (mainReportFile ? 2 : 1));
        const uploadResult = await fileUploadMutation.mutateAsync({
          file: attachmentFiles[i],
          context: 'ATTACHMENT',
          description: `Tài liệu đính kèm ${i + 1} của dự án`,
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        });
        attachmentIds.push(uploadResult.id);
      }
      setAttachmentFileIds(attachmentIds);

      // Submit report with uploaded file IDs
      await submitReportMutation.mutateAsync({
        projectId,
        mainReportFileId: mainReportId,
        attachmentFileIds: attachmentIds,
      });

      // Success notification and reset form
      toast.success('Báo cáo đã được nộp thành công');
      resetForm();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['projectReports', projectId],
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(
        `Lỗi khi nộp báo cáo: ${
          error instanceof Error ? error.message : 'Lỗi không xác định'
        }`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {isUploading ? (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Đang tải lên tập tin ({currentFileIndex}/{totalFiles})
          </Typography>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Vui lòng không đóng cửa sổ này trong khi đang tải lên...
          </Typography>
        </Box>
      ) : submitReportMutation.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" paragraph>
            Nộp báo cáo cho dự án của bạn. Bạn có thể nộp một báo cáo chính và
            nhiều tài liệu đính kèm.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Báo cáo chính
            </Typography>
            <input
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              style={{ display: 'none' }}
              id="main-report-file"
              type="file"
              onChange={handleMainReportFileChange}
            />
            <label htmlFor="main-report-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
              >
                Chọn báo cáo chính
              </Button>
            </label>
            {mainReportFile && (
              <Box sx={{ mt: 2 }}>
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Typography variant="body2">
                    {mainReportFile.name} (
                    {(mainReportFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tài liệu đính kèm (tùy chọn)
            </Typography>
            <input
              accept="*"
              style={{ display: 'none' }}
              id="attachment-files"
              multiple
              type="file"
              onChange={handleAttachmentFilesChange}
            />
            <label htmlFor="attachment-files">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
              >
                Chọn tài liệu đính kèm
              </Button>
            </label>

            {attachmentFiles.length > 0 && (
              <List sx={{ mt: 2 }}>
                {attachmentFiles.map((file, index) => (
                  <ListItem
                    key={index}
                    component={Paper}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  >
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        edge="end"
                        onClick={() => handleRemoveAttachmentFile(index)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!mainReportFile && attachmentFiles.length === 0}
              startIcon={<CloudUpload />}
            >
              Nộp báo cáo
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
