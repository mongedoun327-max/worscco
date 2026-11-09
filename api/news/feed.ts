import type { IncomingMessage, ServerResponse } from "http";
import Parser from "rss-parser";

const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 WorscoiNewsBot/4.0",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
  timeout: 8000,
});

interface FeedSource {
  url: string;
  category: string;
  source: string;
}

const FEEDS: Record<string, FeedSource[]> = {
  all: [
    { url: "https://g1.globo.com/rss/g1/economia/", category: "Mercado", source: "G1 Economia" },
    { url: "https://g1.globo.com/rss/g1/politica/", category: "Política", source: "G1 Política" },
    { url: "https://g1.globo.com/rss/g1/ciencia-e-saude/", category: "Ciência", source: "G1 Ciência" },
    { url: "https://ge.globo.com/rss/ge/futebol/futebol-internacional/liga-dos-campeoes/", category: "Futebol", source: "UEFA Champions League" },
    { url: "https://www.jbox.com.br/feed/", category: "Animes", source: "JBox" },
    { url: "https://www.otakupt.com/feed/", category: "Animes", source: "OtakuPT" },
    { url: "https://tecnoblog.net/feed/", category: "Tecnologias", source: "Tecnoblog" },
    { url: "https://legiaodosherois.com.br/feed", category: "Cultura", source: "Legião dos Heróis" },
    { url: "https://criticalhits.com.br/feed/", category: "Games", source: "Critical Hits" },
    { url: "https://www.publishnews.com.br/rss/", category: "Livros", source: "PublishNews" },
  ],
  futebol: [
    { url: "https://ge.globo.com/rss/ge/futebol/futebol-internacional/liga-dos-campeoes/", category: "Futebol", source: "UEFA Champions League" },
    { url: "https://ge.globo.com/rss/ge/futebol/futebol-internacional/futebol-espanhol/", category: "Futebol", source: "La Liga" },
    { url: "https://ge.globo.com/rss/ge/futebol/futebol-internacional/futebol-ingles/", category: "Futebol", source: "Premier League" },
  ],
  basquete: [
    { url: "https://ge.globo.com/rss/ge/basquete/nba/", category: "Basquete", source: "NBA Brasil" },
  ],
  mercado: [
    { url: "https://g1.globo.com/rss/g1/economia/", category: "Mercado", source: "G1 Economia" },
  ],
  politica: [
    { url: "https://g1.globo.com/rss/g1/politica/", category: "Política", source: "G1 Política" },
  ],
  ciencia: [
    { url: "https://g1.globo.com/rss/g1/ciencia-e-saude/", category: "Ciência", source: "G1 Ciência & Saúde" },
  ],
  geografia: [
    { url: "https://g1.globo.com/rss/g1/natureza/", category: "Geografia", source: "G1 Natureza" },
  ],
  animes: [
    { url: "https://www.jbox.com.br/feed/", category: "Animes", source: "JBox" },
    { url: "https://www.otakupt.com/feed/", category: "Animes", source: "OtakuPT" },
  ],
  mangas: [
    { url: "https://animeunited.com.br/feed/", category: "Mangás", source: "Anime United" },
    { url: "https://www.otakupt.com/feed/", category: "Mangás", source: "OtakuPT" },
  ],
  games: [
    { url: "https://criticalhits.com.br/feed/", category: "Games", source: "Critical Hits" },
    { url: "https://www.adrenaline.com.br/rss/", category: "Games", source: "Adrenaline" },
  ],
  tecnologias: [
    { url: "https://tecnoblog.net/feed/", category: "Tecnologias", source: "Tecnoblog" },
    { url: "https://rss.tecmundo.com.br/feed", category: "Tecnologias", source: "TecMundo" },
  ],
  cultura: [
    { url: "https://legiaodosherois.com.br/feed", category: "Cultura", source: "Legião dos Heróis" },
    { url: "https://g1.globo.com/rss/g1/pop-arte/", category: "Cultura", source: "G1 Pop & Arte" },
  ],
  livros: [
    { url: "https://www.publishnews.com.br/rss/", category: "Livros", source: "PublishNews" },
  ],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers?.host || "localhost"}`);
  const topic = (url.searchParams.get("topic") || "all").toLowerCase();
  const limit = Math.min(60, Math.max(5, parseInt(url.searchParams.get("limit") || "25", 10)));

  const sources = FEEDS[topic] || FEEDS.all;
  const items: any[] = [];

  const promises = sources.map(async (src) => {
    try {
      const feed = await parser.parseURL(src.url);
      const feedItems: any[] = [];
      for (const item of (feed.items || []).slice(0, 8)) {
        const title = (item.title || "").trim();
        if (!title) continue;
        const slug = slugify(title);
        const excerpt = (item.contentSnippet || item.content || "").replace(/<[^>]+>/g, "").slice(0, 240);
        const content = item.content || excerpt || title;

        feedItems.push({
          id: `feed-${slug}-${Math.abs(title.length * 17)}`,
          title,
          slug,
          excerpt: excerpt + "...",
          content,
          cover_url: item.enclosure?.url || null,
          category: src.category,
          published: true,
          published_at: item.isoDate || item.pubDate || new Date().toISOString(),
          author: src.source,
          source_name: src.source,
          source_url: item.link || "",
        });
      }
      return feedItems;
    } catch {
      return [];
    }
  });

  const batches = await Promise.all(promises);
  for (const b of batches) {
    items.push(...b);
  }

  items.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  res.statusCode = 200;
  res.end(JSON.stringify({ items: items.slice(0, limit), count: items.length, topic }));
}
