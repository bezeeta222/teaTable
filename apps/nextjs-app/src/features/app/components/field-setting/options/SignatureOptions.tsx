import type { ISignatureFieldOptions } from '@teable/core';
import { SignatureField } from '@teable/sdk/model';
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@teable/ui-lib/shadcn';
import { useTranslation } from 'next-i18next';

const PEN_WIDTH_OPTIONS = [
  { value: '0.5', label: '0.5' },
  { value: '1', label: '1' },
  { value: '1.5', label: '1.5' },
  { value: '2', label: '2' },
  { value: '2.5', label: '2.5' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

const BACKGROUND_OPTIONS = [
  { value: 'transparent', labelKey: 'field.editor.signature.bgTransparent' as const },
  { value: '#ffffff', labelKey: 'field.editor.signature.bgWhite' as const },
  { value: '#f5f5f5', labelKey: 'field.editor.signature.bgGray' as const },
  { value: '#fffef0', labelKey: 'field.editor.signature.bgCream' as const },
];

export const SignatureOptions = (props: {
  options: Partial<ISignatureFieldOptions> | undefined;
  isLookup?: boolean;
  onChange?: (options: Partial<ISignatureFieldOptions>) => void;
}) => {
  const { options = SignatureField.defaultOptions(), isLookup, onChange } = props;
  const { t } = useTranslation(['table']);

  const {
    penColor = '#000000',
    penWidth = 2,
    backgroundColor = 'transparent',
    showTimestamp = false,
  } = options;

  const onPenColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({ ...options, penColor: e.target.value });
  };

  const onPenWidthChange = (value: string) => {
    onChange?.({ ...options, penWidth: Number(value) });
  };

  const onBackgroundChange = (value: string) => {
    onChange?.({ ...options, backgroundColor: value });
  };

  const onShowTimestampChange = (checked: boolean) => {
    onChange?.({ ...options, showTimestamp: checked });
  };

  if (isLookup) return null;

  return (
    <div className="form-control space-y-4 border-t pt-4">
      <div className="flex w-full flex-col gap-2">
        <Label className="text-sm font-medium">{t('field.editor.signature.penColor')}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={penColor}
            onChange={onPenColorChange}
            className="h-9 w-16 cursor-pointer p-1"
          />
          <Input
            type="text"
            value={penColor}
            onChange={onPenColorChange}
            className="h-9 flex-1"
            placeholder="#000000"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Label className="text-sm font-medium">{t('field.editor.signature.penWidth')}</Label>
        <Select value={penWidth.toString()} onValueChange={onPenWidthChange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PEN_WIDTH_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Label className="text-sm font-medium">{t('field.editor.signature.background')}</Label>
        <Select value={backgroundColor} onValueChange={onBackgroundChange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BACKGROUND_OPTIONS.map(({ value, labelKey }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded border"
                    style={{ backgroundColor: value === 'transparent' ? 'white' : value }}
                  />
                  {t(labelKey)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <Label className="text-sm font-medium">{t('field.editor.signature.showTimestamp')}</Label>
        <Switch checked={showTimestamp} onCheckedChange={onShowTimestampChange} />
      </div>
    </div>
  );
};
