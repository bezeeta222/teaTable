import { z } from '../../../zod';

export const signatureFieldOptionsSchema = z
  .object({
    // Pen settings
    penColor: z.string().optional().default('#000000'),
    penWidth: z.number().min(0.5).max(5).optional().default(2),

    // Canvas background
    backgroundColor: z.string().optional().default('transparent'),

    // Display settings
    showTimestamp: z.boolean().optional().default(false),
  })
  .strict();

export type ISignatureFieldOptions = z.infer<typeof signatureFieldOptionsSchema>;
