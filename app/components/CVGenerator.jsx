// app/components/CVGenerator.jsx
"use client";

import React from "react";

// ==================== PAGE BUDGET CONSTANTS ====================
const USABLE_PAGE_HEIGHT = 297 * 3.78 - 166 - 32; // ≈ 924px
const HEIGHTS = {
  sectionTitle: 35,
  subHeading: 25,
  profileSummary: 70,
  timelineItem: 70,
  emptyLine: 20,
  careerBox: 55,
  declarationBox: 60,
  sideBlock: 130,
  pageBreakBuffer: 40,
};

const CVGenerator = ({ user }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleDisplay = (role) => {
    const names = {
      admin: "Administrator",
      prefect: "Prefect",
      itsecretary: "IT Secretary",
      modarator: "Moderator",
      moderator: "Moderator",
      assistant_prefect: "Assistant Prefect",
      alumni: "Alumni",
      member: "Member",
      student: "Student",
    };
    return names[role] || role || "Member";
  };

  const val = (v, fallback = "Not provided") =>
    v !== undefined && v !== null && v !== "" ? v : fallback;

  // ==================== BUILD CONTENT BLOCKS ====================
  const buildMainBlocks = () => {
    const blocks = [];

    // ---- About ----
    blocks.push({
      id: "about",
      height: HEIGHTS.sectionTitle + HEIGHTS.profileSummary + 20,
      jsx: (
        <div className="section" key="about">
          <div className="section-title">About</div>
          <div className="profile-summary">
            {val(
              user?.careerClubInfo?.reasonToJoin,
              "No personal statement provided.",
            )}
          </div>
        </div>
      ),
    });

    // ---- Experience & Activities ----
    const expItemCount =
      (user?.experience?.clubExperience?.length || 0) +
      (user?.experience?.jobOrInternship?.length || 0) +
      (user?.experience?.extraCurricularActivities ? 1 : 0) +
      1;

    blocks.push({
      id: "experience",
      height:
        HEIGHTS.sectionTitle +
        2 * HEIGHTS.subHeading +
        Math.max(1, expItemCount) * HEIGHTS.timelineItem +
        20,
      jsx: (
        <div className="section" key="experience">
          <div className="section-title">Experience & Activities</div>

          <div className="sub-heading">Club Experience</div>
          {user?.experience?.clubExperience?.length > 0 ? (
            user.experience.clubExperience.map((club, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">
                    {val(club.clubName, "Club not specified")}
                  </div>
                  <div className="timeline-date">{val(club.duration, "—")}</div>
                </div>
                <div className="timeline-subtitle">
                  {val(club.position, "Position not specified")}
                </div>
                {club.responsibility && (
                  <div className="timeline-desc">{club.responsibility}</div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-line">No club experience recorded.</div>
          )}

          <div className="sub-heading" style={{ marginTop: "14px" }}>
            Job / Internship
          </div>
          {user?.experience?.jobOrInternship?.length > 0 ? (
            user.experience.jobOrInternship.map((job, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">
                    {val(job.organization, "Organization not specified")}
                  </div>
                  <div className="timeline-date">{val(job.duration, "—")}</div>
                </div>
                <div className="timeline-subtitle">
                  {val(job.designation, "Designation not specified")}
                </div>
                {job.responsibility && (
                  <div className="timeline-desc">{job.responsibility}</div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-line">No job or internship recorded.</div>
          )}

          <div className="sub-heading" style={{ marginTop: "14px" }}>
            Extra-Curricular Activities
          </div>
          <p
            style={{
              fontSize: "11.5px",
              color: user?.experience?.extraCurricularActivities
                ? "#4B5563"
                : "#9CA3AF",
              fontStyle: user?.experience?.extraCurricularActivities
                ? "normal"
                : "italic",
              lineHeight: 1.7,
              paddingLeft: "2px",
            }}
          >
            {val(
              user?.experience?.extraCurricularActivities,
              "No extra-curricular activities recorded.",
            )}
          </p>
        </div>
      ),
    });

    // ---- Education ----
    blocks.push({
      id: "education",
      height: HEIGHTS.sectionTitle + 3 * HEIGHTS.timelineItem + 20,
      jsx: (
        <div className="section" key="education">
          <div className="section-title">Education</div>

          <div className="timeline-item">
            <div className="timeline-header">
              <div className="timeline-title">
                {val(
                  user?.academicInfo?.university?.institutionName,
                  "University not specified",
                )}
              </div>
              <div className="timeline-date">
                {val(user?.academicInfo?.university?.session, "Present")}
              </div>
            </div>
            <div className="timeline-subtitle">
              {val(
                user?.academicInfo?.university?.collegeName,
                "College not specified",
              )}
              {user?.personalInfo?.classOrYear &&
                ` • ${user.personalInfo.classOrYear}`}
            </div>
            <div className="timeline-meta">
              <span>
                System:{" "}
                <strong>
                  {val(user?.academicInfo?.university?.examSystem, "N/A")}
                </strong>
              </span>
              <span>
                Reg:{" "}
                <strong>
                  {val(
                    user?.academicInfo?.university?.registrationNumber,
                    "N/A",
                  )}
                </strong>
              </span>
              <span>
                CGPA:{" "}
                <strong>
                  {val(
                    user?.academicInfo?.university?.cumulativeResult?.cgpa,
                    "N/A",
                  )}
                </strong>
              </span>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-header">
              <div className="timeline-title">
                Higher Secondary Certificate (HSC)
              </div>
              <div className="timeline-date">
                {val(user?.academicInfo?.hscOrEquivalent?.year, "N/A")}
              </div>
            </div>
            <div className="timeline-subtitle">
              {val(
                user?.academicInfo?.hscOrEquivalent?.institutionName,
                "Institution not specified",
              )}
              {user?.academicInfo?.hscOrEquivalent?.group &&
                ` • ${user.academicInfo.hscOrEquivalent.group}`}
            </div>
            <div className="timeline-meta">
              <span>
                Board:{" "}
                <strong>
                  {val(user?.academicInfo?.hscOrEquivalent?.board, "N/A")}
                </strong>
              </span>
              <span>
                Result:{" "}
                <strong>
                  {val(user?.academicInfo?.hscOrEquivalent?.result, "N/A")}
                </strong>
              </span>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-header">
              <div className="timeline-title">
                Secondary School Certificate (SSC)
              </div>
              <div className="timeline-date">
                {val(user?.academicInfo?.sscOrEquivalent?.year, "N/A")}
              </div>
            </div>
            <div className="timeline-subtitle">
              {val(
                user?.academicInfo?.sscOrEquivalent?.institutionName,
                "Institution not specified",
              )}
              {user?.academicInfo?.sscOrEquivalent?.group &&
                ` • ${user.academicInfo.sscOrEquivalent.group}`}
            </div>
            <div className="timeline-meta">
              <span>
                Board:{" "}
                <strong>
                  {val(user?.academicInfo?.sscOrEquivalent?.board, "N/A")}
                </strong>
              </span>
              <span>
                Result:{" "}
                <strong>
                  {val(user?.academicInfo?.sscOrEquivalent?.result, "N/A")}
                </strong>
              </span>
            </div>
          </div>
        </div>
      ),
    });

    // ---- Semester Results ----
    const semCount = user?.academicInfo?.university?.semesters?.length || 0;
    blocks.push({
      id: "semesters",
      height:
        HEIGHTS.sectionTitle +
        Math.max(1, semCount) * (HEIGHTS.timelineItem - 15) +
        20,
      jsx: (
        <div className="section" key="semesters">
          <div className="section-title">Semester Results</div>
          {semCount > 0 ? (
            user.academicInfo.university.semesters.map((sem, i) => (
              <div
                key={i}
                className="timeline-item"
                style={{ paddingBottom: "10px" }}
              >
                <div className="timeline-header">
                  <div className="timeline-title" style={{ fontSize: "12px" }}>
                    {val(
                      sem.examName,
                      `Semester ${sem.semesterNumber || i + 1}`,
                    )}
                  </div>
                  <div className="timeline-date">{val(sem.year, "N/A")}</div>
                </div>
                <div className="timeline-meta">
                  <span>
                    GPA: <strong>{val(sem.result, "N/A")}</strong>
                  </span>
                  <span>
                    Roll: <strong>{val(sem.rollNumber, "N/A")}</strong>
                  </span>
                  {sem.remarks && (
                    <span>
                      Remarks: <strong>{sem.remarks}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-line">No semester results recorded.</div>
          )}
        </div>
      ),
    });

    // ---- Yearly Results ----
    const yrCount = user?.academicInfo?.university?.years?.length || 0;
    blocks.push({
      id: "years",
      height:
        HEIGHTS.sectionTitle +
        Math.max(1, yrCount) * (HEIGHTS.timelineItem - 15) +
        20,
      jsx: (
        <div className="section" key="years">
          <div className="section-title">Yearly Results</div>
          {yrCount > 0 ? (
            user.academicInfo.university.years.map((yr, i) => (
              <div
                key={i}
                className="timeline-item"
                style={{ paddingBottom: "10px" }}
              >
                <div className="timeline-header">
                  <div className="timeline-title" style={{ fontSize: "12px" }}>
                    {val(yr.examName, `Year ${yr.yearNumber || i + 1}`)}
                  </div>
                  <div className="timeline-date">{val(yr.year, "N/A")}</div>
                </div>
                <div className="timeline-meta">
                  <span>
                    GPA: <strong>{val(yr.result, "N/A")}</strong>
                  </span>
                  <span>
                    Roll: <strong>{val(yr.rollNumber, "N/A")}</strong>
                  </span>
                  {yr.remarks && (
                    <span>
                      Remarks: <strong>{yr.remarks}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-line">No yearly results recorded.</div>
          )}
        </div>
      ),
    });

    // ---- Achievements ----
    const userAchCount = user?.achievements?.length || 0;
    const clubAchCount = user?.accCareerClubAchievements?.length || 0;
    blocks.push({
      id: "achievements",
      height:
        HEIGHTS.sectionTitle +
        HEIGHTS.subHeading +
        Math.max(1, userAchCount) * HEIGHTS.timelineItem +
        Math.max(1, clubAchCount) * HEIGHTS.timelineItem +
        30,
      jsx: (
        <div className="section" key="achievements">
          <div className="section-title">Achievements</div>

          {userAchCount > 0 ? (
            user.achievements.map((ach, i) => (
              <div key={`user-${i}`} className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">
                    {val(ach.title, "Achievement title not specified")}
                  </div>
                  <div className="timeline-date">{val(ach.date, "—")}</div>
                </div>
                <div className="timeline-meta">
                  <span>
                    🏆{" "}
                    <strong>
                      {val(ach.position, "Position not specified")}
                    </strong>
                  </span>
                  <span>
                    Organizer: <strong>{val(ach.organizer, "N/A")}</strong>
                  </span>
                  <span style={{ textTransform: "capitalize" }}>
                    Level: <strong>{val(ach.level, "N/A")}</strong>
                  </span>
                  {ach.location && (
                    <span>
                      Location: <strong>{ach.location}</strong>
                    </span>
                  )}
                </div>
                {ach.projectOrCompetitionName && (
                  <div className="timeline-desc">
                    <strong>Project/Contest:</strong>{" "}
                    {ach.projectOrCompetitionName}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-line">No personal achievements recorded.</div>
          )}

          <div className="sub-heading" style={{ marginTop: "14px" }}>
            ACC Career Club Achievements
          </div>
          {clubAchCount > 0 ? (
            user.accCareerClubAchievements.map((ach, i) => (
              <div key={`club-${i}`} className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">
                    {val(ach.eventName, "Event not specified")}
                    <span className="club-badge">ACC Career Club</span>
                  </div>
                  <div className="timeline-date">{val(ach.date, "—")}</div>
                </div>
                <div className="timeline-meta">
                  <span>
                    🏆{" "}
                    <strong>
                      {val(ach.position, "Position not specified")}
                    </strong>
                  </span>
                  <span>
                    Organizer:{" "}
                    <strong>{val(ach.organizer, "ACC Career Club")}</strong>
                  </span>
                  {ach.certificateId && (
                    <span>
                      Certificate ID: <strong>{ach.certificateId}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-line">
              No ACC Career Club achievements recorded.
            </div>
          )}
        </div>
      ),
    });

    // ---- Career Aspirations ----
    blocks.push({
      id: "career",
      height: HEIGHTS.sectionTitle + 4 * HEIGHTS.careerBox + 20,
      jsx: (
        <div className="section" key="career">
          <div className="section-title">Career Aspirations</div>

          <div className="career-box">
            <div className="career-title">Target Role / Company</div>
            <div className="career-text">
              {val(
                user?.careerClubInfo?.interestedCareerOrgOrPos,
                "Not specified",
              )}
            </div>
          </div>

          <div className="career-box">
            <div className="career-title">Skills to Develop</div>
            <div className="career-text">
              {val(
                user?.careerClubInfo?.requiredSkillsForCareer,
                "Not specified",
              )}
            </div>
          </div>

          <div className="career-box">
            <div className="career-title">Career Roadmap</div>
            <div className="career-text">
              {val(user?.careerClubInfo?.roadmapPlanning, "Not specified")}
            </div>
          </div>

          <div className="career-box">
            <div className="career-title">
              Career Prospects of My Department
            </div>
            <div className="career-text">
              {val(
                user?.careerClubInfo?.careerProspectsOfDept,
                "Not specified",
              )}
            </div>
          </div>
        </div>
      ),
    });

    // ---- Declaration ----
    blocks.push({
      id: "declaration",
      height: HEIGHTS.declarationBox + 20,
      jsx: (
        <div className="declaration-box" key="declaration">
          <strong>Declaration:</strong>{" "}
          {user?.declaration
            ? "I hereby declare that all the information provided above is correct and complete to the best of my knowledge."
            : "Information provided in this document is accurate to the best of my knowledge."}
        </div>
      ),
    });

    return blocks;
  };

  const buildSideBlocks = () => {
    return [
      {
        id: "personal",
        height: HEIGHTS.sideBlock + 30,
        jsx: (
          <div className="side-block" key="personal">
            <div className="section-title">Personal</div>
            <div className="info-line">
              <span className="label">Date of Birth</span>
              <span
                className={`value ${
                  !user?.personalInfo?.dateOfBirth ? "empty-val" : ""
                }`}
              >
                {user?.personalInfo?.dateOfBirth
                  ? formatDate(user.personalInfo.dateOfBirth)
                  : "Not provided"}
              </span>
            </div>
            <div className="info-line">
              <span className="label">Blood Group</span>
              <span
                className={`value ${
                  !user?.personalInfo?.bloodGroup ? "empty-val" : ""
                }`}
              >
                {val(user?.personalInfo?.bloodGroup, "Not provided")}
              </span>
            </div>
            <div className="info-line">
              <span className="label">Religion</span>
              <span
                className={`value ${
                  !user?.personalInfo?.religion ? "empty-val" : ""
                }`}
              >
                {val(user?.personalInfo?.religion, "Not provided")}
              </span>
            </div>
            <div className="info-line">
              <span className="label">Marital Status</span>
              <span
                className={`value ${
                  !user?.personalInfo?.maritalStatus ? "empty-val" : ""
                }`}
              >
                {val(user?.personalInfo?.maritalStatus, "Not provided")}
              </span>
            </div>
            <div className="info-line">
              <span className="label">Department</span>
              <span className={`value ${!user?.department ? "empty-val" : ""}`}>
                {val(user?.department, "Not provided")}
              </span>
            </div>
            <div className="info-line">
              <span className="label">Class / Year</span>
              <span
                className={`value ${
                  !user?.personalInfo?.classOrYear ? "empty-val" : ""
                }`}
              >
                {val(user?.personalInfo?.classOrYear, "Not provided")}
              </span>
            </div>
            <div className="info-line">
              <span className="label">Present Address</span>
              <span
                className={`value ${
                  !user?.personalInfo?.presentAddress ? "empty-val" : ""
                }`}
              >
                {val(user?.personalInfo?.presentAddress, "Not provided")}
              </span>
            </div>
            <div className="info-line">
              <span className="label">Permanent Address</span>
              <span
                className={`value ${
                  !user?.personalInfo?.permanentAddress ? "empty-val" : ""
                }`}
              >
                {val(user?.personalInfo?.permanentAddress, "Not provided")}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "academic",
        height: 110,
        jsx: (
          <div className="side-block" key="academic">
            <div className="section-title">Academic Score</div>
            <div className="info-line">
              <span className="label">Cumulative CGPA</span>
              <span
                className={`value ${
                  !user?.academicInfo?.university?.cumulativeResult?.cgpa
                    ? "empty-val"
                    : ""
                }`}
                style={{ fontSize: "18px" }}
              >
                {val(
                  user?.academicInfo?.university?.cumulativeResult?.cgpa,
                  "N/A",
                )}
              </span>
            </div>
            <div className="progress-wrap">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: user?.academicInfo?.university?.cumulativeResult
                      ?.cgpa
                      ? `${Math.min(
                          100,
                          (parseFloat(
                            user.academicInfo.university.cumulativeResult.cgpa,
                          ) /
                            4) *
                            100,
                        )}%`
                      : "0%",
                  }}
                />
              </div>
              <div className="progress-label">out of 4.00</div>
            </div>
          </div>
        ),
      },
      {
        id: "skills",
        height: 90,
        jsx: (
          <div className="side-block" key="skills">
            <div className="section-title">Skills</div>
            <div className="tag-list">
              {user?.skills?.length > 0 || user?.customSkills?.length > 0 ? (
                <>
                  {user.skills?.map((skill, i) => (
                    <span key={i} className="tag tag-primary">
                      {skill}
                    </span>
                  ))}
                  {user.customSkills?.map((skill, i) => (
                    <span key={`c-${i}`} className="tag tag-warm">
                      {skill}
                    </span>
                  ))}
                </>
              ) : (
                <span className="tag tag-empty">No skills added</span>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "interests",
        height: 90,
        jsx: (
          <div className="side-block" key="interests">
            <div className="section-title">Interests</div>
            <div className="tag-list">
              {user?.interests?.length > 0 ||
              user?.customInterests?.length > 0 ? (
                <>
                  {user.interests?.map((interest, i) => (
                    <span key={i} className="tag tag-accent">
                      {interest}
                    </span>
                  ))}
                  {user.customInterests?.map((interest, i) => (
                    <span key={`c-${i}`} className="tag tag-outline">
                      {interest}
                    </span>
                  ))}
                </>
              ) : (
                <span className="tag tag-empty">No interests added</span>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "family",
        height: 140,
        jsx: (
          <div className="side-block" key="family">
            <div className="section-title">Family</div>
            <div className="info-line">
              <span className="label">Father</span>
              <span
                className={`value ${
                  !user?.guardianInfo?.father?.name ? "empty-val" : ""
                }`}
              >
                {val(user?.guardianInfo?.father?.name, "Not provided")}
              </span>
              {user?.guardianInfo?.father?.occupation && (
                <span
                  style={{
                    fontSize: "10px",
                    color: "#6B7280",
                    marginTop: "1px",
                  }}
                >
                  {user.guardianInfo.father.occupation}
                </span>
              )}
            </div>
            <div className="info-line">
              <span className="label">Mother</span>
              <span
                className={`value ${
                  !user?.guardianInfo?.mother?.name ? "empty-val" : ""
                }`}
              >
                {val(user?.guardianInfo?.mother?.name, "Not provided")}
              </span>
              {user?.guardianInfo?.mother?.occupation && (
                <span
                  style={{
                    fontSize: "10px",
                    color: "#6B7280",
                    marginTop: "1px",
                  }}
                >
                  {user.guardianInfo.mother.occupation}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "membership",
        height: 90,
        jsx: (
          <div className="side-block" key="membership">
            <div className="section-title">Membership</div>
            <div className="info-line">
              <span className="label">Member Since</span>
              <span className={`value ${!user?.createdAt ? "empty-val" : ""}`}>
                {user?.createdAt ? formatDate(user.createdAt) : "Not available"}
              </span>
            </div>
            <div className="info-line">
              <span className="label">Status</span>
              <span className="value">
                {user?.isVerified ? "✓ Verified" : "Pending Verification"}
              </span>
            </div>
          </div>
        ),
      },
    ];
  };

  // ==================== PAGINATE ====================
  const FIRST_PAGE_MAIN_BUDGET = USABLE_PAGE_HEIGHT - 166;
  const OTHER_PAGE_MAIN_BUDGET = USABLE_PAGE_HEIGHT;

  const paginateBlocks = (blocks, budgets) => {
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    let pageIdx = 0;
    let budget = budgets[pageIdx] ?? budgets[budgets.length - 1];

    for (const block of blocks) {
      if (currentHeight + block.height > budget) {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          pageIdx++;
          currentPage = [];
          currentHeight = 0;
          budget = budgets[pageIdx] ?? budgets[budgets.length - 1];
        }
      }
      currentPage.push(block);
      currentHeight += block.height;
    }

    if (currentPage.length > 0) pages.push(currentPage);
    return pages.length > 0 ? pages : [[]];
  };

  const mainBlocks = buildMainBlocks();
  const sideBlocks = buildSideBlocks();

  const budgets = [
    FIRST_PAGE_MAIN_BUDGET,
    OTHER_PAGE_MAIN_BUDGET,
    OTHER_PAGE_MAIN_BUDGET,
    OTHER_PAGE_MAIN_BUDGET,
  ];

  const mainPages = paginateBlocks(mainBlocks, budgets);
  const totalPages = mainPages.length;

  // ==================== RENDER ====================
  return (
    <html>
      <head>
        <title>{`${user?.fullName || "Profile"} - CV`}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #E5E5E5;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #3D444C;
            line-height: 1.5;
            font-size: 12px;
          }

          .sheet {
            width: 210mm;
            height: 297mm;
            margin: 0 auto 10mm auto;
            background: #ffffff;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            page-break-after: always;
            break-after: page;
          }
          .sheet:last-child {
            page-break-after: auto;
            break-after: auto;
            margin-bottom: 0;
          }

          @page { size: A4; margin: 0; }

          @media print {
            html, body {
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet {
              margin: 0;
              box-shadow: none;
              page-break-after: always;
              break-after: page;
            }
            .sheet:last-child {
              page-break-after: auto;
              break-after: auto;
            }
          }

          .header {
            background: linear-gradient(135deg, #3D444C 0%, #3D444C 60%, #994D35 100%);
            color: #E7E3D8;
            padding: 28px 40px;
            display: flex;
            align-items: center;
            gap: 24px;
          }
          .header-photo {
            width: 110px; height: 110px;
            border-radius: 50%;
            border: 4px solid #D3A16D;
            overflow: hidden;
            background: #E7E3D8;
            flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
          }
          .header-photo img { width: 100%; height: 100%; object-fit: cover; }
          .header-photo-placeholder {
            font-size: 44px; font-weight: 800; color: #994D35;
          }
          .header-info h1 {
            font-size: 26px; font-weight: 800;
            letter-spacing: 0.5px; margin-bottom: 6px;
          }
          .header-info .role {
            font-size: 14px; color: #D3A16D; font-weight: 600;
            text-transform: uppercase; letter-spacing: 1.5px;
            margin-bottom: 10px;
          }
          .header-info .contact-row {
            display: flex; flex-wrap: wrap;
            gap: 6px 18px; font-size: 11.5px;
            color: #E7E3D8; opacity: 0.95;
          }
          .header-info .contact-row span {
            display: inline-flex; align-items: center; gap: 5px;
          }
          .contact-icon { color: #D3A16D; font-weight: 700; }

          .section { margin-bottom: 22px; }
          .section-title {
            font-size: 14px; font-weight: 800;
            color: #3D444C; text-transform: uppercase;
            letter-spacing: 1.5px;
            padding-bottom: 6px; margin-bottom: 12px;
            border-bottom: 2.5px solid #D3A16D;
            position: relative;
            display: flex; align-items: center; gap: 8px;
          }
          .section-title::before {
            content: "";
            display: inline-block;
            width: 6px; height: 6px;
            background: #994D35; border-radius: 50%;
          }
          .side-col .section-title {
            font-size: 12.5px; letter-spacing: 1.2px;
            padding-bottom: 5px; margin-bottom: 10px;
          }

          .profile-summary {
            font-size: 12.5px; color: #4B5563; line-height: 1.7;
            margin-bottom: 18px; padding: 14px 18px;
            background: #F9F8F5;
            border-left: 4px solid #D3A16D;
            border-radius: 0 8px 8px 0;
          }

          .timeline-item {
            position: relative;
            padding-left: 20px; padding-bottom: 16px;
            border-left: 2px solid #E5E7EB;
          }
          .timeline-item:last-child {
            border-left-color: transparent; padding-bottom: 0;
          }
          .timeline-item::before {
            content: "";
            position: absolute;
            left: -7px; top: 3px;
            width: 12px; height: 12px;
            border-radius: 50%;
            background: #D3A16D;
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 0 2px #D3A16D;
          }
          .timeline-header {
            display: flex; justify-content: space-between;
            align-items: flex-start; gap: 10px; margin-bottom: 3px;
          }
          .timeline-title {
            font-size: 13.5px; font-weight: 700; color: #3D444C;
          }
          .timeline-date {
            font-size: 10.5px; color: #994D35; font-weight: 600;
            background: #E7E3D8;
            padding: 2px 8px; border-radius: 10px;
            white-space: nowrap;
          }
          .timeline-subtitle {
            font-size: 11.5px; color: #6B7280; margin-bottom: 4px;
          }
          .timeline-desc {
            font-size: 11.5px; color: #4B5563; line-height: 1.6; margin-top: 3px;
          }
          .timeline-meta {
            display: flex; flex-wrap: wrap;
            gap: 4px 12px; margin-top: 4px;
            font-size: 11px; color: #6B7280;
          }
          .timeline-meta strong { color: #3D444C; }

          .sub-heading {
            font-size: 10px; font-weight: 800; color: #994D35;
            text-transform: uppercase; letter-spacing: 1.2px;
            margin: 12px 0 8px 0; padding-left: 2px;
          }

          .side-block { margin-bottom: 20px; }
          .info-line {
            display: flex; flex-direction: column;
            margin-bottom: 9px; font-size: 11px;
          }
          .info-line .label {
            color: #994D35; font-weight: 700;
            text-transform: uppercase;
            font-size: 9px; letter-spacing: 1px; margin-bottom: 2px;
          }
          .info-line .value {
            color: #3D444C; font-weight: 600;
            font-size: 11.5px; word-break: break-word;
          }
          .empty-val {
            color: #9CA3AF !important;
            font-style: italic;
            font-weight: 500 !important;
          }

          .tag-list { display: flex; flex-wrap: wrap; gap: 5px; }
          .tag {
            display: inline-block;
            padding: 3px 9px; border-radius: 10px;
            font-size: 10px; font-weight: 600; line-height: 1.4;
          }
          .tag-primary { background: #3D444C; color: #E7E3D8; }
          .tag-accent { background: #D3A16D; color: #3D444C; }
          .tag-outline {
            background: #ffffff; color: #3D444C;
            border: 1.5px solid #D3A16D;
          }
          .tag-warm { background: #994D35; color: #ffffff; }
          .tag-empty {
            background: #F5F2EA; color: #9CA3AF;
            border: 1.5px dashed #D3A16D; font-style: italic;
          }

          .progress-wrap { margin-top: 4px; }
          .progress-track {
            width: 100%; height: 7px;
            background: #ffffff; border-radius: 6px;
            overflow: hidden; border: 1px solid #E5E7EB;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #D3A16D, #994D35);
            border-radius: 6px;
          }
          .progress-label {
            font-size: 10px; color: #6B7280;
            margin-top: 3px; text-align: right;
          }

          .career-box {
            background: #ffffff; border-radius: 8px;
            padding: 11px 13px;
            border: 1.5px solid #D3A16D;
            margin-bottom: 9px;
          }
          .career-box .career-title {
            font-size: 9.5px; font-weight: 800; color: #994D35;
            text-transform: uppercase; letter-spacing: 1.2px;
            margin-bottom: 4px;
          }
          .career-box .career-text {
            font-size: 11px; color: #3D444C;
            line-height: 1.5; font-weight: 500;
          }

          .club-badge {
            display: inline-block;
            font-size: 8.5px; font-weight: 800;
            color: #ffffff; background: #994D35;
            padding: 1.5px 6px; border-radius: 6px;
            margin-left: 6px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            vertical-align: middle;
          }

          .declaration-box {
            margin-top: 24px; padding: 12px 16px;
            background: #F9F8F5;
            border: 1px dashed #D3A16D;
            border-radius: 8px;
            font-size: 10.5px; color: #6B7280;
            line-height: 1.6; font-style: italic;
          }
          .declaration-box strong {
            color: #994D35; font-style: normal;
          }

          .footer {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            text-align: center;
            padding: 10px 40px;
            background: #3D444C;
            color: #E7E3D8;
            font-size: 9.5px;
            letter-spacing: 0.5px;
          }
          .footer span { color: #D3A16D; font-weight: 700; }

          .empty-line {
            font-size: 11px; color: #9CA3AF;
            font-style: italic; padding: 4px 0;
          }

          .continuation-tag {
            display: inline-block;
            font-size: 9px;
            font-weight: 700;
            color: #994D35;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
            padding: 3px 10px;
            border: 1.5px solid #D3A16D;
            border-radius: 4px;
          }

          .end-marker {
            margin-top: auto;
            padding-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #D3A16D;
            letter-spacing: 2px;
            font-weight: 700;
            opacity: 0.5;
          }

          /* ============ SIGNATURE BLOCK (absolute) ============ */
          .signature-block {
            position: absolute;
            right: 34px;
            bottom: 60px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            z-index: 5;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .signature-line {
            width: 160px;
            border-bottom: 1.5px solid #3D444C;
            height: 32px;
          }
          .signature-label {
            margin-top: 6px;
            font-size: 10px;
            font-weight: 700;
            color: #994D35;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            text-align: right;
            width: 160px;
          }
        `}</style>
      </head>
      <body>
        {/* ==================== SHEETS ==================== */}
        {mainPages.map((pageBlocks, pageIdx) => (
          <div className="sheet" key={pageIdx}>
            {/* Header — only on first page */}
            {pageIdx === 0 && (
              <div className="header">
                <div className="header-photo">
                  {user?.personalInfo?.profilePicture ? (
                    <img
                      src={user.personalInfo.profilePicture}
                      alt={user.fullName}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="header-photo-placeholder">
                      {user?.fullName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="header-info">
                  <h1>{val(user?.fullName, "Unknown Member")}</h1>
                  <div className="role">{getRoleDisplay(user?.role)}</div>
                  <div className="contact-row">
                    <span>
                      <span className="contact-icon">✉</span>
                      {val(user?.email, "Email not provided")}
                    </span>
                    <span>
                      <span className="contact-icon">☎</span>
                      {val(user?.phone, "Phone not provided")}
                    </span>
                    <span>
                      <span className="contact-icon">#</span>
                      ID: {val(user?.studentId, "N/A")}
                    </span>
                    <span>
                      <span className="contact-icon">◆</span>
                      {val(user?.department, "Department not provided")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Body grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "68% 32%",
                height:
                  pageIdx === 0
                    ? "calc(297mm - 166px - 32px)"
                    : "calc(297mm - 32px)",
                overflow: "hidden",
                alignItems: "stretch",
              }}
            >
              {/* Main column */}
              <div
                className="main-col"
                style={{
                  padding: "26px 30px 30px 40px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {pageIdx > 0 && (
                  <div className="continuation-tag">
                    {val(user?.fullName, "Unknown")} — Continued
                  </div>
                )}

                {pageBlocks.map((block) => block.jsx)}

                <div className="end-marker">• END OF CONTENT •</div>
              </div>

              {/* Side column */}
              <div
                className="side-col"
                style={{
                  background: "#F5F2EA",
                  padding: "26px 30px 30px 24px",
                  borderLeft: "3px solid #D3A16D",
                  height: "100%",
                  alignSelf: "stretch",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {pageIdx === 0 && sideBlocks.map((b) => b.jsx)}
              </div>
            </div>

            {/* Signature — only on the last sheet, absolutely positioned */}
            {pageIdx === totalPages - 1 && (
              <div className="signature-block">
                <div className="signature-line" />
                <div className="signature-label">Student&apos;s Signature</div>
              </div>
            )}

            {/* Footer */}
            <div className="footer">
              {val(user?.fullName, "Unknown")} • Page {pageIdx + 1} of{" "}
              {totalPages}
            </div>
          </div>
        ))}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            `,
          }}
        />
      </body>
    </html>
  );
};

export default CVGenerator;