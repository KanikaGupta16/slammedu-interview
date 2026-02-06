"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const updateUser = authClient.updateUser;

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = session?.user;

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);
  const displayName = name || user?.name || "";
  const displayImage = user?.image;

  if (isPending || !session) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      let imageUrl = user.image ?? undefined;
      const file = fileInputRef.current?.files?.[0];

      if (file) {
        if (!file.type.startsWith("image/")) {
          setError("Please select an image file");
          setSaving(false);
          return;
        }

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
        imageUrl = url;
      }

      const newName = name.trim() || user.name || "";
      const { error: updateError } = await updateUser({
        name: newName,
        image: imageUrl ?? undefined,
      });

      if (updateError) {
        throw new Error(updateError.message || "Failed to update profile");
      }

      setSuccess(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <Avatar className="size-20">
                <AvatarImage src={displayImage ?? undefined} alt={displayName} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <CardTitle className="text-lg">{displayName || "User"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Profile picture</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => setError("")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  Change photo
                </Button>
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              {success && (
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Profile updated successfully
                </p>
              )}

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
