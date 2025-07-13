import { paginationSchema } from 'src/common/schema/pagination.schema';
import { z } from 'zod';

export const createProposedProjectCommentSchema = z.object({
  content: z.string().min(1, 'Nội dung bình luận không được để trống'),
  proposedProjectId: z.string(),
});
export type CreateProposedProjectCommentDto = z.infer<
  typeof createProposedProjectCommentSchema
>;

export const findProposedProjectCommentSchema = paginationSchema.extend({
  proposedProjectId: z.string(),
  orderBy: z.enum(['createdAt']).optional().default('createdAt'),
  asc: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type FindProposedProjectCommentDto = z.infer<
  typeof findProposedProjectCommentSchema
>;
