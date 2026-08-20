import mongoose from "mongoose";

const experienceMediaSchema = new mongoose.Schema(
  {
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video", "audio", "file"],
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    fileName: String,

    fileSize: Number,

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ExperienceMedia", experienceMediaSchema);
