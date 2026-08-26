import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '@/lib/api';
import { Trash2, Mail, MailOpen, Phone } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import clsx from 'clsx';

interface Msg {
  id: string; name: string; email: string; phone?: string;
  subject: string; message: string; createdAt: string; read: boolean;
}

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => contactApi.list(1),
  });

  const messages: Msg[] = data?.data?.data ?? [];

  const markReadMut = useMutation({
    mutationFn: (id: string) => contactApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-messages'] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  return (
    <>
      <Helmet><title>Xabarlar | Admin</title></Helmet>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.messages')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Jami: {messages.length} | O'qilmagan: {messages.filter((m) => !m.read).length}
          </p>
        </div>

        {isLoading && <div className="text-center py-8 text-gray-400">Yuklanmoqda...</div>}

        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                'card p-5 transition-all',
                !msg.read && 'border-l-4 border-l-primary-500 bg-primary-50'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.read
                      ? <Mail className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      : <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    }
                    <span className="font-semibold text-gray-900">{msg.name}</span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-sm text-gray-500">
                    <a href={`mailto:${msg.email}`} className="text-primary-700 hover:underline">{msg.email}</a>
                    {msg.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {msg.phone}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 mb-1">{msg.subject}</div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  {!msg.read && (
                    <button
                      onClick={() => markReadMut.mutate(msg.id)}
                      className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                      title="O'qilgan deb belgilash"
                    >
                      <MailOpen className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMut.mutate(msg.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && messages.length === 0 && (
            <div className="card p-12 text-center">
              <Mail className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Xabarlar yo'q</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
