import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  count: number;
  onCancel: () => void;
  children: ReactNode;
}

/**
 * Admin ro'yxatida bir nechta yozuv belgilanganda jadval ustida chiqadigan
 * amal paneli. `count === 0` bo'lsa hech narsa chiqarmaydi.
 */
export default function BulkActionsBar({ count, onCancel, children }: Props) {
  const { t } = useTranslation();
  if (count === 0) return null;

  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5"
      role="toolbar"
      aria-label={t('admin.bulk_toolbar')}
    >
      <span className="text-sm font-medium text-primary-900">
        {t('admin.selected_count', { count })}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onCancel}
        className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-700"
      >
        {t('admin.cancel')}
      </button>
    </div>
  );
}
