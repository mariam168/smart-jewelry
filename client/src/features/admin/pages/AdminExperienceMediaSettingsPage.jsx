import { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../auth/context/AuthContext.jsx";

import {
  getExperienceMediaLimits,
  updateExperienceMediaLimits,
  getAdminMediaRequests,
  updateAdminMediaRequest,
  deleteAdminMediaRequest,
} from "../../experience/services/experienceApi.js";

const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("20")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `20${digits.slice(1)}`;
  }

  return digits;
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "approved":
      return "border-classic-gold/30 bg-soft-cream text-antique-gold";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "pending":
    default:
      return "border-champagne-gold/30 bg-champagne-gold/10 text-antique-gold";
  }
};

const getMediaTypeLabel = (type, t) => {
  switch (type) {
    case "image":
      return t("adminExperienceMediaSettings.images", "Images");

    case "audio":
      return t("adminExperienceMediaSettings.audio", "Audio");

    case "video":
      return t("adminExperienceMediaSettings.video", "Video");

    default:
      return type || "—";
  }
};

const AdminExperienceMediaSettingsPage = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  const isSuperAdmin = user?.role?.name === "super_admin";

  const [form, setForm] = useState({
    imageLimit: 5,
    videoLimit: 5,
    audioLimit: 5,
  });

  const [mediaRequests, setMediaRequests] = useState([]);

  const [requestLimits, setRequestLimits] = useState({});

  const [requestNotes, setRequestNotes] = useState({});

  const [searchTerm, setSearchTerm] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [workingRequestId, setWorkingRequestId] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const loadPage = async () => {
    try {
      setLoading(true);
      setError("");

      const [limits, requests] = await Promise.all([
        getExperienceMediaLimits(),
        getAdminMediaRequests(),
      ]);

      setForm({
        imageLimit: Number(limits?.imageLimit ?? 5),
        videoLimit: Number(limits?.videoLimit ?? 5),
        audioLimit: Number(limits?.audioLimit ?? 5),
      });

      const normalizedRequests = Array.isArray(requests) ? requests : [];

      setMediaRequests(normalizedRequests);

      const limitsByRequest = {};

      const notesByRequest = {};

      normalizedRequests.forEach((request) => {
        limitsByRequest[request._id] =
          Number(
            request.approvedExtraLimit ?? request.requestedExtraLimit ?? 1,
          ) || 1;

        notesByRequest[request._id] = request.adminNote || "";
      });

      setRequestLimits(limitsByRequest);

      setRequestNotes(notesByRequest);
    } catch (loadError) {
      setError(
        loadError?.response?.data?.message ||
          t("adminExperienceMediaSettings.failedToLoadMediaControls"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        imageLimit: Math.max(Number(form.imageLimit) || 0, 0),

        videoLimit: Math.max(Number(form.videoLimit) || 0, 0),

        audioLimit: Math.max(Number(form.audioLimit) || 0, 0),
      };

      const result = await updateExperienceMediaLimits(payload);

      setForm({
        imageLimit: Number(result?.imageLimit ?? payload.imageLimit),

        videoLimit: Number(result?.videoLimit ?? payload.videoLimit),

        audioLimit: Number(result?.audioLimit ?? payload.audioLimit),
      });

      setMessage(
        t("adminExperienceMediaSettings.mediaLimitsUpdatedSuccessfully"),
      );
    } catch (saveError) {
      setError(
        saveError?.response?.data?.message ||
          t("adminExperienceMediaSettings.failedToUpdateMediaLimits"),
      );
    } finally {
      setSaving(false);
    }
  };

  const updateRequest = async (request, status) => {
    try {
      setWorkingRequestId(request._id);

      setError("");
      setMessage("");

      const approvedExtraLimit = Math.max(
        Number(
          requestLimits[request._id] ?? request.requestedExtraLimit ?? 1,
        ) || 0,
        0,
      );

      const payload = {
        status,

        approvedExtraLimit: status === "approved" ? approvedExtraLimit : 0,

        adminNote: requestNotes[request._id] || "",
      };

      await updateAdminMediaRequest(request._id, payload);

      setMessage(
        status === "approved"
          ? t(
              "adminExperienceMediaSettings.mediaRequestApproved",
              "Media allowance request approved.",
            )
          : t(
              "adminExperienceMediaSettings.mediaRequestRejected",
              "Media allowance request rejected.",
            ),
      );

      await loadPage();
    } catch (updateError) {
      setError(
        updateError?.response?.data?.message ||
          t(
            "adminExperienceMediaSettings.failedToUpdateMediaRequest",
            "Failed to update media request.",
          ),
      );
    } finally {
      setWorkingRequestId("");
    }
  };

  const deleteRequest = async (request) => {
    const confirmed = window.confirm(
      t("adminExperienceMediaSettings.confirmDeleteRequest"),
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingRequestId(request._id);

      setError("");
      setMessage("");

      await deleteAdminMediaRequest(request._id);

      setMessage(
        t(
          "adminExperienceMediaSettings.mediaRequestDeleted",
          "Media request deleted.",
        ),
      );

      await loadPage();
    } catch (deleteError) {
      setError(
        deleteError?.response?.data?.message ||
          t(
            "adminExperienceMediaSettings.failedToDeleteMediaRequest",
            "Failed to delete media request.",
          ),
      );
    } finally {
      setWorkingRequestId("");
    }
  };

  const requestStats = useMemo(() => {
    return {
      total: mediaRequests.length,

      pending: mediaRequests.filter((request) => request.status === "pending")
        .length,

      approved: mediaRequests.filter((request) => request.status === "approved")
        .length,

      rejected: mediaRequests.filter((request) => request.status === "rejected")
        .length,
    };
  }, [mediaRequests]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return mediaRequests.filter((request) => {
      if (typeFilter !== "all" && request.mediaType !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const experience = request.experience || {};

      const order = experience.order || {};

      const owner = experience.owner || {};

      const searchableValues = [
        request.mediaType,

        request.requesterName,

        request.requesterPhone,

        request.message,

        request.status,

        request.adminNote,

        experience.serialNumber,

        experience.slug,

        order.orderNumber,

        owner.email,

        owner.phone,

        owner.firstName,

        owner.lastName,
      ];

      return searchableValues.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [mediaRequests, searchTerm, typeFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[440px] items-center justify-center bg-warm-ivory">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

          <p className="mt-5 text-[12px] text-slate-gray">
            {t("adminExperienceMediaSettings.loadingExperienceMediaControls")}
          </p>
        </div>
      </div>
    );
  }

  const settings = [
    {
      name: "imageLimit",

      title: t("adminExperienceMediaSettings.imageLimit"),

      description: t("adminExperienceMediaSettings.imageLimitDescription"),

      icon: "◫",
    },

    {
      name: "audioLimit",

      title: t("adminExperienceMediaSettings.voiceMessageLimit"),

      description: t(
        "adminExperienceMediaSettings.voiceMessageLimitDescription",
      ),

      icon: "♫",
    },

    {
      name: "videoLimit",

      title: t("adminExperienceMediaSettings.globalVideoMaximum"),

      description: t(
        "adminExperienceMediaSettings.globalVideoMaximumDescription",
      ),

      icon: "▶",
    },
  ];

  return (
    <div className="min-h-full space-y-8 text-midnight-navy">
      <header className="overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-gradient-to-br from-deep-navy via-rich-navy to-luxury-black px-7 py-9 shadow-[0_24px_65px_rgba(7,19,31,0.16)] sm:px-9">
        <div className="flex items-center gap-3">
          <span className="text-champagne-gold">✦</span>

          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-premium-silver">
            {t("adminExperienceMediaSettings.experienceSettings")}
          </span>
        </div>

        <h1 className="mt-4 font-serif text-[3rem] text-soft-white">
          {t("adminExperienceMediaSettings.mediaControl")}
        </h1>

        <p className="mt-4 max-w-2xl text-[13px] leading-7 text-premium-silver/75">
          {t("adminExperienceMediaSettings.headerDescription")}
        </p>
      </header>

      {error && (
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[12px] text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-[16px] border border-champagne-gold/30 bg-soft-cream px-5 py-4 text-[12px] text-antique-gold">
          {message}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* GLOBAL LIMITS */}
      {/* ---------------------------------------------------------------- */}

      <form
        onSubmit={handleSave}
        className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white shadow-[0_20px_60px_rgba(7,19,31,0.06)]"
      >
        <div className="border-b border-light-champagne bg-warm-ivory/50 px-7 py-7">
          <h2 className="font-serif text-[1.8rem]">
            {t("adminExperienceMediaSettings.globalMediaLimits")}
          </h2>

          <p className="mt-2 text-[11px] leading-6 text-slate-gray">
            {t("adminExperienceMediaSettings.globalMediaLimitsDescription")}
          </p>
        </div>

        <div className="grid gap-5 p-7 lg:grid-cols-3">
          {settings.map((item) => (
            <div
              key={item.name}
              className="rounded-[20px] border border-light-champagne bg-warm-ivory/50 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold">
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <label className="text-[12px] font-semibold text-midnight-navy">
                    {item.title}
                  </label>

                  <p className="mt-1 min-h-[60px] text-[10px] leading-5 text-slate-gray">
                    {item.description}
                  </p>

                  <div className="relative mt-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      required
                      name={item.name}
                      value={form[item.name]}
                      onChange={handleChange}
                      className="h-[52px] w-full rounded-[13px] border border-light-champagne bg-soft-white px-5 pr-20 text-[14px] font-semibold outline-none focus:border-classic-gold"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase text-steel-gray">
                      {t("adminExperienceMediaSettings.max")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-light-champagne bg-warm-ivory/30 px-7 py-6">
          <p className="text-[10px] text-steel-gray">
            {t("adminExperienceMediaSettings.allowedRange")}
          </p>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[48px] min-w-[170px] items-center justify-center rounded-[13px] bg-midnight-navy px-7 text-[10px] font-semibold uppercase tracking-[0.12em] text-soft-white disabled:opacity-50"
          >
            {saving
              ? t("adminExperienceMediaSettings.saving")
              : t("adminExperienceMediaSettings.saveLimits")}
          </button>
        </div>
      </form>

      {/* ---------------------------------------------------------------- */}
      {/* UNIFIED REQUEST QUEUE */}
      {/* ---------------------------------------------------------------- */}

      <section className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white shadow-[0_20px_60px_rgba(7,19,31,0.06)]">
        <div className="border-b border-light-champagne bg-warm-ivory/50 px-7 py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                {t("adminExperienceMediaSettings.adminApprovalQueue")}
              </p>

              <h2 className="mt-3 font-serif text-[1.9rem]">
                {t(
                  "adminExperienceMediaSettings.mediaRequests",
                  "Media Allowance Requests",
                )}
              </h2>

              <p className="mt-2 max-w-2xl text-[11px] leading-6 text-slate-gray">
                {t(
                  "adminExperienceMediaSettings.mediaRequestsDescription",
                  "Review image, audio and video allowance requests.",
                )}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                [t("adminExperienceMediaSettings.total"), requestStats.total],

                [
                  t("adminExperienceMediaSettings.pending"),
                  requestStats.pending,
                ],

                [
                  t("adminExperienceMediaSettings.approved"),
                  requestStats.approved,
                ],

                [
                  t("adminExperienceMediaSettings.rejected"),
                  requestStats.rejected,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-[74px] rounded-[13px] border border-light-champagne bg-soft-white px-3 py-2 text-center"
                >
                  <p className="text-[7px] uppercase tracking-[0.12em] text-steel-gray">
                    {label}
                  </p>

                  <p className="mt-1 font-serif text-[1.2rem] text-midnight-navy">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t(
                "adminExperienceMediaSettings.searchMediaRequests",
                "Search media requests...",
              )}
              className="h-[52px] w-full rounded-[14px] border border-light-champagne bg-soft-white px-5 text-[11px] outline-none focus:border-classic-gold"
            />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-[52px] rounded-[14px] border border-light-champagne bg-soft-white px-4 text-[10px] outline-none focus:border-classic-gold"
            >
              <option value="all">
                {t("adminExperienceMediaSettings.allMediaTypes", "All Media")}
              </option>

              <option value="image">
                {t("adminExperienceMediaSettings.images", "Images")}
              </option>

              <option value="audio">
                {t("adminExperienceMediaSettings.audio", "Audio")}
              </option>

              <option value="video">
                {t("adminExperienceMediaSettings.video", "Video")}
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-[52px] rounded-[14px] border border-light-champagne bg-soft-white px-4 text-[10px] outline-none focus:border-classic-gold"
            >
              <option value="all">
                {t("adminExperienceMediaSettings.allStatuses", "All Statuses")}
              </option>

              <option value="pending">
                {t("adminExperienceMediaSettings.pending")}
              </option>

              <option value="approved">
                {t("adminExperienceMediaSettings.approved")}
              </option>

              <option value="rejected">
                {t("adminExperienceMediaSettings.rejected")}
              </option>
            </select>
          </div>
        </div>

        {mediaRequests.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-serif text-[1.5rem] text-midnight-navy">
              {t(
                "adminExperienceMediaSettings.noMediaRequestsYet",
                "No media requests yet.",
              )}
            </p>

            <p className="mt-2 text-[11px] text-slate-gray">
              {t(
                "adminExperienceMediaSettings.noMediaRequestsDescription",
                "New allowance requests will appear here.",
              )}
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-serif text-[1.5rem] text-midnight-navy">
              {t(
                "adminExperienceMediaSettings.noMatchingMediaRequests",
                "No matching requests.",
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1380px] text-left">
              <thead>
                <tr className="bg-midnight-navy">
                  {[
                    [
                      "type",
                      t("adminExperienceMediaSettings.mediaType", "Media"),
                    ],

                    ["customer", t("adminExperienceMediaSettings.customer")],

                    [
                      "experience",
                      t("adminExperienceMediaSettings.experience"),
                    ],

                    ["request", t("adminExperienceMediaSettings.request")],

                    ["status", t("adminExperienceMediaSettings.status")],

                    [
                      "allowed",
                      t(
                        "adminExperienceMediaSettings.extraAllowance",
                        "Extra Allowance",
                      ),
                    ],

                    ["adminNote", t("adminExperienceMediaSettings.adminNote")],

                    ["contact", t("adminExperienceMediaSettings.contact")],

                    ["action", t("adminExperienceMediaSettings.action")],
                  ].map(([key, heading]) => (
                    <th
                      key={key}
                      className="px-5 py-4 text-[7px] font-semibold uppercase tracking-[0.18em] text-champagne-gold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-light-champagne/70">
                {filteredRequests.map((request) => {
                  const experience = request.experience || {};

                  const order = experience.order || {};

                  const owner = experience.owner || {};

                  const whatsappNumber = normalizeWhatsAppNumber(
                    request.requesterPhone,
                  );

                  const isWorking = workingRequestId === request._id;

                  return (
                    <tr
                      key={request._id}
                      className="align-top hover:bg-warm-ivory/40"
                    >
                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full border border-light-champagne bg-warm-ivory px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-deep-navy">
                          {getMediaTypeLabel(request.mediaType, t)}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-[11px] font-semibold text-midnight-navy">
                          {request.requesterName}
                        </p>

                        <p className="mt-1 text-[9px] text-steel-gray">
                          {request.requesterPhone}
                        </p>

                        {owner?.email && (
                          <p className="mt-1 text-[8px] text-steel-gray">
                            {owner.email}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-mono text-[9px] text-midnight-navy">
                          {experience.serialNumber || "—"}
                        </p>

                        <p className="mt-1 text-[8px] text-steel-gray">
                          {t("adminExperienceMediaSettings.orderNumber")}
                          {order.orderNumber || "—"}
                        </p>

                        <p className="mt-1 text-[8px] text-steel-gray">
                          {formatDate(request.requestedAt || request.createdAt)}
                        </p>
                      </td>

                      <td className="max-w-[230px] px-5 py-5">
                        <p className="text-[9px] font-semibold text-midnight-navy">
                          {t(
                            "adminExperienceMediaSettings.requested",
                            "Requested",
                          )}{" "}
                          {request.requestedExtraLimit || 1}
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-[9px] leading-5 text-slate-gray">
                          {request.message ||
                            t("adminExperienceMediaSettings.noNoteProvided")}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
                            request.status,
                          )}`}
                        >
                          {t(
                            `adminExperienceMediaSettings.statuses.${request.status}`,
                            {
                              defaultValue: request.status,
                            },
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            requestLimits[request._id] ??
                            request.approvedExtraLimit ??
                            request.requestedExtraLimit ??
                            1
                          }
                          onChange={(event) =>
                            setRequestLimits((previous) => ({
                              ...previous,

                              [request._id]: event.target.value,
                            }))
                          }
                          className="h-[42px] w-[90px] rounded-[10px] border border-light-champagne bg-warm-ivory px-3 text-[11px] outline-none focus:border-classic-gold"
                        />

                        <p className="mt-1 text-[7px] text-steel-gray">
                          {t(
                            "adminExperienceMediaSettings.requested",
                            "Requested",
                          )}{" "}
                          {request.requestedExtraLimit || 1}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <textarea
                          rows={3}
                          value={requestNotes[request._id] || ""}
                          onChange={(event) =>
                            setRequestNotes((previous) => ({
                              ...previous,

                              [request._id]: event.target.value,
                            }))
                          }
                          placeholder={t(
                            "adminExperienceMediaSettings.optionalNote",
                          )}
                          className="w-[220px] resize-none rounded-[10px] border border-light-champagne bg-warm-ivory px-3 py-2 text-[9px] leading-4 outline-none focus:border-classic-gold"
                        />
                      </td>

                      <td className="px-5 py-5">
                        {whatsappNumber ? (
                          <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                              `Hello ${request.requesterName}, regarding your JEVORYA ${request.mediaType || "media"} allowance request for serial ${experience.serialNumber || ""}.`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[38px] items-center rounded-full bg-[#25D366] px-4 text-[8px] font-semibold text-white"
                          >
                            {t("adminExperienceMediaSettings.whatsapp")}
                          </a>
                        ) : (
                          <span className="text-[8px] text-steel-gray">—</span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            disabled={isWorking}
                            onClick={() =>
                              updateRequest(
                                request,
                                request.status === "approved"
                                  ? "rejected"
                                  : "approved",
                              )
                            }
                            className={`min-h-[36px] rounded-[10px] px-4 text-[8px] font-semibold disabled:opacity-50 ${
                              request.status === "approved"
                                ? "border border-red-200 bg-red-50 text-red-700"
                                : "bg-midnight-navy text-soft-white"
                            }`}
                          >
                            {isWorking
                              ? t("adminExperienceMediaSettings.saving")
                              : request.status === "approved"
                                ? t("adminExperienceMediaSettings.reject")
                                : t("adminExperienceMediaSettings.approve")}
                          </button>

                          {isSuperAdmin && (
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => deleteRequest(request)}
                              className="min-h-[36px] rounded-[10px] border border-midnight-navy/15 bg-warm-ivory px-4 text-[8px] font-semibold text-midnight-navy hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                            >
                              {t("adminExperienceMediaSettings.delete")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminExperienceMediaSettingsPage;
