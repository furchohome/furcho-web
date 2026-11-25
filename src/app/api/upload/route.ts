import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getAdminSession } from "@/lib/auth";

const FOLDER_MAP: Record<string, string> = {
  products: "furcho/products",
  banners: "furcho/banners",
  categories: "furcho/categories",
  enquiries: "furcho/enquiries",
  quotations: "furcho/quotations",
};

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret || apiKey.startsWith("your-") || apiSecret.startsWith("your-")) {
    return null;
  }
  return { cloudName, apiKey, apiSecret };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload." }, { status: 400 });
    }

    // Only public enquiry attachments may be uploaded without an admin session
    if (folder !== "enquiries") {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized. Admin login required." }, { status: 401 });
      }
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload JPG, PNG, WebP, AVIF or PDF." },
        { status: 400 }
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum size limit of 8 MB." }, { status: 400 });
    }

    const cfg = cloudinaryConfig();
    const cloudFolder = FOLDER_MAP[folder] || "furcho/misc";

    // 1. Cloudinary signed upload (server-side; API secret never reaches the browser)
    if (cfg) {
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign = `folder=${cloudFolder}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash("sha1")
        .update(paramsToSign + cfg.apiSecret)
        .digest("hex");

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", cfg.apiKey);
      body.append("timestamp", String(timestamp));
      body.append("folder", cloudFolder);
      body.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || "Cloudinary upload failed." },
          { status: 502 }
        );
      }
      return NextResponse.json({
        url: data.secure_url,
        publicId: data.public_id,
        name: file.name,
        provider: "CLOUDINARY",
      });
    }

    // 2. Local dev fallback when Cloudinary credentials are not configured yet
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Set CLOUDINARY_* environment variables." },
        { status: 500 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".jpg";
    const base = path.basename(file.name, ext).toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const fileName = `${base}-${Date.now()}${ext}`;
    const uploadDir = path.resolve(process.cwd(), "public", "uploads", folder);
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    return NextResponse.json({
      url: `/uploads/${folder}/${fileName}`,
      name: file.name,
      provider: "LOCAL_STORAGE",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
