import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  FaBars,
  FaXmark,
  FaUsers,
  FaBagShopping,
  FaArrowRightToBracket,
  FaArrowRightFromBracket,
  FaGlobe,
} from "react-icons/fa6";

import logo from "../../assets/logo5.png";

import { useAuth } from "../../features/auth/context/AuthContext";
import { CartContext } from "../../context/CartContext";

const Header = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const { cartItems, openCart } = useContext(CartContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const isAdmin =
    user?.role?.name === "admin" ||
    user?.role?.name === "super_admin";

  const customerFirstName =
    user?.customer?.firstName ||
    user?.firstName ||
    "";

  const customerName = customerFirstName;

  const toggleLanguage = () => {
    const newLang =
      i18n.language === "en" ? "ar" : "en";

    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();

    navigate("/login");

    setIsMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
      isActive
        ? "text-midnight-navy"
        : "text-midnight-navy/50 hover:text-classic-gold"
    } after:absolute after:bottom-0 after:left-1/2 after:h-[1.5px] after:bg-classic-gold after:transition-all after:duration-300 after:-translate-x-1/2 ${
      isActive
        ? "after:w-full"
        : "after:w-0 hover:after:w-full"
    }`;

  const actionIconClass =
    "group relative flex h-10 w-10 items-center justify-center rounded-full text-midnight-navy/80 transition-all duration-300 hover:bg-midnight-navy hover:text-white";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-light-champagne/40 bg-soft-white/90 backdrop-blur-lg">
      {" "}
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-12">
        {" "}
        <div className="flex-1">
          {" "}
          <Link
            to="/"
            className="inline-block transition-transform duration-300 hover:scale-[1.03]"
          >
            {" "}
          
<img
  src={logo}
  alt="logo"
  className="h-16 w-auto md:h-16"
/>

{" "}
          </Link>{" "}
        </div>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
          <NavLink
            to="/"
            className={navLinkClass}
          >
            {t("header.home")}
          </NavLink>

          <NavLink
            to="/shop"
            className={navLinkClass}
          >
            {t("header.shop")}
          </NavLink>

          <NavLink
            to="/about"
            className={navLinkClass}
          >
            {t("header.about")}
          </NavLink>

          <NavLink
            to="/contact"
            className={navLinkClass}
          >
            {t("header.contact")}
          </NavLink>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-3">
          <button
            onClick={toggleLanguage}
            className="hidden items-center gap-2 rounded-full border border-light-champagne/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-midnight-navy transition-all hover:bg-warm-ivory md:flex"
          >
            <FaGlobe className="text-sm" />

            <span>{i18n.language}</span>
          </button>

          <div className="mx-2 hidden h-5 w-px bg-light-champagne/60 sm:block" />

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                to={
                  isAdmin
                    ? "/admin"
                    : "/account"
                }
                className={
                  user?.role?.name ===
                  "customer"
                    ? "group relative flex h-10 max-w-[180px] items-center rounded-full border border-light-champagne/60 bg-warm-ivory/40 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-midnight-navy transition-all duration-300 hover:border-classic-gold hover:bg-midnight-navy hover:text-white"
                    : actionIconClass
                }
                title={t(
                  "header.myAccount"
                )}
              >
                {user?.role?.name ===
                "customer" ? (
                  <span className="truncate">
                    {customerName}
                  </span>
                ) : (
                  <FaUsers className="text-lg" />
                )}
              </Link>

              <button
                onClick={handleLogout}
                className={`${actionIconClass} hidden sm:flex`}
                title={t(
                  "header.logout"
                )}
              >
                <FaArrowRightFromBracket className="text-base" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={actionIconClass}
              title={t("header.login")}
            >
              <FaArrowRightToBracket className="text-lg" />
            </Link>
          )}

          <button
            onClick={openCart}
            className={actionIconClass}
          >
            <FaBagShopping className="text-lg" />

            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-classic-gold text-[9px] font-bold text-white shadow-sm group-hover:bg-midnight-navy">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() =>
              setIsMenuOpen(!isMenuOpen)
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-ivory/40 text-midnight-navy md:hidden"
          >
            {isMenuOpen ? (
              <FaXmark className="text-xl" />
            ) : (
              <FaBars className="text-lg" />
            )}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="absolute left-0 top-full w-full bg-soft-white/98 px-8 py-10 shadow-2xl backdrop-blur-xl md:hidden">
          <nav className="flex flex-col space-y-6">
            {[
              [t("header.home"), "/"],
              [t("header.shop"), "/shop"],
              [t("header.about"), "/about"],
              [t("header.contact"), "/contact"],
            ].map(([name, path]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className={({
                  isActive,
                }) =>
                  `text-xs font-black uppercase tracking-[0.2em] transition-colors ${
                    isActive
                      ? "text-classic-gold"
                      : "text-midnight-navy"
                  }`
                }
              >
                {name}
              </NavLink>
            ))}

            <div className="mt-4 flex flex-col gap-4 border-t border-light-champagne/40 pt-6">
              <button
                onClick={() => {
                  toggleLanguage();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-midnight-navy"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-ivory">
                  <FaGlobe />
                </span>
                {t("header.language")} (
                {i18n.language})
              </button>

              {user?.role?.name ===
                "customer" && (
                <Link
                  to="/account"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-midnight-navy"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-ivory">
                    <FaUsers />
                  </span>

                  <span className="truncate">
                    {customerName}
                  </span>
                </Link>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-red-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                    <FaArrowRightFromBracket />
                  </span>

                  {t("header.logout")}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;