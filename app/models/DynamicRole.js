// app/models/DynamicRole.js

import mongoose from "mongoose";

const DynamicRoleSchema = new mongoose.Schema(
  {
    roleKey: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    displayName: { 
      type: String, 
      required: true 
    },
  },
  { timestamps: true }
);

const DynamicRole = mongoose.models.DynamicRole || mongoose.model("DynamicRole", DynamicRoleSchema);
export default DynamicRole;