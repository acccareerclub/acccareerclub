// app/context/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line
  }, []);


  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Check if session expired
        if (data.message === "Session expired. Please login again.") {
          toast.error("Session expired. Please login again.");
          // Clear any stored tokens
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          router.push("/login?session=expired");
        }
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // In AuthContext.jsx - Update the login function
  const login = async (identifier, password) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }), // Changed from email to identifier
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        router.push("/");
        return { success: true, user: data.user };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/signup", {
        // ✅ FIXED: Changed from /api/user/register to /api/auth/signup
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        // ✅ FIXED: Don't set user or authenticate - they need to login
        toast.success("Registration successful! Please login to continue.");
        router.push("/login"); // ✅ FIXED: Redirect to login page
        return { success: true };
      } else {
        toast.error(data.message || "Registration failed");
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        // ✅ FIXED: Changed from /api/user/logout to /api/auth/logout
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        setIsAuthenticated(false);
        toast.success("Logged out successfully");
        router.push("/login");
        return { success: true };
      } else {
        toast.error("Logout failed");
        return { success: false };
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
      return { success: false };
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      if (!user || !user.id) {
        toast.error("User not authenticated");
        return { success: false, error: "User not authenticated" };
      }

      const response = await fetch(`/api/auth/me`, {
        // ✅ FIXED: Update user profile
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        toast.success("Profile updated successfully!");
        return { success: true, user: data.user };
      } else {
        toast.error(data.message || "Profile update failed");
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Profile update failed. Please try again.");
      return { success: false, error: error.message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch("/api/auth/change-password", {
        // ✅ FIXED: Changed from /api/user/change-password to /api/auth/change-password
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password changed successfully!");
        return { success: true };
      } else {
        toast.error(data.message || "Password change failed");
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("Password change failed. Please try again.");
      return { success: false, error: error.message };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
        changePassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
