const RSS_PATHS = [
  "/feed", "/rss", "/feed.xml", "/rss.xml",
  "/feed/rss2", "/rss2.xml", "/atom.xml",
  "/feeds/posts/default", "/news/rss",
];

export async function fetchRSSTitles(homepageUrl: string): Promise<string[]> {
  let base: string;
  try {
    base = new URL(homepageUrl).origin;
  } catch {
    return [];
  }

  for (const path of RSS_PATHS) {
    try {
      const res = await fetch(`${base}${path}`, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DiscoverMatrix/1.0; +https://discover-matrix.vercel.app)" },
      });
      if (!res.ok) continue;
      const text = await res.text();
      const titles = parseTitlesFromXML(text);
      if (titles.length >= 5) return titles.slice(0, 25);
    } catch {
      continue;
    }
  }
  return [];
}

function parseTitlesFromXML(xml: string): string[] {
  // Try CDATA-wrapped titles first (most Italian news sites)
  const cdataRe = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/g;
  const cdata = [...xml.matchAll(cdataRe)].map((m) => m[1].trim()).filter(isArticleTitle);
  if (cdata.length >= 5) return cdata;

  // Plain-text titles (skip first which is the feed name)
  const plainRe = /<title[^>]*>([\s\S]*?)<\/title>/g;
  const plain = [...xml.matchAll(plainRe)]
    .map((m) =>
      m[1]
        .replace(/<!\[CDATA\[|\]\]>/g, "")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
        .trim()
    )
    .filter(isArticleTitle);

  return plain.slice(1); // skip feed title
}

function isArticleTitle(t: string): boolean {
  return t.length >= 20 && !t.startsWith("<?") && !t.includes("<") && !t.includes("http");
}
