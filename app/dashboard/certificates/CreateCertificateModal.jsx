// app/dashboard/certificates/CreateCertificateModal.jsx
"use client";

import { useAuth } from "@/app/context/AuthContext";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaUser,
  FaUserCheck,
  FaUsers,
  FaTrophy,
  FaTimes,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSignature,
  FaInfoCircle,
  FaPlus,
  FaTrash,
  FaLayerGroup,
} from "react-icons/fa";

// ==========================================
// HELPERS
// ==========================================
const ROLE_LABELS = {
  prefect: "Prefect",
  assistant_prefect: "Assistant Prefect",
  itsecretary: "IT Secretary",
  modarator: "Moderator",
  moderator: "Moderator",
  president: "President",
  vice_president: "Vice President",
  general_secretary: "General Secretary",
  joint_secretary: "Joint Secretary",
  treasurer: "Treasurer",
  member: "Member",
  alumni: "Alumni",
};

const formatRole = (role) => {
  if (!role) return "";
  return (
    ROLE_LABELS[role] ||
    role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const formatPosition = (pos) => {
  if (!pos) return "";
  const map = {
    "1st": "1st Place",
    "2nd": "2nd Place",
    "3rd": "3rd Place",
    champion: "Champion",
    runner_up: "Runner Up",
    finalist: "Finalist",
    honorable_mention: "Honorable Mention",
    special_mention: "Special Mention",
    participant: "Participant",
  };
  return map[pos] || pos;
};

// ==========================================
// COMPONENT
// ==========================================
const CreateCertificateModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState({
    internal: [],
    external: [],
    achievers: [],
    total: 0,
  });
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [mode, setMode] = useState("individual");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [recipientSearch, setRecipientSearch] = useState("");
  const [individualRecipient, setIndividualRecipient] = useState(null);

  const [isCustomRecipient, setIsCustomRecipient] = useState(false);
  const [customRecipient, setCustomRecipient] = useState({
    name: "",
    email: "",
    institution: "",
    identificationNo: "",
  });

  // ==========================================
  // CUSTOM BATCH MODE STATE
  // ==========================================
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [customBatchRecipients, setCustomBatchRecipients] = useState([]);

  const [certificateForm, setCertificateForm] = useState({
    certificateType: "participation",
    title: "Certificate of Participation",
    description: "",
    achievementTitle: "",
    achievementPosition: "",
    signatureType: "system_generated",
    signatories: [],
    backgroundUrl:
      "https://res.cloudinary.com/ffuatrrt/image/upload/v1790161104/certificate_back_1_sxzqf8.jpg",
    templateUsed: "default",
  });

  // ==========================================
  // AUTO-SET TYPE + TITLE WHEN MODE CHANGES
  // ==========================================
  useEffect(() => {
    if (mode === "achievers") {
      setCertificateForm((prev) => ({
        ...prev,
        certificateType: "achievement",
        title: "Certificate of Achievement",
      }));
    } else if (mode === "bulk" || mode === "custom-batch") {
      setCertificateForm((prev) => ({
        ...prev,
        certificateType: "participation",
        title: "Certificate of Participation",
      }));
    }
  }, [mode]);

  // ==========================================
  // FETCH EVENTS
  // ==========================================
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/secure/events/get-events?limit=100", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      }
    };
    fetchEvents();
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ==========================================
  // EVENT ATTENDEES
  // ==========================================
  const fetchEventAttendees = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/secure/certificates/event-attendees?eventId=${eventId}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setAttendees({
          internal: data.attendees.internal || [],
          external: data.attendees.external || [],
          achievers: data.attendees.achievers || [],
          total:
            (data.attendees.internal?.length || 0) +
            (data.attendees.external?.length || 0),
        });
        setSelectedEvent(data.event);
      } else {
        toast.error(data.message || "Failed to load attendees");
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
      toast.error("Failed to load attendees");
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setIndividualRecipient(null);
    setSelectedRecipients([]);
    setRecipientSearch("");
    if (eventId) {
      fetchEventAttendees(eventId);
    } else {
      setSelectedEvent(null);
      setAttendees({
        internal: [],
        external: [],
        achievers: [],
        total: 0,
      });
    }
  };

  // ==========================================
  // USER SEARCH (for Custom Batch)
  // ==========================================
  const searchUsers = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setUserResults([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const res = await fetch(
        `/api/secure/users/search?q=${encodeURIComponent(term)}&limit=30`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setUserResults(data.users || []);
      } else {
        toast.error(data.message || "Search failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to search users");
    } finally {
      setSearchingUsers(false);
    }
  }, []);

  // Debounced user search
  useEffect(() => {
    if (mode !== "custom-batch") return;
    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [userSearch, mode, searchUsers]);

  const toggleCustomBatchUser = (u) => {
    setCustomBatchRecipients((prev) => {
      const exists = prev.find((r) => r.userId === u._id);
      if (exists) return prev.filter((r) => r.userId !== u._id);
      return [
        ...prev,
        {
          userId: u._id,
          name: u.fullName,
          email: u.email,
          studentId: u.studentId,
          department: u.department,
          phone: u.phone,
          identificationNo: u.studentId,
        },
      ];
    });
  };

  // ==========================================
  // COMBINED ATTENDEE LIST (event modes)
  // ==========================================
  const allAttendees = useMemo(() => {
    const list = [];
    const seen = new Set();
    const add = (item) => {
      const key = item.userId
        ? `u:${item.userId}`
        : item.email
          ? `e:${item.email.toLowerCase()}`
          : `n:${(item.name || "").toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push(item);
    };
    attendees.internal.forEach((a) => add(a));
    attendees.external.forEach((a) => add(a));
    return list;
  }, [attendees]);

  const filteredAttendees = useMemo(() => {
    if (!recipientSearch.trim()) return allAttendees;
    const term = recipientSearch.toLowerCase();
    return allAttendees.filter(
      (a) =>
        a.name?.toLowerCase().includes(term) ||
        a.email?.toLowerCase().includes(term) ||
        a.studentId?.toLowerCase().includes(term) ||
        a.identificationNo?.toLowerCase().includes(term) ||
        a.institution?.toLowerCase().includes(term),
    );
  }, [allAttendees, recipientSearch]);

  const handleRecipientToggle = (recipient) => {
    setSelectedRecipients((prev) => {
      const exists = prev.find(
        (r) =>
          (r.userId && r.userId === recipient.userId) ||
          (!r.userId &&
            r.email === recipient.email &&
            r.name === recipient.name),
      );
      if (exists) {
        return prev.filter(
          (r) =>
            !(
              (r.userId && r.userId === recipient.userId) ||
              (!r.userId &&
                r.email === recipient.email &&
                r.name === recipient.name)
            ),
        );
      }
      return [...prev, recipient];
    });
  };

  const handleSelectAll = (type) => {
    let list = [];
    if (type === "internal") list = attendees.internal;
    else if (type === "external") list = attendees.external;
    else if (type === "all") list = allAttendees;

    setSelectedRecipients((prev) => {
      const newSelection = [...prev];
      for (const item of list) {
        const exists = newSelection.find(
          (r) =>
            (r.userId && r.userId === item.userId) ||
            (!r.userId && r.email === item.email && r.name === item.name),
        );
        if (!exists) newSelection.push(item);
      }
      return newSelection;
    });
  };

  // ==========================================
  // GENERATE
  // ==========================================
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("mode", mode);
      if (selectedEvent) formData.append("eventId", selectedEvent._id);

      formData.append("certificateType", certificateForm.certificateType);
      formData.append("title", certificateForm.title);
      formData.append("description", certificateForm.description);
      formData.append("achievementTitle", certificateForm.achievementTitle);
      formData.append(
        "achievementPosition",
        certificateForm.achievementPosition,
      );
      formData.append("signatureType", certificateForm.signatureType);
      formData.append(
        "signatories",
        JSON.stringify(certificateForm.signatories),
      );
      formData.append("backgroundUrl", certificateForm.backgroundUrl);
      formData.append("templateUsed", certificateForm.templateUsed);

      if (mode === "individual") {
        if (isCustomRecipient) {
          formData.append("recipientName", customRecipient.name);
          formData.append("recipientEmail", customRecipient.email);
          formData.append(
            "recipientIdentificationNo",
            customRecipient.identificationNo,
          );
          formData.append("recipientInstitution", customRecipient.institution);
        } else if (individualRecipient) {
          if (individualRecipient.userId) {
            formData.append("recipientUserId", individualRecipient.userId);
          } else {
            formData.append("recipientName", individualRecipient.name);
            formData.append("recipientEmail", individualRecipient.email || "");
            formData.append(
              "recipientIdentificationNo",
              individualRecipient.identificationNo ||
                individualRecipient.studentId ||
                "",
            );
            formData.append(
              "recipientInstitution",
              individualRecipient.institution || "",
            );
          }
        }
      } else if (mode === "selective") {
        formData.append("recipients", JSON.stringify(selectedRecipients));
      } else if (mode === "custom-batch") {
        formData.append("recipients", JSON.stringify(customBatchRecipients));
      }

      const res = await fetch("/api/secure/certificates/create-certificate", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setTimeout(() => onSuccess(), 900);
      } else {
        toast.error(data.message || "Failed to create certificate");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  // ==========================================
  // SIGNATORIES
  // ==========================================
  const addSignatory = () => {
    setCertificateForm((prev) => ({
      ...prev,
      signatories: [
        ...prev.signatories,
        {
          name: "",
          designation: "",
          signatureUrl: "",
          order: prev.signatories.length,
        },
      ],
    }));
  };

  const updateSignatory = (index, field, value) => {
    setCertificateForm((prev) => {
      const updated = [...prev.signatories];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, signatories: updated };
    });
  };

  const removeSignatory = (index) => {
    setCertificateForm((prev) => ({
      ...prev,
      signatories: prev.signatories.filter((_, i) => i !== index),
    }));
  };

  // ==========================================
  // VALIDATION
  // ==========================================
  const isGenerateDisabled =
    generating ||
    (mode === "individual" && !isCustomRecipient && !individualRecipient) ||
    (mode === "individual" &&
      isCustomRecipient &&
      !customRecipient.name.trim()) ||
    (mode === "selective" && selectedRecipients.length === 0) ||
    (mode === "custom-batch" && customBatchRecipients.length === 0) ||
    (mode === "bulk" && !selectedEvent) ||
    (mode === "achievers" &&
      (!selectedEvent || attendees.achievers.length === 0));

  const modeOptions = [
    { value: "individual", label: "Individual", Icon: FaUser },
    { value: "selective", label: "Selective", Icon: FaUserCheck },
    { value: "bulk", label: "All Attendees", Icon: FaUsers },
    { value: "achievers", label: "All Achievers", Icon: FaTrophy },
    { value: "custom-batch", label: "Custom Batch", Icon: FaLayerGroup },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4
             bg-white/30 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-[#E7E3D8] rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#3D444C] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaSignature className="text-[#D3A16D]" />
              Create Certificates
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Pick attendees from events or search members for a custom batch
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Mode Selection */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide mb-3">
              Generation Mode
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {modeOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setMode(value);
                    setSelectedRecipients([]);
                    setIndividualRecipient(null);
                    setIsCustomRecipient(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    mode === value
                      ? "border-[#3D444C] bg-[#3D444C] text-white"
                      : "border-gray-200 hover:border-[#3D444C] text-[#3D444C]"
                  }`}
                >
                  <Icon className="text-xl" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* LEFT */}
            <div className="space-y-5">
              {/* Event — hidden in custom-batch */}
              {mode !== "custom-batch" && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide mb-3">
                    Event
                  </h3>
                  <select
                    onChange={handleEventChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D444C] focus:border-transparent"
                  >
                    <option value="">Select an event</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.eventTitle} -{" "}
                        {new Date(event.eventDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>

                  {selectedEvent && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {selectedEvent.eventType}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(selectedEvent.eventDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Attendees:</span>{" "}
                        {attendees.total} ({attendees.internal.length} internal,{" "}
                        {attendees.external.length} external)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* INDIVIDUAL */}
              {mode === "individual" && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide">
                      Recipient
                    </h3>
                    {selectedEvent && (
                      <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCustomRecipient}
                          onChange={(e) => {
                            setIsCustomRecipient(e.target.checked);
                            setIndividualRecipient(null);
                          }}
                          className="rounded"
                        />
                        Custom (no event)
                      </label>
                    )}
                  </div>

                  {!isCustomRecipient ? (
                    !selectedEvent ? (
                      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg flex items-start gap-2">
                        <FaInfoCircle className="text-[#D3A16D] mt-0.5 flex-shrink-0" />
                        <span>
                          Select an event to pick an attendee, or enable{" "}
                          <strong>Custom (no event)</strong> for a one-off
                          certificate.
                        </span>
                      </div>
                    ) : loading ? (
                      <div className="flex justify-center py-6">
                        <FaSpinner className="animate-spin text-[#3D444C] text-2xl" />
                      </div>
                    ) : (
                      <>
                        <div className="relative mb-3">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                          <input
                            type="text"
                            placeholder="Search by name, email, ID, or institution..."
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        {individualRecipient && (
                          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-green-900 truncate">
                                {individualRecipient.name}
                              </p>
                              <p className="text-xs text-green-700 truncate">
                                {individualRecipient.userId
                                  ? "Member"
                                  : "External"}
                                {individualRecipient.studentId
                                  ? ` • ${individualRecipient.studentId}`
                                  : individualRecipient.identificationNo
                                    ? ` • ${individualRecipient.identificationNo}`
                                    : ""}
                                {individualRecipient.email
                                  ? ` • ${individualRecipient.email}`
                                  : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => setIndividualRecipient(null)}
                              className="text-green-700 hover:text-green-900 ml-2"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}

                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                          {filteredAttendees.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500 text-center">
                              No attendees match.
                            </p>
                          ) : (
                            filteredAttendees.map((a, idx) => {
                              const isSelected =
                                individualRecipient &&
                                ((a.userId &&
                                  a.userId === individualRecipient.userId) ||
                                  (!a.userId &&
                                    a.email === individualRecipient.email &&
                                    a.name === individualRecipient.name));
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setIndividualRecipient(a)}
                                  className={`w-full text-left p-2.5 hover:bg-gray-50 flex items-center justify-between ${
                                    isSelected ? "bg-green-50" : ""
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {a.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {a.userId
                                        ? `Member • ${a.studentId || "—"}`
                                        : `External${
                                            a.institution
                                              ? ` • ${a.institution}`
                                              : ""
                                          }`}
                                      {a.email ? ` • ${a.email}` : ""}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <FaCheckCircle className="text-green-600 flex-shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {filteredAttendees.length} of {allAttendees.length}{" "}
                          attendees
                        </p>
                      </>
                    )
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">
                        Manual entry — only for one-off certificates that aren't
                        tied to an event.
                      </p>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={customRecipient.name}
                        onChange={(e) =>
                          setCustomRecipient((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={customRecipient.email}
                        onChange={(e) =>
                          setCustomRecipient((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Institution / Organization"
                        value={customRecipient.institution}
                        onChange={(e) =>
                          setCustomRecipient((prev) => ({
                            ...prev,
                            institution: e.target.value,
                          }))
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="ID Number"
                        value={customRecipient.identificationNo}
                        onChange={(e) =>
                          setCustomRecipient((prev) => ({
                            ...prev,
                            identificationNo: e.target.value,
                          }))
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SELECTIVE */}
              {mode === "selective" && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide">
                      Select ({selectedRecipients.length})
                    </h3>
                    {selectedEvent && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSelectAll("all")}
                          className="text-xs px-2 py-1 bg-[#3D444C] text-white rounded"
                        >
                          All
                        </button>
                        <button
                          onClick={() => setSelectedRecipients([])}
                          className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {!selectedEvent ? (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                      Select an event first to see attendees.
                    </div>
                  ) : loading ? (
                    <div className="flex justify-center py-6">
                      <FaSpinner className="animate-spin text-[#3D444C] text-2xl" />
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2">
                      {attendees.internal.length > 0 && (
                        <>
                          <p className="text-xs font-medium text-gray-500 px-2">
                            Internal ({attendees.internal.length})
                          </p>
                          {attendees.internal.map((a) => (
                            <label
                              key={a.userId}
                              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRecipients.some(
                                  (r) => r.userId === a.userId,
                                )}
                                onChange={() => handleRecipientToggle(a)}
                                className="mr-3"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {a.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {a.studentId} • {a.email}
                                </p>
                              </div>
                            </label>
                          ))}
                        </>
                      )}
                      {attendees.external.length > 0 && (
                        <>
                          <p className="text-xs font-medium text-gray-500 mt-3 px-2">
                            External ({attendees.external.length})
                          </p>
                          {attendees.external.map((a, idx) => (
                            <label
                              key={idx}
                              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRecipients.some(
                                  (r) =>
                                    !r.userId &&
                                    r.email === a.email &&
                                    r.name === a.name,
                                )}
                                onChange={() => handleRecipientToggle(a)}
                                className="mr-3"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {a.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {a.institution} • {a.email}
                                </p>
                              </div>
                            </label>
                          ))}
                        </>
                      )}
                      {attendees.internal.length === 0 &&
                        attendees.external.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No attendees on this event.
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* BULK */}
              {mode === "bulk" && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  {!selectedEvent ? (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                      Select an event to generate certificates for all its
                      attendees.
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Generate for{" "}
                        <strong>{attendees.total} attendees</strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {attendees.internal.length} internal,{" "}
                        {attendees.external.length} external
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ACHIEVERS */}
              {mode === "achievers" && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  {!selectedEvent ? (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                      Select an event to generate certificates for its
                      achievers.
                    </div>
                  ) : attendees.achievers.length > 0 ? (
                    <>
                      <div className="p-3 mb-3 bg-purple-50 border border-purple-100 rounded-lg flex items-start gap-2">
                        <FaTrophy className="text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-purple-800">
                          Positions are pulled automatically from the event's
                          achievers list. No need to set them manually.
                        </p>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {attendees.achievers.map((a, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {a.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {a.userId ? "Member" : "External"}
                                {a.institution ? ` • ${a.institution}` : ""}
                                {a.email ? ` • ${a.email}` : ""}
                              </p>
                            </div>
                            {a.position && (
                              <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                                {formatPosition(a.position)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-4 rounded-lg">
                      <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                      <span>
                        No achievers found for this event. Add achievers to the
                        event first.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* CUSTOM BATCH */}
              {mode === "custom-batch" && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide mb-3">
                    Search Members ({customBatchRecipients.length} selected)
                  </h3>

                  <div className="p-3 mb-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
                    <FaInfoCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      Search by college ID (student ID) or name to add members
                      to this batch. Certificates will be generated without an
                      event.
                    </p>
                  </div>

                  <div className="relative mb-3">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search by college ID, name, or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* Selected chips */}
                  {customBatchRecipients.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {customBatchRecipients.map((r) => (
                        <span
                          key={r.userId}
                          className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-xs px-2 py-1 rounded-full"
                        >
                          {r.name}
                          <button
                            onClick={() =>
                              toggleCustomBatchUser({ _id: r.userId })
                            }
                            className="hover:text-green-950"
                          >
                            <FaTimes className="text-[10px]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Results */}
                  <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {userSearch.trim().length < 2 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        Type at least 2 characters to search.
                      </p>
                    ) : searchingUsers ? (
                      <div className="flex justify-center py-6">
                        <FaSpinner className="animate-spin text-[#3D444C] text-xl" />
                      </div>
                    ) : userResults.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        No users found.
                      </p>
                    ) : (
                      userResults.map((u) => {
                        const isSelected = customBatchRecipients.some(
                          (r) => r.userId === u._id,
                        );
                        return (
                          <button
                            key={u._id}
                            onClick={() => toggleCustomBatchUser(u)}
                            className={`w-full text-left p-2.5 hover:bg-gray-50 flex items-center justify-between ${
                              isSelected ? "bg-green-50" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {u.fullName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {u.studentId || "—"} • {u.email}
                                {u.department ? ` • ${u.department}` : ""}
                              </p>
                            </div>
                            {isSelected ? (
                              <FaCheckCircle className="text-green-600 flex-shrink-0 ml-2" />
                            ) : (
                              <FaPlus className="text-gray-400 flex-shrink-0 ml-2 text-xs" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Certificate Details */}
            <div className="space-y-5">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide mb-3">
                  Certificate Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Certificate Type
                    </label>
                    <select
                      value={certificateForm.certificateType}
                      onChange={(e) =>
                        setCertificateForm((prev) => ({
                          ...prev,
                          certificateType: e.target.value,
                        }))
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="participation">Participation</option>
                      <option value="achievement">Achievement</option>
                      <option value="completion">Completion</option>
                      <option value="appreciation">Appreciation</option>
                      <option value="recognition">Recognition</option>
                      <option value="organizer">Organizer</option>
                      <option value="speaker">Speaker</option>
                      <option value="judge">Judge</option>
                      <option value="mentor">Mentor</option>
                      <option value="excellence">Excellence</option>
                      <option value="alumni">Alumni</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={certificateForm.title}
                      onChange={(e) =>
                        setCertificateForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={certificateForm.description}
                      placeholder="For participation with us"
                      onChange={(e) =>
                        setCertificateForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {certificateForm.certificateType === "achievement" &&
                    mode !== "achievers" && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Achievement Title
                          </label>
                          <input
                            type="text"
                            value={certificateForm.achievementTitle}
                            onChange={(e) =>
                              setCertificateForm((prev) => ({
                                ...prev,
                                achievementTitle: e.target.value,
                              }))
                            }
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                            placeholder="e.g., Champion"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Position
                          </label>
                          <select
                            value={certificateForm.achievementPosition}
                            onChange={(e) =>
                              setCertificateForm((prev) => ({
                                ...prev,
                                achievementPosition: e.target.value,
                              }))
                            }
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Select position</option>
                            <option value="1st">1st Place</option>
                            <option value="2nd">2nd Place</option>
                            <option value="3rd">3rd Place</option>
                            <option value="champion">Champion</option>
                            <option value="runner_up">Runner Up</option>
                            <option value="finalist">Finalist</option>
                            <option value="honorable_mention">
                              Honorable Mention
                            </option>
                            <option value="special_mention">
                              Special Mention
                            </option>
                          </select>
                        </div>
                      </>
                    )}

                  {mode === "achievers" && (
                    <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                      <FaInfoCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-purple-800">
                        Each achiever's position is taken from the event.
                      </p>
                    </div>
                  )}

                  {/* Issuer info: display-only, from auth */}
                  {user && (
                    <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <FaInfoCircle className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-600">
                        <p className="font-medium text-[#3D444C]">
                          Issued as {user.fullName}
                        </p>
                        <p className="text-gray-500">
                          {formatRole(user.executiveBranch) ||
                            formatRole(user.role) ||
                            "Member"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide mb-3">
                  Signatures
                </h3>

                <select
                  value={certificateForm.signatureType}
                  onChange={(e) =>
                    setCertificateForm((prev) => ({
                      ...prev,
                      signatureType: e.target.value,
                      // Reset signatories when switching away from custom
                      ...(e.target.value !== "custom"
                        ? { signatories: [] }
                        : {}),
                    }))
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm mb-3"
                >
                  <option value="system_generated">
                    System Generated (No signature)
                  </option>
                  <option value="moderator_signed">Moderator Signed</option>
                  <option value="moderator_and_principal_signed">
                    Moderator & Principal Signed
                  </option>
                </select>

                {/* Preview helper text */}
                {certificateForm.signatureType === "system_generated" && (
                  <p className="text-xs text-gray-500 italic">
                    A small red note will appear at the bottom of the
                    certificate.
                  </p>
                )}
                {certificateForm.signatureType === "moderator_signed" && (
                  <p className="text-xs text-gray-500 italic">
                    Blank signature line labeled "Moderator" will appear at the
                    bottom-right.
                  </p>
                )}
                {certificateForm.signatureType ===
                  "moderator_and_principal_signed" && (
                  <p className="text-xs text-gray-500 italic">
                    Blank signature lines labeled "Principal" (left) and
                    "Moderator" (right) will appear at the bottom.
                  </p>
                )}

                {certificateForm.signatureType === "custom" && (
                  <div className="space-y-3 mt-3">
                    {certificateForm.signatories.map((sig, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium">
                            Signatory {idx + 1}
                          </span>
                          <button
                            onClick={() => removeSignatory(idx)}
                            className="text-red-500 text-xs flex items-center gap-1"
                          >
                            <FaTrash className="text-[10px]" /> Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Name"
                          value={sig.name}
                          onChange={(e) =>
                            updateSignatory(idx, "name", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Designation"
                          value={sig.designation}
                          onChange={(e) =>
                            updateSignatory(idx, "designation", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addSignatory}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-[#3D444C] hover:text-[#3D444C] flex items-center justify-center gap-2"
                    >
                      <FaPlus className="text-xs" /> Add Signatory
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="px-8 py-3 bg-[#3D444C] text-white rounded-lg font-semibold hover:bg-[#2a3037] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <FaSpinner className="animate-spin" /> Generating...
              </>
            ) : mode === "bulk" || mode === "achievers" ? (
              `Generate ${
                mode === "achievers"
                  ? attendees.achievers.length
                  : attendees.total
              } Certificates`
            ) : mode === "selective" ? (
              `Generate ${selectedRecipients.length} Certificates`
            ) : mode === "custom-batch" ? (
              `Generate ${customBatchRecipients.length} Certificates`
            ) : (
              "Generate Certificate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCertificateModal;
