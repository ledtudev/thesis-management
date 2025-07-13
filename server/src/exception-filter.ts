import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import {
  ApiResponseError,
  generateApiResponse,
  ValidationErrorDetail,
} from './common/response';

@Catch() // Catch all exceptions globally
export class HttpExceptionFilter implements ExceptionFilter {
  // private readonly logger = new Logger({
  //   level: 'error',
  //   format: winston.format.json(),
  //   transports: [new winston.transports.Console()],
  // });

  /**
   * Main method to catch and handle exceptions
   * @param exception The thrown exception
   * @param host The execution context
   */
  catch(exception: Error, host: ArgumentsHost): void {
    console.error('Exception caught:', {
      name: exception.name,
      message: exception.message,
      stack: exception.stack,
    });

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error } = this.handleException(exception, request);
    const responseBody = generateApiResponse(
      message,
      null,
      {
        version: '1',
        requestId: request.id,
        path: request.id as string,
        method: request.method,
      },
      error,
    );

    response.status(status).json(responseBody);
  }

  /**
   * Handle different types of exceptions and return appropriate status, message, and error
   * @param exception The exception to handle
   * @param request The HTTP request object
   * @returns Object containing HTTP status, message, and error details
   */
  private handleException(
    exception: Error,
    request: Request,
  ): { status: number; message: string; error?: ApiResponseError } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
    let error: ApiResponseError = {
      code: 'INTERNAL_SERVER_ERROR', // Ensure a code is always set
      message,
    };

    if (exception instanceof ZodValidationException) {
      return this.handleZodValidationException(exception);
    } else if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    } else if (exception instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaException(exception);
    } else {
      // this.logger.error(
      //   `${request.method} ${request.url}`,
      //   (exception as Error).stack,
      // );
      return { status, message, error };
    }
  }

  /**
   * Handle Zod validation exceptions
   * @param exception ZodValidationException instance
   * @returns Status, message, and error details
   */
  private handleZodValidationException(exception: ZodValidationException): {
    status: number;
    message: string;
    error: ApiResponseError;
  } {
    const zodError = exception.getZodError();
    const details: ValidationErrorDetail[] = zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    const message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    return {
      status: HttpStatus.BAD_REQUEST,
      message,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle HTTP exceptions (including BadRequestException and others)
   * @param exception HttpException instance
   * @returns Status, message, and error details
   */
  private handleHttpException(exception: HttpException): {
    status: number;
    message: string;
    error: ApiResponseError;
  } {
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    if (status === HttpStatus.NOT_FOUND) {
      const message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as any).message || 'Không tìm thấy tài nguyên';
      return {
        status,
        message,
        error: {
          code: 'NOT_FOUND',
          message,
          timestamp: new Date().toISOString(),
        },
      };
    }

    if (exception.name === 'BadRequestException') {
      const response = errorResponse as {
        message: string | string[];
        errors?: Record<string, string[]>;
      };
      if (response.errors && typeof response === 'object') {
        const details: ValidationErrorDetail[] = Object.entries(
          response.errors,
        ).flatMap(([field, messages]) =>
          messages.map((msg) => ({ field, message: msg })),
        );
        const message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        return {
          status: HttpStatus.BAD_REQUEST,
          message,
          error: {
            code: 'VALIDATION_ERROR',
            message,
            details,
            timestamp: new Date().toISOString(),
          },
        };
      }
      const message =
        typeof response.message === 'string'
          ? response.message
          : 'Invalid request';
      return {
        status: HttpStatus.BAD_REQUEST,
        message,
        error: {
          code: 'BAD_REQUEST',
          message,
          timestamp: new Date().toISOString(),
        },
      };
    }

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as any).message || 'An error occurred';
    return {
      status,
      message,
      error: {
        code: exception.name.toUpperCase().replace('EXCEPTION', 'ERROR'),
        message,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle Prisma-specific exceptions
   * @param exception PrismaClientKnownRequestError instance
   * @returns Status, message, and error details
   */
  private handlePrismaException(exception: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: ApiResponseError;
  } {
    const message = 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.';
    return {
      status: HttpStatus.BAD_REQUEST,
      message,
      error: {
        code: 'DATABASE_ERROR',
        message,
        details: [
          { field: 'meta', message: exception.meta as unknown as string },
        ],
        timestamp: new Date().toISOString(),
      },
    };
  }
}
