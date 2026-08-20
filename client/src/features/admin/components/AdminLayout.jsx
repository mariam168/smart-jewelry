import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/admin") {
      return "Dashboard";
    }

    if (path.includes("/technologies")) {
      return "Technologies";
    }

    if (path.includes("/technology-models")) {
      return "Technology Models";
    }

    if (path.includes("/smart-units")) {
      return "Smart Units";
    }

    if (path.includes("/products")) {
      return "Products";
    }

    if (path.includes("/manufacturing")) {
      return "Manufacturing Orders";
    }

    if (path.includes("/categories")) {
      return "Categories";
    }

    if (path.includes("/orders")) {
      return "Orders";
    }

    return "Admin Dashboard";
  };

  const pageTitle = getPageTitle();

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -right-48 top-20 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <div className="pointer-events-none fixed -left-40 bottom-0 h-[460px] w-[460px] rounded-full bg-light-champagne/50 blur-[120px]" />

      <AdminSidebar />

      <main className="relative min-h-screen lg:ml-72">
        <header className="sticky top-0 z-30 border-b border-light-champagne/80 bg-soft-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[78px] items-center justify-between px-6 sm:px-8 lg:px-10">
            <div className="flex items-center gap-4">
              <div className="hidden h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-[11px] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.13)] sm:flex">
                ✦
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
                    Smart Jewelry
                  </p>

                  <span className="h-px w-5 bg-classic-gold/45" />
                </div>

                <h1 className="mt-1 font-serif text-[1.3rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden items-center gap-2.5 rounded-full border border-light-champagne bg-warm-ivory/75 px-4 py-2.5 shadow-[0_5px_16px_rgba(7,19,31,0.03)] sm:flex">
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-classic-gold/30" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-classic-gold" />
                </span>

                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
                  Admin
                </span>
              </div>

              <div className="hidden h-8 w-px bg-light-champagne sm:block" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne-gold/20 bg-midnight-navy text-[10px] font-semibold text-champagne-gold shadow-[0_7px_18px_rgba(18,38,58,0.13)]">
                  A
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-[11px] font-semibold text-midnight-navy">
                    Administrator
                  </p>

                  <p className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-steel-gray">
                    Control Panel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="relative min-h-[calc(100vh-78px)] overflow-hidden">
          <div className="pointer-events-none absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.05] blur-[120px]" />

          <div className="pointer-events-none absolute -bottom-52 -left-40 h-[500px] w-[500px] rounded-full bg-soft-cream/80 blur-[120px]" />

          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-champagne-gold/20 to-transparent" />

          <div className="relative z-10 p-5 sm:p-7 lg:p-9 xl:p-10">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/60" />

                  <span className="text-[8px] text-classic-gold">✦</span>
                </div>

                <p className="max-w-xl text-[12px] leading-7 text-slate-gray sm:text-[13px]">
                  Manage your smart jewelry store and keep everything organized
                  from one place.
                </p>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                  Elegant
                </span>

                <span className="text-[8px] text-classic-gold">✦</span>

                <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                  Personal
                </span>

                <span className="text-[8px] text-classic-gold">✦</span>

                <span className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                  Smart
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-8 right-8 top-0 z-20 h-px bg-gradient-to-r from-transparent via-champagne-gold/55 to-transparent" />

              <div className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_16px_45px_rgba(7,19,31,0.045)] backdrop-blur-sm sm:p-7 lg:p-8">
                <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[75px]" />

                <div className="pointer-events-none absolute -bottom-28 -left-20 h-52 w-52 rounded-full bg-champagne-gold/[0.05] blur-[80px]" />

                <div className="relative">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative border-t border-light-champagne/80 bg-soft-white/55 px-6 py-5 backdrop-blur-sm sm:px-8 lg:px-10">
          <div className="mx-auto flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
              Smart Jewelry Admin Panel
            </p>

            <div className="flex items-center gap-3">
              <span className="h-px w-6 bg-classic-gold/35" />

              <span className="text-[7px] text-classic-gold">✦</span>

              <span className="h-px w-6 bg-classic-gold/35" />
            </div>

            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
              Management System
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
