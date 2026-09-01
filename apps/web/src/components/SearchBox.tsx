import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import { searchApi } from '@/lib/api';
import { sanitizeSnippet } from '@/lib/sanitize';
import { useCurrentLang, useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { MIN_QUERY_LENGTH, type SearchItem, type SearchResponse } from '@/lib/search';

/** Ochiladigan ro'yxatda ko'rsatiladigan eng ko'p natija. */
const PREVIEW_LIMIT = 6;

/**
 * Sarlavhadagi qidiruv — **doim ikonka**, bosilganda o'ng tomonda ochiladigan
 * panelda maydon chiqadi. Ilgari `md`dan boshlab doim ochiq maydon edi — bu
 * o'zbekcha kabi uzunroq guruh nomlari bilan mega-menyuga joy qoldirmasdi
 * (matn ikki qatorga sinib qolardi). Tashqariga bosilganda `pointerdown`
 * bilan yopiladi (to'liq ekranli overlay emas — sabab: shu turdagi overlay
 * `<header>`ning stacking context'i ichida mega-menyu tugmalarini bosib
 * qolib, hover sirkilini keltirib chiqargan edi, xuddi shu naqsh bu yerda
 * ham qaytarilmasin).
 */
export default function SearchBox() {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const navigate = useNavigate();
  const localize = useLocalizedPath();
  const listId = useId();

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debounced = useDebouncedValue(query, 300);
  const term = debounced.trim();
  const enabled = term.length >= MIN_QUERY_LENGTH;

  const { data, isFetching } = useQuery({
    queryKey: ['search-preview', term, lang],
    queryFn: () => searchApi.query({ q: term, lang, limit: PREVIEW_LIMIT }),
    enabled,
  });

  const response = enabled ? (data?.data as SearchResponse | undefined) : undefined;
  const items: SearchItem[] = response?.groups.flatMap((group) => group.items) ?? [];
  const showList = focused && enabled && (items.length > 0 || (!isFetching && !!response));

  // Ro'yxat yangilanganda tanlov ro'yxatdan tashqarida qolib ketmasin.
  useEffect(() => setActive(-1), [term]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Tashqariga bosilganda panel yopiladi.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const closeAndClear = () => {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const goToResults = () => {
    if (query.trim().length < MIN_QUERY_LENGTH) return;
    navigate(localize(`/search?q=${encodeURIComponent(query.trim())}`));
    closeAndClear();
  };

  const goToItem = (item: SearchItem) => {
    navigate(localize(item.url));
    closeAndClear();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (items.length === 0 ? -1 : (index + 1) % items.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (items.length === 0 ? -1 : (index <= 0 ? items.length : index) - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[active];
      if (item) goToItem(item);
      else goToResults();
    } else if (event.key === 'Escape') {
      closeAndClear();
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? t('search.close') : t('search.open')}
        aria-expanded={open}
        className="p-2 text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-md transition-colors"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[min(20rem,90vw)] bg-white border border-gray-100 rounded-lg shadow-lg p-3 z-50">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-label={t('search.title')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t('search.placeholder')}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            {showList && (
              <ul
                id={listId}
                role="listbox"
                className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50 max-h-96 overflow-y-auto"
              >
                {items.map((item, index) => (
                  <li key={`${item.type}-${item.id}`} role="option" aria-selected={index === active}>
                    <button
                      type="button"
                      // `onMouseDown` `onClick` dan oldin ishlaydi — maydondan
                      // fokus ketishi havolani bosishga xalaqit qilmaydi.
                      onMouseDown={(event) => {
                        event.preventDefault();
                        goToItem(item);
                      }}
                      onMouseEnter={() => setActive(index)}
                      className={clsx(
                        'w-full text-left px-3 py-2 transition-colors',
                        index === active ? 'bg-primary-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <span className="block text-xs text-primary-700">
                        {t(`search.types.${item.type}`)}
                      </span>
                      <span className="block text-sm text-gray-900 line-clamp-1">{item.title}</span>
                      <span
                        className="block text-xs text-gray-500 line-clamp-1 [&_mark]:bg-yellow-100 [&_mark]:text-gray-900"
                        dangerouslySetInnerHTML={{ __html: sanitizeSnippet(item.snippet) }}
                      />
                    </button>
                  </li>
                ))}

                {items.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    {t('search.no_results', { q: term })}
                  </li>
                )}

                {items.length > 0 && (
                  <li className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        goToResults();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-primary-700 hover:bg-gray-50"
                    >
                      {t('search.show_all')} ({response?.total ?? 0})
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
