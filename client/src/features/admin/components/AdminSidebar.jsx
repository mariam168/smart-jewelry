import { NavLink } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../auth/context/AuthContext";

const AdminSidebar = () => {
  const { user } = useAuth();

  const { t, i18n } = useTranslation();

  const isSuperAdmin = user?.role?.name === "super_admin";

  const menuItems = [
    ...(isSuperAdmin
      ? [
          {
            label: t("adminSidebar.dashboard"),
            path: "/admin",
          },
          {
            label: t("adminSidebar.users"),
            path: "/admin/users",
          },
          {
            label: t("adminSidebar.finance"),
            path: "/admin/finance",
          },
        ]
      : []),

    {
      label: t("adminSidebar.shipping"),
      path: "/admin/shipping",
    },

    {
      label: t("adminSidebar.technologies"),
      path: "/admin/technologies",
    },

    {
      label: t("adminSidebar.technologyModels"),
      path: "/admin/technology-models",
    },

    {
      label: t("adminSidebar.smartUnits"),
      path: "/admin/smart-units",
    },

    {
      label: t("adminSidebar.products"),
      path: "/admin/products",
    },

    {
      label: t("adminSidebar.manufacturingOrders"),
      path: "/admin/manufacturing",
    },

    {
      label: t("adminSidebar.categories"),
      path: "/admin/categories",
    },

    {
      label: t("adminSidebar.orders"),
      path: "/admin/orders",
    },

    {
      label: t("adminSidebar.experienceMediaSettings"),
      path: "/admin/experience-media-settings",
    },
  ];

  const handleLanguageChange = () => {
    i18n.changeLanguage(
      i18n.language === "ar" ? "en" : "ar"
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col overflow-hidden border-r border-soft-white/10 bg-midnight-navy text-soft-white shadow-[18px_0_55px_rgba(7,19,31,0.12)] lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-rich-navy via-midnight-navy to-luxury-black" />

      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-champagne-gold/10 blur-[90px]" />

      <div className="pointer-events-none absolute -bottom-32 -left-28 h-80 w-80 rounded-full bg-navy-soft/20 blur-[90px]" />

      <div className="pointer-events-none absolute right-0 top-[26%] h-64 w-64 rounded-full border border-champagne-gold/[0.05]" />

      <div className="relative z-10 shrink-0 border-b border-soft-white/[0.08] px-6 py-7">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-[15px] text-champagne-gold shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-sm">
            <span className="absolute inset-1 rounded-full border border-champagne-gold/10" />

            <span className="relative">✦</span>
          </div>

          <div>
            <h1 className="font-serif text-[1.25rem] font-normal tracking-[-0.02em] text-soft-white">
              {t("adminSidebar.smartJewelry")}
            </h1>

            <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.3em] text-premium-silver/45">
              {t("adminSidebar.adminPanel")}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-champagne-gold/25" />

          <span className="text-[7px] text-classic-gold">✦</span>

          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-champagne-gold/25" />
        </div>

        <button
          type="button"
          onClick={handleLanguageChange}
          className="group mt-6 flex w-full items-center justify-between rounded-[12px] border border-champagne-gold/15 bg-soft-white/[0.035] px-4 py-3 transition-all duration-300 hover:border-champagne-gold/35 hover:bg-soft-white/[0.07]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-champagne-gold/15 bg-soft-white/[0.04] text-[9px] text-champagne-gold transition-all duration-300 group-hover:bg-champagne-gold/10">
              ✦
            </span>

            <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-premium-silver/60 group-hover:text-soft-white">
              {i18n.language === "ar" ? "العربية" : "English"}
            </span>
          </div>

          <span className="text-[10px] text-champagne-gold transition-transform duration-300 group-hover:translate-x-0.5">
            {i18n.language === "ar" ? "EN" : "AR"}
          </span>
        </button>
      </div>

      <nav className="admin-sidebar-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
        <div className="mb-4 flex items-center gap-3 px-3">
          <span className="h-px w-6 bg-classic-gold/45" />

          <p className="text-[7px] font-semibold uppercase tracking-[0.3em] text-premium-silver/40">
            {t("adminSidebar.management")}
          </p>
        </div>

        <div className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `   
group relative flex min-h-[48px] items-center   
overflow-hidden rounded-[14px]   
px-3.5 py-3   
text-[11px] font-medium   
transition-all duration-300   
   
${
  isActive
    ? `   
border border-champagne-gold/15   
bg-soft-white/[0.07]   
text-soft-white   
shadow-[0_8px_24px_rgba(0,0,0,0.13)]   
`
    : `   
border border-transparent   
text-premium-silver/60   
hover:border-soft-white/[0.06]   
hover:bg-soft-white/[0.04]   
hover:text-soft-white   
`
}   
`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`   
absolute left-0 top-1/2   
h-7 w-[2px]   
-translate-y-1/2   
rounded-r-full   
bg-champagne-gold   
shadow-[0_0_12px_rgba(227,196,122,0.35)]   
   
${isActive ? "opacity-100" : "opacity-0"}   
   
`}
                  />

                  <span
                    className={`   
flex h-8 w-8 shrink-0   
items-center justify-center   
rounded-full   
text-[7px]   
   
${
  isActive
    ? `   
border border-champagne-gold/20   
bg-midnight-navy   
text-champagne-gold   
`
    : `   
border border-transparent   
bg-soft-white/[0.025]   
text-premium-silver/35   
group-hover:border-champagne-gold/10   
group-hover:text-champagne-gold   
`
}   
   
`}
                  >
                    ✦
                  </span>

                  <span className="ml-3 truncate">
                    {item.label}
                  </span>

                  <span
                    className={`   
ml-auto   
text-[11px]   
text-champagne-gold   
   
${
  isActive
    ? "translate-x-0 opacity-100"
    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
}   
   
`}
                  >
                    →
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="relative z-10 shrink-0">
        <div className="relative mx-6 border-t border-soft-white/[0.08] py-5">
          <div className="flex items-center justify-center gap-2 text-[6px] font-semibold uppercase tracking-[0.23em] text-premium-silver/30">
            <span>{t("adminSidebar.elegant")}</span>

            <span className="text-classic-gold/65">✦</span>

            <span>{t("adminSidebar.personal")}</span>

            <span className="text-classic-gold/65">✦</span>

            <span>{t("adminSidebar.smart")}</span>
          </div>
        </div>
      </div>

      <style>
        {`

.admin-sidebar-scroll {

scrollbar-width: thin;

scrollbar-color:   
rgba(227,196,122,0.25)   
transparent;

}


.admin-sidebar-scroll::-webkit-scrollbar {

width:4px;

}


.admin-sidebar-scroll::-webkit-scrollbar-track {

background:transparent;

}


.admin-sidebar-scroll::-webkit-scrollbar-thumb {

background:   
rgba(227,196,122,0.22);   

border-radius:999px;

}

        `}
      </style>
    </aside>
  );
};

export default AdminSidebar;