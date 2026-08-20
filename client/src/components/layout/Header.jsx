import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  FaBars,
  FaXmark,
  FaUsers,
  FaBagShopping,
  FaArrowRightToBracket,
  FaArrowRightFromBracket,
} from "react-icons/fa6";

import logo from "../../assets/logo5.png";
import { useAuth } from "../../features/auth/context/AuthContext";
import { CartContext } from "../../context/CartContext";

const Header = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { cartItems, openCart } = useContext(CartContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `relative flex h-full items-center justify-center px-0.5 text-[12px] font-semibold uppercase tracking-[0.035em] transition-colors duration-300
    ${
      isActive
        ? "text-midnight-navy"
        : "text-midnight-navy/85 hover:text-classic-gold"
    }
    after:absolute after:bottom-[28px] after:left-1/2 after:h-[1.5px]
    after:-translate-x-1/2 after:bg-midnight-navy
    after:transition-all after:duration-300
    ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-light-champagne/60 bg-soft-white/98 backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[1480px] items-center justify-between px-4 sm:px-6 md:h-[106px] lg:px-10 xl:px-14">
        <Link
          to="/"
          className="group flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40"
        >
          <img
            src={logo}
            alt="logo"
            className="h-[64px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.015] md:h-[94px] lg:h-[98px]"
          />
        </Link>

        <nav className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center gap-8 md:flex lg:gap-11 xl:gap-14">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>

          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-5">
          {user ? (
            <>
              <Link
                to={user?.role?.name === "admin" ? "/admin" : "/account"}
                className="group hidden items-center gap-2.5 text-[11px] font-medium text-midnight-navy transition-colors duration-300 hover:text-classic-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40 sm:flex"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-ivory text-midnight-navy transition-all duration-300 group-hover:bg-soft-cream group-hover:text-classic-gold md:h-10 md:w-10">
                  <FaUsers className="text-[15px]" />
                </span>

                <span className="hidden whitespace-nowrap lg:block">
                  {user?.role?.name === "admin" ? "Dashboard" : "My Account"}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="group hidden items-center gap-2 text-[11px] font-medium text-slate-gray transition-colors duration-300 hover:text-antique-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40 sm:flex"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-slate-gray transition-all duration-300 group-hover:bg-warm-ivory group-hover:text-antique-gold md:h-10 md:w-10">
                  <FaArrowRightFromBracket className="text-[14px]" />
                </span>

                <span className="hidden lg:block">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="group hidden items-center gap-2.5 text-[11px] font-medium text-midnight-navy transition-colors duration-300 hover:text-classic-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40 sm:flex"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-ivory text-midnight-navy transition-all duration-300 group-hover:bg-soft-cream group-hover:text-classic-gold md:h-10 md:w-10">
                <FaArrowRightToBracket className="text-[14px]" />
              </span>

              <span className="hidden whitespace-nowrap lg:block">Login</span>
            </Link>
          )}

          <button
            onClick={openCart}
            aria-label="Open shopping cart"
            className="group relative flex h-10 w-10 items-center justify-center text-midnight-navy transition-all duration-300 hover:text-classic-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40 md:h-11 md:w-11"
          >
            <FaBagShopping className="text-[19px] transition-transform duration-300 group-hover:-translate-y-0.5 md:text-[21px]" />

            {cartCount > 0 && (
              <span className="absolute -right-[1px] top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-midnight-navy px-1 text-[9px] font-bold leading-none text-soft-white shadow-sm md:-right-[2px] md:top-[1px]">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-midnight-navy transition-all duration-300 hover:bg-warm-ivory hover:text-classic-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-classic-gold/40 md:hidden"
          >
            {isMenuOpen ? (
              <FaXmark className="text-[20px]" />
            ) : (
              <FaBars className="text-[19px]" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-light-champagne/70 bg-soft-white px-4 pb-7 pt-4 shadow-[0_18px_35px_rgba(7,19,31,0.06)] md:hidden sm:px-6">
          <nav className="mx-auto flex max-w-7xl flex-col">
            {[
              ["Home", "/"],
              ["Shop", "/shop"],
              ["About", "/about"],
              ["Contact", "/contact"],
            ].map(([name, path]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `relative flex min-h-[50px] items-center border-b border-light-champagne/60 px-1 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300 ${
                    isActive
                      ? "text-classic-gold"
                      : "text-midnight-navy hover:text-classic-gold"
                  }`
                }
              >
                {name}
              </NavLink>
            ))}

            <div className="pt-4">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link
                    to={user?.role?.name === "admin" ? "/admin" : "/account"}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-1 py-3 text-[12px] font-medium text-midnight-navy transition-colors duration-300 hover:text-classic-gold"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-ivory text-midnight-navy">
                      <FaUsers className="text-[14px]" />
                    </span>

                    {user?.role?.name === "admin" ? "Dashboard" : "My Account"}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-1 py-3 text-left text-[12px] font-medium text-slate-gray transition-colors duration-300 hover:text-antique-gold"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-ivory">
                      <FaArrowRightFromBracket className="text-[14px]" />
                    </span>
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-1 py-3 text-[12px] font-medium text-midnight-navy transition-colors duration-300 hover:text-classic-gold"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-ivory">
                    <FaArrowRightToBracket className="text-[14px]" />
                  </span>
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
