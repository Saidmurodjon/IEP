/** `GET /api/search` javobining tiplari. Frontend shu shakl bo'yicha ishlaydi. */

export const SEARCH_TYPES = ['news', 'publications', 'documents', 'employees', 'structure'] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export interface SearchItem {
  type: SearchType;
  id: string;
  title: string;
  /** `<mark>` teglari bo'lishi mumkin — ko'rsatishdan oldin `sanitizeSnippet`. */
  snippet: string;
  /** Til prefiksisiz ichki manzil — `LocalizedLink` prefiksni o'zi qo'yadi. */
  url: string;
  date: string | null;
}

export interface SearchGroup {
  type: SearchType;
  total: number;
  items: SearchItem[];
}

export interface SearchResponse {
  q: string;
  lang: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: Record<SearchType, number>;
  groups: SearchGroup[];
}

/** Eng qisqa so'rov uzunligi — server ham shu qiymatni talab qiladi. */
export const MIN_QUERY_LENGTH = 2;
