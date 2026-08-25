export type Lang = 'uz' | 'en' | 'ru';

export interface Translation {
  uz: string;
  en: string;
  ru: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: Translation;
  summary: Translation;
  content: Translation;
  imageUrl?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  title: Translation;
  authors: string;
  journal?: string;
  year: number;
  doi?: string;
  fileUrl?: string;
  category: string;
  createdAt: string;
}

export type StructureUnitType =
  | 'department'
  | 'laboratory'
  | 'division'
  | 'center'
  | 'sector'
  | 'council'
  | 'position'
  | 'service';

export interface StructureUnit {
  id: string;
  name: Translation;
  description: Translation;
  head?: string | null;
  type: StructureUnitType;
  staffCount?: number | null;
  isAdvisory?: boolean;
  parentId?: string;
  order: number;
  children?: StructureUnit[];
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
  };
}
