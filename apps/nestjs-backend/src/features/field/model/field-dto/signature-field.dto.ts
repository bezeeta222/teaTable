import type { ISignatureCellValue, ISignatureItem } from '@teable/core';
import { SignatureFieldCore, generateAttachmentId } from '@teable/core';
import { omit } from 'lodash';
import type { FieldBase } from '../field-base';

export class SignatureFieldDto extends SignatureFieldCore implements FieldBase {
  get isStructuredCellValue() {
    return false;
  }

  static getTokenAndNameByString(value: string): { token: string; name: string } | undefined {
    const openParenIndex = value.lastIndexOf('(');

    if (openParenIndex === -1) {
      return;
    }
    const name = value.slice(0, openParenIndex).trim();
    const token = value.slice(openParenIndex + 1, -1).trim();
    return { name, token };
  }

  convertCellValue2DBValue(value: unknown): unknown {
    if (value == null) {
      return null;
    }
    // Remove runtime properties before storing
    return JSON.stringify(omit(value as ISignatureItem, ['presignedUrl']));
  }

  convertDBValue2CellValue(value: unknown): unknown {
    return value == null || typeof value === 'object' ? value : JSON.parse(value as string);
  }

  override convertStringToCellValue(
    value: string,
    attachments?: Omit<ISignatureItem, 'id' | 'name'>[]
  ): ISignatureCellValue | null {
    // value is signature.png (token)
    if (!attachments?.length || !value) {
      return null;
    }
    const tokenAndName = SignatureFieldDto.getTokenAndNameByString(value);
    if (!tokenAndName) {
      return null;
    }
    const { token, name } = tokenAndName;
    const attachment = attachments.find((attachment) => attachment.token === token);
    if (!attachment) {
      return null;
    }
    return {
      ...attachment,
      name,
      id: generateAttachmentId(),
    } as ISignatureItem;
  }
}
