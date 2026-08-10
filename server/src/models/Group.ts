import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: String, required: true }], // member names or emails
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", groupSchema);
