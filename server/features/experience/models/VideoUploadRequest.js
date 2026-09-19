import mongoose from "mongoose";

const mediaUploadRequestSchema = new mongoose.Schema(
  {
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
      index: true,
    },

    mediaType: {
      type: String,
      enum: ["image", "audio", "video"],
      required: true,
      index: true,
    },

    requesterName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    requesterPhone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    requestedExtraLimit: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },

    approvedExtraLimit: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    approvedVideoLimit: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

mediaUploadRequestSchema.index({
  experience: 1,
  mediaType: 1,
  status: 1,
});

const ExperienceMediaRequest =
  mongoose.models.ExperienceMediaRequest ||
  mongoose.model("ExperienceMediaRequest", mediaUploadRequestSchema);

export default ExperienceMediaRequest;