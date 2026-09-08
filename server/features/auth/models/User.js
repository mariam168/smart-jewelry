import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    whatsappVerifiedAt: {
  type: Date,
  default: null,
},

whatsappOtpHash: {
  type: String,
  default: null,
},

whatsappOtpExpiresAt: {
  type: Date,
  default: null,
},

whatsappOtpLastSentAt: {
  type: Date,
  default: null,
},

whatsappOtpAttempts: {
  type: Number,
  default: 0,
},

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    emailVerificationTokenHash: {
      type: String,
      default: null,
    },

    emailVerificationExpiresAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
