/**
 * File type classification
 */
export enum FileType {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  SPREADSHEET = 'SPREADSHEET',
  PRESENTATION = 'PRESENTATION',
  OTHER = 'OTHER',
}

/**
 * Service for handling file operations
 */
const fileService = {
  /**
   * Get a download URL for a file
   * @param fileId The ID of the file to download
   * @returns The URL to download the file
   */
  getDownloadUrl(fileId: string): string {
    return `${
      process.env.NEXT_PUBLIC_API_URL || '/api'
    }/storage/download/${fileId}`;
  },

  /**
   * Download a file directly
   * @param fileId The ID of the file to download
   */
  downloadFile(fileId: string): void {
    if (!fileId) return;

    // Open in a new tab for direct download
    window.open(this.getDownloadUrl(fileId), '_blank');
  },

  /**
   * Get a preview URL for a file
   * @param fileId The ID of the file to preview
   * @returns The URL to preview the file
   */
  getPreviewUrl(fileId: string): string {
    // For preview, we use the same download endpoint, but the browser will try to render it
    return this.getDownloadUrl(fileId);
  },

  /**
   * Determine the file type based on mime type
   * @param mimeType The MIME type of the file
   * @returns The file type classification
   */
  getFileType(mimeType: string): FileType {
    if (!mimeType) return FileType.OTHER;

    if (mimeType === 'application/pdf') {
      return FileType.PDF;
    }

    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    }

    if (
      mimeType === 'application/msword' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/vnd.oasis.opendocument.text' ||
      mimeType === 'text/plain'
    ) {
      return FileType.DOCUMENT;
    }

    if (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.oasis.opendocument.spreadsheet'
    ) {
      return FileType.SPREADSHEET;
    }

    if (
      mimeType === 'application/vnd.ms-powerpoint' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      mimeType === 'application/vnd.oasis.opendocument.presentation'
    ) {
      return FileType.PRESENTATION;
    }

    return FileType.OTHER;
  },

  /**
   * Check if a file is previewable in the browser
   * @param mimeType The MIME type of the file
   * @returns Whether the file is previewable
   */
  isPreviewable(mimeType: string): boolean {
    const fileType = this.getFileType(mimeType);
    return fileType === FileType.PDF || fileType === FileType.IMAGE;
  },
};

export default fileService;
