// app/components/CVGenerator.jsx
"use client";

import React from "react";
import Logo from "../assets/logo/Careerclublogo.png";

// ==================== PAGE BUDGET (px, based on 96dpi A4) ====================
// A4 = 297mm ≈ 1122px tall, 210mm ≈ 794px wide.
const A4_HEIGHT = 1122;
const HEADER_HEIGHT = 200; // doc-header + doc-title-bar
const FOOTER_HEIGHT = 44; // .footer padding + font
const PAGE_PADDING_BOTTOM = 24; // main-col padding-bottom

const FIRST_PAGE_BUDGET =
  A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - PAGE_PADDING_BOTTOM;
const OTHER_PAGE_BUDGET = A4_HEIGHT - FOOTER_HEIGHT - PAGE_PADDING_BOTTOM;

// Height estimates — measured in px to match real rendering
const H = {
  sectionTitle: 34, // section-title bar
  tableHeader: 30, // thead row
  tableRow: 36, // one tbody row (2-line cells included)
  sectionGap: 20, // margin-bottom on .section
  declarationBox: 80,
};

const CVGenerator = ({
  user,
  signatures = { moderator: false, coModerator: false, teacher: false },
}) => {
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

  const val = (v, fallback = "—") =>
    v !== undefined && v !== null && v !== "" ? v : fallback;

  // Helper — build a simple 2-col label/value table
  const InfoTable = ({ rows }) => (
    <table className="doc-table">
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i}>
            <td className="label-cell">{label}</td>
            <td className="value-cell">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // ==================== BUILD MAIN BLOCKS ====================
  const buildMainBlocks = () => {
    const blocks = [];

    /* ---------- 1. PERSONAL STATEMENT ---------- */
    blocks.push({
      id: "about",
      height: H.sectionTitle + H.tableRow * 2 + H.sectionGap,
      jsx: (
        <div className="section" key="about">
          <div className="section-title">Personal Statement</div>
          <InfoTable
            rows={[
              [
                "About",
                <span className="profile-statement">
                  {val(
                    user?.careerClubInfo?.reasonToJoin,
                    "No personal statement provided.",
                  )}
                </span>,
              ],
            ]}
          />
        </div>
      ),
    });

    /* ---------- 2. ACADEMIC SUMMARY ---------- */
    blocks.push({
      id: "academic-summary",
      height: H.sectionTitle + H.tableRow * 6 + H.sectionGap,
      jsx: (
        <div className="section" key="academic-summary">
          <div className="section-title">Academic Summary</div>
          <InfoTable
            rows={[
              [
                "University",
                val(user?.academicInfo?.university?.institutionName),
              ],
              ["College", val(user?.academicInfo?.university?.collegeName)],
              [
                "Registration No.",
                <span className="mono">
                  {val(user?.academicInfo?.university?.registrationNumber)}
                </span>,
              ],
              ["Session", val(user?.academicInfo?.university?.session)],
              [
                "Exam System",
                <span className="capitalize">
                  {val(user?.academicInfo?.university?.examSystem)}
                </span>,
              ],
              [
                "Cumulative CGPA",
                <span className="mono big">
                  {val(user?.academicInfo?.university?.cumulativeResult?.cgpa)}
                </span>,
              ],
            ]}
          />
        </div>
      ),
    });

    /* ---------- 3. HSC ---------- */
    blocks.push({
      id: "hsc",
      height: H.sectionTitle + H.tableRow * 6 + H.sectionGap,
      jsx: (
        <div className="section" key="hsc">
          <div className="section-title">
            Higher Secondary Certificate (HSC)
          </div>
          <InfoTable
            rows={[
              [
                "Institution",
                val(user?.academicInfo?.hscOrEquivalent?.institutionName),
              ],
              ["Group", val(user?.academicInfo?.hscOrEquivalent?.group)],
              ["Board", val(user?.academicInfo?.hscOrEquivalent?.board)],
              [
                "Roll No.",
                <span className="mono">
                  {val(user?.academicInfo?.hscOrEquivalent?.rollNumber)}
                </span>,
              ],
              ["Year", val(user?.academicInfo?.hscOrEquivalent?.year)],
              [
                "Result",
                <span className="mono big">
                  {val(user?.academicInfo?.hscOrEquivalent?.result)}
                </span>,
              ],
            ]}
          />
        </div>
      ),
    });

    /* ---------- 4. SSC ---------- */
    blocks.push({
      id: "ssc",
      height: H.sectionTitle + H.tableRow * 6 + H.sectionGap,
      jsx: (
        <div className="section" key="ssc">
          <div className="section-title">
            Secondary School Certificate (SSC)
          </div>
          <InfoTable
            rows={[
              [
                "Institution",
                val(user?.academicInfo?.sscOrEquivalent?.institutionName),
              ],
              ["Group", val(user?.academicInfo?.sscOrEquivalent?.group)],
              ["Board", val(user?.academicInfo?.sscOrEquivalent?.board)],
              [
                "Roll No.",
                <span className="mono">
                  {val(user?.academicInfo?.sscOrEquivalent?.rollNumber)}
                </span>,
              ],
              ["Year", val(user?.academicInfo?.sscOrEquivalent?.year)],
              [
                "Result",
                <span className="mono big">
                  {val(user?.academicInfo?.sscOrEquivalent?.result)}
                </span>,
              ],
            ]}
          />
        </div>
      ),
    });

    /* ---------- 5. SEMESTER RESULTS ---------- */
    const semesters = user?.academicInfo?.university?.semesters || [];
    if (semesters.length > 0) {
      blocks.push({
        id: "semesters",
        height:
          H.sectionTitle +
          H.tableHeader +
          semesters.length * H.tableRow +
          H.sectionGap,
        jsx: (
          <div className="section" key="semesters">
            <div className="section-title">Semester Results</div>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Year</th>
                  <th>Roll No.</th>
                  <th>GPA</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map((sem, i) => (
                  <tr key={i}>
                    <td>
                      {val(
                        sem.examName,
                        `Semester ${sem.semesterNumber || i + 1}`,
                      )}
                    </td>
                    <td>{val(sem.year)}</td>
                    <td className="mono">{val(sem.rollNumber)}</td>
                    <td className="mono bold">{val(sem.result)}</td>
                    <td>{val(sem.remarks, "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      });
    }

    /* ---------- 6. YEARLY RESULTS ---------- */
    const years = user?.academicInfo?.university?.years || [];
    if (years.length > 0) {
      blocks.push({
        id: "years",
        height:
          H.sectionTitle +
          H.tableHeader +
          years.length * H.tableRow +
          H.sectionGap,
        jsx: (
          <div className="section" key="years">
            <div className="section-title">Yearly Results</div>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Year</th>
                  <th>Roll No.</th>
                  <th>GPA</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {years.map((yr, i) => (
                  <tr key={i}>
                    <td>
                      {val(yr.examName, `Year ${yr.yearNumber || i + 1}`)}
                    </td>
                    <td>{val(yr.year)}</td>
                    <td className="mono">{val(yr.rollNumber)}</td>
                    <td className="mono bold">{val(yr.result)}</td>
                    <td>{val(yr.remarks, "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      });
    }

    /* ---------- 7. EXPERIENCE ---------- */
    const clubExp = user?.experience?.clubExperience || [];
    const jobs = user?.experience?.jobOrInternship || [];
    const extra = user?.experience?.extraCurricularActivities;
    const expRows = clubExp.length + jobs.length + (extra ? 1 : 0);

    blocks.push({
      id: "experience",
      height:
        H.sectionTitle +
        H.tableHeader +
        Math.max(1, expRows) * H.tableRow +
        H.sectionGap,
      jsx: (
        <div className="section" key="experience">
          <div className="section-title">Experience & Activities</div>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ width: "28%" }}>Type</th>
                <th style={{ width: "37%" }}>Organization / Role</th>
                <th style={{ width: "15%" }}>Duration</th>
                <th style={{ width: "20%" }}>Responsibility</th>
              </tr>
            </thead>
            <tbody>
              {clubExp.map((c, i) => (
                <tr key={`club-${i}`}>
                  <td>Club Experience</td>
                  <td>
                    <div className="cell-primary">{val(c.clubName)}</div>
                    <div className="cell-secondary">{val(c.position)}</div>
                  </td>
                  <td>{val(c.duration)}</td>
                  <td>{val(c.responsibility, "—")}</td>
                </tr>
              ))}
              {jobs.map((j, i) => (
                <tr key={`job-${i}`}>
                  <td>Job / Internship</td>
                  <td>
                    <div className="cell-primary">{val(j.organization)}</div>
                    <div className="cell-secondary">{val(j.designation)}</div>
                  </td>
                  <td>{val(j.duration)}</td>
                  <td>{val(j.responsibility, "—")}</td>
                </tr>
              ))}
              {extra && (
                <tr>
                  <td>Extracurricular</td>
                  <td colSpan={3}>{extra}</td>
                </tr>
              )}
              {expRows === 0 && (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    No experience recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ),
    });

    /* ---------- 8. ACHIEVEMENTS ---------- */
    const userAch = user?.achievements || [];
    const clubAch = user?.accCareerClubAchievements || [];
    const totalAch = userAch.length + clubAch.length;

    if (totalAch > 0) {
      blocks.push({
        id: "achievements",
        height:
          H.sectionTitle + H.tableHeader + totalAch * H.tableRow + H.sectionGap,
        jsx: (
          <div className="section" key="achievements">
            <div className="section-title">Achievements</div>
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Title / Event</th>
                  <th style={{ width: "18%" }}>Position</th>
                  <th style={{ width: "22%" }}>Organizer</th>
                  <th style={{ width: "16%" }}>Level</th>
                  <th style={{ width: "12%" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {userAch.map((ach, i) => (
                  <tr key={`u-${i}`}>
                    <td>
                      <div className="cell-primary">
                        {val(ach.title, "Achievement")}
                      </div>
                      {ach.projectOrCompetitionName && (
                        <div className="cell-secondary">
                          {ach.projectOrCompetitionName}
                        </div>
                      )}
                    </td>
                    <td>{val(ach.position)}</td>
                    <td>{val(ach.organizer)}</td>
                    <td className="capitalize">{val(ach.level)}</td>
                    <td>{val(ach.date)}</td>
                  </tr>
                ))}
                {clubAch.map((ach, i) => (
                  <tr key={`c-${i}`} className="club-row">
                    <td>
                      <div className="cell-primary">
                        {val(ach.eventName, "Club Event")}
                        <span className="club-badge">ACC</span>
                      </div>
                    </td>
                    <td>{val(ach.position)}</td>
                    <td>{val(ach.organizer, "ACC Career Club")}</td>
                    <td>Club</td>
                    <td>{val(ach.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      });
    }

    /* ---------- 9. SKILLS & INTERESTS ---------- */
    const allSkills = [...(user?.skills || []), ...(user?.customSkills || [])];
    const allInterests = [
      ...(user?.interests || []),
      ...(user?.customInterests || []),
    ];

    if (allSkills.length > 0 || allInterests.length > 0) {
      blocks.push({
        id: "skills",
        height: H.sectionTitle + H.tableRow * 2 + H.sectionGap,
        jsx: (
          <div className="section" key="skills">
            <div className="section-title">Skills & Interests</div>
            <table className="doc-table">
              <tbody>
                <tr>
                  <td className="label-cell">Skills</td>
                  <td className="value-cell">
                    {allSkills.length > 0 ? (
                      <div className="tag-row">
                        {allSkills.map((s, i) => (
                          <span key={i} className="doc-tag">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="empty-val">Not provided</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="label-cell">Interests</td>
                  <td className="value-cell">
                    {allInterests.length > 0 ? (
                      <div className="tag-row">
                        {allInterests.map((s, i) => (
                          <span key={i} className="doc-tag doc-tag-alt">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="empty-val">Not provided</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      });
    }

    /* ---------- 10. CAREER ASPIRATIONS ---------- */
    blocks.push({
      id: "career",
      height: H.sectionTitle + H.tableRow * 4 + H.sectionGap,
      jsx: (
        <div className="section" key="career">
          <div className="section-title">Career Aspirations</div>
          <InfoTable
            rows={[
              [
                "Target Role / Company",
                val(user?.careerClubInfo?.interestedCareerOrgOrPos),
              ],
              [
                "Skills to Develop",
                val(user?.careerClubInfo?.requiredSkillsForCareer),
              ],
              ["Career Roadmap", val(user?.careerClubInfo?.roadmapPlanning)],
              [
                "Career Prospects of My Field",
                val(user?.careerClubInfo?.careerProspectsOfDept),
              ],
            ]}
          />
        </div>
      ),
    });

    /* ---------- 11. DECLARATION ---------- */
    blocks.push({
      id: "declaration",
      height: H.declarationBox + H.sectionGap,
      jsx: (
        <div className="declaration-block" key="declaration">
          <strong>Declaration:</strong> I hereby declare that all the
          information provided above is correct and complete to the best of my
          knowledge.
        </div>
      ),
    });

    return blocks;
  };

  /* ==================== SIDE COLUMN ==================== */
  const sideRows = [
    [
      "Date of Birth",
      user?.personalInfo?.dateOfBirth
        ? formatDate(user.personalInfo.dateOfBirth)
        : null,
    ],
    ["Blood Group", user?.personalInfo?.bloodGroup],
    ["Religion", user?.personalInfo?.religion],
    ["Marital Status", user?.personalInfo?.maritalStatus],
    ["Department", user?.department],
    ["Class / Year", user?.personalInfo?.classOrYear],
    ["Student ID", user?.studentId],
    ["Present Address", user?.personalInfo?.presentAddress],
    ["Permanent Address", user?.personalInfo?.permanentAddress],
  ];

  const familyRows = [
    [
      "Father",
      user?.guardianInfo?.father?.name,
      user?.guardianInfo?.father?.occupation,
    ],
    [
      "Mother",
      user?.guardianInfo?.mother?.name,
      user?.guardianInfo?.mother?.occupation,
    ],
  ];

  /* ==================== PAGINATE (natural flow) ==================== */
  const paginateBlocks = (blocks, budgets) => {
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    let pageIdx = 0;
    let budget = budgets[pageIdx] ?? budgets[budgets.length - 1];

    for (const block of blocks) {
      // If this block alone fits on an empty page, never split it.
      // If adding it would overflow, push the current page and start a new one.
      if (currentPage.length > 0 && currentHeight + block.height > budget) {
        pages.push(currentPage);
        pageIdx++;
        currentPage = [];
        currentHeight = 0;
        budget = budgets[pageIdx] ?? budgets[budgets.length - 1];
      }
      currentPage.push(block);
      currentHeight += block.height;
    }
    if (currentPage.length > 0) pages.push(currentPage);
    return pages.length > 0 ? pages : [[]];
  };

  const mainBlocks = buildMainBlocks();

  // Budget list — first page has header+title, others don't
  const budgets = [FIRST_PAGE_BUDGET];
  for (let i = 0; i < 6; i++) budgets.push(OTHER_PAGE_BUDGET);

  const mainPages = paginateBlocks(mainBlocks, budgets);
  const totalPages = mainPages.length;

  return (
    <html>
      <head>
        <title>{`${user?.fullName || "Profile"} — Official Profile`}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            margin: 0; padding: 0;
            background: #E5E5E5;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1F2937;
            font-size: 11.5px;
            line-height: 1.5;
          }

            .signature-section {
            margin-top: 20px;
            padding: 14px 16px;
            background: #FAF8F3;
            border: 1.5px solid #D3A16D;
            border-radius: 6px;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* ============ SHEET — flex column so footer stays at bottom ============ */
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

            display: flex;
            flex-direction: column;
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
            .no-print { display: none !important; }
          }

          /* ============ HEADER ============ */
          .doc-header {
            background: #3D444C;
            color: #E7E3D8;
            padding: 22px 34px;
            display: flex;
            align-items: center;
            gap: 22px;
            border-bottom: 4px solid #D3A16D;
            flex-shrink: 0;
          }
          .doc-header-photo {
            width: 96px; height: 96px;
            border-radius: 50%;
            border: 4px solid #D3A16D;
            background: #E7E3D8;
            overflow: hidden;
            flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
          }
          .doc-header-photo img { width: 100%; height: 100%; object-fit: cover; }
          .doc-header-photo .ph {
            font-size: 40px; font-weight: 800; color: #994D35;
          }
          .doc-header-info { flex: 1; min-width: 0; }
          .doc-header-info h1 {
            font-size: 24px; font-weight: 800;
            letter-spacing: 0.5px; margin-bottom: 4px;
            color: #FFFFFF;
          }
          .doc-header-info .role-line {
            font-size: 11px; color: #D3A16D;
            text-transform: uppercase;
            letter-spacing: 2.2px;
            font-weight: 700; margin-bottom: 10px;
          }
          .doc-header-contact {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px 20px; font-size: 11px;
          }
          .doc-header-contact span { display: inline-block; }
          .doc-header-contact strong {
            color: #D3A16D; margin-right: 6px; font-weight: 700;
          }

          /* ============ CLUB LOGO ============ */
          .doc-header-logo {
            flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            padding-left: 8px;
          }
          .doc-header-logo img {
            height: 76px; width: 76px;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
          }

          /* ============ DOC TITLE ============ */
          .doc-title-bar {
            text-align: center;
            padding: 12px 30px 8px;
            border-bottom: 1.5px solid #D3A16D;
            flex-shrink: 0;
          }
          .doc-title-bar h2 {
            font-size: 14px; font-weight: 800;
            letter-spacing: 3px; text-transform: uppercase;
            color: #3D444C;
          }
          .doc-title-bar p {
            font-size: 9.5px; letter-spacing: 2px;
            color: #994D35; margin-top: 2px;
            text-transform: uppercase; font-weight: 600;
          }

          /* ============ BODY GRID — grows, footer stays at bottom ============ */
          .doc-body {
            display: grid;
            grid-template-columns: 66% 34%;
            flex: 1;
            min-height: 0;
            overflow: hidden;
          }

          /* ============ MAIN COLUMN ============ */
          .main-col {
            padding: 22px 26px 20px 34px;
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          /* ============ SECTION TITLE ============ */
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .section-title {
            font-size: 12px; font-weight: 800;
            color: #FFFFFF; background: #3D444C;
            padding: 6px 12px; letter-spacing: 1.5px;
            text-transform: uppercase; margin-bottom: 8px;
            border-left: 4px solid #D3A16D;
            display: flex; align-items: center;
          }

          /* ============ TABLE — never split across pages ============ */
          table.doc-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 4px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table.doc-table th {
            background: #E7E3D8; color: #3D444C;
            text-align: left; padding: 7px 10px;
            font-weight: 800; font-size: 10px;
            letter-spacing: 0.8px; text-transform: uppercase;
            border: 1px solid #D6D0BE;
          }
          table.doc-table td {
            padding: 7px 10px;
            border: 1px solid #D6D0BE;
            vertical-align: top;
            color: #1F2937;
            word-wrap: break-word;
          }
          table.doc-table tr:nth-child(even) td { background: #FBF9F5; }
          .label-cell {
            width: 34%;
            background: #F5F2EA !important;
            font-weight: 700; color: #3D444C;
            font-size: 10.5px; letter-spacing: 0.4px;
            text-transform: uppercase;
          }
          .value-cell { font-weight: 500; }
          .profile-statement {
            display: inline-block;
            line-height: 1.65; color: #4B5563;
          }
          .mono { font-family: 'Courier New', monospace; font-weight: 700; }
          .big { font-size: 13px; color: #994D35; }
          .bold { font-weight: 800; }
          .capitalize { text-transform: capitalize; }
          .cell-primary {
            font-weight: 700; color: #1F2937; font-size: 11px;
          }
          .cell-secondary {
            font-size: 10px; color: #6B7280; margin-top: 1px;
          }
          .empty-cell {
            text-align: center; color: #9CA3AF;
            font-style: italic; padding: 14px !important;
          }
          .empty-val {
            color: #9CA3AF; font-style: italic; font-weight: 500;
          }

          /* ============ TAGS ============ */
          .tag-row { display: flex; flex-wrap: wrap; gap: 5px; }
          .doc-tag {
            background: #3D444C; color: #E7E3D8;
            padding: 2px 9px; border-radius: 10px;
            font-size: 9.5px; font-weight: 600;
          }
          .doc-tag-alt { background: #D3A16D; color: #3D444C; }

          /* ============ CLUB BADGE ============ */
          .club-badge {
            display: inline-block;
            font-size: 8px; font-weight: 800;
            background: #994D35; color: #fff;
            padding: 1px 5px; border-radius: 4px;
            letter-spacing: 0.6px; margin-left: 6px;
            text-transform: uppercase; vertical-align: middle;
          }
          tr.club-row td { background: #FBF4EE !important; }

          /* ============ DECLARATION ============ */
          .declaration-block {
            padding: 10px 14px;
            background: #F5F2EA;
            border: 1px dashed #D3A16D;
            border-radius: 6px;
            font-size: 10.5px; color: #4B5563;
            line-height: 1.6; font-style: italic;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .declaration-block strong {
            color: #994D35; font-style: normal; letter-spacing: 0.4px;
          }

          /* ============ SIDE COLUMN ============ */
          .side-col {
            background: #F5F2EA;
            padding: 22px 24px 30px 22px;
            border-left: 3px solid #D3A16D;
            min-width: 0;
          }
          .side-section { margin-bottom: 22px; }
          .side-title {
            font-size: 10.5px; font-weight: 800;
            color: #994D35; text-transform: uppercase;
            letter-spacing: 1.6px; padding-bottom: 5px;
            border-bottom: 2px solid #D3A16D;
            margin-bottom: 8px;
          }
          .side-table {
            width: 100%; border-collapse: collapse; font-size: 10.5px;
          }
          .side-table td {
            padding: 5px 0; vertical-align: top;
            border-bottom: 1px dotted #D6D0BE;
          }
          .side-table tr:last-child td { border-bottom: none; }
          .side-table .s-label {
            width: 40%; color: #6B7280;
            font-weight: 600; text-transform: uppercase;
            font-size: 9px; letter-spacing: 0.6px;
          }
          .side-table .s-value {
            color: #1F2937; font-weight: 600; word-break: break-word;
          }

          /* ============ SIGNATURE SECTION ============ */
          .signature-section {
            margin-top: 20px;
            padding: 14px 16px;
            background: #FAF8F3;
            border: 1.5px solid #D3A16D;
            border-radius: 6px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .signature-toggle-row {
            display: flex;
            flex-wrap: wrap;
            gap: 18px;
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #D3A16D;
          }
          .signature-toggle-row label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 10px;
            font-weight: 700;
            color: #3D444C;
            cursor: pointer;
            user-select: none;
            text-transform: uppercase;
            letter-spacing: 0.6px;
          }
          .signature-toggle-row input[type="checkbox"] {
            width: 14px; height: 14px;
            accent-color: #994D35;
          }
          .signature-grid {
            display: flex;
            justify-content: space-around;
            gap: 20px;
            flex-wrap: wrap;
          }
          .sig-cell {
            flex: 1; min-width: 150px; text-align: center;
          }
          .sig-line {
            border-bottom: 1.5px solid #3D444C;
            height: 34px; margin-bottom: 6px;
          }
          .sig-label {
            font-size: 10px; font-weight: 800;
            color: #994D35; text-transform: uppercase;
            letter-spacing: 1.2px;
          }
          .sig-sub {
            font-size: 9px; color: #6B7280;
            margin-top: 2px; letter-spacing: 0.4px;
          }

          /* ============ CONTINUATION ============ */
          .continuation-tag {
            display: inline-block;
            font-size: 9px; font-weight: 700;
            color: #994D35; text-transform: uppercase;
            letter-spacing: 1.5px; margin-bottom: 12px;
            padding: 3px 10px;
            border: 1.5px solid #D3A16D;
            border-radius: 4px;
            flex-shrink: 0;
          }

          /* ============ END MARKER ============ */
          .end-marker {
            margin-top: auto;
            padding-top: 12px;
            text-align: center;
            font-size: 9px;
            color: #D3A16D;
            letter-spacing: 2px;
            font-weight: 700;
            opacity: 0.6;
          }

          /* ============ FOOTER — in flow, no absolute ============ */
          .footer {
            flex-shrink: 0;
            background: #3D444C;
            color: #E7E3D8;
            padding: 10px 34px;
            font-size: 9.5px;
            letter-spacing: 0.6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer span { color: #D3A16D; font-weight: 700; }
        `}</style>
      </head>
      <body>
        {mainPages.map((pageBlocks, pageIdx) => {
          const isLast = pageIdx === totalPages - 1;

          return (
            <div className="sheet" key={pageIdx}>
              {/* Header — only first page */}
              {pageIdx === 0 && (
                <>
                  <div className="doc-header">
                    <div className="doc-header-photo">
                      {user?.personalInfo?.profilePicture ? (
                        <img
                          src={user.personalInfo.profilePicture}
                          alt={user.fullName}
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="ph">
                          {user?.fullName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    <div className="doc-header-info">
                      <h1>{val(user?.fullName, "Unknown Member")}</h1>
                      <div className="role-line">
                        {getRoleDisplay(user?.role)} &nbsp;•&nbsp; ACC Career
                        Club
                      </div>
                      <div className="doc-header-contact">
                        <span>
                          <strong>✉</strong>
                          {val(user?.email, "—")}
                        </span>
                        <span>
                          <strong>☎</strong>
                          {val(user?.phone, "—")}
                        </span>
                        <span>
                          <strong>ID:</strong>
                          {val(user?.studentId, "—")}
                        </span>
                        <span>
                          <strong>Dept:</strong>
                          {val(user?.department, "—")}
                        </span>
                      </div>
                    </div>

                    <div className="doc-header-logo">
                      <img src={Logo.src || Logo} alt="ACC Career Club" />
                    </div>
                  </div>
                  <div className="doc-title-bar">
                    <h2>Official Member Profile</h2>
                    <p>Adamjee Cantonment College — ACC Career Club</p>
                  </div>
                </>
              )}

              {/* Body grid — flex:1 so footer pushes to bottom of sheet */}
              <div className="doc-body">
                {/* Main column */}
                <div className="main-col">
                  {pageIdx > 0 && (
                    <div className="continuation-tag">
                      {val(user?.fullName, "Member")} — Continued
                    </div>
                  )}

                  {pageBlocks.map((b) => b.jsx)}

                  {/* Signature section — only on last page */}
                  {isLast &&
                    (signatures.teacher ||
                      signatures.coModerator ||
                      signatures.moderator) && (
                      <div className="signature-section">
                        <div className="signature-grid">
                          {/* LEFT — Club Teacher Member */}
                          {signatures.teacher && (
                            <div className="sig-cell">
                              <div className="sig-line" />
                              <div className="sig-label">
                                Club Teacher Member
                              </div>
                              <div className="sig-sub">ACC Career Club</div>
                            </div>
                          )}

                          {/* MIDDLE — Co-Moderator */}
                          {signatures.coModerator && (
                            <div className="sig-cell">
                              <div className="sig-line" />
                              <div className="sig-label">Co-Moderator</div>
                              <div className="sig-sub">ACC Career Club</div>
                            </div>
                          )}

                          {/* RIGHT — Moderator */}
                          {signatures.moderator && (
                            <div className="sig-cell">
                              <div className="sig-line" />
                              <div className="sig-label">Moderator</div>
                              <div className="sig-sub">ACC Career Club</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="end-marker">• END OF DOCUMENT •</div>
                </div>

                {/* Side column — only first page */}
                <div className="side-col">
                  {pageIdx === 0 && (
                    <>
                      <div className="side-section">
                        <div className="side-title">Personal Details</div>
                        <table className="side-table">
                          <tbody>
                            {sideRows.map(([label, value], i) => (
                              <tr key={i}>
                                <td className="s-label">{label}</td>
                                <td className="s-value">
                                  {value ? (
                                    value
                                  ) : (
                                    <span className="empty-val">
                                      Not provided
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {(user?.guardianInfo?.father?.name ||
                        user?.guardianInfo?.mother?.name) && (
                        <div className="side-section">
                          <div className="side-title">Family</div>
                          <table className="side-table">
                            <tbody>
                              {familyRows.map(([label, name, occ], i) => (
                                <tr key={i}>
                                  <td className="s-label">{label}</td>
                                  <td className="s-value">
                                    {name || (
                                      <span className="empty-val">
                                        Not provided
                                      </span>
                                    )}
                                    {occ && (
                                      <div
                                        style={{
                                          fontSize: "9.5px",
                                          color: "#6B7280",
                                          fontWeight: 500,
                                          marginTop: "1px",
                                        }}
                                      >
                                        {occ}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="side-section">
                        <div className="side-title">Membership</div>
                        <table className="side-table">
                          <tbody>
                            <tr>
                              <td className="s-label">Membership ID</td>
                              <td className="s-value">
                                {user?.membershipId ? user.membershipId : "—"}
                              </td>
                            </tr>
                            <tr>
                              <td className="s-label">Member Since</td>
                              <td className="s-value">
                                {user?.createdAt
                                  ? formatDate(user.createdAt)
                                  : "—"}
                              </td>
                            </tr>
                            <tr>
                              <td className="s-label">Status</td>
                              <td className="s-value">
                                {user?.isVerified ? "✓ Verified" : "Pending"}
                              </td>
                            </tr>
                            <tr>
                              <td className="s-label">Role</td>
                              <td className="s-value">
                                {getRoleDisplay(user?.role)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer — in normal flow, always at bottom of the sheet */}
              <div className="footer">
                <div>
                  <span>{val(user?.fullName, "Unknown")}</span> — ACC Career
                  Club
                </div>
                <div>
                  Page <span>{pageIdx + 1}</span> of <span>{totalPages}</span>
                </div>
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

export default CVGenerator;
