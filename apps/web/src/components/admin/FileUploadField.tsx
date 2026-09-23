import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Area } from 'react-easy-crop';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { fileUrl, uploadsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import {
  formatBytes, prepareImage, cropToFile, MAX_WIDTH_DEFAULT, MAX_WIDTH_PHOTO, MIN_WIDTH_PHOTO,
} from '@/lib/image-prepare';
import PhotoCropModal from '@/components/admin/PhotoCropModal';

interface Props {
  kind: 'image' | 'photo' | 'document';
  /** Joriy qiymat: `/api/files/<key>`. Bo'sh bo'lsa fayl tanlanmagan. */
  value?: string | null;
  onChange: (url: string | null) => void;
  label: string;
  ownerType?: string;
  ownerId?: string;
}

const ACCEPT: Record<Props['kind'], string> = {
  image: 'image/jpeg,image/png,image/webp',
  photo: 'image/jpeg,image/png,image/webp',
  document: '.pdf,.doc,.docx,.xls,.xlsx',
};

/**
 * Fayl yuklash maydoni. Rasm bo'lsa yuborishdan oldin brauzerda
 * kichraytiriladi va foydalanuvchiga nima bo'lgani aytiladi.
 */
export default function FileUploadField({ kind, value, onChange, label, ownerType, ownerId }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'preparing' | 'uploading' | null>(null);
  const [cropSrc, setCropSrc] = useState<{ url: string; file: File } | null>(null);

  const isImage = kind !== 'document';

  const handleFile = async (file: File) => {
    try {
      let payload = file;
      let width: number | undefined;
      let height: number | undefined;

      if (isImage) {
        setBusy('preparing');
        const prepared = await prepareImage(file, {
          maxWidth: kind === 'photo' ? MAX_WIDTH_PHOTO : MAX_WIDTH_DEFAULT,
          minWidth: kind === 'photo' ? MIN_WIDTH_PHOTO : 0,
        });
        payload = prepared.file;
        width = prepared.width;
        height = prepared.height;
        if (prepared.resized) {
          toast.success(
            t('toast.image_resized', {
              from: prepared.resized.fromWidth,
              to: prepared.resized.toWidth,
              before: formatBytes(prepared.resized.beforeBytes),
              after: formatBytes(prepared.resized.afterBytes),
            })
          );
        }
      }

      setBusy('uploading');
      const response = await uploadsApi.upload(payload, kind, { width, height, ownerType, ownerId });
      onChange(response.data.data.url);
      toast.success(t(isImage ? 'toast.image_uploaded' : 'toast.file_uploaded'));
    } catch (error) {
      // `prepareImage` xatolari `ClientError` bo'lib keladi va toast ularni
      // API xatolari bilan bir xil o'zbekcha matnga o'giradi.
      toast.showError(error);
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  /** Xodim rasmi tanlanganda — avval qo'lda kesish oynasi ochiladi. */
  const onFileSelected = (file: File) => {
    if (kind === 'photo') {
      setCropSrc({ url: URL.createObjectURL(file), file });
      return;
    }
    void handleFile(file);
  };

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc.url);
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const confirmCrop = async (area: Area) => {
    if (!cropSrc) return;
    const { url, file } = cropSrc;
    setCropSrc(null);
    try {
      const cropped = await cropToFile(url, area, file.name);
      await handleFile(cropped);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const Icon = isImage ? ImageIcon : FileText;

  return (
    <div>
      <label className="label">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
          {isImage ? (
            <img
              src={fileUrl(value)}
              alt=""
              className={`${kind === 'photo' ? 'h-16 w-12' : 'h-14 w-14'} rounded object-cover bg-gray-100 flex-shrink-0`}
            />
          ) : (
            <div className="h-14 w-14 rounded bg-gray-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 truncate font-mono">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-primary-700 hover:underline"
          >
            {t('upload.replace')}
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={t('upload.remove')}
            className="p-1.5 text-gray-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy !== null}
          className="w-full rounded-lg border-2 border-dashed border-gray-200 p-5 text-center hover:border-primary-300 transition-colors disabled:opacity-60"
        >
          {busy ? (
            <span className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t(busy === 'preparing' ? 'upload.preparing' : 'upload.uploading')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Icon className="h-4 w-4 text-gray-300" />
              <Upload className="h-4 w-4 text-gray-300" />
              {t(isImage ? 'upload.choose_image' : 'upload.choose_file')}
            </span>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />

      {cropSrc && (
        <PhotoCropModal
          imageUrl={cropSrc.url}
          onCancel={closeCrop}
          onConfirm={(area) => void confirmCrop(area)}
        />
      )}
    </div>
  );
}
