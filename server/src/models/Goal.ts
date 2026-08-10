import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    icon: { type: String, default: "🎯" },
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true }
);

export const Goal = mongoose.model("Goal", goalSchema);
