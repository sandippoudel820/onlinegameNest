import { Game } from '../types/game';

export const updatePageSeo = (config: {
  title: string;
  description: string;
  canonicalPath?: string;
  game?: Game;
}) => {
  // Update Title
  const formattedTitle = config.title.includes('OnlineGameNest')
    ? config.title
    : `${config.title} - Play Free on OnlineGameNest`;
  document.title = formattedTitle;

  // Update Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', config.description);
  }

  // Update OpenGraph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', formattedTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', config.description);

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && config.game?.thumbnail) {
    ogImage.setAttribute('content', config.game.thumbnail);
  }

  // Update JSON-LD structured data for games
  let scriptTag = document.getElementById('gamenest-game-ldjson');
  if (config.game) {
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'gamenest-game-ldjson';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: config.game.title,
      description: config.game.description,
      genre: [config.game.category, ...config.game.tags],
      playMode: 'SinglePlayer',
      applicationCategory: 'Game',
      operatingSystem: 'Any web browser (HTML5)',
      inLanguage: 'en',
      author: {
        '@type': 'Organization',
        name: config.game.developer || 'OnlineGameNest',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: config.game.rating,
        reviewCount: config.game.ratingCount,
        bestRating: '5',
        worstRating: '1',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    };
    scriptTag.textContent = JSON.stringify(schema);
  } else if (scriptTag) {
    scriptTag.remove();
  }
};

export const generateSitemapXml = (games: Game[], baseUrl = 'https://onlinegamenest.com') => {
  const staticPages = [
    '',
    'all-games',
    'categories',
    'about',
    'contact',
    'privacy-policy',
    'terms-of-service',
    'cookie-policy',
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  staticPages.forEach((path) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/${path}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${path === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Dynamic game pages
  games.forEach((game) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/game/${game.slug}</loc>\n`;
    xml += `    <lastmod>${game.releaseDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
};

export const generateRobotsTxt = (baseUrl = 'https://onlinegamenest.com') => {
  return `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${baseUrl}/sitemap.xml
`;
};
