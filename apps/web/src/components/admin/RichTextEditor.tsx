import { Suspense, lazy } from 'react';

/**
 * Tahrirlagich FAQAT admin panelda ishlatiladi, shuning uchun `lazy` —
 * tiptap paketlari ochiq sahifalar bundle'iga tushmaydi (07-topshiriq, 5-bo'lim).
 */
const RichTextEditorInner = lazy(() => import('./RichTextEditorInner'));

interface Props {
  value: string;
  onChange: (html: string) => void;
  ownerType?: string;
  ownerId?: string;
}

export default function RichTextEditor(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-gray-300 min-h-[300px] bg-gray-50 animate-pulse" />
      }
    >
      <RichTextEditorInner {...props} />
    </Suspense>
  );
}
