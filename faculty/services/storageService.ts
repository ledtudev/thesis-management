import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
 * @deprecated Use getSecureFileDownloadUrl instead for new implementations
 */
export const getFileDownloadUrl = (fileId: string): string => {
  return `${api.defaults.baseURL}/storage/download/${fileId}`;
};

/**
 * Get file view URL for inline viewing (PDFs, images, etc.)
 */
export const getFileViewUrl = (fileId: string): string => {
  const baseUrl = `${api.defaults.baseURL}/storage/view/${fileId}`;

  // Get token from localStorage if available (for iframe authentication)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return `${baseUrl}?token=${encodeURIComponent(token)}`;
    }
  }

  return baseUrl;
};

/**
 * Get a secure file download URL with authentication token
 * This URL can be opened in a new tab without requiring login
 */
export const getSecureFileDownloadUrl = async (
  fileId: string,
): Promise<string> => {
  try {
    const { data } = await api.get<ApiResponse<{ downloadUrl: string }>>(
      `/storage/secure-download-url/${fileId}`,
    );
    return data.data.downloadUrl;
  } catch (error) {
    console.error('Error getting secure download URL:', error);
    return getFileDownloadUrl(fileId);
  }
};

/**
 * Generate a secure file download URL with the current auth token
 * This can be used immediately without an API call
 */
export const generateSecureFileUrl = (fileId: string): string => {
  return `${api.defaults.baseURL}/storage/download/${fileId}`;
};

/**
 * Download a file directly (simplified version)
 * This function automatically handles authentication and downloads the file
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
 * Hook for getting a secure download URL
 */
export const useSecureDownloadUrl = (fileId?: string) => {
  return useQuery({
    queryKey: ['secureDownloadUrl', fileId],
    queryFn: () => getSecureFileDownloadUrl(fileId || ''),
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for creating blob URL
 */
export const useFileBlobUrl = (fileId?: string) => {
  return useQuery({
    queryKey: ['fileBlobUrl', fileId],
    queryFn: () => createFileBlobUrl(fileId || ''),
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Download a file (triggers download dialog)
 */
export const downloadFile = async (
  fileId: string,
  filename?: string,
): Promise<void> => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (!token) {
    console.error('No access token found');
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.get(
      `${api.defaults.baseURL}/storage/download/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      },
    );

    // Create blob URL and trigger download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    // Try to get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let downloadFilename = filename;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
      );
      if (filenameMatch && filenameMatch[1]) {
        downloadFilename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    link.download = downloadFilename || `file_${fileId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('File downloaded successfully');
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Debug function to test file access and get detailed information
 */
export const debugFileAccess = async (fileId: string): Promise<void> => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  console.log('=== File Access Debug ===');
  console.log('File ID:', fileId);
  console.log('Token available:', !!token);
  console.log('API Base URL:', api.defaults.baseURL);

  if (!token) {
    console.error('No access token found');
    return;
  }

  try {
    // Test 1: Get file info
    console.log('\n1. Testing file info endpoint...');
    const infoResponse = await api.get(`/storage/info/${fileId}`);
    console.log('File info response:', infoResponse.data);

    // Test 2: Test view endpoint
    console.log('\n2. Testing view endpoint...');
    const viewUrl = `${api.defaults.baseURL}/storage/view/${fileId}`;
    console.log('View URL:', viewUrl);

    try {
      const viewResponse = await axios.head(viewUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('View endpoint headers:', viewResponse.headers);
    } catch (viewError) {
      console.error('View endpoint error:', viewError);
    }

    // Test 3: Test download endpoint
    console.log('\n3. Testing download endpoint...');
    const downloadUrl = `${api.defaults.baseURL}/storage/download/${fileId}`;
    console.log('Download URL:', downloadUrl);

    try {
      const downloadResponse = await axios.head(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Download endpoint headers:', downloadResponse.headers);
    } catch (downloadError) {
      console.error('Download endpoint error:', downloadError);
    }
  } catch (error) {
    console.error('Debug error:', error);
  }

  console.log('=== End Debug ===');
};

/**
 * Hook for debugging file access
 */
export const useDebugFileAccess = () => {
  return useMutation({
    mutationFn: debugFileAccess,
  });
};

/**
 * Hook for downloading files
 */
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: ({ fileId, filename }: { fileId: string; filename?: string }) =>
      downloadFile(fileId, filename),
  });
};
