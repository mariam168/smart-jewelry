import mongoose from "mongoose";

const videoUploadRequestSchema = new mongoose.Schema(
  {
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
      unique: true,
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
  },
);

const VideoUploadRequest =
  mongoose.models.VideoUploadRequest ||
  mongoose.model(
    "VideoUploadRequest",
    videoUploadRequestSchema,
  );

export default VideoUploadRequest;