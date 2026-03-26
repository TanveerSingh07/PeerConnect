import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["connection_request", "connection_accepted", "like", "comment", "message"],
      required: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    postContent: {
      type: String,
      default: ""
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// Compound index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);