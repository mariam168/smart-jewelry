import mongoose from "mongoose";

const experienceMediaSchema =
  new mongoose.Schema(
    {
      experience: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience",
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: [
          "image",
          "video",
          "audio",
          "file",
        ],
        required: true,
      },

      url: {
        type: String,
        required: true,
      },

      fileName: {
        type: String,
        default: "",
      },

      fileSize: {
        type: Number,
        default: 0,
      },

      note: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    },
  );

experienceMediaSchema.index({
  experience: 1,
  type: 1,
});

const ExperienceMedia =
  mongoose.models.ExperienceMedia ||
  mongoose.model(
    "ExperienceMedia",
    experienceMediaSchema,
  );

export default ExperienceMedia;