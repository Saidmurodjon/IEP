import { useCallback, useRef, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { PHOTO_ASPECT_RATIO } from '@/lib/image-prepare';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Props {
  imageUrl: string;
  onCancel: () => void;
  onConfirm: (area: Area) => void;
}

/**
 * Xodim rasmini yuklashdan oldin 3x4 andozaga qo'lda moslashtirish —
 * foydalanuvchi surish (drag) va kattalashtirish (zoom) bilan qaysi
 * qismi saqlanishini o'zi tanlaydi (avtomatik markazdan kesish emas).
 */
export default function PhotoCropModal({ imageUrl, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true, onCancel);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="crop-modal-title" className="font-semibold text-gray-900">
            {t('upload.crop_title')}
          </h2>
          <button onClick={onCancel} aria-label={t('common.close')} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-80 bg-gray-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={PHOTO_ASPECT_RATIO}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="label" htmlFor="crop-zoom-range">
              {t('upload.crop_zoom')}
            </label>
            <input
              id="crop-zoom-range"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
            />
          </div>
          <p className="text-xs text-gray-400">{t('upload.crop_hint')}</p>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => area && onConfirm(area)}
              disabled={!area}
              className="btn-primary disabled:opacity-60"
            >
              {t('upload.crop_confirm')}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary">
              {t('admin.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
