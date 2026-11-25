import sharp from "sharp";
import path from "path";

async function cropHero() {
  const meta = await sharp("public/images/reference-full.jpg").metadata();
  const W = meta.width;
  const H = meta.height;
  console.log("Full reference dimensions:", W, H);

  // Extract seamless hero background containing the wall, plant, folded table, iron, and open board
  // From right side (approx x: 0.38 to 1.0, y: 0.065 to 0.385)
  await sharp("public/images/reference-full.jpg")
    .extract({
      left: Math.round(0.38 * W),
      top: Math.round(0.063 * H),
      width: Math.round(0.62 * W),
      height: Math.round(0.325 * H)
    })
    .jpeg({ quality: 95 })
    .toFile("public/images/products/ironing-table-hero-bg.jpg");

  // Mobile dedicated crop (focused on table, folded board, iron, and wall)
  await sharp("public/images/reference-full.jpg")
    .extract({
      left: Math.round(0.42 * W),
      top: Math.round(0.063 * H),
      width: Math.round(0.58 * W),
      height: Math.round(0.325 * H)
    })
    .jpeg({ quality: 95 })
    .toFile("public/images/products/ironing-table-hero-mobile.jpg");

  console.log("Hero background images created successfully!");
}

cropHero().catch(console.error);
