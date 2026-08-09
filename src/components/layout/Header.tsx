import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bike, Wrench, Package, MapPin, Search, Menu, User2, Heart, LogOut, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const MODULES = [
  { to: "/motosikletler", label: "Motosikletler", icon: Bike, color: "text-moto" },
  { to: "/parca-aksesuar", label: "Parça & Aksesuar", icon: Package, color: "text-parca" },
  { to: "/kurye-ilanlari", label: "Kurye İlanları", icon: Wrench, color: "text-kurye" },
  { to: "/servisler", label: "Servisler", icon: MapPin, color: "text-servis" },
] as const;

export function Header() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    void navigate({ to: "/motosikletler", search: q ? { q } : {} });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Bike className="size-5" />
          </span>
          <span className="font-display text-2xl font-bold tracking-wide">MotoHub</span>
        </Link>

        <form onSubmit={submitSearch} className="relative ml-2 hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Marka, model veya kelime ara..."
            className="pl-9"
            maxLength={80}
            aria-label="Site içi arama"
          />
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          {MODULES.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname.startsWith(m.to) && "bg-secondary text-foreground",
              )}
            >
              <m.icon className={cn("size-4", m.color)} />
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/motosikletler/ilan-ver">
              <Plus className="size-4" /> İlan Ver
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Hesabım">
                  <User2 className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link to="/hesabim">Panelim</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/hesabim" search={{ tab: "favoriler" }}>
                    <Heart className="size-4" /> Favorilerim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/hesabim/mesajlar">Mesajlarım</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOut className="size-4" /> Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/giris">Giriş Yap</Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menü">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <div className="mt-6 flex flex-col gap-1">
                {MODULES.map((m) => (
                  <Link
                    key={m.to}
                    to={m.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary"
                  >
                    <m.icon className={cn("size-4", m.color)} />
                    {m.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />
                <Link
                  to="/motosikletler/ilan-ver"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary"
                >
                  İlan Ver
                </Link>
                <Link
                  to={user ? "/hesabim" : "/giris"}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary"
                >
                  {user ? "Panelim" : "Giriş Yap"}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <form onSubmit={submitSearch} className="relative border-t border-border px-4 py-2 md:hidden">
        <Search className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara..."
          className="pl-9"
          maxLength={80}
          aria-label="Site içi arama"
        />
      </form>
    </header>
  );
}
