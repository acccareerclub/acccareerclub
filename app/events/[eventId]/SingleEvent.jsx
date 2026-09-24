// app/events/[eventId]/SingleEvent.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  FaArrowLeft,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaSpinner,
  FaStar,
  FaFilePdf,
  FaLock,
  FaUser,
  FaCheckCircle,
  FaPaperPlane,
  FaUsers,
  FaTrophy,
  FaMicrophone,
  FaUserPlus,
  FaEnvelope,
  FaCrown,
  FaInfoCircle,
} from "react-icons/fa";
import { FaStar as FaStarFill } from "react-icons/fa";

const DEFAULT_BANNER =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790148020/event-invitation_alzpch.jpg";

const SingleEvent = ({ eventId }) => {
  const { user, loading: authLoading } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log(event);

  // Feedback
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // External feedback verification
  const [externalEmail, setExternalEmail] = useState("");
  const [verifyingExternal, setVerifyingExternal] = useState(false);
  const [verifiedExternal, setVerifiedExternal] = useState(null); // email string
  const [verifiedExternalName, setVerifiedExternalName] = useState(""); // name

  // Pre-registration (external)
  const [extForm, setExtForm] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    identificationNo: "",
  });
  const [submittingPre, setSubmittingPre] = useState(false);

  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (verifiedExternal) params.set("verifiedEmail", verifiedExternal);
      const qs = params.toString();
      const res = await fetch(
        `/api/users/events/${eventId}${qs ? `?${qs}` : ""}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (data.success) setEvent(data.event);
      else setError(data.message || "Event not found");
    } catch (err) {
      console.error(err);
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user?._id || user?.id, verifiedExternal]);

  // ==========================================
  // Feedback submit (member or verified external)
  // ==========================================
  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!user && !verifiedExternal) {
      return toast.error("Please log in or verify your email first.");
    }
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/users/events/${eventId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rating,
          comment,
          verifiedEmail: !user ? verifiedExternal : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Thank you for your feedback!");
        setComment("");
        setRating(5);
        fetchEvent();
      } else {
        toast.error(data.message || "Failed to submit feedback");
      }
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // ==========================================
  // External email verification
  // ==========================================
  const verifyExternal = async (e) => {
    e.preventDefault();
    const emailLower = externalEmail.toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(emailLower)) {
      return toast.error("Enter a valid email");
    }
    setVerifyingExternal(true);
    try {
      const res = await fetch(
        `/api/users/events/${eventId}?verifiedEmail=${encodeURIComponent(
          emailLower,
        )}`,
      );
      const data = await res.json();

      // externalFeedbackIdentity is now an object: { email, name, institution } | null
      const identity = data?.event?.externalFeedbackIdentity;

      if (data.success && identity) {
        setVerifiedExternal(identity.email);
        setVerifiedExternalName(identity.name || "");
        toast.success(
          identity.name
            ? `Verified as ${identity.name}. You can now leave feedback.`
            : "Email verified! You can now leave feedback.",
        );
      } else {
        toast.error("This email is not in the attendee list for this event.");
      }
    } catch {
      toast.error("Failed to verify email");
    } finally {
      setVerifyingExternal(false);
    }
  };

  // ==========================================
  // Pre-registration — member
  // ==========================================
  const preRegisterMember = async () => {
    if (!user) return toast.error("Please log in first.");
    setSubmittingPre(true);
    try {
      const res = await fetch(`/api/users/events/${eventId}/pre-register`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchEvent();
      } else toast.error(data.message || "Failed to register");
    } catch {
      toast.error("Failed to register");
    } finally {
      setSubmittingPre(false);
    }
  };

  // ==========================================
  // Pre-registration — external
  // ==========================================
  const preRegisterExternal = async (e) => {
    e.preventDefault();
    if (!extForm.name.trim()) return toast.error("Name is required");
    if (!/^\S+@\S+\.\S+$/.test(extForm.email))
      return toast.error("Valid email is required");

    setSubmittingPre(true);
    try {
      const res = await fetch(`/api/users/events/${eventId}/pre-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          data.verifyUrl
            ? "Registered! Please check your email to verify."
            : data.message,
        );
        setExtForm({
          name: "",
          email: "",
          phone: "",
          institution: "",
          identificationNo: "",
        });
        fetchEvent();
      } else toast.error(data.message || "Failed to register");
    } catch {
      toast.error("Failed to register");
    } finally {
      setSubmittingPre(false);
    }
  };

  // ==========================================
  // Loading / Error
  // ==========================================
  if (loading || authLoading) return <EventShimmer />;

  if (error || !event) {
    return (
      <div className="min-h-[60vh] bg-[#E7E3D8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-[#3D444C]/10">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
            Event Not Found
          </h2>
          <p className="text-[#3D444C]/60 mb-6">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-[#994D35] text-white px-6 py-3 rounded-lg hover:bg-[#3D444C] transition-colors font-medium"
          >
            <FaArrowLeft className="text-sm" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const banner = event.eventThumbnail?.url || DEFAULT_BANNER;
  const statusConfig = getStatusConfig(event.eventStatus);
  const isPast =
    event.eventDate && new Date(event.eventDate).getTime() < Date.now();
  const isCompleted = event.eventStatus === "completed";

  const registrationOpen =
    !isCompleted &&
    event.preRegistrationRequired &&
    !isPast &&
    event.eventStatus !== "cancelled" &&
    (!event.preRegistrationDeadline ||
      new Date() <= new Date(event.preRegistrationDeadline));

  const showFeedbackSection = isCompleted;

  return (
    <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-[#3D444C] hover:text-[#994D35] transition-colors mb-6 font-medium"
        >
          <FaArrowLeft className="text-sm" /> Back to Events
        </Link>

        {/* HERO — split layout: image on top, info card below */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-[#3D444C]/10 bg-white">
          {/* ---------- Thumbnail (image only, no text overlay) ---------- */}
          <div className="relative w-full h-56 sm:h-72 lg:h-80 bg-[#3D444C]">
            <Image
              src={banner}
              alt={event.eventTitle}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />

            {/* Top-left badges — floating over image (small, unobtrusive) */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-[#3D444C]/85 text-[#E7E3D8] text-xs sm:text-sm rounded-full font-semibold uppercase tracking-wide backdrop-blur-sm">
                {event.eventType}
              </span>
              {event.isFeatured && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-[#D3A16D] text-[#3D444C] text-xs sm:text-sm rounded-full font-bold backdrop-blur-sm">
                  <FaStar className="text-xs" /> Featured
                </span>
              )}
            </div>

            {/* Top-right status pill */}
            <span
              className={`absolute top-4 right-4 px-3 py-1.5 text-xs sm:text-sm rounded-full font-bold shadow-md ${statusConfig.bg} ${statusConfig.text}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* ---------- Info panel (text lives here, not on image) ---------- */}
          <div className="p-5 sm:p-8 bg-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#3D444C] leading-tight">
              {event.eventTitle}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#3D444C]/70">
              {event.eventDate && (
                <span className="flex items-center gap-2">
                  <FaCalendar className="text-[#D3A16D]" />
                  <span className="font-medium">
                    {format(new Date(event.eventDate), "PPP")}
                  </span>
                </span>
              )}
              {event.eventDay && (
                <span className="flex items-center gap-2">
                  <FaClock className="text-[#D3A16D]" />
                  <span className="font-medium">{event.eventDay}</span>
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#D3A16D]" />
                  <span className="font-medium">{event.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#994D35] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D444C]">
                  About This Event
                </h2>
              </div>
              <div
                className="prose prose-sm sm:prose-base max-w-none text-[#3D444C]/80 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    event.eventDescription || "<p>No description provided.</p>",
                }}
              />
            </div>

            {/* Speaker */}
            {event.eventSpeakerAvailability &&
              event.eventSpeakerCredentials?.speakerName && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <FaMicrophone className="text-[#D3A16D]" />
                    <h2 className="text-xl font-bold text-[#3D444C]">
                      Speaker
                    </h2>
                  </div>
                  <p className="font-semibold text-[#3D444C]">
                    {event.eventSpeakerCredentials.speakerName}
                  </p>
                  {event.eventSpeakerCredentials.speakerDescription && (
                    <p className="text-sm text-[#3D444C]/70 mt-1 whitespace-pre-line">
                      {event.eventSpeakerCredentials.speakerDescription}
                    </p>
                  )}
                </div>
              )}

            {/* Pre-registration — hidden when completed */}
            {registrationOpen && (
              <PreRegistrationCard
                event={event}
                user={user}
                registrationOpen={registrationOpen}
                submittingPre={submittingPre}
                extForm={extForm}
                setExtForm={setExtForm}
                onMemberRegister={preRegisterMember}
                onExternalRegister={preRegisterExternal}
              />
            )}

            {/* Achievers — shown when completed */}
            {isCompleted && event.achievers && event.achievers.length > 0 && (
              <AchieversSection achievers={event.achievers} />
            )}

            {/* Resources */}
            <ResourceSection
              title="Pre-Event Resources"
              icon="📚"
              resources={event.preResources || []}
            />
            <ResourceSection
              title="Post-Event Resources"
              icon="🎓"
              resources={event.postResources || []}
            />

            {/* Feedback — only when completed */}
            {showFeedbackSection && (
              <FeedbackSection
                event={event}
                user={user}
                rating={rating}
                setRating={setRating}
                comment={comment}
                setComment={setComment}
                submittingFeedback={submittingFeedback}
                onSubmit={submitFeedback}
                externalEmail={externalEmail}
                setExternalEmail={setExternalEmail}
                verifyingExternal={verifyingExternal}
                verifiedExternal={verifiedExternal}
                verifiedExternalName={verifiedExternalName}
                onVerifyExternal={verifyExternal}
              />
            )}
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-[#3D444C] mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#994D35] rounded-full" />
                Event Details
              </h3>

              <div className="space-y-4 text-sm">
                {event.eventDate && (
                  <InfoRow
                    icon={<FaCalendar className="text-[#D3A16D]" />}
                    label="Date"
                    value={format(new Date(event.eventDate), "PPPP")}
                  />
                )}
                {event.eventDay && (
                  <InfoRow
                    icon={<FaClock className="text-[#D3A16D]" />}
                    label="Day"
                    value={event.eventDay}
                  />
                )}
                <InfoRow
                  icon={<FaMapMarkerAlt className="text-[#D3A16D]" />}
                  label="Place"
                  value={event.location || "On-site"}
                />
                <InfoRow
                  icon={<FaUser className="text-[#D3A16D]" />}
                  label="Organizer"
                  value="ACC Career Club"
                />
                <InfoRow
                  icon={<FaStar className="text-[#D3A16D]" />}
                  label="Type"
                  value={
                    event.eventType.charAt(0).toUpperCase() +
                    event.eventType.slice(1)
                  }
                />
              </div>

              <div className="mt-5 pt-5 border-t border-[#3D444C]/10 space-y-2 text-sm text-[#3D444C]/70">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-[#D3A16D]" />
                  <span className="font-semibold text-[#3D444C]">
                    {event.attendeeCount}
                  </span>{" "}
                  attendee{event.attendeeCount !== 1 ? "s" : ""}
                </div>
                {event.preRegistrationCount > 0 && (
                  <div className="flex items-center gap-2">
                    <FaUserPlus className="text-[#D3A16D]" />
                    <span className="font-semibold text-[#3D444C]">
                      {event.preRegistrationCount}
                    </span>{" "}
                    pre-registered
                  </div>
                )}
                {event.achieverCount > 0 && (
                  <div className="flex items-center gap-2">
                    <FaTrophy className="text-[#D3A16D]" />
                    <span className="font-semibold text-[#3D444C]">
                      {event.achieverCount}
                    </span>{" "}
                    achiever{event.achieverCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   ACHIEVERS SECTION
   ============================================================ */
const AchieversSection = ({ achievers }) => {
  const grouped = achievers.reduce((acc, a) => {
    const key = a.positionLabel || "Achiever";
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const order = [
    "1st Place",
    "Champion",
    "2nd Place",
    "Runner Up",
    "3rd Place",
    "Finalist",
    "Honorable Mention",
    "Special Mention",
    "Participant",
  ];
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="bg-gradient-to-br from-[#3D444C] to-[#2a3037] rounded-2xl shadow-lg p-6 sm:p-8 text-[#E7E3D8]">
      <div className="flex items-center gap-2 mb-5">
        <FaTrophy className="text-[#D3A16D] text-2xl" />
        <h2 className="text-xl sm:text-2xl font-bold">Champions & Achievers</h2>
      </div>

      <div className="space-y-5">
        {sortedKeys.map((pos) => (
          <div key={pos}>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#D3A16D" }}
            >
              {pos}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {grouped[pos].map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/5 border border-[#D3A16D]/30 rounded-lg px-3 py-2"
                >
                  <FaCrown className="text-[#D3A16D] text-sm flex-shrink-0" />
                  <span className="font-semibold truncate">{a.name}</span>
                  {a.institution && (
                    <span className="text-xs text-[#E7E3D8]/60 truncate ml-auto">
                      {a.institution}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   FEEDBACK SECTION
   ============================================================ */
const FeedbackSection = ({
  event,
  user,
  rating,
  setRating,
  comment,
  setComment,
  submittingFeedback,
  onSubmit,
  externalEmail,
  setExternalEmail,
  verifyingExternal,
  verifiedExternal,
  verifiedExternalName,
  onVerifyExternal,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-[#D3A16D] rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-[#3D444C]">
          Feedback ({event.feedback?.length || 0})
        </h2>
      </div>

      {/* List */}
      {event.feedback && event.feedback.length > 0 ? (
        <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
          {event.feedback.map((f, i) => (
            <div
              key={f._id || i}
              className="bg-[#E7E3D8]/40 rounded-xl p-4 border border-[#3D444C]/10"
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <p className="text-sm font-semibold text-[#3D444C]">
                  {f.displayName || "Anonymous"}
                </p>
                {f.isExternal && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#D3A16D]/20 text-[#994D35]">
                    Guest
                  </span>
                )}
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

      {/* Member + attended + not yet submitted — show the form */}
      {user && event.isAttendee && !event.hasSubmittedFeedback && (
        <form
          onSubmit={onSubmit}
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
                    star <= rating ? "text-[#D3A16D]" : "text-[#3D444C]/20"
                  }`}
                />
              </button>
            ))}
            <span className="text-sm text-[#3D444C]/60 ml-2">{rating}/5</span>
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

      {/* Member + already submitted */}
      {user && event.hasSubmittedFeedback && (
        <div className="border-t border-[#3D444C]/10 pt-5 mt-4 flex items-center gap-2 text-green-600 font-medium text-sm">
          <FaCheckCircle /> You have already submitted feedback. Thank you!
        </div>
      )}

      {/* Member + did NOT attend — info note instead of the form */}
      {user && !event.isAttendee && !event.hasSubmittedFeedback && (
        <div className="border-t border-[#3D444C]/10 pt-5 mt-4">
          <div className="flex items-start gap-3 bg-[#E7E3D8]/50 border border-dashed border-[#3D444C]/20 rounded-xl p-4">
            <FaInfoCircle className="text-[#994D35] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-[#3D444C] text-sm">
                Feedback not available
              </p>
              <p className="text-xs text-[#3D444C]/70 mt-1">
                Only members who attended this event can submit feedback. If you
                attended but weren't marked, please contact an admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* External — must verify email first */}
      {!user && (
        <div className="border-t border-[#3D444C]/10 pt-5 mt-4">
          {!verifiedExternal ? (
            <>
              <h3 className="text-md font-semibold text-[#3D444C] mb-2 flex items-center gap-2">
                <FaEnvelope className="text-[#D3A16D]" />
                Attendee? Verify your email to leave feedback
              </h3>
              <p className="text-xs text-[#3D444C]/60 mb-3">
                Enter the email you attended this event with. We&apos;ll match
                it against the attendee list.
              </p>
              <form onSubmit={onVerifyExternal} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your registered email"
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg text-sm focus:outline-none focus:border-[#3D444C]"
                />
                <button
                  type="submit"
                  disabled={verifyingExternal}
                  className="inline-flex items-center gap-2 bg-[#994D35] text-white px-5 py-2.5 rounded-lg hover:bg-[#3D444C] transition-colors font-medium disabled:opacity-50"
                >
                  {verifyingExternal ? (
                    <>
                      <FaSpinner className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <FaEnvelope /> Verify Email
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-green-800">
                  <p>
                    Verified as{" "}
                    <strong>{verifiedExternalName || verifiedExternal}</strong>
                  </p>
                  {verifiedExternalName && (
                    <p className="text-green-700/70 font-mono mt-0.5">
                      {verifiedExternal}
                    </p>
                  )}
                </div>
              </div>

              {!event.hasSubmittedFeedback ? (
                <form onSubmit={onSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
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
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/20 text-sm resize-none"
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
              ) : (
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                  <FaCheckCircle /> You have already submitted feedback. Thank
                  you!
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Link for non-attendees who are club members */}
      {!user && !verifiedExternal && (
        <div className="mt-3 pt-3 border-t border-[#3D444C]/10 text-xs text-[#3D444C]/50">
          Club member?{" "}
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
  );
};

/* ============================================================
   PRE-REGISTRATION CARD
   ============================================================ */
const PreRegistrationCard = ({
  event,
  user,
  registrationOpen,
  submittingPre,
  extForm,
  setExtForm,
  onMemberRegister,
  onExternalRegister,
}) => {
  const closed = !registrationOpen;
  const deadlineText = event.preRegistrationDeadline
    ? format(new Date(event.preRegistrationDeadline), "PPP")
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-4">
        <FaUserPlus className="text-[#D3A16D]" />
        <h2 className="text-xl font-bold text-[#3D444C]">Pre-Registration</h2>
      </div>

      {closed && (
        <p className="text-sm text-[#3D444C]/60 mb-4">
          Pre-registration has closed.
          {deadlineText ? ` Deadline was ${deadlineText}.` : ""}
        </p>
      )}

      {!closed && deadlineText && (
        <p className="text-xs text-[#994D35] font-semibold mb-4">
          Deadline: {deadlineText}
        </p>
      )}

      {user ? (
        event.isPreRegisteredMember ? (
          <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
            <FaCheckCircle /> You're registered. See you at the event!
          </div>
        ) : (
          <button
            onClick={onMemberRegister}
            disabled={closed || submittingPre}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#3D444C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#994D35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingPre ? (
              <>
                <FaSpinner className="animate-spin" /> Registering…
              </>
            ) : (
              <>
                <FaUserPlus /> Register as Club Member
              </>
            )}
          </button>
        )
      ) : event.externalPreRegistrationAllowed ? (
        <form onSubmit={onExternalRegister} className="space-y-3">
          <p className="text-xs text-[#3D444C]/60 mb-2">
            Not a club member? Fill in the form below to pre-register.
          </p>

          <input
            type="text"
            placeholder="Full Name *"
            value={extForm.name}
            onChange={(e) =>
              setExtForm((p) => ({ ...p, name: e.target.value }))
            }
            disabled={closed}
            className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg text-sm focus:outline-none focus:border-[#3D444C]"
          />
          <input
            type="email"
            placeholder="Email *"
            value={extForm.email}
            onChange={(e) =>
              setExtForm((p) => ({ ...p, email: e.target.value }))
            }
            disabled={closed}
            className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg text-sm focus:outline-none focus:border-[#3D444C]"
          />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            placeholder="Phone (11 digits max)"
            value={extForm.phone}
            onChange={(e) =>
              setExtForm((p) => ({
                ...p,
                phone: e.target.value.replace(/\D/g, "").slice(0, 11),
              }))
            }
            disabled={closed}
            className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg text-sm focus:outline-none focus:border-[#3D444C]"
          />
          <input
            type="text"
            placeholder="Institution / College"
            value={extForm.institution}
            onChange={(e) =>
              setExtForm((p) => ({ ...p, institution: e.target.value }))
            }
            disabled={closed}
            className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg text-sm focus:outline-none focus:border-[#3D444C]"
          />
          <input
            type="text"
            placeholder="ID / Roll No."
            value={extForm.identificationNo}
            onChange={(e) =>
              setExtForm((p) => ({
                ...p,
                identificationNo: e.target.value,
              }))
            }
            disabled={closed}
            className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg text-sm focus:outline-none focus:border-[#3D444C]"
          />

          <button
            type="submit"
            disabled={closed || submittingPre}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#994D35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3D444C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingPre ? (
              <>
                <FaSpinner className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <FaUserPlus /> Pre-Register
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="flex items-start gap-3 bg-[#E7E3D8]/50 border border-dashed border-[#3D444C]/20 rounded-xl p-4">
          <FaLock className="text-[#994D35] mt-0.5" />
          <div>
            <p className="font-semibold text-[#3D444C] text-sm">
              Club members only / শুধুমাত্র ক্লাব সদস্যদের জন্য
            </p>

            {/* Bangla */}
            <p className="text-xs text-[#3D444C]/60 mt-1">
              এই ইভেন্টে এক্সটার্নাল প্রি-রেজিস্ট্রেশন নেই। ক্লাব সদস্য হলে{" "}
              <Link
                href="/login"
                className="text-[#994D35] hover:underline font-semibold"
              >
                লগ ইন
              </Link>{" "}
              করুন। নতুন সদস্য হতে{" "}
              <Link
                href="/signup"
                className="text-[#994D35] hover:underline font-semibold"
              >
                সাইন আপ
              </Link>{" "}
              করুন।
            </p>

            {/* English */}
            <p className="text-xs text-[#3D444C]/60 mt-1">
              No external pre-registration. Club members, please{" "}
              <Link
                href="/login"
                className="text-[#994D35] hover:underline font-semibold"
              >
                Log in
              </Link>
              . To join, please{" "}
              <Link
                href="/signup"
                className="text-[#994D35] hover:underline font-semibold"
              >
                Sign up
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   RESOURCE SECTION
   ============================================================ */
const ResourceSection = ({ title, icon, resources }) => {
  if (!resources?.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold text-[#3D444C]">{title}</h2>
      </div>

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
    </div>
  );
};

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

/* ============================================================
   SHIMMER
   ============================================================ */
const EventShimmer = () => (
  <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-5xl mx-auto">
      <div className="h-5 w-40 bg-[#3D444C]/10 rounded mb-6 animate-pulse" />
      <div className="relative w-full h-56 sm:h-72 lg:h-80 rounded-2xl bg-[#3D444C]/10 mb-8 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 space-y-3">
          <div className="h-8 w-3/4 bg-[#3D444C]/20 rounded" />
          <div className="h-4 w-1/2 bg-[#3D444C]/20 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 animate-pulse">
            <div className="h-6 w-48 bg-[#3D444C]/10 rounded mb-5" />
            <div className="space-y-3">
              <div className="h-4 bg-[#3D444C]/10 rounded w-full" />
              <div className="h-4 bg-[#3D444C]/10 rounded w-11/12" />
              <div className="h-4 bg-[#3D444C]/10 rounded w-10/12" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-5 w-36 bg-[#3D444C]/10 rounded mb-5" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ============================================================
   HELPERS
   ============================================================ */
const getStatusConfig = (status) => {
  switch (status) {
    case "upcoming":
      return {
        label: "Upcoming",
        bg: "bg-[#D3A16D]",
        text: "text-[#3D444C]",
      };
    case "completed":
      return { label: "Completed", bg: "bg-green-500", text: "text-white" };
    case "cancelled":
      return { label: "Cancelled", bg: "bg-red-500", text: "text-white" };
    default:
      return { label: status, bg: "bg-gray-400", text: "text-white" };
  }
};

export default SingleEvent;
