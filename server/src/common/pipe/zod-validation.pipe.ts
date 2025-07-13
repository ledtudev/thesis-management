import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = this.formatZodErrorMessages(error);
        throw new BadRequestException({
          message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường.',
          errors: errorMessages,
        });
      }

      throw new BadRequestException('Lỗi xác thực dữ liệu. Vui lòng thử lại.');
    }
  }

  private formatZodErrorMessages(error: ZodError): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    error.errors.forEach((err) => {
      const path = err.path.length > 0 ? err.path.join('.') : 'body';
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    });

    return formattedErrors;
  }
}
