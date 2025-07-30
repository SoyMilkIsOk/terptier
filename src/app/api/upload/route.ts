import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuid } from "uuid";
import sharp from "sharp";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "No file" },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { success: false, error: "Only image uploads are allowed" },
      { status: 400 }
    );
  }

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length > MAX_SIZE) {
    try {
      buffer = await sharp(buffer)
        .resize({ width: 1280, height: 1280, fit: "inside" })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (err) {
      console.error("Failed to resize image", err);
    }
  }

  if (buffer.length > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: "File too large" },
      { status: 400 }
    );
  }

  const filename = `${uuid()}-${file.name}`;
  const blob = await put(filename, buffer, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return NextResponse.json({ success: true, url: blob.url });
}
