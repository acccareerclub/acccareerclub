// app/components/ClassicCVGenerator.jsx
"use client";

import React from "react";

// ==================== PAGE BUDGET ====================
const USABLE_PAGE_HEIGHT = 297 * 3.78 - 175 - 32;
const HEIGHTS = {
  sectionTitle: 38,
  subHeading: 25,
  profileSummary: 75,
  timelineItem: 72,
  careerBox: 58,
};

const ClassicCVGenerator = ({ user }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const userAchievements = user?.achievements || [];
  const clubAchievements = user?.accCareerClubAchievements || [];
  const hasAchievements =
    userAchievements.length > 0 || clubAchievements.length > 0;

  const hasExperience =
    user?.experience?.clubExperience?.length > 0 ||
    user?.experience?.jobOrInternship?.length > 0 ||
    user?.experience?.extraCurricularActivities;

  const buildMainBlocks = () => {
    const blocks = [];

    // ---- PROFILE SUMMARY ----
    // ---- PROFILE SUMMARY ----
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
            <div className="section-title">
              Profile Summary
              <span className="st-line" />
            </div>
            <p className="profile-text">{bioText}</p>
          </div>
        ),
      });
    }

    // ---- EXPERIENCE ----
    if (hasExperience) {
      const clubCount = user?.experience?.clubExperience?.length || 0;
      const jobCount = user?.experience?.jobOrInternship?.length || 0;
      const hasExtra = !!user?.experience?.extraCurricularActivities;
      const subHeadings =
        (clubCount > 0 ? 1 : 0) + (jobCount > 0 ? 1 : 0) + (hasExtra ? 1 : 0);
      const totalItems = clubCount + jobCount + (hasExtra ? 1 : 0);

      blocks.push({
        id: "experience",
        height:
          HEIGHTS.sectionTitle +
          subHeadings * HEIGHTS.subHeading +
          Math.max(1, totalItems) * HEIGHTS.timelineItem +
          20,
        jsx: (
          <div className="section" key="experience">
            <div className="section-title">
              Experience & Activities
              <span className="st-line" />
            </div>

            {clubCount > 0 && (
              <>
                <div className="sub-heading">Club Experience</div>
                {user.experience.clubExperience.map((club, i) => (
                  <div key={i} className="exp-item">
                    <div className="exp-left">
                      <div className="exp-date">{club.duration || "—"}</div>
                    </div>
                    <div className="exp-right">
                      <div className="exp-title">{club.clubName || "Club"}</div>
                      {club.position && (
                        <div className="exp-role">{club.position}</div>
                      )}
                      {club.responsibility && (
                        <div className="exp-desc">{club.responsibility}</div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {jobCount > 0 && (
              <>
                <div className="sub-heading">Job / Internship</div>
                {user.experience.jobOrInternship.map((job, i) => (
                  <div key={i} className="exp-item">
                    <div className="exp-left">
                      <div className="exp-date">{job.duration || "—"}</div>
                    </div>
                    <div className="exp-right">
                      <div className="exp-title">
                        {job.organization || "Organization"}
                      </div>
                      {job.designation && (
                        <div className="exp-role">{job.designation}</div>
                      )}
                      {job.responsibility && (
                        <div className="exp-desc">{job.responsibility}</div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {hasExtra && (
              <>
                <div className="sub-heading">Extra-Curricular Activities</div>
                <p className="exp-desc">
                  {user.experience.extraCurricularActivities}
                </p>
              </>
            )}
          </div>
        ),
      });
    }

    // ---- EDUCATION (always) ----
    blocks.push({
      id: "education",
      height: HEIGHTS.sectionTitle + 3 * HEIGHTS.timelineItem + 20,
      jsx: (
        <div className="section" key="education">
          <div className="section-title">
            Education
            <span className="st-line" />
          </div>

          {(user?.academicInfo?.university?.institutionName ||
            user?.academicInfo?.university?.collegeName) && (
            <div className="exp-item">
              <div className="exp-left">
                <div className="exp-date">
                  {user?.academicInfo?.university?.session || "Present"}
                </div>
              </div>
              <div className="exp-right">
                <div className="exp-title">
                  {user?.academicInfo?.university?.institutionName ||
                    "University"}
                </div>
                <div className="exp-role">
                  {user?.academicInfo?.university?.collegeName ||
                    "Adamjee Cantonment College"}
                </div>
                <div className="exp-meta">
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
            </div>
          )}

          {user?.academicInfo?.hscOrEquivalent?.institutionName && (
            <div className="exp-item">
              <div className="exp-left">
                <div className="exp-date">
                  {user?.academicInfo?.hscOrEquivalent?.year || "N/A"}
                </div>
              </div>
              <div className="exp-right">
                <div className="exp-title">
                  Higher Secondary Certificate (HSC)
                </div>
                <div className="exp-role">
                  {user.academicInfo.hscOrEquivalent.institutionName}
                  {user.academicInfo.hscOrEquivalent.group &&
                    ` • ${user.academicInfo.hscOrEquivalent.group}`}
                </div>
                <div className="exp-meta">
                  {user?.academicInfo?.hscOrEquivalent?.board && (
                    <span>
                      Board:{" "}
                      <strong>{user.academicInfo.hscOrEquivalent.board}</strong>
                    </span>
                  )}
                  {user?.academicInfo?.hscOrEquivalent?.result && (
                    <span>
                      Result:{" "}
                      <strong>
                        {user.academicInfo.hscOrEquivalent.result}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {user?.academicInfo?.sscOrEquivalent?.institutionName && (
            <div className="exp-item">
              <div className="exp-left">
                <div className="exp-date">
                  {user?.academicInfo?.sscOrEquivalent?.year || "N/A"}
                </div>
              </div>
              <div className="exp-right">
                <div className="exp-title">
                  Secondary School Certificate (SSC)
                </div>
                <div className="exp-role">
                  {user.academicInfo.sscOrEquivalent.institutionName}
                  {user.academicInfo.sscOrEquivalent.group &&
                    ` • ${user.academicInfo.sscOrEquivalent.group}`}
                </div>
                <div className="exp-meta">
                  {user?.academicInfo?.sscOrEquivalent?.board && (
                    <span>
                      Board:{" "}
                      <strong>{user.academicInfo.sscOrEquivalent.board}</strong>
                    </span>
                  )}
                  {user?.academicInfo?.sscOrEquivalent?.result && (
                    <span>
                      Result:{" "}
                      <strong>
                        {user.academicInfo.sscOrEquivalent.result}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    });

    // ---- ACHIEVEMENTS ----
    if (hasAchievements) {
      const total = userAchievements.length + clubAchievements.length;
      blocks.push({
        id: "achievements",
        height:
          HEIGHTS.sectionTitle + Math.max(1, total) * HEIGHTS.timelineItem + 20,
        jsx: (
          <div className="section" key="achievements">
            <div className="section-title">
              Achievements
              <span className="st-line" />
            </div>

            {userAchievements.map((ach, i) => (
              <div key={`u-${i}`} className="exp-item">
                <div className="exp-left">
                  <div className="exp-date">{ach.date || "—"}</div>
                </div>
                <div className="exp-right">
                  <div className="exp-title">{ach.title || "Achievement"}</div>
                  <div className="exp-meta">
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
                    <div className="exp-desc">
                      <strong>Project/Contest:</strong>{" "}
                      {ach.projectOrCompetitionName}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {clubAchievements.map((ach, i) => (
              <div key={`c-${i}`} className="exp-item">
                <div className="exp-left">
                  <div className="exp-date">{ach.date || "—"}</div>
                </div>
                <div className="exp-right">
                  <div className="exp-title">
                    {ach.eventName || "Club Achievement"}
                    <span className="club-badge">ACC Career Club</span>
                  </div>
                  <div className="exp-meta">
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
              </div>
            ))}
          </div>
        ),
      });
    }

    // ---- CAREER OBJECTIVE ----
    const hasCareerInfo =
      user?.careerClubInfo?.interestedCareerOrgOrPos ||
      user?.careerClubInfo?.requiredSkillsForCareer ||
      user?.careerClubInfo?.roadmapPlanning ||
      user?.careerClubInfo?.careerProspectsOfDept;

    if (hasCareerInfo) {
      const count = [
        user?.careerClubInfo?.interestedCareerOrgOrPos,
        user?.careerClubInfo?.requiredSkillsForCareer,
        user?.careerClubInfo?.roadmapPlanning,
        user?.careerClubInfo?.careerProspectsOfDept,
      ].filter(Boolean).length;

      blocks.push({
        id: "career",
        height: HEIGHTS.sectionTitle + count * HEIGHTS.careerBox + 20,
        jsx: (
          <div className="section" key="career">
            <div className="section-title">
              Career Objective
              <span className="st-line" />
            </div>

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

    // ---- SKILLS (single column) ----
    if (user?.skills?.length > 0 || user?.customSkills?.length > 0) {
      blocks.push({
        id: "skills",
        height: 110,
        jsx: (
          <div className="section" key="skills">
            <div className="section-title">
              Skills
              <span className="st-line" />
            </div>
            <div className="tag-list">
              {user.skills?.map((s, i) => (
                <span key={i} className="tag tag-dark">
                  {s}
                </span>
              ))}
              {user.customSkills?.map((s, i) => (
                <span key={`c-${i}`} className="tag tag-warm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ),
      });
    }

    // ---- INTERESTS ----
    if (user?.interests?.length > 0 || user?.customInterests?.length > 0) {
      blocks.push({
        id: "interests",
        height: 110,
        jsx: (
          <div className="section" key="interests">
            <div className="section-title">
              Interests
              <span className="st-line" />
            </div>
            <div className="tag-list">
              {user.interests?.map((s, i) => (
                <span key={i} className="tag tag-accent">
                  {s}
                </span>
              ))}
              {user.customInterests?.map((s, i) => (
                <span key={`c-${i}`} className="tag tag-outline">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ),
      });
    }

    return blocks;
  };

  const FIRST_PAGE_MAIN_BUDGET = USABLE_PAGE_HEIGHT - 190;
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
  const mainPages = paginateBlocks(mainBlocks, [
    FIRST_PAGE_MAIN_BUDGET,
    OTHER_PAGE_MAIN_BUDGET,
    OTHER_PAGE_MAIN_BUDGET,
    OTHER_PAGE_MAIN_BUDGET,
  ]);
  const totalPages = mainPages.length;

  return (
    <html>
      <head>
        <title>{`${user?.fullName || "CV"} - Classic CV`}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #E5E5E5; }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #2A2A2A;
            line-height: 1.55;
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
          .sheet:last-child { page-break-after: auto; break-after: auto; margin-bottom: 0; }

          @page { size: A4; margin: 0; }
          @media print {
            html, body {
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet { margin: 0; box-shadow: none; }
          }

          /* ============ HEADER ============ */
          .header {
            text-align: center;
            padding: 36px 60px 22px;
            border-bottom: 3px double #2A2A2A;
            margin-bottom: 22px;
          }
          .header .name {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 4px;
            color: #1F2937;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .header .title {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 5px;
            color: #8B7355;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          .header .contact {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px 22px;
            font-size: 11px;
            color: #4B5563;
          }
          .header .contact span {
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }
          .header .contact .sep {
            color: #A08C6A;
            font-weight: 700;
          }

          /* ============ BODY ============ */
          .body {
            padding: 0 60px 40px;
            display: flex;
            flex-direction: column;
            min-height: calc(297mm - 200px - 40px);
          }

          /* ============ SECTION TITLE ============ */
          .section { margin-bottom: 24px; }
          .section-title {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 13px;
            font-weight: 800;
            color: #1F2937;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .st-line {
            flex: 1;
            height: 1.5px;
            background: #1F2937;
            opacity: 0.6;
          }

          /* ============ PROFILE ============ */
          .profile-text {
            font-size: 12.5px;
            color: #4B5563;
            line-height: 1.8;
            text-align: justify;
          }

          /* ============ EXP ITEM (2-col timeline) ============ */
          .exp-item {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 18px;
            margin-bottom: 16px;
            padding-bottom: 14px;
            border-bottom: 1px dashed #D6D0BE;
          }
          .exp-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
          }
          .exp-left { text-align: right; }
          .exp-date {
            font-size: 10.5px;
            font-weight: 700;
            color: #8B7355;
            letter-spacing: 0.6px;
            font-family: 'Segoe UI', Tahoma, sans-serif;
          }
          .exp-right { }
          .exp-title {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 13.5px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 2px;
          }
          .exp-role {
            font-size: 11.5px;
            font-style: italic;
            color: #6B7280;
            margin-bottom: 4px;
          }
          .exp-desc {
            font-size: 11.5px;
            color: #4B5563;
            line-height: 1.65;
            margin-top: 3px;
          }
          .exp-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 4px 14px;
            margin-top: 4px;
            font-size: 11px;
            color: #6B7280;
          }
          .exp-meta strong { color: #1F2937; }

          .sub-heading {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 10px;
            font-weight: 800;
            color: #8B7355;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 10px 0 12px 128px;
          }

          /* ============ CAREER ============ */
          .career-box {
            background: #FAF8F3;
            padding: 12px 16px;
            border-left: 3px solid #8B7355;
            margin-bottom: 10px;
          }
          .career-box .career-title {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 9.5px;
            font-weight: 800;
            color: #8B7355;
            text-transform: uppercase;
            letter-spacing: 1.6px;
            margin-bottom: 4px;
          }
          .career-box .career-text {
            font-size: 11.5px;
            color: #2A2A2A;
            line-height: 1.6;
          }

          /* ============ TAGS ============ */
          .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .tag {
            display: inline-block;
            padding: 4px 11px;
            border-radius: 3px;
            font-size: 10.5px;
            font-weight: 600;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            letter-spacing: 0.4px;
          }
          .tag-dark { background: #1F2937; color: #F3F1EA; }
          .tag-accent { background: #E7E3D8; color: #1F2937; }
          .tag-warm { background: #8B7355; color: #FFFFFF; }
          .tag-outline {
            background: transparent;
            color: #1F2937;
            border: 1.2px solid #8B7355;
          }

          /* ============ CLUB BADGE ============ */
          .club-badge {
            display: inline-block;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 8.5px;
            font-weight: 800;
            color: #FFFFFF;
            background: #8B7355;
            padding: 1.5px 7px;
            border-radius: 3px;
            margin-left: 8px;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            vertical-align: middle;
          }

          /* ============ CONTINUATION ============ */
          .continuation-tag {
            display: inline-block;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 9px;
            font-weight: 700;
            color: #8B7355;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 16px;
            padding: 4px 12px;
            border: 1.5px solid #8B7355;
            border-radius: 3px;
          }

          /* ============ SIGNATURE ============ */
          .signature-block {
            margin-top: auto;
            padding-top: 40px;
            display: flex;
            justify-content: flex-start;
          }
          .signature-inner { width: 240px; text-align: left; }
          .signature-line {
            border-top: 1.3px solid #2A2A2A;
            margin-bottom: 6px;
          }
          .signature-label {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 9.5px;
            font-weight: 700;
            color: #8B7355;
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          /* ============ END MARKER ============ */
          .end-marker {
            margin-top: 24px;
            padding-top: 18px;
            text-align: center;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 9px;
            color: #8B7355;
            letter-spacing: 3px;
            font-weight: 700;
            opacity: 0.55;
          }

          /* ============ FOOTER ============ */
          .footer {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            text-align: center;
            padding: 10px 60px;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            font-size: 9.5px;
            color: #6B7280;
            border-top: 1px solid #E5E7EB;
            background: #FAF8F3;
            letter-spacing: 1px;
          }
        `}</style>
      </head>
      <body>
        {mainPages.map((pageBlocks, pageIdx) => {
          const isLast = pageIdx === totalPages - 1;
          return (
            <div className="sheet" key={pageIdx}>
              {/* Header — only first page */}
              {pageIdx === 0 && (
                <div className="header">
                  <div className="name">{user?.fullName || "Unknown"}</div>
                  <div className="title">Curriculum Vitae</div>
                  <div className="contact">
                    {user?.email && <span>✉ {user.email}</span>}
                    {user?.email && (user?.phone || user?.department) && (
                      <span className="sep">•</span>
                    )}
                    {user?.phone && <span>☎ {user.phone}</span>}
                    {user?.phone && user?.department && (
                      <span className="sep">•</span>
                    )}
                    {user?.department && <span>{user.department}</span>}
                  </div>
                </div>
              )}

              <div className="body">
                {pageIdx > 0 && (
                  <div className="continuation-tag">
                    {user?.fullName || "Unknown"} — Continued
                  </div>
                )}

                {pageBlocks.map((b) => b.jsx)}

                {isLast && (
                  <div className="signature-block">
                    <div className="signature-inner">
                      <div className="signature-line" />
                      <div className="signature-label">Student's Signature</div>
                    </div>
                  </div>
                )}

                <div className="end-marker">• END OF CONTENT •</div>
              </div>

              <div className="footer">
                Page {pageIdx + 1} of {totalPages} — {user?.fullName || "CV"}
              </div>
            </div>
          );
        })}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onload = function() {
                setTimeout(function() { window.print(); }, 500);
              };
            `,
          }}
        />
      </body>
    </html>
  );
};

export default ClassicCVGenerator;
