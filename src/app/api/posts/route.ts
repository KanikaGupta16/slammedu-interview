import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts, user } from "@/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";
import { randomUUID } from "crypto";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const userId = searchParams.get("userId");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) ||
        DEFAULT_LIMIT,
      MAX_LIMIT
    );

    const selectFields = {
      id: posts.id,
      userId: posts.userId,
      image: posts.image,
      caption: posts.caption,
      createdAt: posts.createdAt,
      userName: user.name,
      userImage: user.image,
    };

    const baseQuery = db
      .select(selectFields)
      .from(posts)
      .innerJoin(user, eq(posts.userId, user.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit + 1);

    const whereClause =
      userId && cursor
        ? and(eq(posts.userId, userId), lt(posts.createdAt, new Date(cursor)))
        : userId
          ? eq(posts.userId, userId)
          : cursor
            ? lt(posts.createdAt, new Date(cursor))
            : undefined;

    const results =
      whereClause
        ? await db
            .select(selectFields)
            .from(posts)
            .innerJoin(user, eq(posts.userId, user.id))
            .where(whereClause)
            .orderBy(desc(posts.createdAt))
            .limit(limit + 1)
        : await baseQuery;

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? lastItem.createdAt?.toISOString() ?? null
        : null;

    return NextResponse.json({
      posts: items.map((p) => ({
        ...p,
        createdAt: p.createdAt?.toISOString(),
      })),
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { image, caption } = body as { image?: string; caption?: string };

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    await db.insert(posts).values({
      id,
      userId: session.user.id,
      image,
      caption: typeof caption === "string" ? caption : "",
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
