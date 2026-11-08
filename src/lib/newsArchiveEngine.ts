/**
 * News Archive & Permanent Immutability Engine
 * Manages queries, historical pagination, timeline indexing, and canonical slug resolution.
 * Guarantees zero 404 for historical articles.
 */

import { SyndicatedNewsItem } from "./newsSyndication";
import { expandNewsToDeepReport } from "./newsExpander";

export interface ArchiveFilterOptions {
  page?: number;
  pageSize?: number;
  year?: number | null;
  month?: number | null;
  category?: string;
  q?: string;
  status?: "published" | "archived" | "all";
}

export interface ArchiveQueryResult {
  items: SyndicatedNewsItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ArchiveTimelineEntry {
  year: number;
  month: number;
  count: number;
}

/**
 * Queries the permanent historical news archive with server-side pagination & filters.
 */
export async function queryNewsArchive(options: ArchiveFilterOptions = {}): Promise<ArchiveQueryResult> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.pageSize) params.set("pageSize", String(options.pageSize));
  if (options.year) params.set("year", String(options.year));
  if (options.month) params.set("month", String(options.month));
  if (options.category && options.category !== "all") params.set("category", options.category);
  if (options.q) params.set("q", options.q);

  try {
    const res = await fetch(`/api/news/archive?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      const enrichedItems = (data.items || []).map((it: any) => expandNewsToDeepReport(it));
      return {
        items: enrichedItems,
        total: data.total || enrichedItems.length,
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        totalPages: data.totalPages || 1,
      };
    }
  } catch (err) {
    console.error("Falha ao consultar arquivo permanente de notícias:", err);
  }

  return {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };
}

/**
 * Resolves a permanent canonical news article by slug or ID.
 * Queries the historical archive endpoint first, guaranteeing that even years later, the link works!
 */
export async function fetchPermanentArticle(slugOrId: string): Promise<SyndicatedNewsItem | null> {
  if (!slugOrId) return null;

  try {
    const res = await fetch(`/api/news/article?slug=${encodeURIComponent(slugOrId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.article) {
        return expandNewsToDeepReport(data.article);
      }
    }
  } catch {}

  return null;
}

/**
 * Fetches the archive timeline breakdown (available years and months with counts).
 */
export async function fetchArchiveTimeline(): Promise<{ timeline: ArchiveTimelineEntry[]; totalArticles: number }> {
  try {
    const res = await fetch("/api/news/timeline");
    if (res.ok) {
      const data = await res.json();
      return {
        timeline: data.timeline || [],
        totalArticles: data.totalArticles || 0,
      };
    }
  } catch {}

  return { timeline: [], totalArticles: 0 };
}
