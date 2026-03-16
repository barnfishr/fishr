import * as cheerio from "cheerio";
import { ScrapedContent } from "./types";

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  // Normalize URL
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Fetch the page
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html: string;
  try {
    const res = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; fishr/1.0; +https://fishr.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Site returned status ${res.status}`);
    }

    html = await res.text();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out after 15 seconds");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  // Parse HTML
  const $ = cheerio.load(html);

  // Remove nav, footer, scripts, styles, iframes
  $("nav, footer, script, style, iframe, noscript, svg, header").remove();

  // Extract content
  const title = $("title").first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || "";

  const headings: { level: number; text: string }[] = [];
  $("h1, h2, h3").each((_, el) => {
    const tag = $(el).prop("tagName")?.toLowerCase() || "";
    const level = parseInt(tag.replace("h", ""), 10);
    const text = $(el).text().trim();
    if (text) {
      headings.push({ level, text });
    }
  });

  const paragraphs: string[] = [];
  $("p, li").each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 10) {
      paragraphs.push(text);
    }
  });

  // Extract CTAs (buttons and prominent links)
  const ctas: string[] = [];
  $('a[href], button, [role="button"], input[type="submit"]').each((_, el) => {
    const text =
      $(el).text().trim() || $(el).attr("value")?.trim() || "";
    if (text && text.length > 1 && text.length < 60) {
      ctas.push(text);
    }
  });

  // Deduplicate and limit
  const uniqueCtas = [...new Set(ctas)].slice(0, 20);
  const uniqueParagraphs = [...new Set(paragraphs)].slice(0, 50);

  if (headings.length === 0 && uniqueParagraphs.length === 0) {
    throw new Error(
      "Could not extract meaningful content from this page. It may use client-side rendering."
    );
  }

  return {
    url: normalizedUrl,
    title,
    headings,
    paragraphs: uniqueParagraphs,
    ctas: uniqueCtas,
    metaDescription,
  };
}
