import { db } from "../src/db";
import { user, posts } from "../src/db/schema";
import { randomUUID } from "crypto";

// Fixed IDs so re-running seed works (users may already exist)
const SEED_USERS = [
  {
    id: "seed-user-alex-000000000001",
    name: "Alex Chen",
    email: "alex@example.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  },
  {
    id: "seed-user-jordan-00000000002",
    name: "Jordan Taylor",
    email: "jordan@example.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
  },
  {
    id: "seed-user-sam-000000000003",
    name: "Sam Williams",
    email: "sam@example.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
  },
];

const SEED_POSTS = [
  { userId: 0, caption: "Just wrapped up an amazing study session! 📚", imageIndex: 1 },
  { userId: 0, caption: "Campus views never get old", imageIndex: 2 },
  { userId: 1, caption: "New project incoming 🚀", imageIndex: 3 },
  { userId: 1, caption: "Coffee and code – the perfect combo", imageIndex: 4 },
  { userId: 1, caption: "Collaboration is key!", imageIndex: 5 },
  { userId: 2, caption: "Sunset study vibes", imageIndex: 6 },
  { userId: 2, caption: "Breakthrough moment today", imageIndex: 7 },
  { userId: 0, caption: "Weekend mode activated", imageIndex: 8 },
];

const PICSUM_IMAGES = SEED_POSTS.map(
  (_, i) => `https://picsum.photos/seed/slammedu${i}/600/600`
);

async function seed() {
  console.log("Seeding database...");

  for (const u of SEED_USERS) {
    await db
      .insert(user)
      .values({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
        image: u.image,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing({ target: user.id });
    console.log(`  Added user: ${u.name}`);
  }

  for (let i = 0; i < SEED_POSTS.length; i++) {
    const p = SEED_POSTS[i];
    const userId = SEED_USERS[p.userId].id;
    const imageUrl = PICSUM_IMAGES[i];

    await db.insert(posts).values({
      id: randomUUID(),
      userId,
      image: imageUrl,
      caption: p.caption,
      createdAt: new Date(Date.now() - (SEED_POSTS.length - i) * 3600000),
    });
  }

  console.log(`  Added ${SEED_POSTS.length} posts`);
  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
