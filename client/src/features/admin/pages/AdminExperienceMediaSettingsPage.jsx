import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getExperienceMediaLimits,
  updateExperienceMediaLimits,
  getAdminVideoUploadRequests,
  updateAdminVideoUploadRequest,
} from "../../experience/services/experienceApi.js";

const normalizeWhatsAppNumber = (
  value,
) => {
  const digits =
    String(
      value || "",
    ).replace(
      /\D/g,
      "",
    );

  if (!digits) {
    return "";
  }

  if (
    digits.startsWith(
      "20",
    )
  ) {
    return digits;
  }

  if (
    digits.startsWith(
      "0",
    )
  ) {
    return `20${digits.slice(
      1,
    )}`;
  }

  return digits;
};

const formatDate = (
  value,
) => {
  if (!value) {
    return "—";
  }

  return new Date(
    value,
  ).toLocaleString(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  );
};

const getStatusClasses = (
  status,
) => {
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

const AdminExperienceMediaSettingsPage =
  () => {
    const [
      form,
      setForm,
    ] = useState({
      imageLimit: 5,
      videoLimit: 5,
      audioLimit: 5,
    });

    const [
      videoRequests,
      setVideoRequests,
    ] = useState([]);

    const [
      requestLimits,
      setRequestLimits,
    ] = useState({});

    const [
      requestNotes,
      setRequestNotes,
    ] = useState({});

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      workingRequestId,
      setWorkingRequestId,
    ] = useState("");

    const [
      message,
      setMessage,
    ] = useState("");

    const [
      error,
      setError,
    ] = useState("");

    const loadPage =
      async () => {
        try {
          setLoading(
            true,
          );

          setError("");

          const [
            limits,
            requests,
          ] = await Promise.all([
            getExperienceMediaLimits(),
            getAdminVideoUploadRequests(),
          ]);

          setForm({
            imageLimit:
              Number(
                limits?.imageLimit ??
                  5,
              ),

            videoLimit:
              Number(
                limits?.videoLimit ??
                  5,
              ),

            audioLimit:
              Number(
                limits?.audioLimit ??
                  5,
              ),
          });

          setVideoRequests(
            Array.isArray(
              requests,
            )
              ? requests
              : [],
          );

          const limitsByRequest =
            {};

          const notesByRequest =
            {};

          (
            Array.isArray(
              requests,
            )
              ? requests
              : []
          ).forEach(
            (
              request,
            ) => {
              limitsByRequest[
                request._id
              ] =
                Number(
                  request.approvedVideoLimit ||
                    0,
                ) || 1;

              notesByRequest[
                request._id
              ] =
                request.adminNote ||
                "";
            },
          );

          setRequestLimits(
            limitsByRequest,
          );

          setRequestNotes(
            notesByRequest,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError?.response
              ?.data
              ?.message ||
              "Failed to load experience media controls.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      };

    useEffect(() => {
      loadPage();
    }, []);

    const handleChange =
      (
        event,
      ) => {
        const {
          name,
          value,
        } = event.target;

        setForm(
          (
            previous,
          ) => ({
            ...previous,

            [name]:
              value,
          }),
        );
      };

    const handleSave =
      async (
        event,
      ) => {
        event.preventDefault();

        try {
          setSaving(
            true,
          );

          setError("");
          setMessage("");

          const payload = {
            imageLimit:
              Number(
                form.imageLimit,
              ),

            videoLimit:
              Number(
                form.videoLimit,
              ),

            audioLimit:
              Number(
                form.audioLimit,
              ),
          };

          const result =
            await updateExperienceMediaLimits(
              payload,
            );

          setForm(
            result,
          );

          setMessage(
            "Media limits updated successfully.",
          );
        } catch (
          saveError
        ) {
          setError(
            saveError?.response
              ?.data
              ?.message ||
              "Failed to update media limits.",
          );
        } finally {
          setSaving(
            false,
          );
        }
      };

    const updateRequest =
      async (
        request,
        status,
      ) => {
        try {
          setWorkingRequestId(
            request._id,
          );

          setError("");
          setMessage("");

          const payload = {
            status,

            approvedVideoLimit:
              status ===
              "approved"
                ? Number(
                    requestLimits[
                      request._id
                    ] || 1,
                  )
                : 0,

            adminNote:
              requestNotes[
                request._id
              ] || "",
          };

          await updateAdminVideoUploadRequest(
            request._id,
            payload,
          );

          setMessage(
            status ===
              "approved"
              ? "Video upload access approved."
              : "Video upload request rejected.",
          );

          await loadPage();
        } catch (
          updateError
        ) {
          setError(
            updateError?.response
              ?.data
              ?.message ||
              "Failed to update video request.",
          );
        } finally {
          setWorkingRequestId(
            "",
          );
        }
      };

    const requestStats =
      useMemo(() => {
        return {
          total:
            videoRequests.length,

          pending:
            videoRequests.filter(
              (
                request,
              ) =>
                request.status ===
                "pending",
            ).length,

          approved:
            videoRequests.filter(
              (
                request,
              ) =>
                request.status ===
                "approved",
            ).length,

          rejected:
            videoRequests.filter(
              (
                request,
              ) =>
                request.status ===
                "rejected",
            ).length,
        };
      }, [videoRequests]);

    if (loading) {
      return (
        <div className="flex min-h-[440px] items-center justify-center bg-warm-ivory">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

            <p className="mt-5 text-[12px] text-slate-gray">
              Loading Experience Media Controls...
            </p>
          </div>
        </div>
      );
    }

    const settings = [
      {
        name:
          "imageLimit",

        title:
          "Image Limit",

        description:
          "Maximum photos allowed in each jewelry experience.",

        icon:
          "◫",
      },

      {
        name:
          "audioLimit",

        title:
          "Voice Message Limit",

        description:
          "Maximum number of voice recordings. Customers record them inside the experience page; audio-file upload is not offered.",

        icon:
          "♫",
      },

      {
        name:
          "videoLimit",

        title:
          "Global Video Maximum",

        description:
          "Maximum videos an approved experience can ever receive. Each customer still needs separate admin approval below.",

        icon:
          "▶",
      },
    ];

    return (
      <div className="min-h-full space-y-8 text-midnight-navy">
        <header className="overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-gradient-to-br from-deep-navy via-rich-navy to-luxury-black px-7 py-9 shadow-[0_24px_65px_rgba(7,19,31,0.16)] sm:px-9">
          <div className="flex items-center gap-3">
            <span className="text-champagne-gold">
              ✦
            </span>

            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-premium-silver">
              Experience Settings
            </span>
          </div>

          <h1 className="mt-4 font-serif text-[3rem] text-soft-white">
            Media Control
          </h1>

          <p className="mt-4 max-w-2xl text-[13px] leading-7 text-premium-silver/75">
            Photos are customer uploads, audio is recorded inside the
            experience, and videos require individual admin approval.
          </p>
        </header>

        {error && (
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[12px] text-red-700">
            {
              error
            }
          </div>
        )}

        {message && (
          <div className="rounded-[16px] border border-champagne-gold/30 bg-soft-cream px-5 py-4 text-[12px] text-antique-gold">
            {
              message
            }
          </div>
        )}

        <form
          onSubmit={
            handleSave
          }
          className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white shadow-[0_20px_60px_rgba(7,19,31,0.06)]"
        >
          <div className="border-b border-light-champagne bg-warm-ivory/50 px-7 py-7">
            <h2 className="font-serif text-[1.8rem]">
              Global Media Limits
            </h2>

            <p className="mt-2 text-[11px] leading-6 text-slate-gray">
              Attachments are removed. Video limit here is only the global
              ceiling; each Experience must also be approved individually.
            </p>
          </div>

          <div className="grid gap-5 p-7 lg:grid-cols-3">
            {settings.map(
              (
                item,
              ) => (
                <div
                  key={
                    item.name
                  }
                  className="rounded-[20px] border border-light-champagne bg-warm-ivory/50 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-champagne-gold">
                      {
                        item.icon
                      }
                    </div>

                    <div className="min-w-0 flex-1">
                      <label className="text-[12px] font-semibold text-midnight-navy">
                        {
                          item.title
                        }
                      </label>

                      <p className="mt-1 min-h-[60px] text-[10px] leading-5 text-slate-gray">
                        {
                          item.description
                        }
                      </p>

                      <div className="relative mt-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          required
                          name={
                            item.name
                          }
                          value={
                            form[
                              item.name
                            ]
                          }
                          onChange={
                            handleChange
                          }
                          className="h-[52px] w-full rounded-[13px] border border-light-champagne bg-soft-white px-5 pr-20 text-[14px] font-semibold outline-none focus:border-classic-gold"
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase text-steel-gray">
                          Max
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="flex items-center justify-between border-t border-light-champagne bg-warm-ivory/30 px-7 py-6">
            <p className="text-[10px] text-steel-gray">
              Allowed range: 0–100 per media type
            </p>

            <button
              type="submit"
              disabled={
                saving
              }
              className="inline-flex min-h-[48px] min-w-[170px] items-center justify-center rounded-[13px] bg-midnight-navy px-7 text-[10px] font-semibold uppercase tracking-[0.12em] text-soft-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Limits"}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white shadow-[0_20px_60px_rgba(7,19,31,0.06)]">
          <div className="border-b border-light-champagne bg-warm-ivory/50 px-7 py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                  Admin Approval Queue
                </p>

                <h2 className="mt-3 font-serif text-[1.9rem]">
                  Video Upload Requests
                </h2>

                <p className="mt-2 max-w-2xl text-[11px] leading-6 text-slate-gray">
                  Customer request details arrive here. Approve the Experience
                  and choose exactly how many videos it may upload.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  [
                    "Total",
                    requestStats.total,
                  ],

                  [
                    "Pending",
                    requestStats.pending,
                  ],

                  [
                    "Approved",
                    requestStats.approved,
                  ],

                  [
                    "Rejected",
                    requestStats.rejected,
                  ],
                ].map(
                  ([
                    label,
                    value,
                  ]) => (
                    <div
                      key={
                        label
                      }
                      className="min-w-[74px] rounded-[13px] border border-light-champagne bg-soft-white px-3 py-2 text-center"
                    >
                      <p className="text-[7px] uppercase tracking-[0.12em] text-steel-gray">
                        {
                          label
                        }
                      </p>

                      <p className="mt-1 font-serif text-[1.2rem] text-midnight-navy">
                        {
                          value
                        }
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {videoRequests.length ===
          0 ? (
            <div className="p-10 text-center">
              <p className="font-serif text-[1.5rem] text-midnight-navy">
                No Video Requests Yet
              </p>

              <p className="mt-2 text-[11px] text-slate-gray">
                Requests submitted from Manage Experience will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left">
                <thead>
                  <tr className="bg-midnight-navy">
                    {[
                      "Customer",
                      "Experience",
                      "Request",
                      "Status",
                      "Allowed Videos",
                      "Admin Note",
                      "Contact",
                      "Action",
                    ].map(
                      (
                        heading,
                      ) => (
                        <th
                          key={
                            heading
                          }
                          className="px-5 py-4 text-[7px] font-semibold uppercase tracking-[0.18em] text-champagne-gold"
                        >
                          {
                            heading
                          }
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-champagne/70">
                  {videoRequests.map(
                    (
                      request,
                    ) => {
                      const experience =
                        request.experience ||
                        {};

                      const order =
                        experience.order ||
                        {};

                      const owner =
                        experience.owner ||
                        {};

                      const whatsappNumber =
                        normalizeWhatsAppNumber(
                          request.requesterPhone,
                        );

                      const isWorking =
                        workingRequestId ===
                        request._id;

                      return (
                        <tr
                          key={
                            request._id
                          }
                          className="align-top hover:bg-warm-ivory/40"
                        >
                          <td className="px-5 py-5">
                            <p className="text-[11px] font-semibold text-midnight-navy">
                              {
                                request.requesterName
                              }
                            </p>

                            <p className="mt-1 text-[9px] text-steel-gray">
                              {
                                request.requesterPhone
                              }
                            </p>

                            {owner?.email && (
                              <p className="mt-1 text-[8px] text-steel-gray">
                                {
                                  owner.email
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <p className="font-mono text-[9px] text-midnight-navy">
                              {experience.serialNumber ||
                                "—"}
                            </p>

                            <p className="mt-1 text-[8px] text-steel-gray">
                              Order #
                              {order.orderNumber ||
                                "—"}
                            </p>

                            <p className="mt-1 text-[8px] text-steel-gray">
                              {formatDate(
                                request.requestedAt ||
                                  request.createdAt,
                              )}
                            </p>
                          </td>

                          <td className="max-w-[240px] px-5 py-5">
                            <p className="whitespace-pre-wrap text-[9px] leading-5 text-slate-gray">
                              {request.message ||
                                "No note provided."}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
                                request.status,
                              )}`}
                            >
                              {
                                request.status
                              }
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <input
                              type="number"
                              min="1"
                              max={Math.max(
                                Number(
                                  form.videoLimit ||
                                    1,
                                ),
                                1,
                              )}
                              value={
                                requestLimits[
                                  request._id
                                ] || 1
                              }
                              onChange={(
                                event,
                              ) =>
                                setRequestLimits(
                                  (
                                    previous,
                                  ) => ({
                                    ...previous,

                                    [request._id]:
                                      event.target
                                        .value,
                                  }),
                                )
                              }
                              className="h-[42px] w-[90px] rounded-[10px] border border-light-champagne bg-warm-ivory px-3 text-[11px] outline-none focus:border-classic-gold"
                            />

                            <p className="mt-1 text-[7px] text-steel-gray">
                              Global max:{" "}
                              {
                                form.videoLimit
                              }
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <textarea
                              rows={3}
                              value={
                                requestNotes[
                                  request._id
                                ] || ""
                              }
                              onChange={(
                                event,
                              ) =>
                                setRequestNotes(
                                  (
                                    previous,
                                  ) => ({
                                    ...previous,

                                    [request._id]:
                                      event.target
                                        .value,
                                  }),
                                )
                              }
                              placeholder="Optional note"
                              className="w-[220px] resize-none rounded-[10px] border border-light-champagne bg-warm-ivory px-3 py-2 text-[9px] leading-4 outline-none focus:border-classic-gold"
                            />
                          </td>

                          <td className="px-5 py-5">
                            {whatsappNumber ? (
                              <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                                  `Hello ${request.requesterName}, regarding your JEVORYA video upload request for serial ${experience.serialNumber || ""}.`,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-[38px] items-center rounded-full bg-[#25D366] px-4 text-[8px] font-semibold text-white"
                              >
                                WhatsApp
                              </a>
                            ) : (
                              <span className="text-[8px] text-steel-gray">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                disabled={
                                  isWorking
                                }
                                onClick={() =>
                                  updateRequest(
                                    request,
                                    "approved",
                                  )
                                }
                                className="min-h-[36px] rounded-[10px] bg-midnight-navy px-4 text-[8px] font-semibold text-soft-white disabled:opacity-50"
                              >
                                {isWorking
                                  ? "Saving..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                disabled={
                                  isWorking
                                }
                                onClick={() =>
                                  updateRequest(
                                    request,
                                    "rejected",
                                  )
                                }
                                className="min-h-[36px] rounded-[10px] border border-red-200 bg-red-50 px-4 text-[8px] font-semibold text-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  };

export default AdminExperienceMediaSettingsPage;