// app/components/UniversalCVGenerator.jsx
"use client";

import React from "react";

// ==================== PAGE BUDGET CONSTANTS ====================
const USABLE_PAGE_HEIGHT = 297 * 3.78 - 175 - 32; // ≈ 915px
const HEIGHTS = {
  sectionTitle: 35,
  subHeading: 25,
  profileSummary: 70,
  timelineItem: 70,
  emptyLine: 20,
  careerBox: 55,
  sideBlock: 130,
};

const UniversalCVGenerator = ({ user }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const val = (v, fallback = "Not provided") =>
    v !== undefined && v !== null && v !== "" ? v : fallback;

  // ---------- Data checks ----------
  const hasExperience =
    user?.experience?.clubExperience?.length > 0 ||
    user?.experience?.jobOrInternship?.length > 0 ||
    user?.experience?.extraCurricularActivities;

  const userAchievements = user?.achievements || [];
  const clubAchievements = user?.accCareerClubAchievements || [];
  const hasAchievements =
    userAchievements.length > 0 || clubAchievements.length > 0;

  // ==================== BUILD MAIN COLUMN BLOCKS ====================
  const buildMainBlocks = () => {
    const blocks = [];

    // ---- Profile / About ----
    const bioText =
      user?.personalInfo?.bio?.trim() ||
      user?.careerClubInfo?.reasonToJoin?.trim() ||
      "";

    if (bioText) {
      blocks.push({
        id: "about",
        height: HEIGHTS.sectionTitle + HEIGHTS.profileSummary + 20,
        jsx: (
          <div className="section" key="about">
            <div className="section-title">Profile</div>
            <div className="profile-summary">{bioText}</div>
          </div>
        ),
      });
    }

    // ---- Experience & Activities ----
    if (hasExperience) {
      const expItemCount =
        (user?.experience?.clubExperience?.length || 0) +
        (user?.experience?.jobOrInternship?.length || 0) +
        (user?.experience?.extraCurricularActivities ? 1 : 0);

      const subHeadingCount =
        (user?.experience?.clubExperience?.length > 0 ? 1 : 0) +
        (user?.experience?.jobOrInternship?.length > 0 ? 1 : 0) +
        (user?.experience?.extraCurricularActivities ? 1 : 0);

      blocks.push({
        id: "experience",
        height:
          HEIGHTS.sectionTitle +
          subHeadingCount * HEIGHTS.subHeading +
          Math.max(1, expItemCount) * HEIGHTS.timelineItem +
          20,
        jsx: (
          <div className="section" key="experience">
            <div className="section-title">Experience & Activities</div>

            {user?.experience?.clubExperience?.length > 0 && (
              <>
                <div className="sub-heading">Club Experience</div>
                {user.experience.clubExperience.map((club, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-header">
                      <div className="timeline-title">
                        {club.clubName || "Club"}
                      </div>
                      {club.duration && (
                        <div className="timeline-date">{club.duration}</div>
                      )}
                    </div>
                    {club.position && (
                      <div className="timeline-subtitle">{club.position}</div>
                    )}
                    {club.responsibility && (
                      <div className="timeline-desc">{club.responsibility}</div>
                    )}
                  </div>
                ))}
              </>
            )}

            {user?.experience?.jobOrInternship?.length > 0 && (
              <>
                <div className="sub-heading" style={{ marginTop: "14px" }}>
                  Job / Internship
                </div>
                {user.experience.jobOrInternship.map((job, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-header">
                      <div className="timeline-title">
                        {job.organization || "Organization"}
                      </div>
                      {job.duration && (
                        <div className="timeline-date">{job.duration}</div>
                      )}
                    </div>
                    {job.designation && (
                      <div className="timeline-subtitle">{job.designation}</div>
                    )}
                    {job.responsibility && (
                      <div className="timeline-desc">{job.responsibility}</div>
                    )}
                  </div>
                ))}
              </>
            )}

            {user?.experience?.extraCurricularActivities && (
              <>
                <div className="sub-heading" style={{ marginTop: "14px" }}>
                  Extra-Curricular Activities
                </div>
                <p
                  style={{
                    fontSize: "11.5px",
                    color: "#4B5563",
                    lineHeight: 1.7,
                    paddingLeft: "2px",
                  }}
                >
                  {user.experience.extraCurricularActivities}
                </p>
              </>
            )}
          </div>
        ),
      });
    }

    // ---- Education (always shown) ----
    blocks.push({
      id: "education",
      height: HEIGHTS.sectionTitle + 3 * HEIGHTS.timelineItem + 20,
      jsx: (
        <div className="section" key="education">
          <div className="section-title">Education</div>

          {(user?.academicInfo?.university?.institutionName ||
            user?.academicInfo?.university?.collegeName) && (
            <div className="timeline-item">
              <div className="timeline-header">
                <div className="timeline-title">
                  {user?.academicInfo?.university?.institutionName ||
                    "University"}
                </div>
                <div className="timeline-date">
                  {user?.academicInfo?.university?.session || "Present"}
                </div>
              </div>
              <div className="timeline-subtitle">
                {user?.academicInfo?.university?.collegeName ||
                  "Adamjee Cantonment College"}
              </div>
              <div className="timeline-meta">
                {user?.academicInfo?.university?.registrationNumber && (
                  <span>
                    Reg No:{" "}
                    <strong>
                      {user.academicInfo.university.registrationNumber}
                    </strong>
                  </span>
                )}
                {user?.academicInfo?.university?.cumulativeResult?.cgpa && (
                  <span>
                    CGPA:{" "}
                    <strong>
                      {user.academicInfo.university.cumulativeResult.cgpa}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {user?.academicInfo?.hscOrEquivalent?.institutionName && (
            <div className="timeline-item">
              <div className="timeline-header">
                <div className="timeline-title">
                  Higher Secondary Certificate (HSC)
                </div>
                <div className="timeline-date">
                  {user?.academicInfo?.hscOrEquivalent?.year || "N/A"}
                </div>
              </div>
              <div className="timeline-subtitle">
                {user.academicInfo.hscOrEquivalent.institutionName}
                {user.academicInfo.hscOrEquivalent.group &&
                  ` • ${user.academicInfo.hscOrEquivalent.group}`}
              </div>
              <div className="timeline-meta">
                {user?.academicInfo?.hscOrEquivalent?.board && (
                  <span>
                    Board:{" "}
                    <strong>{user.academicInfo.hscOrEquivalent.board}</strong>
                  </span>
                )}
                {user?.academicInfo?.hscOrEquivalent?.result && (
                  <span>
                    Result:{" "}
                    <strong>{user.academicInfo.hscOrEquivalent.result}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {user?.academicInfo?.sscOrEquivalent?.institutionName && (
            <div className="timeline-item">
              <div className="timeline-header">
                <div className="timeline-title">
                  Secondary School Certificate (SSC)
                </div>
                <div className="timeline-date">
                  {user?.academicInfo?.sscOrEquivalent?.year || "N/A"}
                </div>
              </div>
              <div className="timeline-subtitle">
                {user.academicInfo.sscOrEquivalent.institutionName}
                {user.academicInfo.sscOrEquivalent.group &&
                  ` • ${user.academicInfo.sscOrEquivalent.group}`}
              </div>
              <div className="timeline-meta">
                {user?.academicInfo?.sscOrEquivalent?.board && (
                  <span>
                    Board:{" "}
                    <strong>{user.academicInfo.sscOrEquivalent.board}</strong>
                  </span>
                )}
                {user?.academicInfo?.sscOrEquivalent?.result && (
                  <span>
                    Result:{" "}
                    <strong>{user.academicInfo.sscOrEquivalent.result}</strong>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    });

    // ---- Achievements ----
    if (hasAchievements) {
      const totalAchievements =
        userAchievements.length + clubAchievements.length;
      blocks.push({
        id: "achievements",
        height:
          HEIGHTS.sectionTitle +
          Math.max(1, totalAchievements) * HEIGHTS.timelineItem +
          20,
        jsx: (
          <div className="section" key="achievements">
            <div className="section-title">Achievements</div>

            {userAchievements.map((ach, i) => (
              <div key={`user-${i}`} className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">
                    {ach.title || "Achievement"}
                  </div>
                  {ach.date && <div className="timeline-date">{ach.date}</div>}
                </div>
                <div className="timeline-meta">
                  {ach.position && (
                    <span>
                      🏆 <strong>{ach.position}</strong>
                    </span>
                  )}
                  {ach.organizer && (
                    <span>
                      Organizer: <strong>{ach.organizer}</strong>
                    </span>
                  )}
                  {ach.level && (
                    <span style={{ textTransform: "capitalize" }}>
                      Level: <strong>{ach.level}</strong>
                    </span>
                  )}
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
            ))}

            {clubAchievements.map((ach, i) => (
              <div key={`club-${i}`} className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">
                    {ach.eventName || "Club Achievement"}
                    <span className="club-badge">ACC Career Club</span>
                  </div>
                  {ach.date && <div className="timeline-date">{ach.date}</div>}
                </div>
                <div className="timeline-meta">
                  {ach.position && (
                    <span>
                      🏆 <strong>{ach.position}</strong>
                    </span>
                  )}
                  {ach.organizer && (
                    <span>
                      Organizer: <strong>{ach.organizer}</strong>
                    </span>
                  )}
                  {ach.certificateId && (
                    <span>
                      Certificate ID: <strong>{ach.certificateId}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ),
      });
    }

    // ---- Career Objective ----
    const hasCareerInfo =
      user?.careerClubInfo?.interestedCareerOrgOrPos ||
      user?.careerClubInfo?.requiredSkillsForCareer ||
      user?.careerClubInfo?.roadmapPlanning ||
      user?.careerClubInfo?.careerProspectsOfDept;

    if (hasCareerInfo) {
      const careerBoxCount = [
        user?.careerClubInfo?.interestedCareerOrgOrPos,
        user?.careerClubInfo?.requiredSkillsForCareer,
        user?.careerClubInfo?.roadmapPlanning,
        user?.careerClubInfo?.careerProspectsOfDept,
      ].filter(Boolean).length;

      blocks.push({
        id: "career",
        height: HEIGHTS.sectionTitle + careerBoxCount * HEIGHTS.careerBox + 20,
        jsx: (
          <div className="section" key="career">
            <div className="section-title">Career Objective</div>

            {user?.careerClubInfo?.interestedCareerOrgOrPos && (
              <div className="career-box">
                <div className="career-title">Target Role / Company</div>
                <div className="career-text">
                  {user.careerClubInfo.interestedCareerOrgOrPos}
                </div>
              </div>
            )}

            {user?.careerClubInfo?.requiredSkillsForCareer && (
              <div className="career-box">
                <div className="career-title">Skills to Develop</div>
                <div className="career-text">
                  {user.careerClubInfo.requiredSkillsForCareer}
                </div>
              </div>
            )}

            {user?.careerClubInfo?.roadmapPlanning && (
              <div className="career-box">
                <div className="career-title">Career Roadmap</div>
                <div className="career-text">
                  {user.careerClubInfo.roadmapPlanning}
                </div>
              </div>
            )}

            {user?.careerClubInfo?.careerProspectsOfDept && (
              <div className="career-box">
                <div className="career-title">Career Prospects of My Field</div>
                <div className="career-text">
                  {user.careerClubInfo.careerProspectsOfDept}
                </div>
              </div>
            )}
          </div>
        ),
      });
    }

    return blocks;
  };

  // ==================== BUILD SIDE BLOCKS ====================
  const buildSideBlocks = () => {
    const blocks = [];

    // ---- Personal ---- (now includes maritalStatus + religion)
    if (
      user?.personalInfo?.dateOfBirth ||
      user?.personalInfo?.bloodGroup ||
      user?.personalInfo?.religion ||
      user?.personalInfo?.maritalStatus ||
      user?.personalInfo?.permanentAddress ||
      user?.personalInfo?.presentAddress
    ) {
      blocks.push({
        id: "personal",
        height: 160, // bumped up a bit for the extra two fields
        jsx: (
          <div className="side-block" key="personal">
            <div className="section-title">Personal</div>
            {user?.personalInfo?.dateOfBirth && (
              <div className="info-line">
                <span className="label">Date of Birth</span>
                <span className="value">
                  {formatDate(user.personalInfo.dateOfBirth)}
                </span>
              </div>
            )}
            {user?.personalInfo?.bloodGroup && (
              <div className="info-line">
                <span className="label">Blood Group</span>
                <span className="value">{user.personalInfo.bloodGroup}</span>
              </div>
            )}
            {user?.personalInfo?.religion && (
              <div className="info-line">
                <span className="label">Religion</span>
                <span className="value">{user.personalInfo.religion}</span>
              </div>
            )}
            {user?.personalInfo?.maritalStatus && (
              <div className="info-line">
                <span className="label">Marital Status</span>
                <span className="value">{user.personalInfo.maritalStatus}</span>
              </div>
            )}
            {user?.personalInfo?.presentAddress && (
              <div className="info-line">
                <span className="label">Present Address</span>
                <span className="value">
                  {user.personalInfo.presentAddress}
                </span>
              </div>
            )}
            {user?.personalInfo?.permanentAddress && (
              <div className="info-line">
                <span className="label">Permanent Address</span>
                <span className="value">
                  {user.personalInfo.permanentAddress}
                </span>
              </div>
            )}
          </div>
        ),
      });
    }

    // ---- Academic Score ----
    if (user?.academicInfo?.university?.cumulativeResult?.cgpa) {
      blocks.push({
        id: "academic",
        height: 110,
        jsx: (
          <div className="side-block" key="academic">
            <div className="section-title">Academic Score</div>
            <div className="info-line">
              <span className="label">Cumulative CGPA</span>
              <span className="value" style={{ fontSize: "18px" }}>
                {user.academicInfo.university.cumulativeResult.cgpa}
              </span>
            </div>
            <div className="progress-wrap">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (parseFloat(
                        user.academicInfo.university.cumulativeResult.cgpa,
                      ) /
                        4) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <div className="progress-label">out of 4.00</div>
            </div>
          </div>
        ),
      });
    }

    // ---- Skills ----
    if (user?.skills?.length > 0 || user?.customSkills?.length > 0) {
      blocks.push({
        id: "skills",
        height: 90,
        jsx: (
          <div className="side-block" key="skills">
            <div className="section-title">Skills</div>
            <div className="tag-list">
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
            </div>
          </div>
        ),
      });
    }

    // ---- Interests ----
    if (user?.interests?.length > 0 || user?.customInterests?.length > 0) {
      blocks.push({
        id: "interests",
        height: 90,
        jsx: (
          <div className="side-block" key="interests">
            <div className="section-title">Interests</div>
            <div className="tag-list">
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
            </div>
          </div>
        ),
      });
    }

    // ---- Family ----
    if (user?.guardianInfo?.father?.name || user?.guardianInfo?.mother?.name) {
      blocks.push({
        id: "family",
        height: 140,
        jsx: (
          <div className="side-block" key="family">
            <div className="section-title">Family</div>
            {user?.guardianInfo?.father?.name && (
              <div className="info-line">
                <span className="label">Father</span>
                <span className="value">{user.guardianInfo.father.name}</span>
                {user.guardianInfo.father.occupation && (
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
            )}
            {user?.guardianInfo?.mother?.name && (
              <div className="info-line">
                <span className="label">Mother</span>
                <span className="value">{user.guardianInfo.mother.name}</span>
                {user.guardianInfo.mother.occupation && (
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
            )}
          </div>
        ),
      });
    }

    return blocks;
  };

  // ==================== PAGINATE ====================
  const FIRST_PAGE_MAIN_BUDGET = USABLE_PAGE_HEIGHT - 115;
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
        <title>{`${user?.fullName || "CV"} - Curriculum Vitae`}</title>
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

          /* ============ HEADER ============ */
          .header {
            background: linear-gradient(135deg, #3D444C 0%, #3D444C 60%, #994D35 100%);
            color: #E7E3D8;
            padding: 30px 40px;
            display: flex;
            align-items: center;
            gap: 26px;
          }
          .header-photo {
            width: 115px;
            height: 115px;
            border-radius: 50%;
            border: 4px solid #D3A16D;
            overflow: hidden;
            background: #E7E3D8;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .header-photo img { width: 100%; height: 100%; object-fit: cover; }
          .header-photo-placeholder {
            font-size: 46px; font-weight: 800; color: #994D35;
          }
          .header-info h1 {
            font-size: 28px; font-weight: 800;
            letter-spacing: 0.5px; margin-bottom: 10px; line-height: 1.1;
          }
          .header-info .contact-row {
            display: flex; flex-wrap: wrap;
            gap: 6px 20px; font-size: 11.5px;
            color: #E7E3D8; opacity: 0.95;
          }
          .header-info .contact-row span {
            display: inline-flex; align-items: center; gap: 5px;
          }
          .contact-icon { color: #D3A16D; font-weight: 700; }

          /* ============ SECTION TITLES ============ */
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

          /* ============ PROFILE SUMMARY ============ */
          .profile-summary {
            font-size: 12.5px; color: #4B5563; line-height: 1.75;
            margin-bottom: 18px; padding: 14px 18px;
            background: #F9F8F5;
            border-left: 4px solid #D3A16D;
            border-radius: 0 8px 8px 0;
          }

          /* ============ TIMELINE ============ */
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

          /* ============ SUB-HEADING ============ */
          .sub-heading {
            font-size: 10px; font-weight: 800; color: #994D35;
            text-transform: uppercase; letter-spacing: 1.2px;
            margin: 12px 0 8px 0; padding-left: 2px;
          }

          /* ============ SIDE COLUMN ============ */
          .side-block { margin-bottom: 22px; }
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

          /* ============ TAGS ============ */
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

          /* ============ PROGRESS BAR ============ */
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

          /* ============ CAREER BOX ============ */
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
            line-height: 1.55; font-weight: 500;
          }

          /* ============ CLUB BADGE ============ */
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

          /* ============ FOOTER ============ */
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

          /* ============ CONTINUATION TAG ============ */
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

          /* ============ END MARKER ============ */
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

          /* ============ SIGNATURE BLOCK ============ */
          .signature-block {
            margin-top: 40px;
            padding-top: 18px;
            display: flex;
            justify-content: flex-start;
          }
          .signature-inner {
            width: 260px;
            text-align: left;
          }
          .signature-line {
            border-top: 1.5px solid #3D444C;
            margin-bottom: 6px;
          }
          .signature-name {
            font-size: 11px;
            font-weight: 700;
            color: #3D444C;
            letter-spacing: 0.4px;
          }
          .signature-meta {
            font-size: 9.5px;
            color: #6B7280;
            margin-top: 2px;
            letter-spacing: 0.3px;
          }
          .signature-label {
            font-size: 9px;
            font-weight: 800;
            color: #994D35;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 4px;
          }
        `}</style>
      </head>
      <body>
        {/* ==================== SHEETS ==================== */}
        {mainPages.map((pageBlocks, pageIdx) => {
          const isLastPage = pageIdx === totalPages - 1;

          return (
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
                    <h1>{user?.fullName || "Unknown"}</h1>
                    <div className="contact-row">
                      {user?.email && (
                        <span>
                          <span className="contact-icon">✉</span>
                          {user.email}
                        </span>
                      )}
                      {user?.phone && (
                        <span>
                          <span className="contact-icon">☎</span>
                          {user.phone}
                        </span>
                      )}
                      {user?.personalInfo?.presentAddress && (
                        <span>
                          <span className="contact-icon">⌂</span>
                          {user.personalInfo.presentAddress}
                        </span>
                      )}
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
                      ? "calc(297mm - 145px - 32px)"
                      : "calc(297mm - 32px)",
                  overflow: "hidden",
                  alignItems: "stretch",
                }}
              >
                {/* Main column */}
                <div
                  className="main-col"
                  style={{
                    padding: "28px 30px 30px 40px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {pageIdx > 0 && (
                    <div className="continuation-tag">
                      {user?.fullName || "Unknown"} — Continued
                    </div>
                  )}

                  {pageBlocks.map((block) => block.jsx)}

                  {/* Signature block — only on the last page, bottom-left */}
                  {isLastPage && (
                    <div className="signature-block">
                      <div className="signature-inner">
                        <div className="signature-line" />
                        <div className="signature-label">
                          Student's Signature
                        </div>
                      </div>
                    </div>
                  )}

                  {/* End marker */}
                  <div className="end-marker">• END OF CONTENT •</div>
                </div>

                {/* Side column */}
                <div
                  className="side-col"
                  style={{
                    background: "#F5F2EA",
                    padding: "28px 30px 30px 24px",
                    borderLeft: "3px solid #D3A16D",
                    height: "100%",
                    alignSelf: "stretch",
                  }}
                >
                  {pageIdx === 0 && sideBlocks.map((b) => b.jsx)}
                </div>
              </div>

              {/* Footer */}
              <div className="footer">
                • Page {pageIdx + 1} of {totalPages}
              </div>
            </div>
          );
        })}

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

export default UniversalCVGenerator;
