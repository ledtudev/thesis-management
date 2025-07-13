// ApiResponse
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  metadata?: ApiResponseMetadata;
  error?: ApiResponseError;
}

// ApiResponseMetadata
export interface ApiResponseMetadata {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  timestamp?: string;
  requestId?: string;
  version?: string;
  path?: string;
  method?: string;
  duration?: number;
}

// ApiResponseError
export interface ApiResponseError {
  code: string;
  message: string;
  details?: string;
  stack?: string;
  timestamp?: string;
  path?: string;
  method?: string;
}

