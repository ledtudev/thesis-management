import { paginationSchema } from 'src/common/schema/pagination.schema';
import { z } from 'zod';

export const createProjectCommentSchema = z.object({
  content: z.string().min(1, 'Nội dung bình luận không được để trống'),
  projectId: z.string()
});
export type CreateProjectCommentDto = z.infer<
  typeof createProjectCommentSchema
>;

export const findProjectCommentSchema = paginationSchema.extend({
  projectId: z.string(),
  orderBy: z.enum(['createdAt']).optional().default('createdAt'),
  asc: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type FindProjectCommentDto = z.infer<typeof findProjectCommentSchema>;

export const updateProjectCommentSchema = z.object({
  content: z.string().min(1, 'Nội dung bình luận không được để trống'),
});
export type UpdateProjectCommentDto = z.infer<
  typeof updateProjectCommentSchema
>;
