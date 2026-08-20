import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getHomeData } from "../services/homeApi";

const FeaturedProducts = () => {
  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);

        const response =
          await getHomeData();

        setProducts(
          response?.data?.featuredProducts ||
          []
        );

      } catch (error) {
        console.error(
          "Failed to load featured products:",
          error
        );

        setError(
          "Unable to load products."
        );

      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="bg-[#fafafa] py-20">

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Featured
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-gray-900">
            Our signature pieces
          </h2>

        </div>

        {isLoading && (
          <div className="py-10 text-center text-gray-500">
            Loading products...
          </div>
        )}

        {error && (
          <div className="py-10 text-center text-red-500">
            {error}
          </div>
        )}

        {!isLoading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
              No featured products available yet.
            </div>
          )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {products.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product.slug}`}
              className="group"
            >

              <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">

                <img
                  src={
                    product.thumbnail ||
                    "/images/placeholder-product.jpg"
                  }
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

              </div>

              <div className="mt-4">

                <h3 className="font-medium text-gray-900">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {product.shortDescription}
                </p>

                <p className="mt-3 font-semibold text-gray-900">
                  {product.price} EGP
                </p>

              </div>

            </Link>
          ))}

        </div>

      </div>

    </section>
  );
};

export default FeaturedProducts;