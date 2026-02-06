"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const reset = () => {
    setCaption("");
    setImageUrl(null);
    setFile(null);
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setError("");
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select an image");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      const { url } = (await uploadRes.json()) as { url: string };

      setSubmitting(true);
      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url, caption: caption.trim() }),
      });

      if (!postRes.ok) {
        const data = await postRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create post");
      }

      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      setSuccess(true);
      setTimeout(() => handleClose(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const busy = uploading || submitting;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />
      <Card className="relative z-10 w-full max-w-md rounded-xl bg-card border-border shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle id="create-post-title" className="font-semibold text-foreground">Create Post</CardTitle>
            <CardDescription className="text-muted-foreground font-normal">Share a photo with your campus</CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-image">Image</Label>
              <input
                id="post-image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {imageUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="size-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                >
                  Change image
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed py-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
              >
                Click to select image
              </Button>
            )}

            <div className="space-y-2">
              <Label htmlFor="post-caption">Caption</Label>
              <Input
                id="post-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="resize-none"
                disabled={busy}
              />
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {success ? (
              <p className="text-muted-foreground text-sm">Posted successfully!</p>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !file}>
                  {busy ? "Posting..." : "Post"}
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
