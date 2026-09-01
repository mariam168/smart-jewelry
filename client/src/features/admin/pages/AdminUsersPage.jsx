import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminUsers,
  updateAdminUserRole,
} from "../services/adminUserApi";

const AdminUsersPage = () => {
  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const loadUsers =
    async () => {
      try {
        setLoading(true);

        setError("");

        const data =
          await getAdminUsers();

        setUsers(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (error) {
        console.error(
          "LOAD USERS ERROR:",
          error,
        );

        setError(
          error?.response?.data
            ?.message ||
            "Failed to load users.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const firstName =
            user.customer
              ?.firstName ||
            "";

          const lastName =
            user.customer
              ?.lastName ||
            "";

          const fullName =
            `${firstName} ${lastName}`
              .trim()
              .toLowerCase();

          const email =
            String(
              user.email ||
                "",
            ).toLowerCase();

          const role =
            user.role?.name ||
            "";

          const matchesSearch =
            !value ||
            fullName.includes(
              value,
            ) ||
            email.includes(
              value,
            );

          const matchesRole =
            roleFilter ===
              "all" ||
            role ===
              roleFilter;

          return (
            matchesSearch &&
            matchesRole
          );
        },
      );
    }, [
      users,
      search,
      roleFilter,
    ]);

  const adminCount =
    users.filter(
      (user) =>
        user.role?.name ===
        "admin",
    ).length;

  const customerCount =
    users.filter(
      (user) =>
        user.role?.name ===
        "customer",
    ).length;

  const handleRoleChange =
    async (
      user,
      newRole,
    ) => {
      const currentRole =
        user.role?.name;

      if (
        currentRole ===
        newRole
      ) {
        return;
      }

      const fullName =
        [
          user.customer
            ?.firstName,

          user.customer
            ?.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        user.email;

      const confirmed =
        window.confirm(
          `Change ${fullName} from ${currentRole || "unknown"} to ${newRole}?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingId(
          user._id,
        );

        setError("");

        setMessage("");

        const response =
          await updateAdminUserRole(
            user._id,
            newRole,
          );

        const updatedUser =
          response?.data
            ?.user;

        setUsers(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                user._id
                  ? {
                      ...item,

                      role:
                        updatedUser
                          ?.role ||
                        {
                          name:
                            newRole,
                        },
                    }
                  : item,
            ),
        );

        setMessage(
          "User role updated successfully.",
        );
      } catch (error) {
        console.error(
          "UPDATE ROLE ERROR:",
          error,
        );

        setError(
          error?.response?.data
            ?.message ||
            "Failed to update user role.",
        );
      } finally {
        setUpdatingId("");
      }
    };

  const formatDate = (
    value,
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric",
      },
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-warm-ivory">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
            Loading Users
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-ivory text-midnight-navy">
      <header className="relative overflow-hidden border-b border-rich-navy bg-gradient-to-br from-deep-navy via-rich-navy to-luxury-black">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-champagne-gold/10" />

        <div className="mx-auto max-w-[1500px] px-6 py-10 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-classic-gold" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-champagne-gold">
              Administration
            </span>
          </div>

          <h1 className="mt-4 font-serif text-[3rem] font-normal tracking-[-0.04em] text-soft-white sm:text-[3.6rem]">
            Registered Users
          </h1>

          <p className="mt-4 max-w-2xl text-[13px] leading-7 text-premium-silver/70">
            View registered accounts and manage administrator access.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-10 lg:px-10">
        {error && (
          <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[12px] text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-[16px] border border-champagne-gold/30 bg-soft-cream px-5 py-4 text-[12px] text-antique-gold">
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-light-champagne bg-soft-white p-6 shadow-[0_12px_32px_rgba(7,19,31,0.04)]">
            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
              Total Users
            </p>

            <p className="mt-3 font-serif text-[2.4rem] text-midnight-navy">
              {users.length}
            </p>
          </div>

          <div className="rounded-[22px] border border-light-champagne bg-soft-white p-6 shadow-[0_12px_32px_rgba(7,19,31,0.04)]">
            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
              Customers
            </p>

            <p className="mt-3 font-serif text-[2.4rem] text-midnight-navy">
              {customerCount}
            </p>
          </div>

          <div className="rounded-[22px] border border-champagne-gold/25 bg-soft-cream p-6 shadow-[0_12px_32px_rgba(7,19,31,0.04)]">
            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
              Administrators
            </p>

            <p className="mt-3 font-serif text-[2.4rem] text-antique-gold">
              {adminCount}
            </p>
          </div>
        </div>

        <section className="mt-7 overflow-hidden rounded-[26px] border border-light-champagne bg-soft-white shadow-[0_18px_50px_rgba(7,19,31,0.05)]">
          <div className="flex flex-col gap-4 border-b border-light-champagne bg-warm-ivory/45 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-serif text-[1.7rem]">
                User Accounts
              </h2>

              <p className="mt-1 text-[10px] text-steel-gray">
                {filteredUsers.length} account(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search name or email..."
                className="h-[44px] min-w-[250px] rounded-[12px] border border-light-champagne bg-soft-white px-4 text-[11px] outline-none focus:border-classic-gold"
              />

              <select
                value={
                  roleFilter
                }
                onChange={(
                  event,
                ) =>
                  setRoleFilter(
                    event.target
                      .value,
                  )
                }
                className="h-[44px] rounded-[12px] border border-light-champagne bg-soft-white px-4 text-[11px] outline-none"
              >
                <option value="all">
                  All Roles
                </option>

                <option value="customer">
                  Customers
                </option>

                <option value="admin">
                  Admins
                </option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-light-champagne bg-soft-cream/50 text-left">
                  <th className="px-6 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    User
                  </th>

                  <th className="px-6 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Email
                  </th>

                  <th className="px-6 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Status
                  </th>

                  <th className="px-6 py-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => {
                    const name =
                      [
                        user.customer
                          ?.firstName,

                        user.customer
                          ?.lastName,
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          " ",
                        ) ||
                      "Admin Account";

                    const role =
                      user.role
                        ?.name ||
                      "customer";

                    const initials =
                      name
                        .split(
                          " ",
                        )
                        .map(
                          (part) =>
                            part[0],
                        )
                        .join("")
                        .slice(
                          0,
                          2,
                        )
                        .toUpperCase();

                    return (
                      <tr
                        key={
                          user._id
                        }
                        className="border-b border-light-champagne/70 transition-colors hover:bg-warm-ivory/40"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-midnight-navy text-[9px] font-semibold text-champagne-gold">
                              {
                                initials
                              }
                            </div>

                            <div>
                              <p className="text-[12px] font-semibold text-midnight-navy">
                                {
                                  name
                                }
                              </p>

                              <p className="mt-1 font-mono text-[8px] text-steel-gray">
                                {String(
                                  user._id,
                                ).slice(
                                  -8,
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-[11px] text-slate-gray">
                          {
                            user.email
                          }
                        </td>

                        <td className="px-6 py-5 text-[11px] text-slate-gray">
                          {user.customer
                            ?.phone ||
                            "—"}
                        </td>

                        <td className="px-6 py-5 text-[11px] text-slate-gray">
                          {formatDate(
                            user.createdAt,
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.12em] ${
                              user.isActive
                                ? "bg-soft-cream text-antique-gold"
                                : "bg-silver-mist text-steel-gray"
                            }`}
                          >
                            {user.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <select
                            value={
                              role
                            }
                            disabled={
                              updatingId ===
                              user._id
                            }
                            onChange={(
                              event,
                            ) =>
                              handleRoleChange(
                                user,
                                event
                                  .target
                                  .value,
                              )
                            }
                            className={`min-w-[130px] rounded-[11px] border px-3 py-2.5 text-[10px] font-semibold outline-none disabled:opacity-50 ${
                              role ===
                              "admin"
                                ? "border-champagne-gold/35 bg-soft-cream text-antique-gold"
                                : "border-light-champagne bg-soft-white text-midnight-navy"
                            }`}
                          >
                            <option value="customer">
                              Customer
                            </option>

                            <option value="admin">
                              Admin
                            </option>
                          </select>
                        </td>
                      </tr>
                    );
                  },
                )}

                {filteredUsers.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center text-[12px] text-steel-gray"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminUsersPage;