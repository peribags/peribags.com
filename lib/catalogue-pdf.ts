import "server-only";

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import sharp from "sharp";
import { siteConfig, formatPhone } from "@/lib/site";
import type { CategoryListingData } from "@/lib/services/storefront/products.service";

// A4 portrait, in points.
const PAGE = { w: 595.28, h: 841.89 };
const MARGIN = 40;
const COLS = 3;
const GAP = 16;
const ROW_GAP = 18;
/** Cap so generation stays fast and the file reasonable. */
const MAX_PRODUCTS = 60;

const INK = rgb(0.09, 0.09, 0.11);
const SUBTLE = rgb(0.42, 0.42, 0.47);
const LINE = rgb(0.84, 0.84, 0.86);
const TILE = rgb(0.96, 0.945, 0.92);

function rupees(paise: number | null): string {
  // Standard PDF fonts can't encode the ₹ glyph, so use "Rs".
  if (paise == null) return "Price on request";
  return `Rs ${new Intl.NumberFormat("en-IN").format(Math.round(paise / 100))}`;
}

/** Embed the brand logo (public/logo.webp) as a PNG. Null if unavailable. */
async function embedLogo(doc: PDFDocument): Promise<PDFImage | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const buf = await readFile(join(process.cwd(), "public", "logo.webp"));
    const png = await sharp(buf)
      .resize({ height: 140, withoutEnlargement: true })
      .png()
      .toBuffer();
    return await doc.embedPng(new Uint8Array(png));
  } catch {
    return null;
  }
}

/** Fetch a product image and normalise it to a small JPEG for embedding. */
async function fetchJpeg(url: string): Promise<Uint8Array | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());
    const out = await sharp(input)
      .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" }) // drop transparency onto white
      .jpeg({ quality: 78 })
      .toBuffer();
    return new Uint8Array(out);
  } catch {
    return null; // a missing/broken image just leaves an empty tile
  }
}

/** Greedy word-wrap into at most `maxLines` lines, ellipsising overflow. */
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);

  if (lines.length > maxLines) lines.length = maxLines;
  // Ellipsise the last line if the text didn't fully fit.
  const joined = lines.join(" ");
  if (joined.length < text.replace(/\s+/g, " ").length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (
      last.length > 1 &&
      font.widthOfTextAtSize(`${last}…`, size) > maxWidth
    ) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

type Fonts = { regular: PDFFont; bold: PDFFont };

/** Draw the masthead. Returns the y-from-top where the product grid starts. */
function drawHeader(
  page: PDFPage,
  fonts: Fonts,
  logo: PDFImage | null,
  categoryName: string,
  productCount: number,
  full: boolean,
): number {
  const { bold, regular } = fonts;
  let top = MARGIN;

  // Brand lockup — logo, "Peri Bag" wordmark, GST below (matches the header).
  const logoH = full ? 36 : 24;
  const logoW = logo ? logoH * (logo.width / logo.height) : 0;
  if (logo) {
    page.drawImage(logo, {
      x: MARGIN,
      y: PAGE.h - top - logoH,
      width: logoW,
      height: logoH,
    });
  }
  const textX = MARGIN + (logo ? logoW + 10 : 0);
  const brandSize = full ? 17 : 13;
  page.drawText(siteConfig.brand, {
    x: textX,
    y: PAGE.h - top - brandSize - 1,
    size: brandSize,
    font: bold,
    color: INK,
  });
  page.drawText(`GST ${siteConfig.gst}`, {
    x: textX,
    y: PAGE.h - top - logoH + (full ? 3 : 1),
    size: 7.5,
    font: regular,
    color: SUBTLE,
  });
  top += logoH;

  if (full) {
    top += 14;
    // Contact line
    const contact = `${formatPhone(siteConfig.phone)}   ·   ${siteConfig.email}   ·   ${siteConfig.url.replace(/^https?:\/\//, "")}`;
    page.drawText(contact, {
      x: MARGIN,
      y: PAGE.h - top - 8,
      size: 8.5,
      font: regular,
      color: SUBTLE,
    });
    top += 26;

    // Title block
    page.drawText("WHOLESALE CATALOGUE", {
      x: MARGIN,
      y: PAGE.h - top - 8,
      size: 8,
      font: bold,
      color: SUBTLE,
    });
    top += 16;
    page.drawText(categoryName, {
      x: MARGIN,
      y: PAGE.h - top - 24,
      size: 26,
      font: bold,
      color: INK,
    });
    top += 34;
    page.drawText(
      `${productCount} ${productCount === 1 ? "product" : "products"}`,
      { x: MARGIN, y: PAGE.h - top - 6, size: 9, font: regular, color: SUBTLE },
    );
    top += 16;
  } else {
    // Running header on later pages — brand lockup left, category right.
    const right = `${categoryName} · Wholesale Catalogue`;
    const rw = regular.widthOfTextAtSize(right, 8.5);
    page.drawText(right, {
      x: PAGE.w - MARGIN - rw,
      y: PAGE.h - top + logoH / 2 - 4,
      size: 8.5,
      font: regular,
      color: SUBTLE,
    });
    top += 6;
  }

  // Divider
  page.drawLine({
    start: { x: MARGIN, y: PAGE.h - top },
    end: { x: PAGE.w - MARGIN, y: PAGE.h - top },
    thickness: 0.75,
    color: LINE,
  });
  return top + 18;
}

function drawFooter(
  page: PDFPage,
  fonts: Fonts,
  pageNo: number,
  pageCount: number,
) {
  const y = MARGIN - 10;
  page.drawText(siteConfig.address.full, {
    x: MARGIN,
    y,
    size: 7,
    font: fonts.regular,
    color: SUBTLE,
  });
  const label = `Page ${pageNo} of ${pageCount}`;
  const w = fonts.regular.widthOfTextAtSize(label, 7.5);
  page.drawText(label, {
    x: PAGE.w - MARGIN - w,
    y,
    size: 7.5,
    font: fonts.regular,
    color: SUBTLE,
  });
}

/** Fit an image inside a box, centred, preserving aspect ratio. */
function drawContained(
  page: PDFPage,
  img: PDFImage,
  x: number,
  yTop: number,
  boxW: number,
  boxH: number,
) {
  const scale = Math.min(boxW / img.width, boxH / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  page.drawImage(img, {
    x: x + (boxW - w) / 2,
    y: PAGE.h - yTop - boxH + (boxH - h) / 2,
    width: w,
    height: h,
  });
}

/**
 * Generate a category-specific catalogue PDF: a masthead followed by a grid
 * of the category's products (image, name, price). Returns the PDF bytes.
 */
export async function buildCategoryCataloguePdf(
  data: CategoryListingData,
): Promise<Uint8Array> {
  const { category, products } = data;
  const shown = products.slice(0, MAX_PRODUCTS);

  const doc = await PDFDocument.create();
  doc.setTitle(`${category.name} — ${siteConfig.brand} Catalogue`);
  doc.setAuthor(siteConfig.brand);
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const logo = await embedLogo(doc);

  // Fetch + embed all images up front (in parallel).
  const jpegs = await Promise.all(shown.map((p) => fetchJpeg(p.imageUrl)));
  const images = await Promise.all(
    jpegs.map((bytes) => (bytes ? doc.embedJpg(bytes) : Promise.resolve(null))),
  );

  const cardW = (PAGE.w - 2 * MARGIN - (COLS - 1) * GAP) / COLS;
  const imgBoxH = cardW * (5 / 4); // 4:5 portrait image area
  const nameSize = 8.5;
  const priceSize = 8.5;
  const textBlockH = 8 + 2 * (nameSize + 2) + 4 + (priceSize + 2);
  const cardH = imgBoxH + textBlockH;
  const footerReserve = MARGIN + 6;

  const pages: PDFPage[] = [];
  let page = doc.addPage([PAGE.w, PAGE.h]);
  pages.push(page);
  let contentTop = drawHeader(
    page,
    fonts,
    logo,
    category.name,
    products.length,
    true,
  );
  let col = 0;
  let rowTop = contentTop;

  if (shown.length === 0) {
    page.drawText("No products are listed in this category yet.", {
      x: MARGIN,
      y: PAGE.h - contentTop - 14,
      size: 11,
      font: fonts.regular,
      color: SUBTLE,
    });
  }

  for (let i = 0; i < shown.length; i++) {
    // New row?
    if (col === 0 && rowTop + cardH > PAGE.h - footerReserve) {
      page = doc.addPage([PAGE.w, PAGE.h]);
      pages.push(page);
      rowTop = drawHeader(
        page,
        fonts,
        logo,
        category.name,
        products.length,
        false,
      );
    }

    const product = shown[i];
    const x = MARGIN + col * (cardW + GAP);

    // Image tile
    page.drawRectangle({
      x,
      y: PAGE.h - rowTop - imgBoxH,
      width: cardW,
      height: imgBoxH,
      color: TILE,
    });
    const img = images[i];
    if (img) drawContained(page, img, x, rowTop, cardW, imgBoxH);

    // Name (max 2 lines)
    let textTop = rowTop + imgBoxH + 8 + nameSize;
    for (const line of wrapText(product.name, fonts.bold, nameSize, cardW, 2)) {
      page.drawText(line, {
        x,
        y: PAGE.h - textTop,
        size: nameSize,
        font: fonts.bold,
        color: INK,
      });
      textTop += nameSize + 2;
    }

    // Price
    page.drawText(rupees(product.pricePaise), {
      x,
      y: PAGE.h - (rowTop + imgBoxH + 8 + 2 * (nameSize + 2) + 4 + priceSize),
      size: priceSize,
      font: fonts.regular,
      color: SUBTLE,
    });

    col += 1;
    if (col === COLS) {
      col = 0;
      rowTop += cardH + ROW_GAP;
    }
  }

  if (products.length > shown.length) {
    const note = `+ ${products.length - shown.length} more products — visit ${siteConfig.url.replace(/^https?:\/\//, "")}/category/${category.slug}`;
    const yTop = col === 0 ? rowTop : rowTop + cardH + ROW_GAP;
    if (yTop + 16 < PAGE.h - footerReserve) {
      page.drawText(note, {
        x: MARGIN,
        y: PAGE.h - yTop - 10,
        size: 8.5,
        font: fonts.regular,
        color: SUBTLE,
      });
    }
  }

  pages.forEach((p, i) => drawFooter(p, fonts, i + 1, pages.length));

  return doc.save();
}
