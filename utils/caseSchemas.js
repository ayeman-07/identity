import { z } from 'zod';

// Schema for uploading / creating a case
export const uploadCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  toothNumber: z.string().min(1, 'Tooth number is required'),
  caseNotes: z.string().max(2000, 'Notes must be under 2000 characters').optional().or(z.literal('')),
  labId: z.string().uuid('Invalid lab selection').optional().or(z.literal('')),
});

export function validateUploadCase(data) {
  const parsed = uploadCaseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.reduce((acc, issue) => {
        const key = issue.path[0] || 'form';
        acc[key] = issue.message;
        return acc;
      }, {})
    };
  }
  return { success: true, data: parsed.data };
}
