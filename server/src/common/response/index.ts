import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiProperty,
  ApiResponse as ApiResponseSwagger,
} from '@nestjs/swagger';
import { uuidv7 } from 'uuidv7';

export function generateApiResponse<T = any>(
  message: string,
  data: T,
  metadata?: ApiResponseMetadata,
  error?: ApiResponseError,
): ApiResponse<T> {
  return {
    success: !error,
    message,
    data,
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      requestId: uuidv7(), 
      ...metadata,
    },
    error: error,
  };
}

export class ApiResponseMetadata {
  @ApiProperty({
    description: 'The current page number for pagination.',
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'The number of items per page.',
    example: 20,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'The total number of items available.',
    example: 100,
    required: false,
  })
  total?: number;

  @ApiProperty({
    description: 'The total number of pages.',
    example: 5,
    required: false,
  })
  totalPages?: number;

  @ApiProperty({
    description: 'The timestamp when the response was generated.',
    example: '2025-03-29T12:00:00Z',
    required: false,
  })
  timestamp?: string;

  @ApiProperty({
    description: 'The unique request ID.',
    example: 'abc123',
    required: false,
  })
  requestId?: string;

  @ApiProperty({
    description: 'API version.',
    example: '1.0.0',
    required: false,
  })
  version?: string;

  @ApiProperty({
    description: 'API request path.',
    example: '/users',
    required: false,
  })
  path?: string;

  @ApiProperty({
    description: 'HTTP method used for the request.',
    example: 'GET',
    required: false,
  })
  method?: string;

  @ApiProperty({
    description: 'Time taken to process the request in milliseconds.',
    example: 120,
    required: false,
  })
  duration?: number;
}

export class ApiResponseError {
  @ApiProperty({
    description: 'Error code.',
    example: 'VALIDATION_ERROR',
  })
  code: string;

  @ApiProperty({
    description: 'Error message.',
    example: 'Invalid data. Please check again.',
  })
  message: string;

  @ApiProperty({
    description: 'Additional error details.',
    example: { field: 'lecturerId', message: 'Required' },
    required: false,
  })
  details?: ValidationErrorDetail[];

  @ApiProperty({
    description: 'Error stack trace, if available.',
    example: 'Error: Not found at Object.<anonymous>',
    required: false,
  })
  stack?: string;

  @ApiProperty({
    description: 'Timestamp when the error occurred.',
    example: '2025-04-04T08:30:49.038Z',
    required: false,
  })
  timestamp?: string;

  @ApiProperty({
    description: 'API request path when the error occurred.',
    example: '/project-allocation',
    required: false,
  })
  path?: string;

  @ApiProperty({
    description: 'HTTP method when the error occurred.',
    example: 'POST',
    required: false,
  })
  method?: string;
}

export class ValidationErrorDetail {
  @ApiProperty({
    description: 'The field that caused the validation failure.',
    example: 'lecturerId',
  })
  field: string;

  @ApiProperty({
    description: 'Message describing why the validation failed.',
    example: 'Required',
  })
  message: string;
}

export class ApiResponse<T = any> {
  @ApiProperty({
    description: 'Indicates whether the request was successful or not.',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'A message providing details about the API response.',
    example: 'Invalid data. Please check again.',
  })
  message: string;

  @ApiProperty({
    description: 'The data returned by the API request.',
    type: Object,
  })
  data: T;

  @ApiProperty({
    description:
      'Metadata about the API response (pagination, timestamps, etc.)',
    type: ApiResponseMetadata,
    required: false,
  })
  metadata?: ApiResponseMetadata;

  @ApiProperty({
    description: 'Error details, if any error occurs.',
    type: ApiResponseError,
    required: false,
  })
  error?: ApiResponseError;
}

export const ApiResponseSwaggerDecorators = {
  Get: <T>(responseClass: new () => T) =>
    applyDecorators(
      ApiResponseSwagger({
        status: HttpStatus.OK,
        description: 'Request was successful and the resource was retrieved.',
        type: responseClass,
      }),
      ApiResponseSwagger({
        status: HttpStatus.NOT_FOUND,
        description: 'Resource not found.',
        type: responseClass,
      }),
      ApiResponseSwagger({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input parameters provided.',
        type: responseClass,
      }),
      ApiResponseSwagger({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred. Please try again later.',
        type: responseClass,
      }),
    ),
};
