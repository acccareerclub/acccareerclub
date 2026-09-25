// app/components/ModernCVGenerator.jsx
"use client";

import React from "react";

// ==================== PAGE BUDGET ====================
const USABLE_PAGE_HEIGHT = 297 * 3.78 - 175 - 32;
const HEIGHTS = {
  sectionTitle: 35,
  subHeading: 25,
  profileSummary: 75,
  timelineItem: 72,
  careerBox: 58,
};

const ModernCVGenerator = ({ user }) => {
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

  // ---------- MAIN BLOCKS ----------
  const buildMainBlocks = () => {
    const blocks = [];

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
              <span className="st-bar" />
              Profile
            </div>
            <div className="profile-summary">{bioText}</div>
          </div>
        ),
      });
    }

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
              <span className="st-bar" />
              Experience & Activities
            </div>

            {clubCount > 0 && (
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

            {jobCount > 0 && (
              <>
                <div className="sub-heading">Job / Internship</div>
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

            {hasExtra && (
              <>
                <div className="sub-heading">Extra-Curricular Activities</div>
                <p className="extra-text">
                  {user.experience.extraCurricularActivities}
                </p>
              </>
            )}
          </div>
        ),
      });
    }

    // Education (always)
    blocks.push({
      id: "education",
      height: HEIGHTS.sectionTitle + 3 * HEIGHTS.timelineItem + 20,
      jsx: (
        <div className="section" key="education">
          <div className="section-title">
            <span className="st-bar" />
            Education
          </div>

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

    if (hasAchievements) {
      const total = userAchievements.length + clubAchievements.length;
      blocks.push({
        id: "achievements",
        height:
          HEIGHTS.sectionTitle + Math.max(1, total) * HEIGHTS.timelineItem + 20,
        jsx: (
          <div className="section" key="achievements">
            <div className="section-title">
              <span className="st-bar" />
              Achievements
            </div>

            {userAchievements.map((ach, i) => (
              <div key={`u-${i}`} className="timeline-item">
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
              <div key={`c-${i}`} className="timeline-item">
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
            <div className="section-title">
              <span className="st-bar" />
              Career Objective
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

    return blocks;
  };

  // ---------- SIDE BLOCKS (LEFT RAIL) ----------
  // In Modern layout, the left rail shows contact + photo + skills + langs.
  // The right column shows the main timeline blocks.
  const buildRailContent = () => {
    const rail = [];

    rail.push({
      id: "contact",
      jsx: (
        <div className="rail-block" key="contact">
          <div className="rail-title">Contact</div>
          {user?.email && (
            <div className="rail-line">
              <span className="rail-label">Email</span>
              <span className="rail-value">{user.email}</span>
            </div>
          )}
          {user?.phone && (
            <div className="rail-line">
              <span className="rail-label">Phone</span>
              <span className="rail-value">{user.phone}</span>
            </div>
          )}
          {user?.studentId && (
            <div className="rail-line">
              <span className="rail-label">Student ID</span>
              <span className="rail-value">{user.studentId}</span>
            </div>
          )}
          {user?.department && (
            <div className="rail-line">
              <span className="rail-label">Department</span>
              <span className="rail-value">{user.department}</span>
            </div>
          )}
        </div>
      ),
    });

    if (
      user?.personalInfo?.dateOfBirth ||
      user?.personalInfo?.bloodGroup ||
      user?.personalInfo?.religion ||
      user?.personalInfo?.maritalStatus
    ) {
      rail.push({
        id: "personal",
        jsx: (
          <div className="rail-block" key="personal">
            <div className="rail-title">Personal</div>
            {user?.personalInfo?.dateOfBirth && (
              <div className="rail-line">
                <span className="rail-label">Date of Birth</span>
                <span className="rail-value">
                  {formatDate(user.personalInfo.dateOfBirth)}
                </span>
              </div>
            )}
            {user?.personalInfo?.bloodGroup && (
              <div className="rail-line">
                <span className="rail-label">Blood Group</span>
                <span className="rail-value">
                  {user.personalInfo.bloodGroup}
                </span>
              </div>
            )}
            {user?.personalInfo?.religion && (
              <div className="rail-line">
                <span className="rail-label">Religion</span>
                <span className="rail-value">{user.personalInfo.religion}</span>
              </div>
            )}
            {user?.personalInfo?.maritalStatus && (
              <div className="rail-line">
                <span className="rail-label">Marital Status</span>
                <span className="rail-value">
                  {user.personalInfo.maritalStatus}
                </span>
              </div>
            )}
          </div>
        ),
      });
    }

    if (user?.skills?.length > 0 || user?.customSkills?.length > 0) {
      rail.push({
        id: "skills",
        jsx: (
          <div className="rail-block" key="skills">
            <div className="rail-title">Skills</div>
            <div className="rail-tags">
              {user.skills?.map((s, i) => (
                <span key={i} className="rail-tag rail-tag-solid">
                  {s}
                </span>
              ))}
              {user.customSkills?.map((s, i) => (
                <span key={`c-${i}`} className="rail-tag rail-tag-warm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ),
      });
    }

    if (user?.interests?.length > 0 || user?.customInterests?.length > 0) {
      rail.push({
        id: "interests",
        jsx: (
          <div className="rail-block" key="interests">
            <div className="rail-title">Interests</div>
            <div className="rail-tags">
              {user.interests?.map((s, i) => (
                <span key={i} className="rail-tag rail-tag-outline">
                  {s}
                </span>
              ))}
              {user.customInterests?.map((s, i) => (
                <span key={`c-${i}`} className="rail-tag rail-tag-outline">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ),
      });
    }

    if (
      user?.personalInfo?.presentAddress ||
      user?.personalInfo?.permanentAddress
    ) {
      rail.push({
        id: "address",
        jsx: (
          <div className="rail-block" key="address">
            <div className="rail-title">Address</div>
            {user?.personalInfo?.presentAddress && (
              <div className="rail-line">
                <span className="rail-label">Present</span>
                <span className="rail-value">
                  {user.personalInfo.presentAddress}
                </span>
              </div>
            )}
            {user?.personalInfo?.permanentAddress && (
              <div className="rail-line">
                <span className="rail-label">Permanent</span>
                <span className="rail-value">
                  {user.personalInfo.permanentAddress}
                </span>
              </div>
            )}
          </div>
        ),
      });
    }

    if (user?.guardianInfo?.father?.name || user?.guardianInfo?.mother?.name) {
      rail.push({
        id: "family",
        jsx: (
          <div className="rail-block" key="family">
            <div className="rail-title">Family</div>
            {user?.guardianInfo?.father?.name && (
              <div className="rail-line">
                <span className="rail-label">Father</span>
                <span className="rail-value">
                  {user.guardianInfo.father.name}
                </span>
                {user.guardianInfo.father.occupation && (
                  <span className="rail-sub">
                    {user.guardianInfo.father.occupation}
                  </span>
                )}
              </div>
            )}
            {user?.guardianInfo?.mother?.name && (
              <div className="rail-line">
                <span className="rail-label">Mother</span>
                <span className="rail-value">
                  {user.guardianInfo.mother.name}
                </span>
                {user.guardianInfo.mother.occupation && (
                  <span className="rail-sub">
                    {user.guardianInfo.mother.occupation}
                  </span>
                )}
              </div>
            )}
          </div>
        ),
      });
    }

    return rail;
  };

  // ---------- PAGINATE ----------
  const FIRST_PAGE_MAIN_BUDGET = USABLE_PAGE_HEIGHT - 130;
  const OTHER_PAGE_MAIN_BUDGET = USABLE_PAGE_HEIGHT - 40;

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
  const railBlocks = buildRailContent();

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
        <title>{`${user?.fullName || "CV"} - Modern CV`}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #E5E5E5; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1F2937;
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
            .sheet { margin: 0; box-shadow: none; }
          }

          /* ========== LAYOUT ========== */
          .layout {
            display: grid;
            grid-template-columns: 34% 66%;
            height: 100%;
          }

          /* ========== LEFT RAIL ========== */
          .rail {
            background: linear-gradient(180deg, #3D444C 0%, #2F353B 100%);
            color: #E7E3D8;
            padding: 34px 22px;
            display: flex;
            flex-direction: column;
            gap: 26px;
          }
          .rail-photo-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 4px;
          }
          .rail-photo {
            width: 130px;
            height: 130px;
            border-radius: 50%;
            border: 5px solid #D3A16D;
            overflow: hidden;
            background: #E7E3D8;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .rail-photo img { width: 100%; height: 100%; object-fit: cover; }
          .rail-photo-placeholder {
            font-size: 52px; font-weight: 800; color: #994D35;
          }
          .rail-name {
            text-align: center;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.5px;
            color: #FFFFFF;
            margin-top: 4px;
            line-height: 1.2;
          }
          .rail-role {
            text-align: center;
            font-size: 10.5px;
            color: #D3A16D;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 700;
            margin-top: 2px;
          }
          .rail-divider {
            height: 2px;
            background: #D3A16D;
            opacity: 0.6;
            margin: 4px 0;
          }
          .rail-block { }
          .rail-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #D3A16D;
            border-bottom: 1.5px solid #D3A16D;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .rail-line {
            display: flex;
            flex-direction: column;
            margin-bottom: 8px;
          }
          .rail-label {
            font-size: 8.5px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #D3A16D;
            font-weight: 700;
            margin-bottom: 1px;
          }
          .rail-value {
            font-size: 11px;
            color: #F3F1EA;
            font-weight: 500;
            word-break: break-word;
          }
          .rail-sub {
            font-size: 9.5px;
            color: #B7B1A5;
            margin-top: 1px;
          }
          .rail-tags { display: flex; flex-wrap: wrap; gap: 5px; }
          .rail-tag {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 9.5px;
            font-weight: 600;
            line-height: 1.4;
          }
          .rail-tag-solid { background: #D3A16D; color: #3D444C; }
          .rail-tag-warm { background: #994D35; color: #FFFFFF; }
          .rail-tag-outline {
            background: transparent;
            color: #E7E3D8;
            border: 1.2px solid #D3A16D;
          }

          /* ========== RIGHT CONTENT ========== */
          .content {
            padding: 34px 34px 40px 30px;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
          }

          .section { margin-bottom: 22px; }
          .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 800;
            color: #3D444C;
            text-transform: uppercase;
            letter-spacing: 1.6px;
            padding-bottom: 6px;
            margin-bottom: 12px;
            border-bottom: 2.5px solid #D3A16D;
          }
          .st-bar {
            width: 22px; height: 3px;
            background: #994D35; border-radius: 2px;
          }

          .profile-summary {
            font-size: 12.5px;
            color: #4B5563;
            line-height: 1.75;
            padding: 14px 18px;
            background: #F9F8F5;
            border-left: 4px solid #D3A16D;
            border-radius: 0 8px 8px 0;
          }

          /* Timeline */
          .timeline-item {
            position: relative;
            padding-left: 20px;
            padding-bottom: 14px;
            border-left: 2px solid #E5E7EB;
          }
          .timeline-item:last-child { border-left-color: transparent; padding-bottom: 0; }
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
            font-size: 13.5px; font-weight: 700; color: #1F2937;
          }
          .timeline-date {
            font-size: 10.5px; color: #994D35; font-weight: 600;
            background: #E7E3D8; padding: 2px 8px; border-radius: 10px;
            white-space: nowrap;
          }
          .timeline-subtitle { font-size: 11.5px; color: #6B7280; margin-bottom: 4px; }
          .timeline-desc { font-size: 11.5px; color: #4B5563; line-height: 1.6; margin-top: 3px; }
          .timeline-meta {
            display: flex; flex-wrap: wrap;
            gap: 4px 12px; margin-top: 4px;
            font-size: 11px; color: #6B7280;
          }
          .timeline-meta strong { color: #1F2937; }

          .sub-heading {
            font-size: 10px; font-weight: 800; color: #994D35;
            text-transform: uppercase; letter-spacing: 1.2px;
            margin: 12px 0 8px 0; padding-left: 2px;
          }
          .extra-text {
            font-size: 11.5px; color: #4B5563; line-height: 1.7;
          }

          .career-box {
            background: #F9F8F5;
            border-radius: 8px;
            padding: 11px 13px;
            border-left: 4px solid #D3A16D;
            margin-bottom: 9px;
          }
          .career-box .career-title {
            font-size: 9.5px; font-weight: 800; color: #994D35;
            text-transform: uppercase; letter-spacing: 1.2px;
            margin-bottom: 4px;
          }
          .career-box .career-text {
            font-size: 11px; color: #1F2937; line-height: 1.55;
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

          .continuation-tag {
            display: inline-block;
            font-size: 9px; font-weight: 700; color: #994D35;
            text-transform: uppercase; letter-spacing: 1.5px;
            margin-bottom: 14px;
            padding: 3px 10px;
            border: 1.5px solid #D3A16D;
            border-radius: 4px;
          }

          .end-marker {
            margin-top: auto;
            padding-top: 18px;
            text-align: center;
            font-size: 9px;
            color: #D3A16D;
            letter-spacing: 2px;
            font-weight: 700;
            opacity: 0.5;
          }

          .signature-block {
            margin-top: 34px;
            display: flex;
            justify-content: flex-start;
          }
          .signature-inner { width: 240px; }
          .signature-line {
            border-top: 1.5px solid #1F2937;
            margin-bottom: 6px;
          }
          .signature-label {
            font-size: 9px; font-weight: 800; color: #994D35;
            text-transform: uppercase; letter-spacing: 1.5px;
          }

          .footer {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            text-align: center;
            padding: 8px 34px;
            background: #3D444C;
            color: #E7E3D8;
            font-size: 9.5px;
            letter-spacing: 0.5px;
          }
        `}</style>
      </head>
      <body>
        {mainPages.map((pageBlocks, pageIdx) => {
          const isLast = pageIdx === totalPages - 1;
          return (
            <div className="sheet" key={pageIdx}>
              <div className="layout">
                {/* Left rail — only on page 0 */}
                <div className="rail">
                  {pageIdx === 0 && (
                    <>
                      <div className="rail-photo-wrap">
                        <div className="rail-photo">
                          {user?.personalInfo?.profilePicture ? (
                            <img
                              src={user.personalInfo.profilePicture}
                              alt={user.fullName}
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="rail-photo-placeholder">
                              {user?.fullName?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="rail-name">
                          {user?.fullName || "Unknown"}
                        </div>
                        <div className="rail-role">Curriculum Vitae</div>
                        <div
                          className="rail-divider"
                          style={{ marginTop: 10 }}
                        />
                      </div>

                      {railBlocks.map((b) => b.jsx)}
                    </>
                  )}
                  {pageIdx > 0 && (
                    <div
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        letterSpacing: "3px",
                        fontSize: "10px",
                        color: "#D3A16D",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        marginTop: "40px",
                      }}
                    >
                      {user?.fullName || "CV"} — Continued
                    </div>
                  )}
                </div>

                {/* Right content */}
                <div className="content">
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
                        <div className="signature-label">
                          Student's Signature
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="end-marker">• END OF CONTENT •</div>
                </div>
              </div>

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
                setTimeout(function() { window.print(); }, 500);
              };
            `,
          }}
        />
      </body>
    </html>
  );
};

export default ModernCVGenerator;
