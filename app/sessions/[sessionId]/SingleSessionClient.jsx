// app/sessions/[sessionId]/SingleSessionClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaSpinner,
  FaStar,
  FaFilePdf,
  FaLock,
  FaUser,
  FaLink,
  FaCheckCircle,
  FaPaperPlane,
  FaStar as FaStarFill,
} from "react-icons/fa";
import { format } from "date-fns";

const DEFAULT_BANNER =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg";

const SingleSessionClient = () => {
  const params = useParams();
  const sessionId = params?.sessionId;
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/users/sessions/${sessionId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
      } else {
        setError(data.message || "Session not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a rating");
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/users/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Feedback submitted! Thank you.");
        setComment("");
        setRating(5);
        fetchSession();
      } else {
        toast.error(data.message || "Failed to submit feedback");
      }
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  /* ============== SHIMMER LOADING ============== */
  if (loading) {
    return <SessionShimmer />;
  }

  /* ============== ERROR STATE ============== */
  if (error || !session) {
    return (
      <div className="min-h-[60vh] bg-[#E7E3D8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-[#3D444C]/10">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
            Session Not Found
          </h2>
          <p className="text-[#3D444C]/60 mb-6">
            {error || "The session you're looking for doesn't exist."}
          </p>
          <Link
            href="/sessions"
            className="inline-flex items-center gap-2 bg-[#994D35] text-white px-6 py-3 rounded-lg hover:bg-[#3D444C] transition-colors font-medium"
          >
            <FaArrowLeft className="text-sm" /> Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  const banner = session.sessionThumbnail?.url || DEFAULT_BANNER;
  const statusConfig = getStatusConfig(session.sessionStatus);

  return (
    <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-[#3D444C] hover:text-[#994D35] transition-colors mb-6 font-medium"
        >
          <FaArrowLeft className="text-sm" /> Back to Sessions
        </Link>

        {/* ============== HERO BANNER ============== */}
        <div className="relative w-full h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden shadow-xl mb-8">
          <Image
            src={banner}
            alt={session.sessionTitle}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D444C]/120 via-[#3D444C]/90 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-[#3D444C]/85 text-[#E7E3D8] text-xs sm:text-sm rounded-full font-semibold uppercase tracking-wide backdrop-blur-sm">
              {session.sessionType}
            </span>
            {session.isFeatured && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-[#D3A16D] text-[#3D444C] text-xs sm:text-sm rounded-full font-bold backdrop-blur-sm">
                <FaStar className="text-xs" /> Featured
              </span>
            )}
          </div>

          {/* Status */}
          <span
            className={`absolute top-4 right-4 px-3 py-1.5 text-xs sm:text-sm rounded-full font-bold shadow-md ${statusConfig.bg} ${statusConfig.text}`}
          >
            {statusConfig.label}
          </span>

          {/* Bottom: title inside banner */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
              {session.sessionTitle}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/90">
              <span className="flex items-center gap-1.5">
                <FaCalendar className="text-[#D3A16D]" />
                {format(new Date(session.sessionDate), "PPP")}
              </span>
              {session.sessionDay && (
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-[#D3A16D]" />
                  {session.sessionDay}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                {session.meetingType === "online" ? (
                  <>
                    <FaVideo className="text-[#D3A16D]" /> Online
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt className="text-[#D3A16D]" />
                    {session.location || "On-site"}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ============== CONTENT + SIDEBAR ============== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#994D35] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D444C]">
                  About This Session
                </h2>
              </div>
              <div
                className="prose prose-sm sm:prose-base max-w-none text-[#3D444C]/80 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    session.sessionDescription ||
                    "<p>No description provided.</p>",
                }}
              />
            </div>

            {/* Meeting Link (if online) */}
            {session.meetingType === "online" && session.meetingLink && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6">
                <h3 className="text-lg font-bold text-[#3D444C] mb-3 flex items-center gap-2">
                  <FaVideo className="text-[#D3A16D]" /> Meeting Link
                </h3>
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#994D35] hover:text-[#3D444C] font-semibold break-all transition-colors"
                >
                  <FaLink className="shrink-0" />
                  {session.meetingLink}
                </a>
              </div>
            )}

            {/* Pre-Session Resources */}
            <ResourceSection
              title="Pre-Session Resources"
              icon="📚"
              resources={session.preResources || []}
              locked={false}
            />

            {/* Post-Session Resources */}
            <ResourceSection
              title="Post-Session Resources"
              icon="🎓"
              resources={session.postResources || []}
              locked={session.postResourcesLocked}
              lockedMessage="Log in to access post-session resources"
            />

            {/* Feedback Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#D3A16D] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D444C]">
                  Feedback ({session.feedback?.length || 0})
                </h2>
              </div>

              {/* Feedback List */}
              {session.feedback && session.feedback.length > 0 ? (
                <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                  {session.feedback.map((f, i) => (
                    <div
                      key={f._id || i}
                      className="bg-[#E7E3D8]/40 rounded-xl p-4 border border-[#3D444C]/10"
                    >
                      {/* Top row: masked name + rating */}
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <p className="text-sm font-semibold text-[#3D444C]">
                          {f.displayName || "Anonymous"}
                        </p>

                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, idx) => (
                            <FaStarFill
                              key={idx}
                              className={
                                idx < f.rating
                                  ? "text-[#D3A16D] text-xs"
                                  : "text-[#3D444C]/20 text-xs"
                              }
                            />
                          ))}
                          <span className="text-[10px] text-[#3D444C]/60 ml-1">
                            {f.rating}/5
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      {f.comment && (
                        <p className="text-[#3D444C]/80 text-sm">{f.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#3D444C]/50 text-sm mb-6">
                  No feedback yet. Be the first to share your thoughts!
                </p>
              )}

              {/* Add Feedback Form */}
              {session.canAddFeedback && !session.hasSubmittedFeedback && (
                <form
                  onSubmit={handleSubmitFeedback}
                  className="border-t border-[#3D444C]/10 pt-5 mt-4"
                >
                  <h3 className="text-md font-semibold text-[#3D444C] mb-3">
                    Share Your Feedback
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <FaStarFill
                          className={`text-2xl ${
                            star <= rating
                              ? "text-[#D3A16D]"
                              : "text-[#3D444C]/20"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-[#3D444C]/60 ml-2">
                      {rating}/5
                    </span>
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience (optional)..."
                    rows="3"
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/20 text-sm resize-none mb-3"
                  />

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="inline-flex items-center gap-2 bg-[#3D444C] text-[#E7E3D8] px-5 py-2.5 rounded-lg hover:bg-[#994D35] transition-colors font-medium disabled:opacity-50"
                  >
                    {submittingFeedback ? (
                      <>
                        <FaSpinner className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane /> Submit Feedback
                      </>
                    )}
                  </button>
                </form>
              )}

              {session.hasSubmittedFeedback && (
                <div className="border-t border-[#3D444C]/10 pt-5 mt-4 flex items-center gap-2 text-green-600 font-medium text-sm">
                  <FaCheckCircle /> You have already submitted feedback. Thank
                  you!
                </div>
              )}

              {session.isAuthenticated && !session.isAttendee && (
                <div className="border-t border-[#3D444C]/10 pt-5 mt-4 text-[#3D444C]/60 text-sm">
                  Only attendees can leave feedback.
                </div>
              )}

              {!session.isAuthenticated && (
                <div className="border-t border-[#3D444C]/10 pt-5 mt-4 text-[#3D444C]/60 text-sm">
                  <Link
                    href="/login"
                    className="text-[#994D35] hover:underline font-semibold"
                  >
                    Log in
                  </Link>{" "}
                  to leave feedback.
                </div>
              )}
            </div>
          </div>

          {/* ============== SIDEBAR ============== */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-[#3D444C] mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#994D35] rounded-full" />
                Session Details
              </h3>

              <div className="space-y-4 text-sm">
                <InfoRow
                  icon={<FaCalendar className="text-[#D3A16D]" />}
                  label="Date"
                  value={format(new Date(session.sessionDate), "PPPP")}
                />
                {session.sessionDay && (
                  <InfoRow
                    icon={<FaClock className="text-[#D3A16D]" />}
                    label="Day"
                    value={session.sessionDay}
                  />
                )}
                <InfoRow
                  icon={
                    session.meetingType === "online" ? (
                      <FaVideo className="text-[#D3A16D]" />
                    ) : (
                      <FaMapMarkerAlt className="text-[#D3A16D]" />
                    )
                  }
                  label="Place"
                  value={
                    session.meetingType === "online"
                      ? "Online"
                      : session.location || "On-site"
                  }
                />
                <InfoRow
                  icon={<FaUser className="text-[#D3A16D]" />}
                  label="Organizer"
                  value={"ACC Career Club"}
                />
                <InfoRow
                  icon={<FaStar className="text-[#D3A16D]" />}
                  label="Type"
                  value={
                    session.sessionType.charAt(0).toUpperCase() +
                    session.sessionType.slice(1)
                  }
                />
              </div>

              <div className="mt-5 pt-5 border-t border-[#3D444C]/10 text-sm text-[#3D444C]/70">
                <span className="font-semibold text-[#3D444C]">
                  {session.sessionAttendees?.length || 0}
                </span>{" "}
                registered attendee
                {(session.sessionAttendees?.length || 0) !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   SHIMMER SKELETON
   ============================================================ */
const SessionShimmer = () => {
  return (
    <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button skeleton */}
        <div className="h-5 w-40 bg-[#3D444C]/10 rounded mb-6 animate-pulse" />

        {/* Hero banner skeleton */}
        <div className="relative w-full h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden bg-[#3D444C]/10 mb-8 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.8s_infinite]" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 space-y-3">
            <div className="h-8 w-3/4 bg-[#3D444C]/20 rounded" />
            <div className="h-4 w-1/2 bg-[#3D444C]/20 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8 animate-pulse">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-[#3D444C]/10 rounded-full" />
                <div className="h-6 w-48 bg-[#3D444C]/10 rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-[#3D444C]/10 rounded w-full" />
                <div className="h-4 bg-[#3D444C]/10 rounded w-11/12" />
                <div className="h-4 bg-[#3D444C]/10 rounded w-10/12" />
                <div className="h-4 bg-[#3D444C]/10 rounded w-9/12" />
                <div className="h-4 bg-[#3D444C]/10 rounded w-11/12" />
              </div>
            </div>

            {/* Pre-Resources card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8 animate-pulse">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 bg-[#3D444C]/10 rounded" />
                <div className="h-6 w-56 bg-[#3D444C]/10 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-[#3D444C]/10 rounded-lg" />
                <div className="h-12 bg-[#3D444C]/10 rounded-lg" />
              </div>
            </div>

            {/* Post-Resources card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8 animate-pulse">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 bg-[#3D444C]/10 rounded" />
                <div className="h-6 w-60 bg-[#3D444C]/10 rounded" />
              </div>
              <div className="h-20 bg-[#3D444C]/10 rounded-xl border border-dashed border-[#3D444C]/20" />
            </div>

            {/* Feedback card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8 animate-pulse">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-[#3D444C]/10 rounded-full" />
                <div className="h-6 w-40 bg-[#3D444C]/10 rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-20 bg-[#3D444C]/10 rounded-xl" />
                <div className="h-20 bg-[#3D444C]/10 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Sidebar column */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-[#3D444C]/10 rounded-full" />
                <div className="h-5 w-36 bg-[#3D444C]/10 rounded" />
              </div>
              <div className="space-y-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-[#3D444C]/10 rounded mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 bg-[#3D444C]/10 rounded" />
                      <div className="h-4 w-32 bg-[#3D444C]/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-[#3D444C]/10">
                <div className="h-4 w-40 bg-[#3D444C]/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   Sub-components
   ============================================================ */
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-[#3D444C]/50 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-[#3D444C] font-medium break-words">{value}</p>
    </div>
  </div>
);

const ResourceSection = ({ title, icon, resources, locked, lockedMessage }) => {
  if (!resources?.length && !locked) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold text-[#3D444C]">{title}</h2>
      </div>

      {locked ? (
        <div className="flex items-center gap-3 bg-[#E7E3D8]/50 border border-dashed border-[#3D444C]/20 rounded-xl p-5">
          <FaLock className="text-[#994D35] text-xl shrink-0" />
          <div>
            <p className="font-semibold text-[#3D444C]">
              {lockedMessage || "Resources Locked"}
            </p>
            <p className="text-xs text-[#3D444C]/60 mt-0.5">
              Sign in to access downloadable PDFs and materials.
            </p>
          </div>
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-2">
          {resources.map((r, i) => (
            <a
              key={r.publicId || i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#E7E3D8]/40 hover:bg-[#D3A16D]/30 border border-[#3D444C]/10 rounded-lg p-3 transition-colors group"
            >
              <FaFilePdf className="text-[#994D35] text-xl shrink-0" />
              <span className="flex-1 text-sm font-medium text-[#3D444C] truncate group-hover:text-[#994D35] transition-colors">
                {r.fileName || "Download PDF"}
              </span>
              <span className="text-xs text-[#3D444C]/40 group-hover:text-[#994D35]">
                Open →
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-[#3D444C]/50 text-sm">
          No resources available at the moment.
        </p>
      )}
    </div>
  );
};

/* ============================================================
   Helpers
   ============================================================ */
const getStatusConfig = (status) => {
  switch (status) {
    case "upcoming":
      return { label: "Upcoming", bg: "bg-[#D3A16D]", text: "text-[#3D444C]" };
    case "completed":
      return { label: "Completed", bg: "bg-green-500", text: "text-white" };
    case "cancelled":
      return { label: "Cancelled", bg: "bg-red-500", text: "text-white" };
    default:
      return { label: status, bg: "bg-gray-400", text: "text-white" };
  }
};

export default SingleSessionClient;
