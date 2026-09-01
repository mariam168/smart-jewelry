import { createBrowserRouter } from "react-router-dom";

import ScrollToTop from "../features/common/components/ScrollToTop";
import MainLayout from "../components/layout/MainLayout";

import HomePage from "../features/home/pages/HomePage";

import ShopPage from "../features/shop/pages/ShopPage";
import ProductDetailsPage from "../features/shop/pages/ProductDetailsPage";

import CartPage from "../features/cart/pages/CartPage";
import CheckoutPage from "../features/checkout/pages/CheckoutPage";

import ExperienceBySlugPage from "../features/experience/pages/ExperienceBySlugPage";
import ManageExperiencePage from "../features/experience/pages/ManageExperiencePage";

import RegisterPage from "../features/auth/pages/RegisterPage";
import LoginPage from "../features/auth/pages/LoginPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import AdminProtectedRoute from "../features/auth/components/AdminProtectedRoute";

import AccountPage from "../features/account/pages/AccountPage";

import MyOrdersPage from "../features/orders/pages/MyOrdersPage";
import OrderDetailsPage from "../features/orders/pages/OrderDetailsPage";
import OrderSuccessPage from "../features/orders/pages/OrderSuccessPage";

import AboutPage from "../features/about/pages/AboutPage";
import ContactPage from "../features/contact/pages/ContactPage";

import NotFoundPage from "../features/common/pages/NotFoundPage";

import AdminLayout from "../features/admin/components/AdminLayout";

import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";

import AdminProductsPage from "../features/admin/pages/AdminProductsPage";
import AddProductPage from "../features/admin/pages/AddProductPage";
import EditProductPage from "../features/admin/pages/EditProductPage";

import AdminProductVariantsPage from "../features/admin/pages/AdminProductVariantsPage";
import AddVariantPage from "../features/admin/pages/AddVariantPage";
import EditVariantPage from "../features/admin/pages/EditVariantPage";

import AdminCategoriesPage from "../features/admin/pages/AdminCategoriesPage";
import AddCategoryPage from "../features/admin/pages/AddCategoryPage";
import EditCategoryPage from "../features/admin/pages/EditCategoryPage";

import AdminTechnologiesPage from "../features/admin/pages/AdminTechnologiesPage";
import AddTechnologyPage from "../features/admin/pages/AddTechnologyPage";
import EditTechnologyPage from "../features/admin/pages/EditTechnologyPage";

import AdminTechnologyModelsPage from "../features/admin/pages/AdminTechnologyModelsPage";
import AddTechnologyModelPage from "../features/admin/pages/AddTechnologyModelPage";
import EditTechnologyModelPage from "../features/admin/pages/EditTechnologyModelPage";

import AdminSmartUnitsPage from "../features/admin/smart-units/pages/AdminSmartUnitsPage";
import AddSmartUnitPage from "../features/admin/smart-units/pages/AddSmartUnitPage";
import EditSmartUnitPage from "../features/admin/smart-units/pages/EditSmartUnitPage";
import AdminSmartUnitInstancesPage from "../features/admin/smart-units/pages/AdminSmartUnitInstancesPage";

import AdminOrdersPage from "../features/admin/pages/AdminOrdersPage";
import AdminOrderDetailsPage from "../features/admin/pages/AdminOrderDetailsPage";

import AdminManufacturingOrdersPage from "../features/admin/pages/AdminManufacturingOrdersPage";
import AdminManufacturingOrderDetailsPage from "../features/admin/pages/AdminManufacturingOrderDetailsPage";

import AdminExperienceMediaSettingsPage from "../features/admin/pages/AdminExperienceMediaSettingsPage";

import AdminFinancePage from "../features/finance/pages/AdminFinancePage";

import AdminShippingAreasPage from "../features/shipping/pages/AdminShippingAreasPage";

const router = createBrowserRouter([
  {
    element: <ScrollToTop />,

    children: [
      {
        element: <MainLayout />,

        children: [
          {
            path: "/",
            element: <HomePage />,
          },

          {
            path: "/home",
            element: <HomePage />,
          },

          {
            path: "/shop",
            element: <ShopPage />,
          },

          {
            path: "/shop/products/:id",
            element: <ProductDetailsPage />,
          },

          {
            path: "/about",
            element: <AboutPage />,
          },

          {
            path: "/contact",
            element: <ContactPage />,
          },

          {
            path: "/cart",
            element: <CartPage />,
          },

          {
            path: "/checkout",
            element: <CheckoutPage />,
          },

          {
            path: "/order-success/:orderId",
            element: <OrderSuccessPage />,
          },

          {
            element: <ProtectedRoute />,

            children: [
              {
                path: "/account",
                element: <AccountPage />,
              },

              {
                path: "/account/orders",
                element: <MyOrdersPage />,
              },

              {
                path: "/account/orders/:id",
                element: <OrderDetailsPage />,
              },
            ],
          },
        ],
      },

      {
        path: "/experience/manage/:token",
        element: <ManageExperiencePage />,
      },

      {
        path: "/experience/public/:serialNumber/:slug",
        element: <ExperienceBySlugPage />,
      },

      {
        path: "/register",
        element: <RegisterPage />,
      },

      {
        path: "/login",
        element: <LoginPage />,
      },

      {
        path: "/verify-email",
        element: <VerifyEmailPage />,
      },

      {
        element: <AdminProtectedRoute />,

        children: [
          {
            path: "/admin",
            element: <AdminLayout />,

            children: [
              {
                index: true,
                element: <AdminDashboardPage />,
              },

              {
                path: "finance",
                element: <AdminFinancePage />,
              },

              {
                path: "products",
                element: <AdminProductsPage />,
              },

              {
                path: "products/new",
                element: <AddProductPage />,
              },

              {
                path: "experience-media-settings",
                element: <AdminExperienceMediaSettingsPage />,
              },

              {
                path: "products/:id/edit",
                element: <EditProductPage />,
              },

              {
                path: "products/:id/variants",
                element: <AdminProductVariantsPage />,
              },

              {
                path: "products/:id/variants/new",
                element: <AddVariantPage />,
              },

              {
                path: "variants/:id/edit",
                element: <EditVariantPage />,
              },

              {
                path: "categories",
                element: <AdminCategoriesPage />,
              },

              {
                path: "categories/new",
                element: <AddCategoryPage />,
              },

              {
                path: "categories/:id/edit",
                element: <EditCategoryPage />,
              },

              {
                path: "technologies",
                element: <AdminTechnologiesPage />,
              },

              {
                path: "technologies/new",
                element: <AddTechnologyPage />,
              },

              {
                path: "technologies/:id/edit",
                element: <EditTechnologyPage />,
              },

              {
                path: "technology-models",
                element: <AdminTechnologyModelsPage />,
              },

              {
                path: "technology-models/new",
                element: <AddTechnologyModelPage />,
              },

              {
                path: "technology-models/:id/edit",
                element: <EditTechnologyModelPage />,
              },

              {
                path: "smart-units",
                element: <AdminSmartUnitsPage />,
              },

              {
                path: "smart-units/new",
                element: <AddSmartUnitPage />,
              },

              {
                path: "smart-units/:id/edit",
                element: <EditSmartUnitPage />,
              },

              {
                path: "smart-units/:id/instances",
                element: <AdminSmartUnitInstancesPage />,
              },

              {
                path: "orders",
                element: <AdminOrdersPage />,
              },

              {
                path: "orders/:id",
                element: <AdminOrderDetailsPage />,
              },

              {
                path: "manufacturing",
                element: <AdminManufacturingOrdersPage />,
              },

              {
                path: "manufacturing/:id",
                element: <AdminManufacturingOrderDetailsPage />,
              },

              {
                path: "shipping",
                element: <AdminShippingAreasPage />,
              },
            ],
          },
        ],
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;