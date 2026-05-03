"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/Button";

interface NavLink {
  label: string;
  href: string;
  adminOnly?: boolean;
}

const LINKS: NavLink[] = [
  { label: "Events", href: "/events" },
  { label: "Community", href: "/community" },
  { label: "Chat", href: "/chat" },
  { label: "Agents", href: "/agent", adminOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, profile, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const visibleLinks = LINKS.filter((l) => !l.adminOnly || isAdmin);

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-colors duration-200 ease-editorial",
          scrolled
            ? "border-b border-border bg-[#0F0F0F]/95 backdrop-blur-md"
            : "bg-transparent",
        )}
        aria-label="Primary navigation"
      >
        <div className="sahayak-container flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className="font-sans text-lg font-bold uppercase tracking-widest text-foreground"
          >
            Sahayak
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {visibleLinks.map((link) => {
              const active = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={active}
                  className={cn(
                    "link-underline font-sans text-sm uppercase tracking-widest",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {firebaseUser ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/onboarding"
                  className="flex items-center gap-3"
                  aria-label="Edit my profile"
                  title="Click to edit your profile"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden bg-muted">
                    {profile?.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-mono text-xs text-foreground">
                        {(profile?.displayName ?? "S").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-sans text-sm text-foreground hover:text-accent transition-colors">
                    {profile?.displayName ?? "Builder"}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await signOutUser();
                    router.push("/");
                  }}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <button
            type="button"
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="h-6 w-6" strokeWidth={1.5} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-[99] bg-background pt-20 md:hidden">
          <div className="sahayak-container flex flex-col gap-8 py-8">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-3xl uppercase tracking-tight text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-8 border-t border-border pt-8">
              {firebaseUser ? (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await signOutUser();
                    router.push("/");
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <Link href="/auth/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
