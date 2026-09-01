import {
  useEffect,
  useState,
} from "react";

import {
  getExperienceMediaLimits,
  updateExperienceMediaLimits,
} from "../../experience/services/experienceApi.js";

const AdminExperienceMediaSettingsPage =
  () => {
    const [
      form,
      setForm,
    ] = useState({
      imageLimit: 5,
      videoLimit: 5,
      audioLimit: 5,
      fileLimit: 5,
    });

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      message,
      setMessage,
    ] = useState("");

    const [
      error,
      setError,
    ] = useState("");

    useEffect(() => {
      loadSettings();
    }, []);

    const loadSettings =
      async () => {
        try {
          setLoading(true);

          const data =
            await getExperienceMediaLimits();

          setForm({
            imageLimit:
              Number(
                data?.imageLimit ??
                  5,
              ),

            videoLimit:
              Number(
                data?.videoLimit ??
                  5,
              ),

            audioLimit:
              Number(
                data?.audioLimit ??
                  5,
              ),

            fileLimit:
              Number(
                data?.fileLimit ??
                  5,
              ),
          });
        } catch (error) {
          setError(
            error?.response?.data
              ?.message ||
              "Failed to load media limits.",
          );
        } finally {
          setLoading(false);
        }
      };

    const handleChange = (
      event,
    ) => {
      const {
        name,
        value,
      } = event.target;

      setForm(
        (previous) => ({
          ...previous,

          [name]:
            value,
        }),
      );
    };

    const handleSave =
      async (event) => {
        event.preventDefault();

        try {
          setSaving(true);

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

            fileLimit:
              Number(
                form.fileLimit,
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
        } catch (error) {
          setError(
            error?.response?.data
              ?.message ||
              "Failed to update media limits.",
          );
        } finally {
          setSaving(false);
        }
      };

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-warm-ivory">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

            <p className="mt-5 text-[12px] text-slate-gray">
              Loading Media Settings...
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
          "Maximum number of photos allowed in each jewelry experience.",

        icon:
          "◫",
      },

      {
        name:
          "videoLimit",

        title:
          "Video Limit",

        description:
          "Maximum number of videos allowed in each jewelry experience.",

        icon:
          "▶",
      },

      {
        name:
          "audioLimit",

        title:
          "Audio Limit",

        description:
          "Maximum number of voice messages or audio files allowed.",

        icon:
          "♫",
      },

      {
        name:
          "fileLimit",

        title:
          "Attachment Limit",

        description:
          "Maximum number of documents and other attachments allowed.",

        icon:
          "⌕",
      },
    ];

    return (
      <div className="min-h-screen bg-warm-ivory text-midnight-navy">
        <header className="border-b border-rich-navy bg-gradient-to-br from-deep-navy via-rich-navy to-luxury-black">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex items-center gap-3">
              <span className="text-champagne-gold">
                ✦
              </span>

              <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-premium-silver">
                Experience Settings
              </span>
            </div>

            <h1 className="mt-4 font-serif text-[3rem] text-soft-white">
              Media Limits
            </h1>

            <p className="mt-4 max-w-2xl text-[13px] leading-7 text-premium-silver/75">
              Control how many photos, videos, audio messages and attachments customers can add to each jewelry experience.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
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

          <form
            onSubmit={
              handleSave
            }
            className="overflow-hidden rounded-[28px] border border-light-champagne bg-soft-white shadow-[0_20px_60px_rgba(7,19,31,0.06)]"
          >
            <div className="border-b border-light-champagne bg-warm-ivory/50 px-7 py-7">
              <h2 className="font-serif text-[1.8rem]">
                Customer Upload Limits
              </h2>

              <p className="mt-2 text-[11px] leading-6 text-slate-gray">
                These limits apply to every jewelry experience. Existing media will not be deleted if you lower a limit.
              </p>
            </div>

            <div className="grid gap-5 p-7 md:grid-cols-2">
              {settings.map(
                (item) => (
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

                        <p className="mt-1 text-[10px] leading-5 text-slate-gray">
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
                className="inline-flex min-h-[48px] min-w-[170px] items-center justify-center rounded-[13px] bg-midnight-navy px-7 text-[10px] font-semibold uppercase tracking-[0.12em] text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.15)] disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Limits"}
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  };

export default AdminExperienceMediaSettingsPage;