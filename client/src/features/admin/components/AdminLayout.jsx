import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/admin") {
      return t("adminLayout.dashboard");
    }

    if (path.includes("/technologies")) {
      return t("adminLayout.technologies");
    }

    if (path.includes("/technology-models")) {
      return t("adminLayout.technologyModels");
    }

    if (path.includes("/smart-units")) {
      return t("adminLayout.smartUnits");
    }

    if (path.includes("/products")) {
      return t("adminLayout.products");
    }

    if (path.includes("/manufacturing")) {
      return t("adminLayout.manufacturingOrders");
    }

    if (path.includes("/categories")) {
      return t("adminLayout.categories");
    }

    if (path.includes("/orders")) {
      return t("adminLayout.orders");
    }

    return t("adminLayout.adminDashboard");
  };

  const pageTitle = getPageTitle();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ee] text-midnight-navy">
      {/* Ambient background */}
      <div className="pointer-events-none fixed -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.07] blur-[120px]" />

      <div className="pointer-events-none fixed -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#e8dfd1]/50 blur-[120px]" />

      <div className="pointer-events-none fixed left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-[130px]" />

      <AdminSidebar />

      <main className="relative min-h-screen lg:ml-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-[#e8dfd1]/80 bg-[#fbfaf7]/90 shadow-[0_4px_25px_rgba(18,38,58,0.025)] backdrop-blur-2xl">
          <div className="mx-auto flex h-[82px] items-center justify-between px-5 sm:px-8 lg:px-10">
            {/* Page identity */}
            <div className="flex min-w-0 items-center gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-champagne-gold/25 bg-midnight-navy text-[13px] text-champagne-gold shadow-[0_10px_25px_rgba(18,38,58,0.12)] sm:flex">
                ✦
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-steel-gray">
                    {t("adminLayout.smartJewelry")}
                  </p>

                  <span className="h-px w-7 bg-classic-gold/50" />
                </div>

                <h1 className="truncate font-serif text-[1.45rem] font-normal leading-none tracking-[-0.02em] text-midnight-navy sm:text-[1.6rem]">
                  {pageTitle}
                </h1>
              </div>
            </div>

            {/* Admin profile */}
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden items-center gap-2.5 rounded-full border border-[#e8dfd1] bg-white/70 px-4 py-2.5 shadow-[0_5px_18px_rgba(7,19,31,0.025)] sm:flex">
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-classic-gold/25" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-classic-gold" />
                </span>

                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-gray">
                  {t("adminLayout.admin")}
                </span>
              </div>

              <div className="hidden h-9 w-px bg-[#e8dfd1] sm:block" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-[10px] font-semibold text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.13)]">
                  A
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-[11px] font-semibold text-midnight-navy">
                    {t("adminLayout.administrator")}
                  </p>

                  <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-steel-gray">
                    {t("adminLayout.controlPanel")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative min-h-[calc(100vh-82px)] overflow-hidden">
          {/* Background decorations */}
          <div className="pointer-events-none absolute -right-48 -top-48 h-[560px] w-[560px] rounded-full bg-champagne-gold/[0.045] blur-[130px]" />

          <div className="pointer-events-none absolute -bottom-52 -left-40 h-[520px] w-[520px] rounded-full bg-[#e9e1d5]/65 blur-[125px]" />

          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[65%] -translate-x-1/2 bg-gradient-to-r from-transparent via-champagne-gold/30 to-transparent" />

          <div className="relative z-10 p-4 sm:p-7 lg:p-9 xl:p-10">
            {/* Intro section */}
            <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-10 bg-classic-gold/60" />

                  <span className="text-[9px] text-classic-gold">✦</span>

                  <span className="h-px w-4 bg-classic-gold/25" />
                </div>

                <p className="max-w-2xl text-[12px] leading-7 text-slate-gray sm:text-[13px]">
                  {t("adminLayout.manageDescription")}
                </p>
              </div>

              <div className="hidden items-center gap-3 rounded-full border border-[#e8dfd1]/80 bg-white/45 px-4 py-2.5 shadow-[0_5px_18px_rgba(7,19,31,0.02)] sm:flex">
                <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                  {t("adminLayout.elegant")}
                </span>

                <span className="text-[7px] text-classic-gold">✦</span>

                <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                  {t("adminLayout.personal")}
                </span>

                <span className="text-[7px] text-classic-gold">✦</span>

                <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                  {t("adminLayout.smart")}
                </span>
              </div>
            </div>

            {/* Main panel */}
            <div className="relative">
              {/* Gold accent */}
              <div className="absolute left-10 right-10 top-0 z-20 h-px bg-gradient-to-r from-transparent via-champagne-gold/65 to-transparent" />

              <div className="relative overflow-hidden rounded-[30px] border border-[#e5ddcf] bg-[#fffdfa]/90 shadow-[0_22px_65px_rgba(18,38,58,0.055)] backdrop-blur-xl">
                {/* Inner glow */}
                <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#eee5d7]/65 blur-[80px]" />

                <div className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-champagne-gold/[0.045] blur-[85px]" />

                <div className="pointer-events-none absolute right-[15%] top-0 h-32 w-32 rounded-full bg-white/70 blur-[60px]" />

                {/* Content */}
                <div className="relative z-10 p-5 sm:p-7 lg:p-9">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative border-t border-[#e8dfd1]/80 bg-[#fbfaf7]/70 px-6 py-6 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
              {t("adminLayout.smartJewelryAdminPanel")}
            </p>

            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/35" />

              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-classic-gold/20 bg-white/60 text-[7px] text-classic-gold">
                ✦
              </span>

              <span className="h-px w-8 bg-classic-gold/35" />
            </div>

            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
              {t("adminLayout.managementSystem")}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;