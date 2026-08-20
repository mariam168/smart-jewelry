import React from "react";
import { RouterProvider } from "react-router-dom";

import router from "./routes";

import { AuthProvider } from "../features/auth/context/AuthContext";
import CartProvider from "../context/CartContext";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
