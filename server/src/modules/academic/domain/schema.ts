import { errorMessages } from 'src/common/constant/errors';
import { stringToNumber } from 'src/common/pipe/zod-custom';
import { z } from 'zod';

export const CreateDomainDto = z.object({
  name: z
    .string()
    .min(2, errorMessages.minLength('Tên domain', 2))
    .max(255, errorMessages.maxLength('Tên domain', 255)),
  description: z.string().max(500).optional(),
});

export type CreateDomainDto = z.infer<typeof CreateDomainDto>;

export const UpdateDomainDto = z.object({
  name: z
    .string()
    .min(2, errorMessages.minLength('Tên domain', 2))
    .max(255, errorMessages.maxLength('Tên domain', 255))
    .optional(),
  description: z.string().max(500).optional(),
});

export type UpdateDomainDto = z.infer<typeof UpdateDomainDto>;

export const FindDomainDto = z
  .object({
    name: z.string().optional(),
    page: stringToNumber('Số trang')
      .pipe(z.number().min(1, errorMessages.required('Số trang')))
      .default('1'),
    limit: stringToNumber('Số lượng mỗi trang')
      .pipe(
        z.number().max(100, errorMessages.maxLength('Số lượng mỗi trang', 100)),
      )
      .default('20'),
    orderBy: z.enum(['name'], {
      errorMap: () => ({ message: errorMessages.invalidOrderBy }),
    }),
    asc: z.enum(['asc', 'desc'], {
      errorMap: () => ({ message: errorMessages.invalidSortDir }),
    }),
    departmentId: z.string(),
    departmentName: z.string(),
  })
  .partial();

export type FindDomainDto = z.infer<typeof FindDomainDto>;
