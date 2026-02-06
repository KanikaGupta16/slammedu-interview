"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { PostCard } from "@/components/post-card";

async function fetchPosts(cursor?: string | null, userId?: string | null) {
  const params = new URLSearchParams();
  params.set("limit", "10");
  if (cursor) params.set("cursor", cursor);
  if (userId) params.set("userId", userId);

  const res = await fetch(`/api/posts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json() as Promise<{
    posts: import("@/components/post-card").Post[];
    nextCursor: string | null;
  }>;
}

function FeedContent() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(pageParam, null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0, rootMargin: "100px" }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading feed...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-destructive">Failed to load feed</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground mb-2">
          No posts yet
        </p>
        <p className="text-sm text-muted-foreground">
          Be the first to create a post using the + button
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={sentinelRef} className="h-4" aria-hidden />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="slammedu-section-label text-sm mb-1">Feed</p>
          <h1 className="slammedu-display text-3xl md:text-4xl tracking-tight">Stay in the loop. Never miss a beat.</h1>
          <p className="slammedu-body text-base text-muted-foreground mt-2">Real-time campus buzz and updates from your people.</p>
        </div>
        <FeedContent />
      </div>
    </div>
  );
}
