import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import "devicon/devicon.min.css";

const pages = [
  { id: "home", number: "01", label: "HOME" },
  { id: "about", number: "02", label: "ABOUT" },
  { id: "education", number: "03", label: "EDUCATION" },
  { id: "experience", number: "04", label: "EXPERIENCE" },
  { id: "skills", number: "05", label: "SKILLS" },
  { id: "projects", number: "06", label: "PROJECTS" },
  { id: "achievements", number: "07", label: "ACHIEVEMENTS" },
  { id: "contact", number: "08", label: "CONTACT" },
];

const skills = {
  Languages: ["Java", "Python", "SQL"],
  Frontend: ["React.js", "HTML5", "CSS3", "JavaScript"],
  Backend: ["Node.js", "Express.js", "REST APIs"],
  Databases: ["MySQL", "MongoDB", "Firebase"],
  Tools: ["Git", "GitHub"],
};

/* =========================================================
   PROJECTS
   ========================================================= */

const projects = [
  {
    title: "Career AI",
    description:
      "AI-powered resume and job tracking platform with ATS scoring, job matching, real-time job discovery and interview evaluation.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB"],
    number: "01",
    logo: "/CareerAI.png",
    category: "AI • CAREER PLATFORM",
  },

  {
    title: "Stock Chat",
    description:
      "Web application connecting shopkeepers and distributors through communication, order management and inventory synchronization.",
    tech: ["React.js", "Node.js", "Firebase"],
    number: "02",
    logo: "/StockChat.jpeg",
    category: "FULL STACK • WEB",
  },

  {
    title: "Fix My City",
    description:
      "Full-stack civic issue reporting platform for reporting and tracking potholes, garbage disposal and other city problems.",
    tech: ["React.js", "Node.js", "Firebase"],
    number: "03",
    logo: "/FixMyCity.png",
    category: "FULL STACK • SMART CITY",
  },
];

function App() {
  const [activePage, setActivePage] = useState("home");
  const [pageTurn, setPageTurn] = useState(null);
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [turnSnapshot, setTurnSnapshot] = useState(null);
  const containerRef = useRef(null);
  const turnTimerRef = useRef(null);
  const wheelLockRef = useRef(false);

  /* =========================================================
     ACTIVE PAGE OBSERVER
     ========================================================= */

  useEffect(() => {
    const sections = document.querySelectorAll(".notebook-page");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActivePage(entry.target.id);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.55,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  /* =========================================================
     PAGE NAVIGATION
     ========================================================= */

  const goToPage = (id, direction = null) => {
    const targetIndex = pages.findIndex((page) => page.id === id);
    const targetDirection =
      direction || (targetIndex > currentIndex ? "next" : "prev");

    if (
      targetIndex === -1 ||
      targetIndex === currentIndex ||
      isPageTurning
    ) {
      return;
    }

    const currentSection = document.getElementById(activePage);

    if (turnTimerRef.current) {
      clearTimeout(turnTimerRef.current);
    }

    /*
      Capture the CURRENT page before moving to the next page.
      The captured page becomes the physical sheet that folds away.
      Nothing else in the portfolio is changed.
    */
    if (currentSection) {
      const snapshot = currentSection.outerHTML
        .replace(/\s+id=(['"])[^'"]*\1/, "")
        .replace(/\s+aria-hidden=(['"])[^'"]*\1/g, "");

      setTurnSnapshot(snapshot);
    }

    setPageTurn(targetDirection);
    setIsPageTurning(true);

    /*
      Move underneath the turning sheet immediately.
      The captured current page completely covers this movement,
      so the user sees only the physical page-turn.
    */
    requestAnimationFrame(() => {
      const container = containerRef.current;
      const targetPage = document.getElementById(id);

      if (container && targetPage) {
        const containerTop = container.getBoundingClientRect().top;
        const targetTop = targetPage.getBoundingClientRect().top;

        container.scrollTop += targetTop - containerTop;
      }
    });

    turnTimerRef.current = setTimeout(() => {
      setPageTurn(null);
      setTurnSnapshot(null);
      setIsPageTurning(false);
    }, 1050);
  };

  const currentIndex = pages.findIndex(
    (page) => page.id === activePage
  );

  const nextPage = () => {
    if (currentIndex < pages.length - 1 && !isPageTurning) {
      goToPage(pages[currentIndex + 1].id, "next");
    }
  };

  const previousPage = () => {
    if (currentIndex > 0 && !isPageTurning) {
      goToPage(pages[currentIndex - 1].id, "prev");
    }
  };

  /* =========================================================
     KEYBOARD NAVIGATION
     ========================================================= */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        nextPage();
      }

      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        previousPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  /* =========================================================
     MOUSE WHEEL PAGE NAVIGATION
     ========================================================= */

  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) < 8) return;

    if (isPageTurning || wheelLockRef.current) {
      e.preventDefault();
      return;
    }

    const goingNext = e.deltaY > 0;
    const canMove = goingNext
      ? currentIndex < pages.length - 1
      : currentIndex > 0;

    if (!canMove) return;

    e.preventDefault();

    wheelLockRef.current = true;

    if (goingNext) {
      nextPage();
    } else {
      previousPage();
    }

    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 1100);
  };

  useEffect(() => {
    return () => {
      if (turnTimerRef.current) {
        clearTimeout(turnTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        /* =====================================================
           BOOK PAGE TURN — PAGE CHANGE ONLY
           Physical sheet: bottom-right -> top-left
           ===================================================== */
        .notebook-scroll {
          position: relative;
          perspective: 2200px;
          overflow: hidden;
          transform-style: preserve-3d;
        }

        .book-page-turn {
          position: sticky;
          top: 0;
          height: 0;
          width: 100%;
          z-index: 9999;
          pointer-events: none;
          overflow: visible;
          perspective: 2200px;
          transform-style: preserve-3d;
        }

        .book-page-turn-paper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          transform-origin: 100% 100%;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform, clip-path, filter;
          overflow: hidden;
          box-shadow:
            -12px 18px 28px rgba(35, 27, 18, .16),
            0 2px 8px rgba(35, 27, 18, .08);
          filter: drop-shadow(-8px 12px 14px rgba(30, 22, 15, .12));
        }

        /* The cloned page keeps the exact existing design. */
        .book-page-turn-paper > .notebook-page {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          margin: 0 !important;
          transform: none !important;
          overflow: hidden !important;
          box-shadow: none !important;
        }

        .book-page-turn-paper > .notebook-page .page-inner {
          pointer-events: none !important;
        }

        .book-page-turn-next .book-page-turn-paper {
          animation: yuvarajRealPageNext 1050ms cubic-bezier(.72, 0, .18, 1) forwards;
        }

        .book-page-turn-prev .book-page-turn-paper {
          transform-origin: 0% 100%;
          animation: yuvarajRealPagePrev 1050ms cubic-bezier(.72, 0, .18, 1) forwards;
        }

        /*
          Forward: the bottom-right corner leads the sheet.
          The sheet folds diagonally toward the top-left while
          the next page is already underneath it.
        */
        @keyframes yuvarajRealPageNext {
          0% {
            opacity: 1;
            transform:
              perspective(2200px)
              rotateY(0deg)
              rotateX(0deg)
              rotateZ(0deg)
              translate3d(0, 0, 0)
              scale(1);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            filter: brightness(1);
          }

          16% {
            transform:
              perspective(2200px)
              rotateY(-10deg)
              rotateX(2deg)
              rotateZ(-1deg)
              translate3d(-1%, -1%, 24px)
              scale(.998);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 82% 100%);
            filter: brightness(.99);
          }

          38% {
            transform:
              perspective(2200px)
              rotateY(-31deg)
              rotateX(5deg)
              rotateZ(-2deg)
              translate3d(-5%, -3%, 65px)
              scale(.992);
            clip-path: polygon(0 0, 100% 0, 94% 100%, 48% 100%);
            filter: brightness(.96);
          }

          62% {
            transform:
              perspective(2200px)
              rotateY(-62deg)
              rotateX(9deg)
              rotateZ(-3deg)
              translate3d(-14%, -7%, 105px)
              scale(.978);
            clip-path: polygon(0 0, 100% 0, 57% 100%, 13% 100%);
            filter: brightness(.91);
          }

          82% {
            transform:
              perspective(2200px)
              rotateY(-82deg)
              rotateX(12deg)
              rotateZ(-4deg)
              translate3d(-27%, -11%, 125px)
              scale(.96);
            clip-path: polygon(0 0, 62% 0, 16% 100%, 0 100%);
            filter: brightness(.86);
          }

          100% {
            opacity: 0;
            transform:
              perspective(2200px)
              rotateY(-96deg)
              rotateX(14deg)
              rotateZ(-5deg)
              translate3d(-40%, -16%, 140px)
              scale(.945);
            clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
            filter: brightness(.82);
          }
        }

        /* Reverse direction when going back one page. */
        @keyframes yuvarajRealPagePrev {
          0% {
            opacity: 1;
            transform:
              perspective(2200px)
              rotateY(0deg)
              rotateX(0deg)
              rotateZ(0deg)
              translate3d(0, 0, 0)
              scale(1);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            filter: brightness(1);
          }

          18% {
            transform:
              perspective(2200px)
              rotateY(12deg)
              rotateX(2deg)
              rotateZ(1deg)
              translate3d(1%, -1%, 24px)
              scale(.998);
            clip-path: polygon(0 0, 18% 0, 100% 100%, 0 100%);
          }

          40% {
            transform:
              perspective(2200px)
              rotateY(34deg)
              rotateX(5deg)
              rotateZ(2deg)
              translate3d(5%, -3%, 65px)
              scale(.992);
            clip-path: polygon(0 0, 55% 0, 100% 100%, 0 100%);
          }

          65% {
            transform:
              perspective(2200px)
              rotateY(63deg)
              rotateX(9deg)
              rotateZ(3deg)
              translate3d(14%, -7%, 105px)
              scale(.978);
            clip-path: polygon(0 0, 88% 0, 100% 100%, 43% 100%);
          }

          84% {
            transform:
              perspective(2200px)
              rotateY(83deg)
              rotateX(12deg)
              rotateZ(4deg)
              translate3d(27%, -11%, 125px)
              scale(.96);
            clip-path: polygon(38% 0, 100% 0, 100% 100%, 0 100%);
          }

          100% {
            opacity: 0;
            transform:
              perspective(2200px)
              rotateY(96deg)
              rotateX(14deg)
              rotateZ(5deg)
              translate3d(40%, -16%, 140px)
              scale(.945);
            clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            filter: brightness(.82);
          }
        }

        .notebook-scroll.book-turn-next,
        .notebook-scroll.book-turn-prev {
          overscroll-behavior: contain;
        }

        @media (prefers-reduced-motion: reduce) {
          .book-page-turn {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .book-page-turn {
            display: none;
          }
        }
      `}</style>

      <main className="portfolio-shell">

      <div className="desk-texture" />

      {/* =====================================================
          SIDE NAVIGATION
          ===================================================== */}

      <nav className="page-tabs">
        {pages.map((page) => (
          <button
            key={page.id}
            className={`page-tab ${
              activePage === page.id ? "active" : ""
            }`}
            onClick={() => goToPage(page.id)}
          >
            <span>{page.number}</span>
            <small>{page.label}</small>
          </button>
        ))}
      </nav>

      {/* =====================================================
          NOTEBOOK
          ===================================================== */}

      <div
        className={`notebook-scroll ${
          pageTurn ? `book-turn-${pageTurn}` : ""
        }`}
        ref={containerRef}
        onWheelCapture={handleWheel}
      >

        {/* ===================================================
            BOOK PAGE TURN — ONLY PAGE CHANGE EFFECT
            =================================================== */}
        {pageTurn && turnSnapshot && (
          <div
            className={`book-page-turn book-page-turn-${pageTurn}`}
            aria-hidden="true"
          >
            <div
              className="book-page-turn-paper"
              dangerouslySetInnerHTML={{ __html: turnSnapshot }}
            />
          </div>
        )}

        {/* ===================================================
            HOME
            =================================================== */}

        <section
          className="notebook-page home-page"
          id="home"
        >
          <div className="page-inner">

            <PageHeader
              number="01 / 08"
              label="PORTFOLIO"
            />

            <div className="home-content">

              <div className="photo-area">

                <div className="photo-frame">

                  <img
                    src="/profile.jpg"
                    alt="Yuvaraj S"
                    className="profile-image"
                  />

                  <div className="signature">
                    Yuvaraj S
                  </div>

                </div>

                <div className="side-note">
                  Turning
                  <br />
                  Ideas
                  <br />
                  into
                  <br />
                  Impact
                </div>

              </div>

              <div className="home-info">

                <p className="eyebrow">
                  SOFTWARE DEVELOPER
                </p>

                <h1>
                  YUVARAJ <span>S</span>
                </h1>

                <div className="gold-line" />

                <p className="intro">
                  Software Developer and Computer Science undergraduate
                  passionate about building real-world applications through
                  clean code, thoughtful design and meaningful technology.
                </p>

                <div className="mini-skills plain-tech-stack">

  <div className="plain-tech">
    <i className="devicon-java-plain colored" />
    <span>Java</span>
  </div>

  <div className="plain-tech">
    <i className="devicon-python-plain colored" />
    <span>Python</span>
  </div>

  <div className="plain-tech">
    <i className="devicon-react-original colored" />
    <span>React</span>
  </div>

  <div className="plain-tech">
    <i className="devicon-nodejs-plain colored" />
    <span>Node.js</span>
  </div>

  <div className="plain-tech">
    <i className="devicon-firebase-plain colored" />
    <span>Firebase</span>
  </div>

</div>

                <button
                  className="journey-button"
                  onClick={() => goToPage("about")}
                >
                  <span>
                    Explore My Journey
                  </span>

                  <b>
                    →
                  </b>

                </button>

              </div>

            </div>

            <ScrollHint />

          </div>
        </section>

        {/* ===================================================
            ABOUT
            =================================================== */}

        <section
          className="notebook-page"
          id="about"
        >
          <div className="page-inner">

            <PageHeader
              number="02 / 08"
              label="ABOUT"
            />

            <div className="about-layout">

              <div className="visual-note">

                <div className="mountain-card">

                  <div className="stars">
                    ✦　·　✧　·　✦
                  </div>

                  <div className="mountain-art">
                    ▲
                    <br />
                    ▲ ▲
                    <br />
                    ▲ ▲ ▲
                  </div>

                  <p>
                    Curious.
                    <br />
                    Consistent.
                    <br />
                    Creative.
                  </p>

                </div>

                <div className="paper-note">
                  Better
                  <br />
                  Code.
                  <br />
                  Better
                  <br />
                  Future.
                </div>

              </div>

              <div className="about-content">

                <h2>
                  About <span>Me</span>
                </h2>

                <p>
                  I'm Yuvaraj S., a final-year Computer Science student who
                  loves turning ideas into real-world applications.
                </p>

                <p>
                  I enjoy solving problems, learning new technologies and
                  creating impactful products with modern web technologies.
                </p>

                <div className="about-points">

                  <AboutPoint
                    icon="⌘"
                    title="Problem Solver"
                    text="I enjoy breaking down complex problems and finding simple solutions."
                  />

                  <AboutPoint
                    icon="↗"
                    title="Continuous Learner"
                    text="Always exploring new technologies and improving my skills."
                  />

                  <AboutPoint
                    icon="♧"
                    title="Team Player"
                    text="I believe in collaboration and learning from others."
                  />

                  <AboutPoint
                    icon="✓"
                    title="Goal Oriented"
                    text="Aiming to build meaningful products and grow as a developer."
                  />

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ===================================================
            EDUCATION
            =================================================== */}

        <section
          className="notebook-page education-page"
          id="education"
        >

          <img
            src="/college.jpg"
            alt=""
            className="education-bg"
          />

          <div className="education-overlay" />

          <div className="page-inner education-content-layer">

            <PageHeader
              number="03 / 08"
              label="EDUCATION"
            />

            <div className="section-title">
              <h2>
                Education
              </h2>
            </div>

            <div className="education-content">

              <div className="timeline">

                <EducationItem
                  icon="⌂"
                  title="B.E. Computer Science and Engineering"
                  place="Sri Sairam Engineering College, Chennai"
                  duration="Sep 2023 – Present"
                  detail="CGPA: 7.91 / 10.0"
                />

                <EducationItem
                  icon="▣"
                  title="Higher Secondary Education"
                  place="Model School, Kallakurichi"
                  duration="Jun 2016 – Mar 2023"
                  detail="Higher Secondary Education"
                />

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            EXPERIENCE
            =================================================== */}

        <section
          className="notebook-page experience-page"
          id="experience"
        >

          <div className="page-inner">

            <PageHeader
              number="04 / 08"
              label="EXPERIENCE"
            />

            <div className="experience-heading">

              <div>

                <p className="experience-eyebrow">
                  EXPERIENCE & INTERNSHIPS
                </p>

                <h2>
                  Where I <span>Built</span> & Learned
                </h2>

              </div>

              <div className="experience-note">
                Learn.
                <br />
                Build.
                <br />
                Grow.
              </div>

            </div>

            <div className="experience-cards">

              {/* ================= TRIOS ================= */}

              <article className="experience-card trios-card">

                <img
                  src="Trios.jpg"
                  alt=""
                  className="experience-bg"
                />

                <div className="experience-bg-overlay" />

                <img
                  src="Trios.jpg"
                  alt=""
                  className="company-watermark trios-logo"
                />

                <div className="experience-card-content">

                  <div className="experience-card-top">

                    <span className="experience-number">
                      01
                    </span>

                    <span className="experience-date">
                      JUN 2025 — JUL 2025
                    </span>

                  </div>

                  <div className="experience-icon">
                    TR
                  </div>

                  <p className="experience-role">
                    WEB DEVELOPER INTERN
                  </p>

                  <h3>
                    Trios Technology
                  </h3>

                  <p className="experience-location">
                    Chennai
                  </p>

                  <div className="experience-divider" />

                  <p className="experience-description">
                    Developed a web-based Employee Leave
                    Management System using Node.js,
                    Express.js and MySQL.
                  </p>

                  <div className="experience-tags">

                    <span>
                      Node.js
                    </span>

                    <span>
                      Express.js
                    </span>

                    <span>
                      MySQL
                    </span>

                    <span>
                      REST APIs
                    </span>

                  </div>

                </div>

              </article>

              {/* ================= INFOSYS ================= */}

              <article className="experience-card infosys-card">

                <img
                  src="InfosysLogo.png"
                  alt=""
                  className="experience-bg"
                />

                <div className="experience-bg-overlay" />

                <img
                  src="InfosysLogo.png"
                  alt=""
                  className="company-watermark infosys-logo"
                />

                <div className="experience-card-content">

                  <div className="experience-card-top">

                    <span className="experience-number">
                      02
                    </span>

                    <span className="experience-date">
                      JUN 2026 — AUG 2026
                    </span>

                  </div>

                  <div className="experience-icon">
                    AI
                  </div>

                  <p className="experience-role">
                    AI INTERN
                  </p>

                  <h3>
                    Infosys Springboard
                  </h3>

                  <p className="experience-location">
                    Virtual Internship
                  </p>

                  <div className="experience-divider" />

                  <p className="experience-description">
                    Developed Career-AI, an AI-powered platform
                    for resume analysis, ATS scoring, job matching
                    and job application tracking.
                  </p>

                  <div className="experience-tags">

                    <span>
                      React.js
                    </span>

                    <span>
                      Node.js
                    </span>

                    <span>
                      REST APIs
                    </span>

                    <span>
                      AI
                    </span>

                  </div>

                </div>

              </article>

            </div>

            <div className="experience-bottom">

              <span>
                01
              </span>

              <div />

              <p>
                BUILDING • LEARNING • GROWING
              </p>

              <div />

              <span>
                02
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            SKILLS
            =================================================== */}

        <section
          className="notebook-page skills-page"
          id="skills"
        >

          <div className="page-inner">

            <PageHeader
              number="05 / 08"
              label="SKILLS"
            />

            {/* ================= SKILLS HEADER ================= */}

            <div className="skills-timeline-header">

              <div className="skills-title-block">

                <p className="skills-eyebrow">
                  MY TECH STACK
                </p>

                <h2>
                  Skills
                </h2>

              </div>

              <div className="skills-header-note">
                Learn.
                <br />
                Build.
                <br />
                Grow.
              </div>

            </div>

            {/* ================= TIMELINE ================= */}

            <div className="skills-timeline">

              {/* ================= LANGUAGES ================= */}

              <div className="skills-timeline-row">

                <div className="skills-timeline-marker">

                  <span>
                    01
                  </span>

                  <div className="skills-timeline-line" />

                </div>

                <div className="skills-timeline-category">
                  Languages
                </div>

                <div className="skills-timeline-items">

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-java-plain colored" />
                    </div>

                    <span>
                      Java
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-python-plain colored" />
                    </div>

                    <span>
                      Python
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-mysql-plain colored" />
                    </div>

                    <span>
                      SQL
                    </span>

                  </div>

                </div>

              </div>

              {/* ================= FRONTEND ================= */}

              <div className="skills-timeline-row">

                <div className="skills-timeline-marker">

                  <span>
                    02
                  </span>

                  <div className="skills-timeline-line" />

                </div>

                <div className="skills-timeline-category">
                  Frontend
                </div>

                <div className="skills-timeline-items">

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-react-original colored" />
                    </div>

                    <span>
                      React.js
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-html5-plain colored" />
                    </div>

                    <span>
                      HTML5
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-css3-plain colored" />
                    </div>

                    <span>
                      CSS3
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-javascript-plain colored" />
                    </div>

                    <span>
                      JavaScript
                    </span>

                  </div>

                </div>

              </div>

              {/* ================= BACKEND ================= */}

              <div className="skills-timeline-row">

                <div className="skills-timeline-marker">

                  <span>
                    03
                  </span>

                  <div className="skills-timeline-line" />

                </div>

                <div className="skills-timeline-category">
                  Backend
                </div>

                <div className="skills-timeline-items">

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-nodejs-plain colored" />
                    </div>

                    <span>
                      Node.js
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-express-original" />
                    </div>

                    <span>
                      Express.js
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo api-logo">
                      <span>
                        API
                      </span>
                    </div>

                    <span>
                      REST APIs
                    </span>

                  </div>

                </div>

              </div>

              {/* ================= DATABASES ================= */}

              <div className="skills-timeline-row">

                <div className="skills-timeline-marker">

                  <span>
                    04
                  </span>

                  <div className="skills-timeline-line" />

                </div>

                <div className="skills-timeline-category">
                  Databases
                </div>

                <div className="skills-timeline-items">

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-mysql-plain colored" />
                    </div>

                    <span>
                      MySQL
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-mongodb-plain colored" />
                    </div>

                    <span>
                      MongoDB
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-firebase-plain colored" />
                    </div>

                    <span>
                      Firebase
                    </span>

                  </div>

                </div>

              </div>

              {/* ================= TOOLS ================= */}

              <div className="skills-timeline-row">

                <div className="skills-timeline-marker">

                  <span>
                    05
                  </span>

                </div>

                <div className="skills-timeline-category">
                  Tools
                </div>

                <div className="skills-timeline-items">

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">
                      <i className="devicon-git-plain colored" />
                    </div>

                    <span>
                      Git
                    </span>

                  </div>

                  <div className="timeline-skill">

                    <div className="timeline-skill-logo">

                      <i className="devicon-github-original" />

                    </div>

                    <span>
                      GitHub
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* ================= BOTTOM NOTE ================= */}

            <div className="skills-bottom-note">

              <span>
                05
              </span>

              <div />

              <p>
                BETTER TOOLS • BETTER PRODUCTS
              </p>

              <div />

              <span>
                SKILLS
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            PROJECTS — OPTION 3
            =================================================== */}

        <section
          className="notebook-page projects-page"
          id="projects"
        >

          <div className="page-inner">

            <PageHeader
              number="06 / 08"
              label="PROJECTS"
            />

            {/* ================= PROJECT HEADER ================= */}

            <div className="projects-heading">

              <div className="projects-title-block">

                <p className="projects-eyebrow">
                  SELECTED WORK
                </p>

                <h2>
                  Projects
                </h2>

                <p className="projects-subtitle">
                  Real problems. Real solutions.
                </p>

              </div>

              <div className="projects-hand-note">

                <span>
                  Build
                </span>

                <span>
                  Solve
                </span>

                <span>
                  Impact
                </span>

                <div className="projects-note-arrow">
                  ↘
                </div>

              </div>

            </div>

            {/* ================= PROJECT GRID ================= */}

            <div className="projects-visual-grid">

              {projects.map((project) => (
                <ProjectCard
                  key={project.title}
                  project={project}
                />
              ))}

            </div>

            {/* ================= PROJECT FOOTER ================= */}

            <div className="projects-bottom">

              <span>
                THREE PROJECTS
              </span>

              <div />

              <p>
                ONE VISION • A BETTER TOMORROW
              </p>

              <div />

              <span>
                06
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            ACHIEVEMENTS
            =================================================== */}

        {/* ===================================================
    ACHIEVEMENTS
    =================================================== */}

<section
  className="notebook-page achievements-page"
  id="achievements"
>
  <div className="page-inner">

    <PageHeader
      number="07 / 08"
      label="ACHIEVEMENTS"
    />

    {/* ================= ACHIEVEMENT HEADER ================= */}

    <div className="achievements-heading">

      <div className="achievements-title-block">

        <p className="achievements-eyebrow">
          MILESTONES & RECOGNITIONS
        </p>

        <h2>
          Achievements
        </h2>

        <p className="achievements-subtitle">
          Recognition for consistent learning,
          problem solving and meaningful contributions.
        </p>

      </div>

      <div className="achievements-hand-note">

        <span>
          Build.
        </span>

        <span>
          Learn.
        </span>

        <span>
          Repeat.
        </span>

        <div className="achievement-note-star">
          ☆
        </div>

        <div className="achievement-note-arrow">
          ↙
        </div>

      </div>

    </div>


    {/* ================= ACHIEVEMENT CARDS ================= */}

    <div className="achievements-grid">

  <article className="achievement-card">

    <div className="achievement-image-wrap">
      <img
        src="/Winner.jpeg"
        alt="Hackathon Achievement"
        className="achievement-image"
      />

      <span className="achievement-number">
        01
      </span>
    </div>

    <div className="achievement-card-content">

      <div className="achievement-icon">
        🏆
      </div>

      <h3>
        National-Level
        <br />
        Hackathon
      </h3>

      <p>
        Secured 25th position among 500 teams
        and received a ₹12,000 cash prize.
      </p>

      <div className="achievement-divider" />

      <div className="achievement-tags">
        <span>TOP 25</span>
        <span>500+ TEAMS</span>
        <span>₹12,000</span>
      </div>

      <div className="achievement-arrow">
        →
      </div>

    </div>

  </article>


  <article className="achievement-card">

    <div className="achievement-image-wrap">
      <img
        src="/PaperAward.jpeg"
        alt="Best Paper Award"
        className="achievement-image"
      />

      <span className="achievement-number">
        02
      </span>
    </div>

    <div className="achievement-card-content">

      <div className="achievement-icon">
        📄
      </div>

      <h3>
        Best Paper
        <br />
        Award
      </h3>

      <p>
        Won Best Paper Award at an IEEE conference
        for research and innovation.
      </p>

      <div className="achievement-divider" />

      <div className="achievement-tags">
        <span>IEEE</span>
        <span>RESEARCH</span>
        <span>BEST PAPER</span>
      </div>

      <div className="achievement-arrow">
        →
      </div>

    </div>

  </article>


  <article className="achievement-card">

    <div className="achievement-image-wrap">
      <img
        src="/Leetcode.jpeg"
        alt="LeetCode Achievement"
        className="achievement-image"
      />

      <span className="achievement-number">
        03
      </span>
    </div>

    <div className="achievement-card-content">

      <div className="achievement-icon">
        &lt;/&gt;
      </div>

      <h3>
        600+ LeetCode
        <br />
        Problems
      </h3>

      <p>
        Solved 600+ Data Structures and Algorithms
        problems using Java.
      </p>

      <div className="achievement-divider" />

      <div className="achievement-tags">
        <span>DSA</span>
        <span>JAVA</span>
        <span>600+ PROBLEMS</span>
      </div>

      <div className="achievement-arrow">
        →
      </div>

    </div>

  </article>

</div>


    {/* ================= BOTTOM ================= */}

    <div className="achievements-bottom">

      <div />

      <span>
        ✦
      </span>

      <p>
        DISCIPLINE • PROBLEM SOLVING • CONTINUOUS GROWTH
      </p>

      <span>
        ✦
      </span>

      <div />

    </div>

  </div>
</section>

        {/* ===================================================
            CONTACT
            =================================================== */}

        {/* ===================================================
    CONTACT — FINAL PAGE
    =================================================== */}

<section
  className="notebook-page contact-page"
  id="contact"
>
  <div className="page-inner">

    <PageHeader
      number="08 / 08"
      label="CONTACT"
    />

    <div className="contact-final">

      {/* ================= LEFT SIDE ================= */}

      <div className="contact-main">

        <p className="contact-eyebrow">
          LET'S CONNECT
        </p>

        <h2>
          Let's build
          <br />
          something <span>meaningful.</span>
        </h2>

        <div className="contact-gold-line" />

        <p className="contact-description">
          I'm always open to new opportunities, collaborations
          and interesting ideas. If you'd like to work together,
          feel free to reach out.
        </p>

        <a
          href="mailto:yuvaraj12139@gmail.com"
          className="contact-email-button"
        >

          <div className="email-button-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
              />

              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <div className="email-button-text">

            <small>
              DROP ME A LINE
            </small>

            <strong>
              yuvaraj12139@gmail.com
            </strong>

          </div>

          <span className="email-arrow">
            ↗
          </span>

        </a>

      </div>


      {/* ================= RIGHT SIDE ================= */}

      <div className="contact-connect">

  


        {/* ================= LINKEDIN ================= */}

        <a
          href="https://www.linkedin.com/in/yuvaraj-s-cse/"
          target="_blank"
          rel="noreferrer"
          className="contact-social linkedin-contact"
        >

          <div className="social-logo linkedin-logo">
            in
          </div>

          <div className="social-content">

            <small>
              LINKEDIN
            </small>

            <strong>
              Yuvaraj S
            </strong>

            <span>
              Professional profile
            </span>

          </div>

          <div className="social-arrow">
            ↗
          </div>

        </a>


        {/* ================= GITHUB ================= */}

        <a
          href="https://github.com/Yuvaraj-63"
          target="_blank"
          rel="noreferrer"
          className="contact-social github-contact"
        >

          <div className="social-logo github-logo">

            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18A10.9 10.9 0 0 1 12 6.08c.97 0 1.94.13 2.85.38 2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.4-5.25 5.68.41.35.77 1.04.77 2.1v3.11c0 .3.2.65.79.54A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>

          </div>

          <div className="social-content">

            <small>
              GITHUB
            </small>

            <strong>
              Yuvaraj-63
            </strong>

            <span>
              Projects & source code
            </span>

          </div>

          <div className="social-arrow">
            ↗
          </div>

        </a>


        {/* ================= LEETCODE ================= */}

        <a
          href="https://leetcode.com/u/Yuvaraj_63/"
          target="_blank"
          rel="noreferrer"
          className="contact-social leetcode-contact"
        >

          <div className="social-logo leetcode-logo">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <path d="M15.5 4.5 11 9l-3-3" />

              <path d="M8 6 3.8 10.2a2.5 2.5 0 0 0 0 3.6l6.4 6.4a2.5 2.5 0 0 0 3.6 0l4.4-4.4" />

              <path d="M13 5 18.2 10.2a2.5 2.5 0 0 0 3.6 0" />

              <path d="M12 13h8" />

            </svg>

          </div>

          <div className="social-content">

            <small>
              LEETCODE
            </small>

            <strong>
              Yuvaraj_63
            </strong>

            <span>
              600+ DSA problems solved
            </span>

          </div>

          <div className="social-arrow">
            ↗
          </div>

        </a>

      </div>

    </div>


    {/* ================= CLOSING NOTE ================= */}

    <div className="contact-closing">

      <div className="closing-line" />

      <div className="closing-content">

        <span className="closing-star">
          ✦
        </span>

        <div className="closing-message">

          <p>
            THANK YOU FOR VISITING
          </p>

          <span>
            Until the next idea...
          </span>

        </div>

        <span className="closing-star">
          ✦
        </span>

      </div>

      <div className="closing-line" />

    </div>


    {/* ================= FOOTER ================= */}

    <div className="contact-footer">

      <span>
        YUVARAJ S.
      </span>

      <span>
        SOFTWARE DEVELOPER
      </span>

      <span>
        2026
      </span>

    </div>

  </div>
</section>

      </div>

      {/* =====================================================
          SCROLL CONTROLS
          ===================================================== */}

      <div className="scroll-controls">

        <button
          onClick={previousPage}
          disabled={currentIndex === 0}
        >
          ↑
        </button>

        <span>
          {String(currentIndex + 1).padStart(2, "0")} / 08
        </span>

        <button
          onClick={nextPage}
          disabled={currentIndex === pages.length - 1}
        >
          ↓
        </button>

      </div>

    </main>
    </>
  );
}

/* =========================================================
   COMPONENTS
   ========================================================= */

function PageHeader({ number, label }) {
  return (
    <div className="page-header">

      <span>
        {number}
      </span>

      <div />

      <span>
        {label}
      </span>

    </div>
  );
}

/* =========================================================
   SCROLL HINT
   ========================================================= */

function ScrollHint() {
  return (
    <div className="scroll-hint">

      <div className="mouse">
        ◯
      </div>

      <span>
        SCROLL DOWN
      </span>

      <b>
        ↓
      </b>

    </div>
  );
}

/* =========================================================
   HOME SKILL BADGE
   ========================================================= */

function SkillBadge({ text }) {
  return (
    <div className="mini-skill">

      <strong className="mini-skill-logo">
        {getSkillIcon(text)}
      </strong>

      <span>
        {text}
      </span>

    </div>
  );
}

/* =========================================================
   ABOUT POINT
   ========================================================= */

function AboutPoint({
  icon,
  title,
  text,
}) {
  return (
    <div className="about-point">

      <div className="about-icon">
        {icon}
      </div>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   EDUCATION ITEM
   ========================================================= */

function EducationItem({
  icon,
  title,
  place,
  duration,
  detail,
}) {
  return (
    <div className="education-item">

      <div className="timeline-dot" />

      <div className="education-icon">
        {icon}
      </div>

      <div className="education-text">

        <h3>
          {title}
        </h3>

        <p>
          {place}
        </p>

        <small>
          {duration}
          &nbsp;|&nbsp;
          {detail}
        </small>

      </div>

    </div>
  );
}

/* =========================================================
   EXPERIENCE ITEM
   Kept unchanged
   ========================================================= */

function ExperienceItem({
  date,
  title,
  company,
  description,
  points,
}) {
  return (
    <article className="experience-item">

      <div className="experience-dot" />

      <div className="experience-date">
        {date}
      </div>

      <h3>
        {title}
      </h3>

      <h4>
        {company}
      </h4>

      <p>
        {description}
      </p>

      <div className="experience-points">

        {points.map((point) => (
          <span key={point}>
            {point}
          </span>
        ))}

      </div>

    </article>
  );
}

/* =========================================================
   PROJECT CARD
   OPTION 3 — VISUAL + OVERLAY
   ========================================================= */

function ProjectCard({ project }) {
  return (
    <article className="project-visual-card">

      <div className="project-image-wrap">

        <img
          src={project.logo}
          alt={project.title}
          className="project-image"
        />

        <div className="project-overlay" />

        <span className="project-big-number">
          {project.number}
        </span>

        <div className="project-overlay-content">

          <div className="project-overlay-top">
            <span>{project.category}</span>

            <span className="project-arrow">
              ↗
            </span>
          </div>

          <div className="project-overlay-bottom">

            <h3>
              {project.title}
            </h3>

            <p>
              {project.description}
            </p>

            <div className="project-tech">
              {project.tech.map((tech) => (
                <span key={tech}>
                  {tech}
                </span>
              ))}
            </div>

          </div>

        </div>

      </div>

    </article>
  );
}

/* =========================================================
   PROJECT TECHNOLOGY
   ========================================================= */

function ProjectTech({ tech }) {

  const icons = {

    "React.js":
      "devicon-react-original colored",

    "Node.js":
      "devicon-nodejs-plain colored",

    "Express.js":
      "devicon-express-original",

    MongoDB:
      "devicon-mongodb-plain colored",

    Firebase:
      "devicon-firebase-plain colored",

    JavaScript:
      "devicon-javascript-plain colored",

    HTML5:
      "devicon-html5-plain colored",

    CSS3:
      "devicon-css3-plain colored",

    MySQL:
      "devicon-mysql-plain colored",

    Python:
      "devicon-python-plain colored",

  };

  return (
    <span className="project-tech-item">

      {icons[tech] && (
        <i className={icons[tech]} />
      )}

      <small>
        {tech}
      </small>

    </span>
  );
}

/* =========================================================
   ACHIEVEMENT CARD
   ========================================================= */

function AchievementCard({
  number,
  title,
  description,
}) {
  return (
    <article className="achievement-card">

      <span>
        {number}
      </span>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>

      </div>

    </article>
  );
}

/* =========================================================
   CONTACT ITEM
   ========================================================= */

function ContactItem({
  label,
  value,
  href,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="contact-item"
    >

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </a>
  );
}

/* =========================================================
   SKILL LOGOS
   ========================================================= */

function getSkillIcon(skill) {

  const icons = {

    /* Languages */

    Java:
      "devicon-java-plain colored",

    Python:
      "devicon-python-plain colored",

    SQL:
      "devicon-mysql-plain colored",

    /* Frontend */

    "React.js":
      "devicon-react-original colored",

    React:
      "devicon-react-original colored",

    HTML5:
      "devicon-html5-plain colored",

    CSS3:
      "devicon-css3-plain colored",

    JavaScript:
      "devicon-javascript-plain colored",

    /* Backend */

    "Node.js":
      "devicon-nodejs-plain colored",

    "Express.js":
      "devicon-express-original",

    "REST APIs":
      "devicon-fastapi-plain colored",

    /* Databases */

    MySQL:
      "devicon-mysql-plain colored",

    MongoDB:
      "devicon-mongodb-plain colored",

    Firebase:
      "devicon-firebase-plain colored",

    /* Tools */

    Git:
      "devicon-git-plain colored",

    GitHub:
      "devicon-github-original",

  };

  return (
    <i
      className={
        icons[skill] ||
        "devicon-devicon-plain"
      }
      aria-hidden="true"
    />
  );
}

export default App;