import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote,
  Link2, Link2Off, ImagePlus, Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { uploadsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { sanitizePastedHtml } from '@/lib/sanitize';
import { formatBytes, prepareImage, MAX_WIDTH_DEFAULT } from '@/lib/image-prepare';

interface Props {
  value: string;
  onChange: (html: string) => void;
  ownerType?: string;
  ownerId?: string;
}

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={clsx(
        'p-2 rounded-md transition-colors',
        active ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditorInner({ value, onChange, ownerType, ownerId }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [uploading, setUploading] = useState(0);

  /**
   * Rasmni yuklab, matnning joriy joyiga qo'yadi. Yuklanish davomida
   * o'sha joyda joy egallovchi matn turadi va tugagach almashtiriladi.
   */
  const insertImage = useCallback(
    async (editor: Editor, file: File) => {
      const placeholder = `⏳ ${t('editor.uploading')}`;
      const from = editor.state.selection.from;
      editor.chain().focus().insertContent(placeholder).run();
      const range = { from, to: from + placeholder.length };

      setUploading((count) => count + 1);
      try {
        const prepared = await prepareImage(file, { maxWidth: MAX_WIDTH_DEFAULT });
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
        const response = await uploadsApi.upload(prepared.file, 'image', {
          width: prepared.width,
          height: prepared.height,
          ownerType,
          ownerId,
        });
        const url: string = response.data.data.url;
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContentAt(range.from, { type: 'image', attrs: { src: url } })
          .run();
        toast.success(t('toast.image_uploaded'));
      } catch (error) {
        editor.chain().focus().deleteRange(range).run();
        toast.showError(error);
      } finally {
        setUploading((count) => count - 1);
      }
    },
    [ownerId, ownerType, t, toast]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Faqat ikkinchi va uchinchi daraja — sahifada `h1` allaqachon bor.
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose-content min-h-[260px] px-4 py-3 focus:outline-none',
      },
      // Word va veb sahifadan kelgan keraksiz belgilash shu yerda tozalanadi.
      transformPastedHTML: (html) => sanitizePastedHtml(html),
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []);
        const image = files.find((file) => file.type.startsWith('image/'));
        if (!image || !editor) return false;
        event.preventDefault();
        void insertImage(editor, image);
        return true;
      },
      handleDrop(view, event) {
        const files = Array.from((event as DragEvent).dataTransfer?.files ?? []);
        const image = files.find((file) => file.type.startsWith('image/'));
        if (!image || !editor) return false;
        event.preventDefault();
        void insertImage(editor, image);
        return true;
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(t('editor.link_prompt'), previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const pickImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void insertImage(editor, file);
    };
    input.click();
  };

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarButton title={t('editor.bold')} active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title={t('editor.italic')} active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarButton title={t('editor.h2')} active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title={t('editor.h3')} active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarButton title={t('editor.bullet_list')} active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title={t('editor.ordered_list')} active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title={t('editor.quote')} active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarButton title={t('editor.link')} active={editor.isActive('link')} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.unlink')}
          onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
        >
          <Link2Off className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title={t('editor.image')} onClick={pickImage}>
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>

        {uploading > 0 && (
          <span className="ml-auto inline-flex items-center gap-1.5 pr-1 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t('editor.uploading')}
          </span>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
