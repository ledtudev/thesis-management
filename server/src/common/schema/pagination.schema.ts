import { z } from 'zod';
import { stringToNumber } from '../pipe/zod-custom'; // Adjust path if necessary

export const paginationSchema = z.object({
  page: stringToNumber('Số trang')
    .default('1')
    .pipe(z.number().int().min(1, 'Số trang phải lớn hơn 0'))
    .optional(),
  limit: stringToNumber('Số lượng mỗi trang')
    .default('10')
    .pipe(
      z
        .number()
        .int()
        .min(1, 'Giới hạn phải lớn hơn 0')
        .max(100, 'Giới hạn không được vượt quá 100'),
    )
    .optional(),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
