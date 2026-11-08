import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = process.env.VITE_APP_URL || 'https://worscoi.com';
const TODAY = new Date().toISOString().split('T')[0];

const STATIC_ROUTES = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/livros', changefreq: 'daily', priority: '0.9' },
  { path: '/webtoons', changefreq: 'daily', priority: '0.9' },
  { path: '/animes', changefreq: 'daily', priority: '0.9' },
  { path: '/noticias', changefreq: 'hourly', priority: '0.9' },
  { path: '/para-voce', changefreq: 'daily', priority: '0.8' },
  { path: '/biblioteca', changefreq: 'weekly', priority: '0.7' },
  { path: '/continuar-lendo', changefreq: 'weekly', priority: '0.6' },
  { path: '/buscar', changefreq: 'weekly', priority: '0.7' },
  { path: '/termos', changefreq: 'monthly', priority: '0.4' },
  { path: '/privacidade', changefreq: 'monthly', priority: '0.4' },
];

const NEWS_CATEGORIES = [
  'animes',
  'mangas',
  'webtoons',
  'livros',
  'tecnologias',
  'games',
  'cultura',
  'futebol',
  'basquete',
  'mercado',
  'virais',
  'listas',
  'politica',
  'geografia',
  'ciencia',
];

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractIds(filePath, regex) {
  try {
    const fullPath = path.resolve(rootDir, filePath);
    if (!fs.existsSync(fullPath)) return [];
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match[1] && !matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return [];
  }
}

export function buildSitemapXml(customOrigin = BASE_URL) {
  const origin = customOrigin.replace(/\/+$/, '');
  const urls = [];

  // 1. Static Core Routes
  for (const route of STATIC_ROUTES) {
    urls.push({
      loc: `${origin}${route.path}`,
      lastmod: TODAY,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  }

  // 2. News Categories
  for (const cat of NEWS_CATEGORIES) {
    urls.push({
      loc: `${origin}/noticias?categoria=${encodeURIComponent(cat)}`,
      lastmod: TODAY,
      changefreq: 'hourly',
      priority: '0.8',
    });
  }

  // 3. Books
  const modernBookIds = extractIds('src/lib/modernBooks.ts', /id:\s*"(mod-[^"]+)"/g);
  for (const id of modernBookIds) {
    urls.push({
      loc: `${origin}/livros/${id}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.8',
    });
    urls.push({
      loc: `${origin}/ler/${id}`,
      lastmod: TODAY,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  const curricularIds = [
    'cur-matematica-enem',
    'cur-fisica-enem',
    'cur-quimica-enem',
    'cur-biologia-enem',
    'cur-historia-enem',
    'cur-redacao-enem',
  ];
  for (const id of curricularIds) {
    urls.push({
      loc: `${origin}/livros/${id}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  const scientificIds = [
    'sci-astrofisica-jwst',
    'sci-quantica-computacao',
    'sci-crispr-cas9',
    'sci-neurociencia-plasticidade',
  ];
  for (const id of scientificIds) {
    urls.push({
      loc: `${origin}/livros/${id}`,
      lastmod: TODAY,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  // 4. Webtoons
  const webtoonIds = extractIds('src/lib/webtoons.ts', /id:\s*"(wt-[a-z0-9-]+)"/g)
    .filter(id => !id.includes('-ep-'));
  for (const id of webtoonIds) {
    urls.push({
      loc: `${origin}/webtoon/${id}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.8',
    });
    urls.push({
      loc: `${origin}/webtoon/${id}/ler`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  // 5. Animes
  const animeIds = extractIds('src/lib/animes.ts', /id:\s*"([a-z0-9-]+)"/g);
  for (const id of animeIds) {
    urls.push({
      loc: `${origin}/animes/${id}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.8',
    });
    urls.push({
      loc: `${origin}/animes/${id}/manga`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  // 6. News Articles from newsArchive.json
  try {
    const archivePath = path.resolve(rootDir, 'src/data/newsArchive.json');
    if (fs.existsSync(archivePath)) {
      const data = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
      const articles = Array.isArray(data.articles) ? data.articles : [];
      // Include all articles or up to 2000
      for (const article of articles.slice(0, 2000)) {
        if (article.slug) {
          const modDate = article.published_at
            ? article.published_at.split('T')[0]
            : TODAY;
          urls.push({
            loc: `${origin}/noticias/${encodeURIComponent(article.slug)}`,
            lastmod: modDate,
            changefreq: 'weekly',
            priority: '0.7',
          });
        }
      }
    }
  } catch (e) {
    console.error('Error loading newsArchive.json:', e);
  }

  // Build standard XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const item of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  return { xml, count: urls.length };
}

// If run directly via node
const isDirectRun = process.argv[1] && process.argv[1].endsWith('generate_sitemap.js');
if (isDirectRun) {
  const result = buildSitemapXml();
  const outputPath = path.resolve(rootDir, 'public/sitemap.xml');
  fs.writeFileSync(outputPath, result.xml, 'utf8');
  console.log(`[Sitemap] Generated ${result.count} URLs in ${outputPath}`);
}
