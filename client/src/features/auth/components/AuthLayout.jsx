const AuthLayout = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {title}
          </h1>

          <p className="mt-2 text-gray-600">
            {subtitle}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;