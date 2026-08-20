import mongoose from "mongoose";

const experiencePersonalSchema = new mongoose.Schema(
  {
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
    },

    ownerName: {
      type: String,
      default: "",
    },

    receiverName: {
      type: String,
      default: "",
    },

    receiverEmail: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    gallery: [
      {
        type: String,
      },
    ],

    videos: [
      {
        type: String,
      },
    ],

    audios: [
      {
        type: String,
      },
    ],

    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ExperiencePersonal", experiencePersonalSchema);
