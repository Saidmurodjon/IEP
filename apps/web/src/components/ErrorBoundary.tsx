import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import { reportClientError } from '@/lib/client-logger';

interface Props {
  children: ReactNode;
  /** `admin` chegarasi ochiq sahifalarni yiqitmaydi va aksincha. */
  scope: 'public' | 'admin';
}

interface State {
  hasError: boolean;
  /** Hodisa raqami — moderator uni texnik xodimga aytadi. */
  incidentId: string | null;
}

/** Qisqa, o'qishga qulay hodisa raqami. */
function makeIncidentId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/**
 * Foydalanuvchiga ko'rsatiladigan xato sahifasi.
 *
 * TEXNIK TAFSILOT KO'RSATILMAYDI — faqat qisqa tushuntirish va hodisa raqami
 * (08-topshiriq, 5-bo'lim).
 */
function ErrorScreen({ incidentId, scope }: { incidentId: string | null; scope: Props['scope'] }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="bg-red-50 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('errorBoundary.title')}</h1>
        <p className="text-gray-500 mb-6">{t('errorBoundary.text')}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => window.location.reload()} className="btn-primary gap-2 px-5 py-2.5">
            <RotateCw className="h-4 w-4" />
            {t('errorBoundary.reload')}
          </button>
          {/*
            Oddiy `<a>`: chegaradan keyin router holati ishonchsiz bo'lishi
            mumkin, to'liq qayta yuklash xavfsizroq.
          */}
          <a href={scope === 'admin' ? '/admin/dashboard' : '/'} className="btn-secondary gap-2 px-5 py-2.5">
            <Home className="h-4 w-4" />
            {t(scope === 'admin' ? 'errorBoundary.dashboard' : 'errorBoundary.home')}
          </a>
        </div>

        {incidentId && (
          <p className="mt-6 text-xs text-gray-400">
            {t('errorBoundary.incident')}: <span className="font-mono">{incidentId}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * React xato chegarasi.
 *
 * Busiz bitta komponentdagi xato butun sahifani oqartirib qo'yadi.
 * Admin panel uchun alohida chegara ishlatiladi — admin paneldagi xato
 * ochiq sahifalarni yiqitmasin.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, incidentId: null };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true, incidentId: makeIncidentId() };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Chegara ushlagan xato jurnalga yuboriladi.
    reportClientError({
      message: `[${this.props.scope}] ${error.message}`,
      stack: `${error.stack ?? ''}\n--- component stack ---${info.componentStack ?? ''}`,
      level: 'error',
      code: 'REACT_ERROR_BOUNDARY',
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorScreen incidentId={this.state.incidentId} scope={this.props.scope} />;
    }
    return this.props.children;
  }
}
