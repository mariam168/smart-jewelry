import React from "react";
import { RouterProvider } from "react-router-dom";

import router from "./routes";

import { AuthProvider } from "../features/auth/context/AuthContext";
import CartProvider from "../context/CartContext";
import LanguageProvider from "../features/common/components/LanguageProvider";

const App = () => {
return ( <AuthProvider> <LanguageProvider> <CartProvider> <RouterProvider router={router} /> </CartProvider> </LanguageProvider> </AuthProvider>
);
};

export default App;
