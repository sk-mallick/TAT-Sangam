# TAT Sangam — Project Documentation

# TAT SANGAM
### A Student Academic Operating System for College Life
> **Tagline:** *Where TAT Students Connect, Collaborate & Grow.*
> **Alternate tagline:** *Your Campus. Your Schedule. Your Progress — in one place.*

---

**Prepared by:** Subham
**Team:** ByteForge *(working name)*
**Program / Institution:** B.Tech Computer Science & Technology, Trident Academy of Technology, Bhubaneswar (BPUT, Odisha)
**Project Domain:** `tat-sangam.page.gd`
**Document Version:** 1.0 · **Date:** 14 August 2026
**Evolves from repository:** `sk-mallick/my-Daily-Planner`

---

## Table of Contents

1. [Executive Summary (Abstract)](#1-executive-summary-abstract)
2. [Project at a Glance](#2-project-at-a-glance)
3. [What Is TAT Sangam? (The *What*)](#3-what-is-tat-sangam-the-what)
4. [Why Build It? (The *Why* — Problem & Need)](#4-why-build-it-the-why--problem--need)
5. [Who & Where (The *Where* — Users & Context)](#5-who--where-the-where--users--context)
6. [How It Works (The *How* — Approach & Architecture)](#6-how-it-works-the-how--approach--architecture)
7. [Core Features](#7-core-features)
8. [Benefits & Value Proposition](#8-benefits--value-proposition)
9. [Development Roadmap (Phases)](#9-development-roadmap-phases)
10. [Future Features](#10-future-features)
11. [Technology Stack](#11-technology-stack)
12. [Team & Roles](#12-team--roles)
13. [Success Metrics & Conclusion](#13-success-metrics--conclusion)

---

## 1. Executive Summary (Abstract)

**TAT Sangam** is a centralized, web-based **student academic platform** for the students of Trident Academy of Technology. It brings the scattered pieces of a student's academic day — the timetable, attendance, deadlines, study material, college notices, activities, and clubs — into a **single dashboard** that a student opens each morning and instantly knows what matters.

It begins as an evolution of an existing planner prototype (`my-Daily-Planner`) and grows into a full platform powered by a **PHP + MySQL backend** with a secure REST API. The signature capabilities are a **smart timetable** that always shows the current and next class, an **attendance view** that tells students their real attendance and exactly how many classes they must attend to stay above the required percentage, and a **community resource hub** where students upload the best notes and rate each other's material.

The result is not "a website to plan my day." It is a **Student Academic Operating System** — a genuinely useful daily tool and, technically, a strong full-stack, security-aware portfolio / final-year / hackathon project.

---

## 2. Project at a Glance

| Field | Detail |
|---|---|
| **Project name** | TAT Sangam |
| **Tagline** | Where TAT Students Connect, Collaborate & Grow. |
| **One-line concept** | A smart student platform combining timetable, attendance intelligence, study resources, quick links, and college information into one dashboard. |
| **Category** | Academic productivity / campus companion web application |
| **Primary users** | Students of Trident Academy of Technology (extensible to other colleges) |
| **Team** | ByteForge *(working name)* |
| **Frontend** | HTML, CSS, JavaScript, Bootstrap, Font Awesome |
| **Backend** | PHP 8.x, REST API |
| **Database** | MySQL 8.x |
| **Domain** | `tat-sangam.page.gd` |
| **Current status** | Prototype (`my-Daily-Planner`) → being rebuilt on a real backend |

---

## 3. What Is TAT Sangam? (The *What*)

TAT Sangam is a **web application that acts as a single home base for a college student's academic life.** After logging in, the student lands on a **dashboard** that answers one question: *"What do I need to know right now?"* — the current class, the next class, how many classes remain today, pending tasks, the nearest deadline, and the latest college announcements.

Around that dashboard sit purpose-built sections:

- A **smart timetable** that knows what class is happening and what comes next.
- An **attendance view** that shows real attendance and advises how to maintain it — without opening the college portal.
- A **resource hub** where students upload and rate the best study material.
- A **college information hub** (FAQs, rules & regulations).
- A **college activities & events** feed and a **clubs directory**.
- A **links hub** for professional profiles, quick links, and AI tools.

In short: **everything a TAT student repeatedly looks for, unified, personalized, and always up to date.**

---

## 4. Why Build It? (The *Why* — Problem & Need)

**The problem.** A student's academic information today is scattered and inconvenient:

- The **timetable** is on a PDF or a wall notice; figuring out "what's my next class and where" means scanning a grid every time.
- **Attendance** lives behind a college-portal login; checking it — and doing the mental math of *"how many classes must I attend to reach 75%?"* — is tedious and error-prone.
- **Study material** is spread across WhatsApp groups, personal drives, and seniors' folders, with no quality signal about what's actually good.
- **College information** (rules, FAQs), **activities/events**, and **club details** are fragmented across notices, posters, and word of mouth.
- The existing prototype stores everything (even passwords) in the **browser's localStorage**, which is insecure and cannot serve multiple users.

**The need.** Students need **one reliable, mobile-friendly place** that pulls these together, remembers their schedule, does the attendance math for them, and lets the student community share and rate resources. There is a real, everyday workflow being solved here — not an invented use case.

**Why now / why us.** The foundation already exists as a working frontend prototype. Rebuilding it on a proper backend turns a personal planner into a platform the whole campus can use, while demonstrating the full engineering stack (frontend, backend, API, database, security, and later AI) — exactly the kind of project that stands out.

---

## 5. Who & Where (The *Where* — Users & Context)

**Who uses it**

| User | What they get |
|---|---|
| **Student (primary)** | Daily dashboard, timetable, attendance advice, resources, tasks, links, college info. |
| **Contributor** | Uploads notes/resources; earns ratings and credit from peers. |
| **Moderator** | Reviews and verifies uploaded resources; handles reports. |
| **Administrator** | Manages users, college info, activities, clubs, and (later) college connectors. |

**Where it runs**

- Accessed from any modern **browser on a phone, tablet, or laptop** — mobile-first, because students check it on the go.
- Hosted on a standard **PHP + MySQL** host; reference domain `tat-sangam.page.gd`.
- Built initially for **Trident Academy of Technology**, but architected so **other colleges can be added later** through a connector abstraction.

---

## 6. How It Works (The *How* — Approach & Architecture)

**Approach.** Evolve, don't rewrite. The existing HTML/CSS/JS/Bootstrap frontend is reused and improved. The big change is **moving the source of truth from the browser to a real server**: data now flows *Browser → REST API (PHP) → MySQL* instead of *Browser → localStorage*.

**Three-tier architecture**

```
        Presentation Tier            Application Tier               Data Tier
   ┌───────────────────────┐   ┌──────────────────────────┐   ┌──────────────┐
   │  Responsive Web UI    │   │  PHP REST API            │   │              │
   │  HTML/CSS/JS/Bootstrap │──►│  Routing → Business Logic │──►│   MySQL 8.x  │
   │  (Dashboard + modules)│   │  → PDO Data Access        │   │              │
   └───────────────────────┘   │        │                  │   └──────────────┘
         ▲   JSON / HTTPS        │        ▼                  │
         └───────────────────────┤  College Connector ──► College Portal (Phase 2)
                                 │  (auth, normalization)   │
                                 └──────────────────────────┘
```

**Key design ideas**

- **REST API + JSON** contract between frontend and backend, over HTTPS.
- **Connector abstraction** for college integration: a generic `CollegeConnector` (`authenticate`, `getTimetable`, `getAttendance`, …) with a concrete `TridentConnector`. New colleges plug in without touching core logic.
- **Normalization layer** converts whatever the college portal returns into the platform's own clean format before storage — the database never holds raw external HTML.
- **Cache & sync, don't scrape-on-every-load:** attendance/timetable are synced into the database on a schedule; many students then read fast cached data.
- **Security by default:** hashed passwords (`password_hash`), secure HttpOnly cookies, PDO prepared statements, CSRF protection, input validation, and role-based access.
- **Fail safe:** optional layers (AI assistant, connector) can be off and the core planner still works.

**Methodology.** Phased, incremental delivery (see Roadmap). Each phase ships something usable on its own.

---

## 7. Core Features

The **dashboard is the landing (index) page.** From there the student reaches every module.

### 7.1 Dashboard (Landing Page)
A proactive daily summary: greeting, **current class**, **next class**, remaining classes today, live clock, today's tasks, the nearest deadline, and **college announcements the student can acknowledge** (mark as seen). It also surfaces an alert when any subject's attendance drops below target.

### 7.2 Smart Timetable
Stored per user in the database (not hard-coded). Shows the current class with time remaining, the next class and countdown, remaining classes today, and today/tomorrow/week views. Each subject can show **whether attendance needs maintaining and how many more classes are required.**

### 7.3 Attendance View & Maintenance Advisor
See **real attendance inside TAT Sangam without opening the Trident website.** For every subject it shows attended/held/percentage and a health status (Safe / Watch / Critical), and it computes:

- **How many classes you must attend** to reach the target — solving `(attended + x) / (held + x) ≥ target`.
- **How many classes you can safely skip** while staying above target.
- A **"Can I skip today's class?"** answer, recomputed with and without today's class.

> *Example:* OS at 21/30 = 70%, target 75% → attend the next **6** classes to recover. A subject at 28/34 = 82% → skipping one (28/35 = 80%) is still safe.

All attendance math is **deterministic** (computed by the backend, never guessed by AI).

### 7.4 Resource Hub (Upload · Discover · Rate · Review)
Students **manually upload the best study material** — notes, question papers, syllabi, lab manuals — tagged by branch, semester, subject, and type. Others browse, search, and download, then **give star ratings (1–5) and leave feedback.** Each resource shows its uploader, upload date, download count, and a **verification status (Verified / Community / Needs Review)**. Reporting plus a moderator review queue keeps quality high; uploads enforce type/size limits and safe storage.

### 7.5 College Information Hub (FAQs · Rules & Regulations)
A single, searchable place for the college's **basic FAQs** and **rules and regulations**, organized into readable sections and editable by admins/moderators.

### 7.6 College Activities & Events
A feed of **all college activities and events** — title, description, date/time, venue, and links — filterable by upcoming vs. past. Upcoming items can surface on the dashboard.

### 7.7 Clubs Directory
A directory of **all clubs in the college** with name, description, category, logo, and contact/social links; each club can list its recent or upcoming activities.

### 7.8 Tasks & Deadlines
Create tasks with title, priority, and due date; edit, complete, and delete them; and see upcoming/overdue items grouped by today, tomorrow, and later on the dashboard.

### 7.9 Links Hub
Store **professional links** (LinkedIn, GitHub, portfolio, LeetCode, resume), plus **Quick Access**, **AI Tools**, and **College** link groups — each a labelled URL with an icon.

### 7.10 Secure Accounts
Registration and login with hashed passwords and secure sessions, replacing the prototype's insecure localStorage approach.

---

## 8. Benefits & Value Proposition

| Benefit | Who gains | Why it matters |
|---|---|---|
| **One place for the academic day** | Students | No more jumping between PDFs, portals, and chat groups. |
| **Never miss a class or lose track of the schedule** | Students | Current/next class + countdown removes guesswork. |
| **Attendance clarity** | Students | Instantly know your % and exactly how many classes to attend — no manual math, no portal login. |
| **Better study material, quality-rated** | Students | Star ratings and verification surface the good notes and filter the noise. |
| **Everything about the college, centralized** | Students | FAQs, rules, activities, and clubs in one searchable hub. |
| **Community knowledge base that grows** | The campus | Every upload and review makes the platform more valuable over time. |
| **Security done right** | Everyone | Hashed passwords, secure sessions, and safe uploads protect users. |
| **A standout engineering project** | The team | Demonstrates frontend, backend, API, database, security, integration, and AI. |

**Positioning:** as a plain daily planner this idea is common; as a **college attendance + resource + information platform** it becomes genuinely useful and portfolio-grade.

---

## 9. Development Roadmap (Phases)

| Phase | Focus | Headline Deliverables |
|---|---|---|
| **1 — Foundation** | Rebuild on a real backend | PHP+MySQL backend, secure auth, profile, **dashboard**, timetable, tasks, links, **resource hub**, **college info / activities / clubs**, REST API. |
| **2 — College Intelligence** | Bring in real data | **College-data connector**, **attendance view + maintenance advisor**, automatic timetable sync. |
| **3 — Resource Maturity** | Trust & quality | Resource verification, richer moderation, ratings analytics, contributor credit. |
| **4 — AI Layer** | Smart assistant | **RAG** over uploaded resources; AI campus assistant with source citations. |
| **5 — Automation** | Keep it fresh | Scheduled sync, notifications (class/deadline/attendance), announcement feed, calendar export. |

Each phase is usable on its own, which keeps scope under control — the biggest risk for a project this ambitious is trying to build everything at once.

---

## 10. Future Features

- **College Data Connector & attendance forecasting** — authorized fetch of timetable/attendance (never bypassing CAPTCHA/MFA), with per-subject forecasting and risk ranking.
- **AI / RAG Campus Assistant** — ask natural-language questions over college PDFs and your own data ("What's the attendance rule for theory?", "Which unit covers deadlock?", "What classes do I have tomorrow?") with cited sources. Strictly additive — the platform works fully with AI off.
- **Notifications** — upcoming class, deadline, attendance warning, new announcement, new resource.
- **College announcement / placement feed** aggregating official notices with links to the source.
- **Calendar integration** — add-to-Google-Calendar and ICS export of the semester timetable.
- **Career Hub** — expanded professional profile and an assignment system with attachments.
- **Semester Overview analytics** — attendance trend, task completion, academic overview.
- **Collaboration & light gamification** — "most helpful contributors" leaderboard, better versions of resources.
- **Multi-college support** — additional connectors turn TAT Sangam into a multi-institution platform.

---

## 11. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | HTML, CSS, JavaScript, Bootstrap, Font Awesome | Reuses and evolves the existing prototype; responsive, light/dark styling. |
| **Backend** | PHP 8.x | REST API, layered (routing → logic → data access). |
| **Data access** | PDO (prepared statements) | Prevents SQL injection. |
| **Database** | MySQL 8.x | Source of truth for all user and shared data. |
| **Auth & sessions** | `password_hash` / `password_verify`, secure HttpOnly SameSite cookies | Replaces localStorage credentials. |
| **Integration (Phase 2)** | College Connector + normalization layer | Timetable / attendance from the college portal. |
| **AI (Phase 4)** | External LLM + embeddings / vector store | Optional RAG assistant. |
| **Hosting** | Standard PHP + MySQL host | Domain `tat-sangam.page.gd`. |

---

## 12. Team & Roles

**Team:** ByteForge *(working name — confirm final name)*

| Role | Responsibility |
|---|---|
| Project Lead / Full-stack Developer | Subham — architecture, backend, API, integration. |
| Frontend | UI/UX, responsive dashboard and module screens. |
| Backend / Database | API endpoints, schema, security. |
| Content / Moderation | College info, activities, clubs data; resource moderation. |

*(Assign teammates to the roles above as your team is finalized.)*

---

## 13. Success Metrics & Conclusion

**How we'll know it's working**

- Students can, within two taps from the dashboard, see their next class, check attendance, add a task, or open a resource.
- Attendance advice matches manual calculation exactly (deterministic and correct).
- A growing library of **rated, verified resources** contributed by students.
- Active use of the college info, activities, and clubs sections.
- Secure accounts with zero plaintext credential storage.

**Conclusion.** TAT Sangam turns a simple daily planner into a **Student Academic Operating System** — a single, secure, mobile-first home for the schedule, attendance, resources, and college life of every TAT student. It solves a real, everyday problem, grows more valuable as the community contributes, and showcases a complete, modern engineering stack. Built phase by phase, it is both **achievable now** and **ambitious for the future.**

---

*— End of Document —*