import type { ISignatureCellValue, ISignatureFieldOptions } from '@teable/core';
import { generateAttachmentId } from '@teable/core';
import { Trash2, Check, X } from '@teable/icons';
import { Button, cn, sonner } from '@teable/ui-lib';
import { noop } from 'lodash';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useTranslation } from '../../../context/app/i18n';
import { useBaseId } from '../../../hooks';
import { UsageLimitModalType, useUsageLimitModalStore } from '../../billing/store';
import { AttachmentManager } from '../attachment/upload-attachment/uploadManage';
import type { ICellEditor, IEditorRef } from '../type';
import { UploadType } from '@teable/openapi';
import type { INotifyVo } from '@teable/openapi';

const { toast } = sonner;

interface ISignatureEditor extends ICellEditor<ISignatureCellValue> {
  options: ISignatureFieldOptions;
}

const defaultAttachmentManager = new AttachmentManager(1);

export const SignatureEditor = forwardRef<IEditorRef<ISignatureCellValue>, ISignatureEditor>(
  (props, ref) => {
    const { className, value, options, readonly, onChange = noop } = props;
    const { penColor = '#000000', penWidth = 2, backgroundColor = 'transparent' } = options ?? {};
    const { t } = useTranslation();
    const baseId = useBaseId();
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Update hasSignature when value changes
    useEffect(() => {
      setHasSignature(!!value);
    }, [value]);

    const clearSignature = useCallback(() => {
      sigCanvasRef.current?.clear();
      setHasSignature(false);
      onChange(undefined);
    }, [onChange]);

    const uploadSignature = useCallback(async () => {
      if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
        return;
      }

      setIsUploading(true);

      try {
        // Get canvas data and add white background
        const sourceCanvas = sigCanvasRef.current.getCanvas();

        // Create a new canvas with white background
        const canvas = document.createElement('canvas');
        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Fill with white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Draw the signature on top
          ctx.drawImage(sourceCanvas, 0, 0);
        }

        const dataUrl = canvas.toDataURL('image/png');
        const blob = await fetch(dataUrl).then((res) => res.blob());
        const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });

        const id = generateAttachmentId();

        // Use the attachment upload manager
        defaultAttachmentManager.upload(
          [{ id, instance: file }],
          UploadType.Table,
          {
            successCallback: (_uploadedFile, attachment: INotifyVo) => {
              const newValue: ISignatureCellValue = {
                id,
                name: file.name,
                path: attachment.path,
                token: attachment.token,
                size: attachment.size,
                mimetype: attachment.mimetype,
                presignedUrl: attachment.presignedUrl,
                width: canvas.width,
                height: canvas.height,
                signedAt: Date.now(),
              };
              onChange(newValue);
              setIsUploading(false);
            },
            errorCallback: (_uploadedFile, error?: string, code?: number) => {
              setIsUploading(false);
              if (code === 402) {
                useUsageLimitModalStore.setState({
                  modalType: UsageLimitModalType.Upgrade,
                  modalOpen: true,
                });
              } else {
                toast.error(error ?? t('common.uploadFailed'));
              }
            },
            progressCallback: noop,
          },
          baseId
        );
      } catch (error) {
        setIsUploading(false);
        toast.error(t('common.uploadFailed'));
      }
    }, [baseId, onChange, t]);

    const handleBegin = useCallback(() => {
      setIsDrawing(true);
    }, []);

    const handleEnd = useCallback(() => {
      setIsDrawing(false);
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        setHasSignature(true);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      setValue: (newValue?: ISignatureCellValue) => {
        if (!newValue) {
          sigCanvasRef.current?.clear();
          setHasSignature(false);
        }
      },
      saveValue: uploadSignature,
    }));

    // Resize canvas when container size changes
    useEffect(() => {
      const container = containerRef.current;
      const canvas = sigCanvasRef.current;
      if (!container || !canvas) return;

      const resizeObserver = new ResizeObserver(() => {
        const canvasElement = canvas.getCanvas();
        const ctx = canvasElement.getContext('2d');
        if (ctx) {
          // Save the current drawing
          const dataUrl = canvas.toDataURL();

          // Resize canvas
          canvasElement.width = container.clientWidth;
          canvasElement.height = container.clientHeight;

          // Restore the drawing
          if (dataUrl && !canvas.isEmpty()) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
            };
            img.src = dataUrl;
          }
        }
      });

      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }, []);

    // Show existing signature or drawing canvas
    if (value?.presignedUrl && !isDrawing) {
      return (
        <div className={cn('flex flex-col gap-2', className)}>
          <div className="relative w-full h-[200px] border rounded-md overflow-hidden bg-white dark:bg-gray-900">
            <img
              src={value.presignedUrl}
              alt={t('field.title.signature')}
              className="w-full h-full object-contain"
            />
          </div>
          {!readonly && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={clearSignature} className="gap-1">
                <Trash2 className="size-4" />
                {t('common.clear')}
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div
          ref={containerRef}
          className={cn(
            'relative w-full h-[200px] border rounded-md overflow-hidden',
            readonly && 'pointer-events-none opacity-60'
          )}
          style={{ backgroundColor: backgroundColor === 'transparent' ? 'white' : backgroundColor }}
        >
          <SignatureCanvas
            ref={sigCanvasRef}
            penColor={penColor}
            minWidth={penWidth * 0.5}
            maxWidth={penWidth}
            canvasProps={{
              className: 'w-full h-full',
            }}
            onBegin={handleBegin}
            onEnd={handleEnd}
          />
          {!hasSignature && !isDrawing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400">
              {t('editor.signature.placeholder')}
            </div>
          )}
        </div>
        {!readonly && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature || isUploading}
              className="gap-1"
            >
              <Trash2 className="size-4" />
              {t('common.clear')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={uploadSignature}
              disabled={!hasSignature || isUploading}
              className="gap-1"
            >
              {isUploading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Check className="size-4" />
              )}
              {t('common.save')}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

SignatureEditor.displayName = 'SignatureEditor';
