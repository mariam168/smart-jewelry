import { useEffect, useState } from "react";

import { getDashboardStats } from "../services/dashboardApi";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);

        setError("");

        const response = await getDashboardStats();

        setStats(response?.data || {});
      } catch (error) {
        console.error("Dashboard Stats Error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load dashboard statistics.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const dashboardStats = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      description: "Products in your catalog",
      icon: "◇",
      accent: "gold",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      description: "Orders placed by customers",
      icon: "✦",
      accent: "dark",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      description: "Registered customers",
      icon: "♢",
      accent: "gold",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      description: "Orders waiting for action",
      icon: "○",
      accent: "dark",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-midnight-navy px-7 py-8 shadow-[0_24px_65px_rgba(7,19,31,0.16)] sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-champagne-gold/10 blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-navy-soft/20 blur-[90px]" />

        <div className="pointer-events-none absolute -right-16 top-1/2 hidden h-56 w-56 -translate-y-1/2 rounded-full border border-champagne-gold/10 sm:block" />

        <div className="pointer-events-none absolute -right-4 top-1/2 hidden h-36 w-36 -translate-y-1/2 rounded-full border border-champagne-gold/10 sm:block" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-9 bg-classic-gold/70" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-champagne-gold">
              Administration
            </span>

            <span className="text-[7px] text-classic-gold">✦</span>
          </div>

          <h1 className="font-serif text-[2.6rem] font-normal leading-none tracking-[-0.04em] text-soft-white sm:text-[3.25rem]">
            Dashboard
          </h1>

          <p className="mt-4 max-w-[620px] text-[12px] leading-7 text-premium-silver/70 sm:text-[13px]">
            Welcome to your Smart Jewelry administration panel. Manage your
            products, orders, customers and store activity from one place.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-[7px] font-semibold uppercase tracking-[0.24em] text-premium-silver/35">
            <span>Elegant</span>

            <span className="text-classic-gold/75">✦</span>

            <span>Personal</span>

            <span className="text-classic-gold/75">✦</span>

            <span>Smart</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative overflow-hidden rounded-[18px] border border-antique-gold/25 bg-soft-cream/80 p-5 shadow-[0_8px_24px_rgba(7,19,31,0.035)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-champagne-gold/10 blur-[45px]" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[12px] text-champagne-gold shadow-[0_7px_18px_rgba(18,38,58,0.12)]">
              !
            </div>

            <div>
              <p className="text-[12px] font-semibold text-midnight-navy">
                Something went wrong
              </p>

              <p className="mt-1.5 text-[10px] leading-5 text-slate-gray">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-5">
        <div>
          <div className="mb-2.5 flex items-center gap-3">
            <span className="h-px w-7 bg-classic-gold/60" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
              Overview
            </span>
          </div>

          <h2 className="font-serif text-[1.6rem] font-normal tracking-[-0.025em] text-midnight-navy">
            Store Statistics
          </h2>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-light-champagne bg-soft-white/75 px-4 py-2 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-classic-gold/30" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-classic-gold" />
          </span>

          <span className="text-[7px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
            Live Data
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_32px_rgba(7,19,31,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-champagne-gold/55 hover:shadow-[0_20px_45px_rgba(7,19,31,0.08)]"
          >
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne-gold/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-soft-cream blur-[50px]" />

            <div className="relative flex items-start justify-between">
              <div
                className={`
                    flex h-12 w-12 items-center justify-center
                    rounded-full border text-[16px]
                    shadow-[0_7px_18px_rgba(7,19,31,0.06)]
                    transition-all duration-300
                    group-hover:scale-105
                    ${
                      stat.accent === "gold"
                        ? `
                          border-champagne-gold/30
                          bg-soft-cream
                          text-antique-gold
                        `
                        : `
                          border-champagne-gold/15
                          bg-midnight-navy
                          text-champagne-gold
                        `
                    }
                  `}
              >
                {stat.icon}
              </div>

              <span className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray/70">
                Smart
              </span>
            </div>

            <div className="relative mt-7">
              <p className="font-serif text-[2.4rem] font-normal leading-none tracking-[-0.035em] text-midnight-navy">
                {isLoading ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-light-champagne" />
                ) : (
                  Number(stat.value || 0).toLocaleString()
                )}
              </p>

              <p className="mt-3 text-[12px] font-semibold text-midnight-navy">
                {stat.title}
              </p>

              <p className="mt-1.5 text-[9px] leading-5 text-slate-gray">
                {stat.description}
              </p>
            </div>

            <div className="relative mt-6 flex items-center gap-2">
              <span className="h-px w-5 bg-classic-gold/45" />

              <span className="text-[7px] text-classic-gold">✦</span>

              <span className="h-px flex-1 bg-light-champagne" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[24px] border border-champagne-gold/15 bg-midnight-navy p-7 shadow-[0_20px_50px_rgba(7,19,31,0.15)] lg:col-span-2">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-champagne-gold/[0.06] blur-[65px]" />

          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-[12px] text-champagne-gold shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
              ✦
            </div>

            <h2 className="mt-6 font-serif text-[1.9rem] font-normal tracking-[-0.025em] text-soft-white">
              Welcome, Admin
              <span className="ml-2">👋</span>
            </h2>

            <p className="mt-3 max-w-2xl text-[12px] leading-7 text-premium-silver/70">
              From here you can manage your Smart Jewelry store, organize your
              products, monitor orders, and keep your entire catalog under
              control.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-premium-silver/35">
                Your Store
              </span>

              <span className="text-[7px] text-classic-gold">✦</span>

              <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-premium-silver/35">
                Your Control
              </span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-7 shadow-[0_10px_32px_rgba(7,19,31,0.04)] backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-soft-cream blur-[55px]" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.25em] text-steel-gray">
                System
              </p>

              <h3 className="mt-1.5 font-serif text-[1.4rem] font-normal text-midnight-navy">
                Store Status
              </h3>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-cream text-[10px] text-classic-gold">
              ✦
            </div>
          </div>

          <div className="relative mt-7 space-y-4">
            <div className="flex items-center justify-between border-b border-light-champagne/75 pb-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-classic-gold/20" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-classic-gold" />
                </span>

                <span className="text-[11px] text-slate-gray">
                  Product Catalog
                </span>
              </div>

              <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-antique-gold">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-light-champagne/75 pb-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-classic-gold/20" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-classic-gold" />
                </span>

                <span className="text-[11px] text-slate-gray">
                  Order System
                </span>
              </div>

              <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-antique-gold">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-classic-gold/20" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-classic-gold" />
                </span>

                <span className="text-[11px] text-slate-gray">Dashboard</span>
              </div>

              <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-antique-gold">
                Online
              </span>
            </div>
          </div>

          <div className="relative mt-7 border-t border-light-champagne/75 pt-5">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-classic-gold/35" />

              <span className="text-[8px] text-classic-gold">✦</span>

              <span className="h-px w-8 bg-classic-gold/35" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
