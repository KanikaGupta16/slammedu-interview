"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PostCard } from "@/components/post-card";

async function fetchMyPosts(userId: string) {
  const params = new URLSearchParams();
  params.set("limit", "50");
  params.set("userId", userId);

  const res = await fetch(`/api/posts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json() as Promise<{
    posts: import("@/components/post-card").Post[];
    nextCursor: string | null;
  }>;
}

export default function MyPostsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", "my", session?.user?.id ?? ""],
    queryFn: () => fetchMyPosts(session!.user!.id),
    enabled: !!session?.user?.id,
  });

  if (isPending || !session) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session.user) {
    router.push("/");
    return null;
  }

  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="slammedu-section-label text-sm mb-1">My Posts</p>
          <h1 className="slammedu-display text-3xl md:text-4xl tracking-tight">Your posts</h1>
          <p className="slammedu-body text-base text-muted-foreground mt-2">Posts you&apos;ve shared with campus.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading your posts...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-destructive">Failed to load posts</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No posts yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create your first post using the + button in the sidebar
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
