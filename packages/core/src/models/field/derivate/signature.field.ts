import { z } from 'zod';
import { IdPrefix } from '../../../utils';
import { FieldType, CellValueType } from '../constant';
import { FieldCore } from '../field';
import type { IFieldVisitor } from '../field-visitor.interface';
import {
  signatureFieldOptionsSchema,
  type ISignatureFieldOptions,
} from './signature-option.schema';

// Cell value structure - single signature item (similar to attachment but singular)
export const signatureItemSchema = z.object({
  id: z.string().startsWith(IdPrefix.Attachment),
  name: z.string(),
  path: z.string(),
  token: z.string(),
  size: z.number(),
  mimetype: z.string(),
  presignedUrl: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  signedAt: z.number().optional(), // Timestamp when signature was captured
  signedBy: z.string().optional(), // User ID who signed
});

// Simplified format for RO (request object) - only required fields
const signatureItemRoSchema = signatureItemSchema.partial().required({ name: true, token: true });

export type ISignatureItem = z.infer<typeof signatureItemSchema>;

export type ISignatureItemRo = z.infer<typeof signatureItemRoSchema>;

// Cell value is a single signature item (not an array like attachments)
export const signatureCellValueSchema = signatureItemSchema.nullable();

export const signatureCellValueRoSchema = signatureItemRoSchema.nullable();

export type ISignatureCellValue = z.infer<typeof signatureCellValueSchema>;

export type ISignatureCellValueRo = z.infer<typeof signatureCellValueRoSchema>;

export class SignatureFieldCore extends FieldCore {
  type: FieldType.Signature = FieldType.Signature;

  options!: ISignatureFieldOptions;

  meta?: undefined;

  cellValueType = CellValueType.String;

  isMultipleCellValue = false; // Single signature per cell

  static defaultOptions(): ISignatureFieldOptions {
    return {
      penColor: '#000000',
      penWidth: 2,
      backgroundColor: 'transparent',
      showTimestamp: false,
    };
  }

  static itemString(name: string, token: string) {
    return `${name} (${token})`;
  }

  cellValue2String(cellValue?: unknown) {
    if (cellValue == null) {
      return '';
    }
    return this.item2String(cellValue as ISignatureItem);
  }

  convertStringToCellValue(_value: string, _ctx?: unknown): ISignatureCellValue | null {
    // Cannot convert from string - signatures must be drawn
    return null;
  }

  repair(value: unknown) {
    if (this.isLookup) {
      return null;
    }

    if (this.validateCellValue(value).success) {
      return value;
    }
    return null;
  }

  validateOptions() {
    return signatureFieldOptionsSchema.safeParse(this.options);
  }

  validateCellValue(cellValue: unknown) {
    return signatureCellValueRoSchema.safeParse(cellValue);
  }

  item2String(value: unknown) {
    if (value == null) {
      return '';
    }
    const { name, token } = value as ISignatureItem;
    return SignatureFieldCore.itemString(name, token);
  }

  accept<T>(visitor: IFieldVisitor<T>): T {
    return visitor.visitSignatureField(this);
  }
}
