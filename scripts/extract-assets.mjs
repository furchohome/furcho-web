import sharp from "sharp";
import fs from "fs";
import path from "path";

const SOURCE_IMAGE =
  "C:/Users/da/.gemini/antigravity/brain/96ed036e-6fe0-491e-aa2e-68e9dcff4d96/.user_uploaded/media_1795356842185_b21967b7.jpg";
const OUT_DIR = path.resolve("./public/images");

async function extract() {
  fs.mkdirSync(path.join(OUT_DIR, "products"), { recursive: true });
  fs.mkdirSync(path.join(OUT_DIR, "categories"), { recursive: true });
  fs.mkdirSync(path.join(OUT_DIR, "banners"), { recursive: true });
  fs.mkdirSync(path.join(OUT_DIR, "brand"), { recursive: true });

  // Copy full reference too
  fs.copyFileSync(SOURCE_IMAGE, path.join(OUT_DIR, "reference-full.jpg"));

  const meta = await sharp(SOURCE_IMAGE).metadata();
  const W = meta.width || 668;
  const H = meta.height || 1024;
  console.log(`Source reference dimensions: ${W}x${H}`);

  const crop = async (relLeft, relTop, relWidth, relHeight, outFile) => {
    const left = Math.max(0, Math.round(relLeft * W));
    const top = Math.max(0, Math.round(relTop * H));
    const width = Math.min(W - left, Math.round(relWidth * W));
    const height = Math.min(H - top, Math.round(relHeight * H));
    await sharp(SOURCE_IMAGE)
      .extract({ left, top, width, height })
      .jpeg({ quality: 95 })
      .toFile(path.join(OUT_DIR, outFile));
  };

  // 1. Furcho Logo
  await crop(0.035, 0.024, 0.175, 0.036, "brand/furcho-logo.jpg");

  // 2. Hero Product Composite (Foldable Wall-Mounted Ironing Table: Open & Folded on Wall)
  await crop(0.41, 0.068, 0.585, 0.302, "products/ironing-table-hero.jpg");

  // 3. Ironing Table - Folded Upright on Wall View
  await crop(0.58, 0.072, 0.30, 0.135, "products/ironing-table-folded.jpg");

  // 4. Ironing Table - Open Wall-Mounted View with Iron & Shirt
  await crop(0.415, 0.178, 0.565, 0.18, "products/ironing-table-usage.jpg");

  // 5. Ironing Table - Clean Open View (from Trending Card 1)
  await crop(0.035, 0.723, 0.184, 0.083, "products/ironing-table-open.jpg");

  // 6. Shop By Category Photos
  await crop(0.031, 0.436, 0.302, 0.092, "categories/kitchen.jpg");
  await crop(0.349, 0.436, 0.302, 0.092, "categories/bedroom.jpg");
  await crop(0.668, 0.436, 0.302, 0.092, "categories/home-accessories.jpg");

  // 7. Premium Living Banner (Full & Right side dining room)
  await crop(0.031, 0.573, 0.938, 0.105, "banners/premium-banner-full.jpg");
  await crop(0.32, 0.573, 0.648, 0.105, "banners/premium-dining-hero.jpg");

  // 8. Trending Products (Exact 5 cards from reference)
  await crop(0.232, 0.723, 0.184, 0.088, "products/wooden-kitchen-utility-table.jpg");
  await crop(0.425, 0.723, 0.176, 0.088, "products/compact-shoe-rack.jpg");
  await crop(0.606, 0.723, 0.178, 0.088, "products/bedside-table.jpg");
  await crop(0.793, 0.723, 0.175, 0.088, "products/wall-mounted-shelf.jpg");

  // 9. Bottom Section Promo Photos
  await crop(0.275, 0.914, 0.215, 0.082, "banners/custom-design-bed.jpg");
  await crop(0.755, 0.914, 0.212, 0.082, "banners/commercial-restaurant.jpg");

  console.log("All visual assets extracted successfully to public/images/");
}

extract().catch((err) => {
  console.error("Error extracting assets:", err);
  process.exit(1);
});
