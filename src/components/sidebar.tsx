"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth-client";
import { Home, User, Settings, LogOut, Copy, Plus, Sun, Moon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreatePostModal } from "@/components/create-post-modal";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
}

const navItems = [
  {
    icon: Home,
    url: "/app",
    label: "Feed",
  },
  {
    icon: Copy,
    url: "/app/posts",
    label: "Posts",
  },
  {
    icon: User,
    url: "/app/user",
    label: "User",
  },
];

function SettingsMenuContent() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <DropdownMenuContent align="start" sideOffset={8} className="w-48">
      <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
        <LogOut className="size-4" />
        Sign Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

function SettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl size-12 text-muted-foreground hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="size-6" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <SettingsMenuContent />
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-2xl size-12 text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="size-6" strokeWidth={1.5} />
      ) : (
        <Moon className="size-6" strokeWidth={1.5} />
      )}
    </Button>
  );
}

function CreatePostButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-2xl size-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
      aria-label="Create Post"
      onClick={onClick}
    >
      <Plus className="size-6" strokeWidth={2} />
    </Button>
  );
}

interface NavIconProps {
  item: (typeof navItems)[0];
  isActive: boolean;
}

function NavIcon({ item, isActive }: NavIconProps) {
  const Icon = item.icon;

  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      className={cn(
        "rounded-2xl size-12",
        isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
      )}
    >
      <Link href={item.url} aria-label={item.label}>
        <Icon className="size-6" strokeWidth={isActive ? 2 : 1.5} />
      </Link>
    </Button>
  );
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const isActiveRoute = (url: string) => {
    if (url === "/app") return pathname === url;
    return pathname?.startsWith(url) ?? false;
  };

  if (isMobile === undefined) {
    return <div className="min-h-screen slammedu-textured-bg">{children}</div>;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen slammedu-textured-bg flex flex-col">
        <header
          className={cn(
            "fixed top-0 left-0 right-0 z-50",
            "bg-background/80 backdrop-blur-xl",
            "border-b border-border"
          )}
        >
          <div className="flex items-center justify-center px-4 py-3">
            <Link href="/app" className="font-bold text-lg text-primary">
              SlammedU
            </Link>
          </div>
        </header>

        <main className="flex-1 pt-14 pb-20">{children}</main>

        <nav
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-background/80 backdrop-blur-xl",
            "border-t border-border"
          )}
        >
          <div className="flex items-center justify-around px-1 py-1.5">
            <NavIcon item={navItems[0]} isActive={isActiveRoute(navItems[0].url)} />
            <NavIcon item={navItems[1]} isActive={isActiveRoute(navItems[1].url)} />
            <CreatePostButton onClick={() => setCreatePostOpen(true)} />
            <NavIcon item={navItems[2]} isActive={isActiveRoute(navItems[2].url)} />
            <SettingsMenu />
          </div>
        </nav>
        <CreatePostModal open={createPostOpen} onOpenChange={setCreatePostOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen slammedu-textured-bg flex">
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[72px] z-50",
          "bg-background/80 backdrop-blur-xl",
          "border-r border-border",
          "flex flex-col items-center py-5"
        )}
      >
        <Link href="/app" className="mb-4 cursor-pointer font-bold text-xl text-primary tracking-tight" title="SlammedU">
          SU
        </Link>

        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <NavIcon item={navItems[0]} isActive={isActiveRoute(navItems[0].url)} />
          <NavIcon item={navItems[1]} isActive={isActiveRoute(navItems[1].url)} />
          <CreatePostButton onClick={() => setCreatePostOpen(true)} />
          <NavIcon item={navItems[2]} isActive={isActiveRoute(navItems[2].url)} />
          <SettingsMenu />
        </div>

        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </aside>

      <CreatePostModal open={createPostOpen} onOpenChange={setCreatePostOpen} />
      <main className="flex-1 ml-[72px]">{children}</main>
    </div>
  );
}
