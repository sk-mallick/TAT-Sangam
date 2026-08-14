# TAT Sangam --- Project Documentation

**Tagline:** *Where TAT Students Connect, Collaborate & Grow.*

**Project:** TAT Sangam\
**Institution:** Trident Academy of Technology (TAT), Bhubaneswar\
**Team:** ByteForge\
**Project Type:** Student Digital Ecosystem / Academic Utility Platform\
**Primary Audience:** TAT Students\
**Initial Deployment:** TAT-specific web platform\
**Current Prototype:** `my-Daily-Planner` → `feature/update-planner`

------------------------------------------------------------------------

## 1. Executive Summary

**TAT Sangam** is a student-focused digital ecosystem designed
specifically for students of **Trident Academy of Technology**.

The project begins with a simple but highly practical problem: students
repeatedly search for lab-record formats, first pages, acknowledgements,
resources, notices, attendance information, college activities, clubs
and other scattered academic information.

TAT Sangam brings these recurring needs into **one centralized
platform**.

The platform is not intended to replace the official college website.
Instead, it acts as a **student utility layer** that organizes useful
information, student-contributed resources and academic tools in a much
simpler experience.

The most high-usage feature is expected to be the **Lab Report
Generator**, especially near practical/lab submission periods. Around
that core, TAT Sangam provides a Resource Hub, Attendance Intelligence,
Timetable/Attendance Planning, College FAQ and Rules, Activities &
Notices, Clubs, useful links, and future AI-powered academic assistance.

------------------------------------------------------------------------

# 2. Problem Statement

TAT students currently have to move between multiple places to find
different types of information:

-   College website
-   Student/attendance portal
-   WhatsApp groups
-   Google searches
-   Seniors and classmates
-   PDF files
-   Department pages
-   Club pages
-   Personal notes
-   Previous lab records
-   Different notices and announcements

This creates several problems:

1.  Information is scattered.
2.  Students repeatedly search for the same resources.
3.  Useful resources are difficult to discover.
4.  Lab-report formatting is repeatedly searched at the end of
    semesters.
5.  Students may not know which official college page contains a
    particular piece of information.
6.  Attendance information requires visiting the college system
    separately.
7.  Students need to manually calculate how many classes they must
    attend to reach/maintain the required attendance.
8.  College activities and clubs are not always discoverable from one
    student-friendly location.
9.  Student-created resources are usually distributed through temporary
    chats instead of a structured repository.

**TAT Sangam solves the discovery and utility problem by creating one
student-oriented digital environment.**

------------------------------------------------------------------------

# 3. Vision

> **Build a single digital environment where every TAT student can
> discover, generate, share, organize and access the academic and campus
> information they need.**

The long-term vision is for TAT Sangam to become a **student digital
ecosystem**, not merely a planner or document generator.

------------------------------------------------------------------------

# 4. Mission

TAT Sangam aims to:

-   Reduce repetitive student effort.
-   Make useful college information easier to discover.
-   Centralize student resources.
-   Provide practical academic utilities.
-   Encourage student-to-student resource sharing.
-   Improve awareness of clubs, activities and opportunities.
-   Provide intelligent academic assistance.
-   Build a reusable platform that can continue serving students after
    the original development team graduates.

------------------------------------------------------------------------

# 5. Why TAT?

TAT is an especially suitable environment for this concept because the
institution already has a broad academic and student-activity ecosystem.

The official TAT website provides areas for learning resources, student
clubs, activities, placement, internships, IEDC and other
student-oriented information. The activities section states that TAT has
about 20 student clubs across cultural and academic platforms, while the
co-curricular section lists college-level and departmental clubs.
[Source: TAT Activities](https://tat.trident.ac.in/activities/)

The CSE department also documents student chapters and technical clubs,
including Hackathon Club, Brain Logic Club and AIML Club, showing the
breadth of the student community that can benefit from a centralized
discovery layer. [Source: TAT
CSE](https://tat.trident.ac.in/academics/departments/computer-science-engineering/)

This makes TAT Sangam a practical institution-specific project rather
than a generic college portal.

------------------------------------------------------------------------

# 6. Existing Starting Point

TAT Sangam will evolve from the existing **My Daily Planner** prototype.

The current `feature/update-planner` branch already provides a
foundation containing:

-   Login/signup
-   Student profile information
-   Timetable
-   Live class status
-   Countdown
-   Monthly calendar
-   To-do management
-   Quick links
-   AI-tool links
-   Data export
-   Responsive student dashboard

The current repository is still a client-side/local-storage prototype.
Its README explicitly describes it as a static application with local
browser storage and notes that localStorage is not a secure credential
store.

Therefore, the next major engineering step is:

**LocalStorage Prototype → Real Backend → TAT Sangam Platform**

Repository:

`https://github.com/sk-mallick/my-Daily-Planner/tree/feature/update-planner`

------------------------------------------------------------------------

# 7. Core Product Structure

TAT Sangam should be organized around the following major modules:

``` text
TAT Sangam
│
├── Dashboard
├── Lab Report Generator
├── Resources
├── Attendance
├── Timetable
├── TAT Guide
│   ├── FAQs
│   ├── Rules & Regulations
│   ├── Important Procedures
│   └── Important Contacts
├── TAT Activities
├── Clubs & Communities
├── Notices / Updates
├── Professional & Quick Links
└── AI Assistant
```

------------------------------------------------------------------------

# 8. Dashboard

The current `index.html` dashboard should evolve into the main **TAT
Sangam Home/Dashboard**.

It should give students an immediate overview of useful information.

### Dashboard Components

-   Current class
-   Next class
-   Today's timetable
-   Attendance summary
-   Attendance warning
-   Upcoming deadlines
-   Recent college updates
-   Recently added resources
-   Quick access to Lab Generator
-   Featured clubs
-   Important links

### Example

``` text
Good Morning, Student

Next Class
Operating Systems
10:45 AM – 11:40 AM

Attendance
OS: 72% ⚠️

Upcoming
AIML Lab Report — Tomorrow

Latest Update
New Training Programme Notice

Quick Actions
[Generate Lab Report]
[Resources]
[Attendance]
[Timetable]
```

The dashboard should remain simple. It should not become a page
containing every feature.

------------------------------------------------------------------------

# 9. Flagship Feature --- Lab Report Generator

## Purpose

The Lab Report Generator is expected to be the highest-traffic feature
during practical submission and semester-end periods.

Students should not need to repeatedly search Google, WhatsApp or
previous reports for basic lab-record structures.

### Student Inputs

-   Student Name
-   Registration/Roll Number
-   Branch
-   Semester
-   Section/Group
-   Lab/Subject
-   Experiment Number
-   Experiment Title
-   Faculty Name, where required
-   Academic Year
-   Other template-specific information

### Output

The system can generate structured printable pages such as:

1.  Cover / First Page
2.  Certificate / Acknowledgement
3.  Index
4.  Experiment Details
5.  Aim
6.  Requirements
7.  Theory
8.  Algorithm / Procedure
9.  Code, where applicable
10. Output
11. Result
12. Viva Questions
13. Additional pages based on the selected laboratory template

### Important Design Principle

The **format should be template-driven**, not fully generated by AI.

AI should assist with content where appropriate, while the
college/lab-specific layout remains deterministic.

This ensures:

-   Consistent formatting
-   Predictable output
-   Faster generation
-   Lower AI cost
-   Fewer formatting errors
-   Easier maintenance

### Copy Feature

Add one-click actions:

-   Copy student details
-   Copy acknowledgement
-   Copy experiment content
-   Copy formatted text
-   Download PDF
-   Print

This is especially useful for students who already have a report
template and only need structured content.

------------------------------------------------------------------------

# 10. AI Integration

OpenAI/ChatGPT can be used as the intelligence layer through the
**OpenAI API**.

Potential AI capabilities:

-   Generate experiment explanations
-   Generate theory
-   Generate algorithms
-   Generate procedure
-   Generate viva questions
-   Summarize academic PDFs
-   Explain difficult concepts
-   Answer questions from approved college resources

The AI should not be responsible for deterministic information such as:

-   Attendance percentage
-   Required attendance calculations
-   Student identity
-   Official rules
-   Official dates
-   Official timetable

Those should come from the database or official source.

------------------------------------------------------------------------

# 11. Resource Hub

The Resource page should become the community knowledge base of TAT
Sangam.

### Students can upload:

-   Notes
-   Lab manuals
-   Question papers
-   Previous-year papers
-   Assignments
-   Syllabus
-   Practical resources
-   Project references
-   Study PDFs
-   Useful links
-   Templates
-   Academic documents

### Resource Metadata

Every resource should store:

-   Title
-   Description
-   Subject
-   Branch
-   Semester
-   Resource type
-   Academic year
-   Uploaded by
-   Upload date
-   Tags
-   Rating
-   Feedback
-   Download/view count
-   Verification status

### Student Interaction

Students should be able to:

-   View
-   Download
-   Search
-   Filter
-   Rate using stars
-   Give feedback
-   Report
-   Save/bookmark
-   Share/copy link

### Resource Quality

Use a simple trust system:

-   Verified
-   Community Uploaded
-   Under Review
-   Reported

This prevents the resource section from becoming an uncontrolled file
dump.

------------------------------------------------------------------------

# 12. Resource Moderation

Because students can upload files, moderation is essential.

### Admin functions

-   Approve/reject resource
-   Remove resource
-   Review reports
-   Mark resource as verified
-   Edit metadata
-   Ban abusive uploads/users
-   View upload history

### Security requirements

Uploads must have:

-   File type validation
-   File size limits
-   Server-side generated filenames
-   Access control
-   Malware scanning where feasible
-   Safe storage
-   Download authorization

Do not directly trust uploaded filenames or MIME types.

------------------------------------------------------------------------

# 13. Attendance Module

The Attendance module should allow students to view attendance without
repeatedly navigating through the college website, **only where an
authorized/technically permitted integration is available**.

### Dashboard

``` text
Overall Attendance: 78%

Operating Systems      72% ⚠️
Web Technology         81% ✓
AIML                   84% ✓
Engineering Design     69% 🔴
```

TAT's published student handbook states that students are required to
attain 75% attendance in theory classes for eligibility for end-semester
examinations, and theory and practical/sessional attendance are
maintained separately. Attendance is calculated from the commencement of
classes. [Source: TAT Student
Handbook](https://tat.trident.ac.in/wp-content/uploads/2015/06/Student-Hand-Book-Revised.pdf)

The platform should therefore treat **75% as a configurable
institutional rule**, not hard-code it permanently.

------------------------------------------------------------------------

# 14. Attendance Intelligence

This is more valuable than simply displaying a percentage.

For every subject, calculate:

### Current

-   Classes held
-   Classes attended
-   Classes missed
-   Current percentage

### Forecast

-   Classes required to reach target attendance
-   Maximum future classes that can be missed while staying above target
-   Projected attendance after upcoming classes
-   Risk level

### Example

``` text
Operating Systems

Attendance: 71%
Target: 75%

Required:
Attend approximately 5 more classes

Risk:
HIGH

Recommendation:
Avoid unnecessary absence in upcoming OS classes.
```

The calculation should be deterministic and performed by backend logic.

------------------------------------------------------------------------

# 15. Timetable + Attendance Planning

The Timetable module should connect directly with Attendance
Intelligence.

Instead of showing only:

``` text
Monday
10:45 — OS
11:40 — WT
12:35 — AIML
```

the system can show:

``` text
Monday

10:45 — OS
Attendance: 71% 🔴
Priority: Attend

11:40 — WT
Attendance: 82% 🟢

12:35 — AIML
Attendance: 84% 🟢
```

This gives students a practical answer to:

> "Which classes should I prioritize to maintain my attendance?"

The system should inform and calculate; it should not encourage students
to violate institutional attendance requirements.

------------------------------------------------------------------------

# 16. TAT Guide

Create a dedicated page for frequently needed college information.

### Categories

-   Academic FAQs
-   Attendance rules
-   Examination rules
-   Lab rules
-   Dress code
-   Library information
-   Hostel information
-   ID-card procedures
-   Registration procedures
-   Training information
-   Placement information
-   Important contacts
-   Forms and official links

Official rules should always display the source and last-verified date.

------------------------------------------------------------------------

# 17. TAT Activities

Create a central feed for college activities and opportunities.

Examples:

-   Workshops
-   Hackathons
-   Seminars
-   Training programmes
-   Competitions
-   Placement activities
-   Internships
-   Technical events
-   Cultural events
-   Sports
-   Club activities
-   Entrepreneurship events

The official TAT site already has an Activities section covering
co-curricular, extra-curricular, innovation & entrepreneurship, sports,
IEDC, incubation and related activities. [Source: TAT
Activities](https://tat.trident.ac.in/activities/)

TAT Sangam should make these easier for students to discover.

------------------------------------------------------------------------

# 18. College Updates / Student Information Feed

Create a social-feed-like but moderated information system.

### Example Posts

**New ID Card Update**

> Students are requested to collect/update their identity cards...

Actions:

-   View details
-   Copy information
-   Open official source
-   Save
-   Share
-   Report

Other examples:

-   Training announcement
-   Placement notice
-   Exam notice
-   Holiday notice
-   Workshop
-   Registration deadline
-   Scholarship information
-   Club recruitment
-   Competition
-   Internship opportunity

### Important Principle

Official information should always retain:

-   Original source
-   Source URL
-   Published date
-   Last verified date

TAT Sangam should not pretend to be the official source.

------------------------------------------------------------------------

# 19. Clubs & Communities

Create a complete directory of TAT clubs.

Each club can have:

-   Club name
-   Category
-   Description
-   Faculty coordinator
-   Student coordinators
-   Activities
-   Upcoming events
-   Recruitment status
-   Social links
-   Contact
-   Join/request information

TAT's official co-curricular page documents college-level and
departmental clubs, including technical clubs under the Technovation
scheme. [Source: TAT Co-Curricular
Clubs](https://tat.trident.ac.in/activities/co-curricullar/)

The directory should be maintained against official information rather
than relying only on student submissions.

------------------------------------------------------------------------

# 20. Professional & Quick Links

Students can save:

### Professional

-   LinkedIn
-   GitHub
-   Portfolio
-   LeetCode
-   CodeChef
-   HackerRank
-   Kaggle
-   Resume

### AI Tools

-   ChatGPT
-   Gemini
-   Claude
-   Perplexity
-   NotebookLM
-   GitHub Copilot

### TAT

-   College Website
-   Student Portal
-   Learning Resources
-   Placement
-   Clubs
-   Departments
-   Official notices

The existing Quick Links feature from the Daily Planner can be retained
and expanded.

------------------------------------------------------------------------

# 21. College Data Integration

A future advanced module can connect TAT Sangam with authorized college
data sources.

Potential data:

-   Timetable
-   Attendance
-   Academic profile
-   Results, if officially/technically permitted
-   Notices
-   Other student-specific information

### Recommended architecture

``` text
Official TAT Source
        ↓
College Connector
        ↓
Authentication / Authorized Session
        ↓
Data Parser
        ↓
Normalization Layer
        ↓
MySQL
        ↓
TAT Sangam REST API
        ↓
Student Dashboard
```

Do not store student college passwords in plaintext.

Prefer official APIs, approved integrations, SSO or user-authorized
sessions where available. If automation is not permitted or requires
bypassing CAPTCHA/MFA/anti-bot controls, the system should not attempt
to bypass them.

------------------------------------------------------------------------

# 22. Backend Architecture

The project should move away from the current localStorage-first
architecture.

### Target stack

**Frontend** - HTML - CSS - JavaScript - Bootstrap

**Backend** - PHP 8+ - REST API - PDO - PHP Sessions

**Database** - MySQL

**AI** - OpenAI API

**Documents** - PDF generation - File storage - Template engine

### High-level architecture

``` text
                    TAT Sangam Frontend
                            │
                            ▼
                       REST API
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
              MySQL      AI Layer   File Store
                 │          │          │
                 │       OpenAI       PDFs
                 │          │
                 └──────────┼──────────┘
                            ▼
                    Business Logic
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
          TAT Data Connector      Admin System
```

------------------------------------------------------------------------

# 23. Suggested Database Structure

Initial tables:

``` text
users
student_profiles
sessions

subjects
labs
experiments
lab_templates

timetable
timetable_slots

attendance
attendance_records

resources
resource_categories
resource_tags
resource_ratings
resource_feedback
resource_reports
resource_bookmarks

announcements
activities
events

clubs
club_members
club_events

faqs
rules
official_links

tasks
assignments

ai_documents
ai_chunks
ai_queries

sync_jobs
sync_logs

admin_users
audit_logs
```

------------------------------------------------------------------------

# 24. API Structure

Example REST endpoints:

``` text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/me

GET    /api/dashboard
GET    /api/timetable/today
GET    /api/timetable/week

GET    /api/attendance
GET    /api/attendance/{subject}
GET    /api/attendance/forecast

GET    /api/labs
GET    /api/labs/{id}/experiments
POST   /api/lab-report/generate
POST   /api/lab-report/pdf

GET    /api/resources
POST   /api/resources
GET    /api/resources/{id}
POST   /api/resources/{id}/rate
POST   /api/resources/{id}/feedback
POST   /api/resources/{id}/report

GET    /api/announcements
GET    /api/activities

GET    /api/clubs
GET    /api/clubs/{id}

GET    /api/faqs
GET    /api/rules

POST   /api/ai/chat

POST   /api/sync/tat
GET    /api/sync/status
```

------------------------------------------------------------------------

# 25. AI + RAG Future Architecture

The Resource Hub can eventually become a searchable college knowledge
base.

``` text
PDF / Notice / Resource
          ↓
      Text Extraction
          ↓
        Chunking
          ↓
       Embeddings
          ↓
     Vector Storage
          ↓
       Retrieval
          ↓
      Relevant Context
          ↓
       OpenAI Model
          ↓
   Answer + Source
```

Example student question:

> "What is the attendance requirement for end-semester examination?"

The system retrieves the relevant official document and answers with the
source.

Another:

> "Give me important OS topics from the uploaded previous-year papers."

The system searches the approved resources and produces a grounded
response.

AI answers should show source documents whenever the answer depends on
institutional information.

------------------------------------------------------------------------

# 26. User Roles

### Student

-   View dashboard
-   Generate lab reports
-   Browse resources
-   Upload resources
-   Rate/feedback
-   View attendance
-   View timetable
-   Explore activities
-   Explore clubs
-   Ask AI questions
-   Save links/resources

### Contributor / Senior

Additional permissions:

-   Upload high-quality resources
-   Maintain club/resource information
-   Suggest corrections

### Moderator

-   Review uploads
-   Review reports
-   Verify resources
-   Moderate feedback

### Admin

-   Manage users
-   Manage labs/templates
-   Manage official information
-   Manage clubs
-   Manage activities
-   Manage announcements
-   Manage integrations
-   View analytics
-   Audit actions

------------------------------------------------------------------------

# 27. Security Requirements

The production version must not treat localStorage as a secure
authentication system.

Required:

-   Password hashing using secure password hashing functions
-   Server-side sessions
-   HttpOnly cookies
-   Secure cookies over HTTPS
-   CSRF protection
-   Prepared SQL statements
-   Input validation
-   Output escaping
-   Authorization checks
-   Rate limiting
-   File upload validation
-   Audit logging
-   Secret management
-   Access-controlled APIs

Student college credentials, if an authorized integration ever requires
them, must be handled as highly sensitive secrets and should not be
casually stored in the database.

------------------------------------------------------------------------

# 28. Non-Functional Requirements

### Performance

-   Fast dashboard load
-   Cached college data
-   Lazy-loaded resources
-   Pagination
-   Optimized database queries

### Reliability

-   Graceful API failure
-   Retry mechanism for external services
-   Sync logs
-   Backups
-   Error logging

### Scalability

The system should be designed for high usage around:

-   Lab submissions
-   Examination periods
-   Results
-   Placement announcements
-   Major college events

### Accessibility

-   Mobile responsive
-   Keyboard accessible
-   Clear typography
-   Good contrast
-   Simple navigation

------------------------------------------------------------------------

# 29. High-Traffic Strategy

The Lab Generator may receive hundreds of requests around submission
periods.

Do not generate identical AI content separately for every student.

Use:

``` text
Lab
 ↓
Experiment
 ↓
Reusable Template / Cached Content
 ↓
Student-specific fields
 ↓
Final Report
```

Use:

-   Caching
-   Request throttling
-   Rate limits
-   Queues for expensive operations
-   Database indexing
-   Pre-generated common content
-   Static templates for fixed pages

This keeps the platform affordable and responsive.

------------------------------------------------------------------------

# 30. What Makes TAT Sangam Different?

TAT Sangam is not simply:

-   A timetable app
-   A PDF generator
-   A notes website
-   An attendance calculator
-   A college notice board

It combines them into a single student ecosystem.

### The product loop

``` text
Student arrives for Lab Report
          ↓
Discovers Resources
          ↓
Finds College Updates
          ↓
Checks Attendance
          ↓
Checks Timetable
          ↓
Explores Clubs
          ↓
Finds Activities
          ↓
Uses AI Assistant
          ↓
Returns regularly
```

The **Lab Generator can be the acquisition feature**, while the rest of
the ecosystem creates long-term usefulness.

------------------------------------------------------------------------

# 31. MVP --- What Should Actually Be Built First?

Do not build every advanced feature in Version 1.

### Phase 1 --- MVP

1.  Dashboard
2.  Lab Report Generator
3.  Lab templates
4.  Resource Hub
5.  Resource upload
6.  Resource rating/feedback
7.  College FAQ/Rules
8.  Activities/Updates
9.  Clubs directory
10. Quick Links
11. PHP + MySQL backend
12. Authentication

### Phase 2

1.  Attendance
2.  Attendance calculation
3.  Timetable
4.  Attendance forecasting
5.  Admin dashboard
6.  Moderation
7.  Notifications

### Phase 3

1.  Authorized TAT integration
2.  Automatic timetable synchronization
3.  Automatic attendance synchronization
4.  College update synchronization

### Phase 4

1.  OpenAI integration
2.  RAG
3.  AI academic assistant
4.  PDF intelligence
5.  Personalized recommendations

------------------------------------------------------------------------

# 32. Future Features

Possible future expansion:

-   Google Calendar synchronization
-   PWA/mobile application
-   Push notifications
-   Placement dashboard
-   Internship tracker
-   Scholarship information
-   Event registration
-   Club membership
-   Alumni network
-   Student marketplace for academic resources
-   Department-specific dashboards
-   Faculty/contributor verification
-   AI-generated study plans
-   Exam preparation assistant
-   Question-paper analytics
-   Resource recommendation engine
-   Multi-college architecture

------------------------------------------------------------------------

# 33. Important Product Principle

TAT Sangam should **complement the official TAT ecosystem, not
impersonate it**.

Official information should always link back to the original TAT source.

For example:

``` text
TAT Sangam
    ↓
"Attendance Rule"
    ↓
Summary
    ↓
Official Source
    ↓
TAT Student Handbook
```

This makes the platform trustworthy and reduces the risk of outdated
information.

------------------------------------------------------------------------

# 34. Benefits to Students

### Academic

-   Faster access to resources
-   Easier lab-report preparation
-   Attendance awareness
-   Timetable visibility
-   Academic document discovery

### Productivity

-   One dashboard
-   Quick links
-   Tasks
-   Deadlines
-   Calendar information

### Community

-   Student resource sharing
-   Feedback
-   Club discovery
-   Activity discovery
-   Peer contribution

### Technology

-   AI assistance
-   RAG
-   Personalized information
-   Automated synchronization

------------------------------------------------------------------------

# 35. Benefits to TAT

If developed responsibly and maintained with institutional cooperation,
the project could provide:

-   Better student information discovery
-   Easier access to student resources
-   Better visibility of clubs and activities
-   Better visibility of training opportunities
-   Reduced repetitive student queries
-   Student-driven knowledge sharing
-   A centralized student utility layer
-   A platform that can be handed over to future student teams

The platform can eventually become a **student-built digital companion
for TAT**.

------------------------------------------------------------------------

# 36. Success Metrics

After deployment, measure:

### Usage

-   Daily active students
-   Monthly active students
-   Lab reports generated
-   Resources uploaded
-   Resource downloads
-   Search queries
-   AI questions

### Quality

-   Average resource rating
-   Reported resources
-   Successful report generations
-   Failed API requests
-   Attendance sync success rate

### Community

-   Active contributors
-   Club views
-   Activity views
-   Resource feedback
-   Returning users

The most important early metric is:

> **How many TAT students repeatedly find the platform useful?**

------------------------------------------------------------------------

# 37. Recommended Product Navigation

``` text
TAT Sangam

Home
│
├── Lab Generator ⭐
├── Resources
├── Attendance
├── Timetable
├── TAT Guide
│   ├── FAQs
│   ├── Rules
│   ├── Contacts
│   └── Important Links
│
├── Updates
├── Activities
├── Clubs
├── My Links
└── AI Assistant
```

------------------------------------------------------------------------

# 38. Recommended Homepage Message

> **TAT Sangam**
>
> *Where TAT Students Connect, Collaborate & Grow.*
>
> Academic resources, lab tools, college updates, attendance,
> activities, clubs and student utilities --- brought together in one
> place.

------------------------------------------------------------------------

# 39. Development Roadmap

## Stage 0 --- Foundation

-   Clean existing Daily Planner code
-   Remove prototype authentication
-   Establish Git branching strategy
-   Create PHP backend
-   Create MySQL schema
-   Build REST API
-   Implement secure authentication

## Stage 1 --- Student Core

-   Dashboard
-   Student profile
-   Quick links
-   Lab generator
-   Lab templates
-   PDF/print output

## Stage 2 --- Community

-   Resource Hub
-   Upload
-   Search
-   Rating
-   Feedback
-   Bookmark
-   Moderation

## Stage 3 --- TAT Information

-   FAQs
-   Rules
-   Contacts
-   Updates
-   Activities
-   Clubs
-   Official links

## Stage 4 --- Academic Intelligence

-   Timetable
-   Attendance
-   Attendance calculations
-   Forecasting

## Stage 5 --- Integration

-   Authorized college connector
-   Data synchronization
-   Sync logs
-   Caching

## Stage 6 --- AI

-   OpenAI integration
-   RAG
-   Document Q&A
-   AI academic assistant

------------------------------------------------------------------------

# 40. Final Product Definition

### Name

# TAT Sangam

### Tagline

**Where TAT Students Connect, Collaborate & Grow.**

### Concept

> **A student-focused digital ecosystem for Trident Academy of
> Technology that centralizes academic utilities, lab-report generation,
> resources, attendance intelligence, college information, activities,
> clubs and AI-powered assistance in one platform.**

### Primary USP

**Lab Report Generator**

### Community USP

**Student-contributed Resource Hub**

### Academic USP

**Attendance + Timetable Intelligence**

### Information USP

**TAT Guide + Activities + Clubs + Updates**

### Technology USP

**PHP REST API + MySQL + OpenAI + RAG + Authorized Data Integration**

------------------------------------------------------------------------

# 41. Senior Developer Recommendation

The biggest mistake would be trying to build the entire vision
simultaneously.

Build the product around one strong loop:

**Lab Generator → Resources → TAT Information → Student Return**

Then progressively add:

**Attendance → Timetable → Integration → AI/RAG**

Do not make AI the reason the platform exists. Make **student utility**
the reason it exists, and use AI where it genuinely improves the
experience.

The Lab Generator should bring students to TAT Sangam.

The Resource Hub should make them stay.

The TAT information system should make it useful throughout the
semester.

Attendance and timetable should make it useful every week.

AI/RAG should make it intelligent.

That combination gives TAT Sangam a realistic path from a final-semester
project into a platform that future TAT students could continue
maintaining.

------------------------------------------------------------------------

## Official References

-   Trident Academy of Technology --- [Official
    Website](https://tat.trident.ac.in/)
-   TAT --- [Activities](https://tat.trident.ac.in/activities/)
-   TAT --- [Co-Curricular / Student
    Clubs](https://tat.trident.ac.in/activities/co-curricullar/)
-   TAT --- [CSE Department and Student
    Clubs](https://tat.trident.ac.in/academics/departments/computer-science-engineering/)
-   TAT --- [Placement](https://tat.trident.ac.in/placement/)
-   TAT --- [Student
    Handbook](https://tat.trident.ac.in/wp-content/uploads/2015/06/Student-Hand-Book-Revised.pdf)
-   Existing Prototype --- `my-Daily-Planner`, branch
    `feature/update-planner`
