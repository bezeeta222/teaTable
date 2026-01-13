import type { ISignatureCellValue } from '@teable/core';
import { useTheme } from '@teable/next-themes';
import { FilePreviewItem, FilePreviewProvider, cn } from '@teable/ui-lib';
import { useAttachmentPreviewI18Map } from '../../hooks';
import type { ICellValue } from '../type';

interface ICellSignature extends ICellValue<ISignatureCellValue> {
  formatImageUrl?: (url: string) => string;
}

export const CellSignature = (props: ICellSignature) => {
  const { value, className, style, formatImageUrl } = props;
  const i18nMap = useAttachmentPreviewI18Map();
  const { resolvedTheme } = useTheme();

  if (!value || !value.presignedUrl) {
    return null;
  }

  const { id, name, mimetype, size, presignedUrl } = value;
  const imageUrl = formatImageUrl ? formatImageUrl(presignedUrl) : presignedUrl;

  return (
    <FilePreviewProvider i18nMap={i18nMap}>
      <div className={cn('flex', className)} style={style}>
        <FilePreviewItem
          className={cn(
            'shrink-0 h-7 max-w-[120px] border rounded border-slate-200 overflow-hidden cursor-pointer dark:border-slate-700'
          )}
          src={presignedUrl}
          name={name}
          mimetype={mimetype}
          size={size}
        >
          <img className="h-full w-auto object-contain" src={imageUrl} alt={name} />
        </FilePreviewItem>
      </div>
    </FilePreviewProvider>
  );
};
