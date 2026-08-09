import { Link } from "@tanstack/react-router";
import { Bike } from "lucide-react";

import { MODULES } from "./Header";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Bike className="size-5" />
            </span>
            <span className="font-display text-2xl font-bold">MotoHub</span>
          </div>
          <p className="mt-3 text-sm text-ink-foreground/70">
            Türkiye'nin motosiklet ekosistemi: ilanlar, yedek parça, kurye işleri ve servis haritası
            tek bir yerde.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg">Modüller</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-foreground/70">
            {MODULES.map((m) => (
              <li key={m.to}>
                <Link to={m.to} className="hover:text-ink-foreground">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg">Hesap</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/giris" className="hover:text-ink-foreground">
                Giriş Yap
              </Link>
            </li>
            <li>
              <Link to="/kayit" className="hover:text-ink-foreground">
                Üye Ol
              </Link>
            </li>
            <li>
              <Link to="/hesabim" className="hover:text-ink-foreground">
                Panelim
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg">İlan Ver</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/motosikletler/ilan-ver" className="hover:text-ink-foreground">
                Motosiklet İlanı
              </Link>
            </li>
            <li>
              <Link to="/parca-aksesuar/ilan-ver" className="hover:text-ink-foreground">
                Parça & Aksesuar İlanı
              </Link>
            </li>
            <li>
              <Link to="/kurye-ilanlari/ilan-ver" className="hover:text-ink-foreground">
                Kurye Arıyorum İlanı
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ink-foreground/60">
        © {new Date().getFullYear()} MotoHub — Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
