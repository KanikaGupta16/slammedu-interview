"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export type Post = {
  id: string;
  userId: string;
  image: string;
  caption: string;
  createdAt: string | null;
  userName: string;
  userImage: string | null;
};

export function PostCard({ post }: { post: Post }) {
  const initials = post.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Avatar className="size-10">
          <AvatarImage src={post.userImage ?? undefined} alt={post.userName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-sm">{post.userName}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-square w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.caption || "Post image"}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        {post.caption && (
          <p className="px-6 py-3 text-sm">{post.caption}</p>
        )}
      </CardContent>
      <CardFooter className="border-t py-3" />
    </Card>
  );
}
