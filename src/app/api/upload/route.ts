import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file" }, { status: 400 });
  }
  const filename = `${uuid()}-${file.name}`;
  const blob = await put(filename, file, { access: "public" });
  return NextResponse.json({ success: true, url: blob.url });
}
