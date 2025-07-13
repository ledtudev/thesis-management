import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery } from '@tanstack/react-query';

// Define storage context types
export type StorageContext = 'AVATAR' | 'PROPOSAL' | 'REPORT' | 'ATTACHMENT';

export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  uploaderId: string;
  uploaderType: string;
}

export interface UploadFileOptions {
  file: File;
  context: StorageContext;
  description?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Upload a file to the server
 */
const uploadFile = async ({
  file,
  context,
  description,
  onProgress,
}: UploadFileOptions): Promise<FileInfo> => {
  const formData = new FormData();
  formData.append('file', file);

  if (description) {
    formData.append('description', description);
  }

  const { data } = await api.post<ApiResponse<FileInfo>>(
    `/storage/upload/${context}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    },
  );

  return data.data as FileInfo;
};

/**
 * Get file information by ID
 */
const getFileInfo = async (fileId: string): Promise<FileInfo> => {
  const { data } = await api.get<ApiResponse<FileInfo>>(
    `/storage/info/${fileId}`,
  );
  return data.data as FileInfo;
};

/**
 * Get file download URL
 */
export const openFileInNewTab = async (fileId: string): Promise<void> => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  try {
    const response = await fetch(
      `${api.defaults.baseURL}/storage/download/${fileId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
      },
    );

    // Kiểm tra xem server có trả về file PDF không
    const contentType = response.headers.get('content-type');
    if (contentType && contentType === 'application/pdf') {
      // Chuyển response thành blob
      const blob = await response.blob();

      // Tạo URL từ blob và tạo thẻ <a> để tải file về
      const fileURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `${fileId}.pdf`; // Đặt tên cho file PDF khi tải xuống
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Dữ liệu trả về không phải file PDF');
    }
  } catch (error) {
    console.error('Có lỗi khi tải file:', error);
  }
};

/**
 * Get file view URL for inline viewing (PDFs, images, etc.)
 */
export const getFileViewUrl = (fileId: string): string => {
  const baseUrl = api.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || '';
  const viewUrl = `${baseUrl}/storage/view/${fileId}`;

  // Get token from localStorage if available (for iframe authentication)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return `${viewUrl}?token=${encodeURIComponent(token)}`;
    }
  }

  return viewUrl;
};

/**
 * Delete a file
 */
const deleteFile = async (fileId: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/storage/${fileId}`);
};

/**
 * Hook for file upload
 */
export const useFileUpload = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};

/**
 * Hook for getting file info
 */
export const useFileInfo = (fileId?: string) => {
  return useQuery({
    queryKey: ['fileInfo', fileId],
    queryFn: () => getFileInfo(fileId || ''),
    enabled: !!fileId,
  });
};

/**
 * Hook for deleting a file
 */
export const useDeleteFile = () => {
  return useMutation({
    mutationFn: deleteFile,
  });
};

/**
 * Download file as blob with authentication
 * This allows us to display files inline without authentication issues
 */
export const downloadFileAsBlob = async (fileId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/storage/download/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading file as blob:', error);
    throw error;
  }
};

/**
 * Create a blob URL for a file that can be used in iframe or object tags
 * This URL will work without authentication issues
 */
export const createFileBlobUrl = async (fileId: string): Promise<string> => {
  try {
    const blob = await downloadFileAsBlob(fileId);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating blob URL:', error);
    throw error;
  }
};

/**
 * Hook for downloading file as blob
 */
export const useFileBlob = (fileId?: string) => {
  return useQuery({
    queryKey: ['fileBlob', fileId],
    queryFn: () => downloadFileAsBlob(fileId || ''),
    enabled: !!fileId,
  });
};

/**
 * Hook for getting file blob URL
 */
export const useFileBlobUrl = (fileId?: string) => {
  return useQuery({
    queryKey: ['fileBlobUrl', fileId],
    queryFn: () => createFileBlobUrl(fileId || ''),
    enabled: !!fileId,
  });
};
