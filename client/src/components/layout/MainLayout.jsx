import { Outlet } from "react-router-dom";

import Header from "./Header";

import Footer from "./Footer";

import CartDrawer from "../cart/CartDrawer";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <CartDrawer />
    </div>
  );
};

export default MainLayout;
