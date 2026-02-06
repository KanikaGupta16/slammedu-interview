import { NextRequest, NextResponse } from "next/server";
import {
  supabase,
  supabaseAdmin,
  STORAGE_BUCKET,
} from "@/lib/supabase";
import { randomUUID } from "crypto";

function isBucketNotFound(error: { message?: string }): boolean {
  const msg = (error?.message ?? "").toLowerCase();
  return (
    msg.includes("bucket") &&
    (msg.includes("not found") ||
      msg.includes("does not exist") ||
      msg.includes("storagenotfound") ||
      msg.includes("nosuchbucket"))
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${randomUUID()}.${fileExtension}`;
    const filePath = `images/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const client = supabaseAdmin ?? supabase;

    let result = await client.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (result.error && isBucketNotFound(result.error)) {
      const { error: createError } = await client.storage.createBucket(
        STORAGE_BUCKET,
        { public: true }
      );
      if (createError) {
        console.error("Create bucket error:", createError);
        return NextResponse.json(
          { error: `Bucket not found. Create a bucket named "${STORAGE_BUCKET}" in Supabase Studio (Storage).` },
          { status: 500 }
        );
      }
      result = await client.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });
    }

    const { data, error } = result;

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = (supabaseAdmin ?? supabase).storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
