# Signature Field Implementation Plan

## Overview

This document outlines the complete end-to-end implementation plan for adding a **Signature Field** to Teable. A signature field allows users to capture digital signatures using a signature pad UI and stores them as images.

---

## Architecture Decision

### Storage Strategy: Hybrid Approach

**Decision**: Store signatures as **attachment-like objects** leveraging the existing attachment storage system.

| Approach | Pros | Cons |
|----------|------|------|
| Base64 inline | Simple, no storage deps | Large cell values, slow queries |
| **Attachment storage** | Reuses existing infra, CDN-ready, thumbnails | Slightly more complex |
| Separate storage | Full control | Unnecessary duplication |

**Chosen**: Attachment storage - signatures are saved as PNG images via the existing presigned URL upload flow, then stored as a single attachment item in the cell value.

### Third-Party Library

**Chosen**: [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas)
- TypeScript support with full type definitions
- 100% test coverage
- Lightweight wrapper around `signature_pad`
- Active maintenance
- Canvas API access for image export

---

## Implementation Phases

### Phase 1: Core Package (`packages/core`)

**Files to create/modify:**

#### 1.1 Add to FieldType Enum
**File**: `packages/core/src/models/field/constant.ts`

```typescript
export enum FieldType {
  // ... existing types
  Signature = 'signature',  // Add this
}
```

#### 1.2 Create Signature Options Schema
**File**: `packages/core/src/models/field/derivate/signature-option.schema.ts`

```typescript
import { z } from 'zod';
import { Colors } from '../colors';

export const signatureFieldOptionsSchema = z.object({
  // Pen settings
  penColor: z.string().default('#000000'),
  penWidth: z.number().min(0.5).max(5).default(2),

  // Canvas settings
  backgroundColor: z.string().default('transparent'),

  // Export format
  exportFormat: z.enum(['png', 'svg']).default('png'),

  // Display settings
  showTimestamp: z.boolean().default(false),
}).strict();

export type ISignatureFieldOptions = z.infer<typeof signatureFieldOptionsSchema>;
```

#### 1.3 Create Signature Cell Value Schema
**File**: `packages/core/src/models/field/derivate/signature.field.ts`

```typescript
import { z } from 'zod';
import type { ISignatureFieldOptions } from './signature-option.schema';
import { signatureFieldOptionsSchema } from './signature-option.schema';
import { FieldCore } from '../field';
import { FieldType } from '../constant';
import { CellValueType, DbFieldType } from '../constant';
import type { IFieldVisitor } from '../field-visitor.interface';

// Cell value structure (single attachment-like object)
export const signatureItemSchema = z.object({
  id: z.string(),
  name: z.string(),           // e.g., "signature_1704067200.png"
  path: z.string(),           // Storage path
  token: z.string(),          // Attachment token
  size: z.number(),           // File size
  mimetype: z.string(),       // "image/png" or "image/svg+xml"
  presignedUrl: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  signedAt: z.number().optional(),    // Timestamp when signed
  signedBy: z.string().optional(),    // User ID who signed
});

export const signatureCellValueSchema = signatureItemSchema.nullable();
export type ISignatureItem = z.infer<typeof signatureItemSchema>;
export type ISignatureCellValue = ISignatureItem | null;

export class SignatureFieldCore extends FieldCore {
  type: FieldType.Signature = FieldType.Signature;

  declare options: ISignatureFieldOptions;

  cellValueType: CellValueType = CellValueType.String;
  dbFieldType: DbFieldType = DbFieldType.Json;
  isMultipleCellValue: boolean = false;  // Single signature per cell

  static defaultOptions(): ISignatureFieldOptions {
    return {
      penColor: '#000000',
      penWidth: 2,
      backgroundColor: 'transparent',
      exportFormat: 'png',
      showTimestamp: false,
    };
  }

  validateOptions() {
    return signatureFieldOptionsSchema.safeParse(this.options);
  }

  validateCellValue(cellValue: unknown) {
    return signatureCellValueSchema.safeParse(cellValue);
  }

  cellValue2String(cellValue?: unknown): string {
    if (cellValue == null) return '';
    const item = cellValue as ISignatureItem;
    return item.name || 'Signature';
  }

  item2String(value?: unknown): string {
    if (value == null) return '';
    const item = value as ISignatureItem;
    return item.name || 'Signature';
  }

  convertStringToCellValue(_value: string): ISignatureCellValue | null {
    // Cannot convert from string (signatures must be drawn)
    return null;
  }

  repair(value: unknown): ISignatureCellValue {
    if (this.validateCellValue(value).success) {
      return value as ISignatureCellValue;
    }
    return null;
  }

  accept<T>(visitor: IFieldVisitor<T>): T {
    return visitor.visitSignatureField(this);
  }
}
```

#### 1.4 Update Field Visitor Interface
**File**: `packages/core/src/models/field/field-visitor.interface.ts`

Add method:
```typescript
export interface IFieldVisitor<T = unknown> {
  // ... existing methods
  visitSignatureField(field: SignatureFieldCore): T;
}
```

#### 1.5 Update Field Unions Schema
**File**: `packages/core/src/models/field/field-unions.schema.ts`

Add to union types:
```typescript
import { signatureFieldOptionsSchema } from './derivate/signature-option.schema';

// Add to unionFieldOptionsVoSchema and unionFieldOptionsRoSchema
```

#### 1.6 Update getOptionsSchema
**File**: `packages/core/src/models/field/field.schema.ts`

```typescript
case FieldType.Signature:
  return signatureFieldOptionsSchema;
```

#### 1.7 Update Exports
**File**: `packages/core/src/models/field/derivate/index.ts`

```typescript
export * from './signature.field';
export * from './signature-option.schema';
```

---

### Phase 2: Backend (`apps/nestjs-backend`)

#### 2.1 Create Signature Field DTO
**File**: `apps/nestjs-backend/src/features/field/model/field-dto/signature-field.dto.ts`

```typescript
import { SignatureFieldCore } from '@teable/core';
import type { IFieldBase } from '../field-base';

export class SignatureFieldDto extends SignatureFieldCore implements IFieldBase {
  get isStructuredCellValue() {
    return false; // Stored as JSON string
  }

  convertCellValue2DBValue(value: unknown): unknown {
    if (value == null) return null;
    // Remove runtime properties before storing
    const { presignedUrl, ...storedValue } = value as Record<string, unknown>;
    return JSON.stringify(storedValue);
  }

  convertDBValue2CellValue(value: unknown): unknown {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    return JSON.parse(value as string);
  }
}
```

#### 2.2 Update Field Factory
**File**: `apps/nestjs-backend/src/features/field/model/factory.ts`

```typescript
import { SignatureFieldDto } from './field-dto/signature-field.dto';

// In createFieldInstanceByVo switch statement:
case FieldType.Signature:
  return plainToInstance(SignatureFieldDto, field);
```

#### 2.3 Update Database Column Visitor (PostgreSQL)
**File**: `apps/nestjs-backend/src/db-provider/create-database-column-query/create-database-column-field-visitor.postgres.ts`

```typescript
visitSignatureField(field: SignatureFieldCore): void {
  // Store as JSON text (signature metadata)
  this.alterTableBuilder.addColumn(field.dbFieldName, 'text');
}
```

#### 2.4 Update Database Column Visitor (SQLite)
**File**: `apps/nestjs-backend/src/db-provider/create-database-column-query/create-database-column-field-visitor.sqlite.ts`

```typescript
visitSignatureField(field: SignatureFieldCore): void {
  this.alterTableBuilder.addColumn(field.dbFieldName, 'TEXT');
}
```

#### 2.5 Update All Visitor Implementations
Search for files implementing `IFieldVisitor` and add the `visitSignatureField` method:
- `type-cast-field-visitor.ts`
- `create-database-column-field-visitor.*.ts`
- `generate-field-by-type.ts`
- Any other visitor implementations

---

### Phase 3: SDK Package (`packages/sdk`)

#### 3.1 Create SDK Field Wrapper
**File**: `packages/sdk/src/model/field/signature.field.ts`

```typescript
import { SignatureFieldCore } from '@teable/core';
import { Mixin } from 'ts-mixer';
import { Field } from './field';

export class SignatureField extends Mixin(SignatureFieldCore, Field) {}
```

#### 3.2 Update SDK Field Factory
**File**: `packages/sdk/src/model/field/factory.ts`

```typescript
import { SignatureField } from './signature.field';

// In createFieldInstance switch statement:
case FieldType.Signature:
  return plainToInstance(SignatureField, field);
```

#### 3.3 Update Field Static Getter
**File**: `packages/sdk/src/hooks/use-field-static-getter.ts`

```typescript
import { Signature } from '@teable/icons'; // Add signature icon

case FieldType.Signature:
  return {
    title: t('field.title.signature'),
    description: t('field.description.signature'),
    defaultOptions: SignatureField.defaultOptions(),
    Icon: Signature,
  };
```

---

### Phase 4: Frontend Editor (`packages/sdk`)

#### 4.1 Install Signature Library
```bash
pnpm -F @teable/sdk add react-signature-canvas
pnpm -F @teable/sdk add -D @types/react-signature-canvas
```

#### 4.2 Create Signature Editor Component
**File**: `packages/sdk/src/components/editor/signature/Editor.tsx`

```tsx
import React, { useRef, useState, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import type { ISignatureFieldOptions, ISignatureCellValue, ISignatureItem } from '@teable/core';
import { Button } from '@teable/ui-lib';
import { Trash2, Save, RotateCcw } from '@teable/icons';
import type { ICellEditor } from '../type';
import { useAttachmentUpload } from '../../../hooks/use-attachment-upload';
import { cn } from '../../../utils';

interface ISignatureEditor extends ICellEditor<ISignatureCellValue> {
  options: ISignatureFieldOptions;
  recordId?: string;
  fieldId?: string;
  baseId?: string;
}

export const SignatureEditor: React.FC<ISignatureEditor> = (props) => {
  const {
    value,
    options,
    readonly,
    onChange,
    className,
    recordId,
    fieldId,
    baseId,
  } = props;

  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { uploadFile } = useAttachmentUpload({ baseId });

  const { penColor, penWidth, backgroundColor } = options;

  const handleClear = useCallback(() => {
    sigCanvasRef.current?.clear();
    setIsDrawing(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return;

    setIsSaving(true);
    try {
      // Get trimmed canvas data
      const canvas = sigCanvasRef.current.getTrimmedCanvas();

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      // Generate filename
      const filename = `signature_${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // Upload using attachment system
      const uploadResult = await uploadFile(file);

      // Create cell value
      const signatureValue: ISignatureItem = {
        id: uploadResult.id,
        name: filename,
        path: uploadResult.path,
        token: uploadResult.token,
        size: uploadResult.size,
        mimetype: 'image/png',
        presignedUrl: uploadResult.presignedUrl,
        width: canvas.width,
        height: canvas.height,
        signedAt: Date.now(),
      };

      onChange?.(signatureValue);
      handleClear();
    } catch (error) {
      console.error('Failed to save signature:', error);
    } finally {
      setIsSaving(false);
    }
  }, [uploadFile, onChange, handleClear]);

  const handleRemove = useCallback(() => {
    onChange?.(null);
  }, [onChange]);

  // If there's an existing signature, show it
  if (value && !isDrawing) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="relative border rounded-md p-2 bg-white">
          <img
            src={value.presignedUrl}
            alt="Signature"
            className="max-w-full h-auto"
          />
          {options.showTimestamp && value.signedAt && (
            <div className="text-xs text-gray-500 mt-1">
              Signed: {new Date(value.signedAt).toLocaleString()}
            </div>
          )}
        </div>
        {!readonly && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawing(true)}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Re-sign
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show signature pad for drawing
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="border rounded-md overflow-hidden bg-white">
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor={penColor}
          minWidth={penWidth * 0.5}
          maxWidth={penWidth}
          backgroundColor={backgroundColor === 'transparent' ? 'rgba(0,0,0,0)' : backgroundColor}
          canvasProps={{
            className: 'w-full h-40',
            style: { touchAction: 'none' },
          }}
          onBegin={() => setIsDrawing(true)}
        />
      </div>

      {!readonly && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  );
};
```

#### 4.3 Update Cell Editor Main
**File**: `packages/sdk/src/components/cell-value-editor/CellEditorMain.tsx`

```tsx
import { SignatureEditor } from '../editor/signature/Editor';

// In switch statement:
case FieldType.Signature:
  return (
    <SignatureEditor
      className={className}
      options={options as ISignatureFieldOptions}
      value={cellValue as ISignatureCellValue}
      onChange={onChange}
      readonly={readonly}
      recordId={recordId}
      fieldId={field.id}
      baseId={baseId}
    />
  );
```

#### 4.4 Create Editor Index Export
**File**: `packages/sdk/src/components/editor/signature/index.ts`

```typescript
export * from './Editor';
```

---

### Phase 5: Cell Display Component

#### 5.1 Create Cell Signature Display
**File**: `packages/sdk/src/components/cell-value/cell-signature/CellSignature.tsx`

```tsx
import React from 'react';
import type { ISignatureCellValue, ISignatureFieldOptions } from '@teable/core';
import type { ICellValue } from '../type';
import { cn } from '../../../utils';
import { FileSignature } from '@teable/icons';

interface ICellSignature extends ICellValue<ISignatureCellValue> {
  options: ISignatureFieldOptions;
}

export const CellSignature: React.FC<ICellSignature> = (props) => {
  const { value, className, style, options } = props;

  if (!value) {
    return (
      <div className={cn('flex items-center text-gray-400', className)} style={style}>
        <FileSignature className="w-4 h-4 mr-1" />
        <span className="text-xs">No signature</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)} style={style}>
      <img
        src={value.presignedUrl}
        alt="Signature"
        className="max-h-8 object-contain"
        loading="lazy"
      />
      {options.showTimestamp && value.signedAt && (
        <span className="text-xs text-gray-500 ml-2">
          {new Date(value.signedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};
```

#### 5.2 Update Cell Value Dispatcher
**File**: `packages/sdk/src/components/cell-value/CellValue.tsx`

```tsx
import { CellSignature } from './cell-signature/CellSignature';

// In switch statement:
case FieldType.Signature:
  return (
    <CellSignature
      value={value as ISignatureCellValue}
      options={options as ISignatureFieldOptions}
      className={className}
      style={style}
    />
  );
```

---

### Phase 6: Field Options UI (`apps/nextjs-app`)

#### 6.1 Create Signature Options Component
**File**: `apps/nextjs-app/src/features/app/components/field-setting/options/SignatureOptions.tsx`

```tsx
import React from 'react';
import type { ISignatureFieldOptions } from '@teable/core';
import { SignatureField } from '@teable/sdk';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Label,
  Switch,
} from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';

interface ISignatureOptionsProps {
  options: Partial<ISignatureFieldOptions> | undefined;
  onChange?: (options: Partial<ISignatureFieldOptions>) => void;
}

const PEN_COLORS = [
  { value: '#000000', label: 'Black' },
  { value: '#1a73e8', label: 'Blue' },
  { value: '#d93025', label: 'Red' },
  { value: '#188038', label: 'Green' },
];

const PEN_WIDTHS = [
  { value: 1, label: 'Thin' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Thick' },
];

export const SignatureOptions: React.FC<ISignatureOptionsProps> = ({ options, onChange }) => {
  const { t } = useTranslation();
  const currentOptions = {
    ...SignatureField.defaultOptions(),
    ...options,
  };

  const handleChange = (key: keyof ISignatureFieldOptions, value: unknown) => {
    onChange?.({ ...currentOptions, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Pen Color */}
      <div className="flex flex-col gap-2">
        <Label>{t('field.signature.penColor')}</Label>
        <div className="flex gap-2">
          {PEN_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleChange('penColor', color.value)}
              className={cn(
                'w-8 h-8 rounded-full border-2',
                currentOptions.penColor === color.value ? 'border-blue-500' : 'border-transparent'
              )}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Pen Width */}
      <div className="flex flex-col gap-2">
        <Label>{t('field.signature.penWidth')}</Label>
        <Select
          value={String(currentOptions.penWidth)}
          onValueChange={(v) => handleChange('penWidth', Number(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PEN_WIDTHS.map((width) => (
              <SelectItem key={width.value} value={String(width.value)}>
                {width.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show Timestamp */}
      <div className="flex items-center justify-between">
        <Label>{t('field.signature.showTimestamp')}</Label>
        <Switch
          checked={currentOptions.showTimestamp}
          onCheckedChange={(v) => handleChange('showTimestamp', v)}
        />
      </div>
    </div>
  );
};
```

#### 6.2 Update Field Options Router
**File**: `apps/nextjs-app/src/features/app/components/field-setting/FieldOptions.tsx`

```tsx
import { SignatureOptions } from './options/SignatureOptions';

// In switch statement:
case FieldType.Signature:
  return (
    <SignatureOptions
      options={options as ISignatureFieldOptions}
      onChange={onChange}
    />
  );
```

#### 6.3 Update Field Type Selection Order
**File**: `apps/nextjs-app/src/features/app/components/field-setting/SelectFieldType.tsx`

```typescript
const BASE_FIELD_TYPE = [
  // ... existing types
  FieldType.Signature,  // Add after Attachment or in Advanced group
];
```

---

### Phase 7: Internationalization

#### 7.1 Add Translation Keys
**File**: `packages/common-i18n/src/locales/en/sdk.json`

```json
{
  "field": {
    "title": {
      "signature": "Signature"
    },
    "description": {
      "signature": "Capture digital signatures"
    },
    "signature": {
      "penColor": "Pen Color",
      "penWidth": "Pen Width",
      "showTimestamp": "Show Signature Date",
      "noSignature": "No signature",
      "clear": "Clear",
      "save": "Save",
      "resign": "Re-sign",
      "remove": "Remove"
    }
  }
}
```

---

### Phase 8: Icons

#### 8.1 Add Signature Icon
**File**: `packages/icons/src/components/Signature.tsx`

If the signature icon doesn't exist, create it or use existing `FileSignature` icon.

---

### Phase 9: Hook for Upload

#### 9.1 Create/Update Attachment Upload Hook
**File**: `packages/sdk/src/hooks/use-attachment-upload.ts`

Ensure there's a reusable hook that wraps the attachment upload flow:

```typescript
import { useCallback } from 'react';
import { UploadType } from '@teable/core';
import { getSignature, notify, uploadFile as uploadToStorage } from '../api/attachments';

interface UseAttachmentUploadOptions {
  baseId?: string;
  uploadType?: UploadType;
}

export const useAttachmentUpload = (options: UseAttachmentUploadOptions = {}) => {
  const { baseId, uploadType = UploadType.Table } = options;

  const uploadFile = useCallback(async (file: File) => {
    // 1. Get presigned URL
    const signatureRes = await getSignature({
      type: uploadType,
      contentLength: file.size,
      contentType: file.type,
      baseId,
    });

    // 2. Upload to storage
    await uploadToStorage(signatureRes.url, file, signatureRes.requestHeaders);

    // 3. Notify server
    const notifyRes = await notify(signatureRes.token, file.name);

    return notifyRes.data;
  }, [baseId, uploadType]);

  return { uploadFile };
};
```

---

## Testing Checklist

### Unit Tests

- [ ] `SignatureFieldCore.validateOptions()` - valid/invalid options
- [ ] `SignatureFieldCore.validateCellValue()` - valid/invalid cell values
- [ ] `SignatureFieldCore.repair()` - data recovery
- [ ] `SignatureFieldCore.cellValue2String()` - string conversion
- [ ] `SignatureFieldDto.convertCellValue2DBValue()` - DB serialization
- [ ] `SignatureFieldDto.convertDBValue2CellValue()` - DB deserialization

### Integration Tests

- [ ] Create signature field via API
- [ ] Update signature field options
- [ ] Delete signature field
- [ ] Upload signature image
- [ ] Retrieve signature from record
- [ ] Clear signature from record

### E2E Tests

- [ ] Draw signature on pad
- [ ] Save signature to record
- [ ] Display signature in grid
- [ ] Clear and re-sign
- [ ] Remove signature
- [ ] Field options configuration

---

## File Summary

### New Files to Create

| Package | File | Purpose |
|---------|------|---------|
| `core` | `derivate/signature-option.schema.ts` | Options validation schema |
| `core` | `derivate/signature.field.ts` | Field class implementation |
| `backend` | `field-dto/signature-field.dto.ts` | Backend DTO |
| `sdk` | `model/field/signature.field.ts` | SDK field wrapper |
| `sdk` | `components/editor/signature/Editor.tsx` | Signature pad editor |
| `sdk` | `components/cell-value/cell-signature/CellSignature.tsx` | Cell display |
| `nextjs-app` | `options/SignatureOptions.tsx` | Field configuration UI |

### Files to Modify

| Package | File | Change |
|---------|------|--------|
| `core` | `constant.ts` | Add `Signature` to `FieldType` enum |
| `core` | `field-visitor.interface.ts` | Add `visitSignatureField` method |
| `core` | `field-unions.schema.ts` | Add signature schema to unions |
| `core` | `field.schema.ts` | Add case to `getOptionsSchema` |
| `core` | `derivate/index.ts` | Export signature modules |
| `backend` | `factory.ts` | Add signature case |
| `backend` | All visitor implementations | Add `visitSignatureField` |
| `sdk` | `factory.ts` | Add signature case |
| `sdk` | `use-field-static-getter.ts` | Add signature metadata |
| `sdk` | `CellEditorMain.tsx` | Add signature editor case |
| `sdk` | `CellValue.tsx` | Add signature display case |
| `nextjs-app` | `FieldOptions.tsx` | Add signature options case |
| `nextjs-app` | `SelectFieldType.tsx` | Add to field type order |
| `common-i18n` | `sdk.json` (all locales) | Add translation keys |

---

## Dependencies to Add

```bash
# SDK package
pnpm -F @teable/sdk add react-signature-canvas
pnpm -F @teable/sdk add -D @types/signature_pad  # Types may be needed
```

---

## Rollout Plan

1. **Phase 1-2**: Core + Backend (no UI impact)
2. **Phase 3-5**: SDK + Editor + Display (feature-flaggable)
3. **Phase 6-7**: Options UI + i18n
4. **Phase 8-9**: Icons + Hooks polish
5. **Testing**: Full test suite
6. **Documentation**: Update CLAUDE.md with new field type

---

## Sources

- [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas) - Signature pad library
- [signature_pad](https://www.npmjs.com/package/signature_pad) - Underlying canvas library
