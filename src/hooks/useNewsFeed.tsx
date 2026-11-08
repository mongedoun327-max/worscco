import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsItem } from "./useCatalog";
import { syncDailyNews, getCachedNews } from "@/lib/newsSyndication";
import { queryNewsArchive } from "@/lib/newsArchiveEngine";
import { applyNewsEditorialOverrides } from "@/lib/editorialStore";

const PAGE_SIZE = 16;

export interface NewsFilters {
  category?: string;
  q?: string;
  order?: "recent" | "oldest";
  year?: string;
  month?: string;
}

/** Infinite news feed combining real-time syndicated RSS, Supabase DB and Permanent Historical Archive */
export const useNewsFeed = (filters: NewsFilters) =>
  useInfiniteQuery({
    queryKey: ["news-feed", filters],
    initialPageParam: 0 as number,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam = 0 }) => {
      // 1. Read cached syndicated news immediately and trigger non-blocking refresh if empty
      let syndicated: NewsItem[] = [];
      try {
        syndicated = getCachedNews();
        if (syndicated.length === 0) {
          void syncDailyNews();
        }
      } catch {
        syndicated = [];
      }

      // 2. Fetch from Permanent Archive Engine (guarantees historical persistence & genre coverage)
      let archiveItems: NewsItem[] = [];
      try {
        const res = await queryNewsArchive({
          category: filters.category && filters.category !== "all" ? filters.category : undefined,
          q: filters.q,
          year: filters.year && filters.year !== "all" ? parseInt(filters.year) : undefined,
          month: filters.month && filters.month !== "all" ? parseInt(filters.month) : undefined,
          pageSize: 700,
        });
        archiveItems = res.items as NewsItem[];
      } catch {
        // Fallback gracefully
      }

      // 3. Fetch Supabase news
      let dbNews: NewsItem[] = [];
      try {
        const { data, error } = await supabase
          .from("news")
          .select("id,title,slug,excerpt,content,cover_url,category,published,published_at,created_at")
          .eq("published", true);
        if (!error && data) {
          dbNews = (data as NewsItem[]).filter(
            (n) => (n.content || "").length >= 300 && !n.cover_url?.startsWith("/covers/")
          );
        }
      } catch {
        // Fallback gracefully
      }

      // 4. Merge & Deduplicate (Archive first so enriched covers & multi-paragraph articles take precedence)
      const seen = new Set<string>();
      let all: NewsItem[] = [];

      for (const item of [...archiveItems, ...syndicated, ...dbNews]) {
        const key = (item.slug || item.title || "").toLowerCase();
        if (!seen.has(key) && (item.content || "").length >= 200) {
          seen.add(key);
          all.push(item);
        }
      }

      // 4b. Apply Editorial Studio overrides & custom publications
      all = applyNewsEditorialOverrides(all);

      // 5. Apply Category Filter
      if (filters.category && filters.category !== "all") {
        const cat = filters.category.toLowerCase();
        all = all.filter((i) => i.category?.toLowerCase() === cat);
      }

      // 6. Apply Search Query Filter
      if (filters.q?.trim()) {
        const term = filters.q.trim().toLowerCase();
        all = all.filter(
          (i: any) =>
            i.title?.toLowerCase().includes(term) ||
            i.excerpt?.toLowerCase().includes(term) ||
            i.content?.toLowerCase().includes(term) ||
            i.category?.toLowerCase().includes(term) ||
            i.author?.toLowerCase().includes(term) ||
            i.source_name?.toLowerCase().includes(term)
        );
      }

      // 7. Apply Historical Year & Month Filters
      if (filters.year && filters.year !== "all") {
        all = all.filter((i) => {
          const d = new Date(i.published_at);
          return !isNaN(d.getTime()) && String(d.getFullYear()) === filters.year;
        });
      }
      if (filters.month && filters.month !== "all") {
        all = all.filter((i) => {
          const d = new Date(i.published_at);
          return !isNaN(d.getTime()) && String(d.getMonth() + 1).padStart(2, "0") === filters.month;
        });
      }

      // 8. Sort deterministically
      const ascending = filters.order === "oldest";
      all.sort((a, b) => {
        const diff = new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        if (diff !== 0) return ascending ? -diff : diff;
        return (a.id || "").localeCompare(b.id || "");
      });

      // 9. Paginate
      const start = pageParam * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageItems = all.slice(start, end);
      const hasNext = end < all.length;

      return {
        items: pageItems,
        nextPage: hasNext ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (last) => last.nextPage,
  });
