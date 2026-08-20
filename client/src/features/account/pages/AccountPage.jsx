import {
  useAuth,
} from "../../auth/context/AuthContext";

const AccountPage = () => {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">
          My Account
        </h1>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <p>
            Welcome,
            {" "}
            {user?.email}
          </p>

          <p className="mt-2">
            Role:
            {" "}
            {user?.role?.name}
          </p>

          <button
            onClick={logout}
            className="mt-6 rounded-lg bg-black px-6 py-3 text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
};

export default AccountPage;