// Type definitions for WriteBlock

export interface PageMetadata {
  page_id: number;
  walrus_blob_id: string;
  version: number;
  author: string;
  created_at: number;
  updated_at: number;
  // Frontend-specific fields
  title?: string;
  slug?: string;
  excerpt?: string;
  markdown_content?: string; // Cached from Walrus
}

export interface Author {
  address: string;
  name: string;
  granted_at: number;
}

export interface AdminCapability {
  issued_at: number;
  holder: string;
}

export interface AuthorCapability {
  author: string;
  issued_at: number;
}

export type UserRole = 'admin' | 'author' | 'viewer';

export interface UserSession {
  address: string;
  role: UserRole;
  hasAdminCap?: boolean;
  hasAuthorCap?: boolean;
  name?: string;
}
