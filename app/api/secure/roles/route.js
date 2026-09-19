// app/api/secure/roles/route.js

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import DynamicRole from "../../../models/DynamicRole";
import User from "../../../models/User";
import { getCurrentUser } from "../../../lib/authUtils";

export async function POST(request) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

    const decoded = getCurrentUser(token);
    if (
      !decoded ||
      !["prefect", "assistant_prefect", "itsecretary"].includes(decoded.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();
    const { roleKey, displayName } = await request.json();

    if (!roleKey || !displayName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const newRole = await DynamicRole.create({ roleKey, displayName });
    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    if (error.code === 11000)
      return NextResponse.json(
        { success: false, message: "Role key already exists" },
        { status: 400 },
      );
    return NextResponse.json(
      { success: false, message: "Failed to create role" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");
    const decoded = getCurrentUser(token);
    if (
      !decoded ||
      !["prefect", "assistant_prefect", "itsecretary"].includes(decoded.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const roleKey = searchParams.get("roleKey");

    await DynamicRole.findOneAndDelete({ roleKey });

    // Reset users who had this role or were executives under this role
    await User.updateMany(
      { role: roleKey },
      { $set: { role: "member", executiveBranch: null } },
    );
    await User.updateMany(
      { role: "executive_member", executiveBranch: roleKey },
      { $set: { role: "member", executiveBranch: null } },
    );

    return NextResponse.json({
      success: true,
      message: "Role deleted and users reset",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete role" },
      { status: 500 },
    );
  }
}
