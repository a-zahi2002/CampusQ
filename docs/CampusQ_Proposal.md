# CampusQ
## An Anonymous Academic Question and Answer Platform

**Asmed Sahee M.P**  
**25DSE057**

Final Project – DSE/006  
Diploma in Software Engineering  
Centre for Open and Distance Learning  
Sabaragamuwa University of Sri Lanka  
February 2026

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Project Objectives](#2-project-objectives)
3. [Proposed Solution](#3-proposed-solution)
   - 3.1 [System Overview](#31-system-overview)
   - 3.2 [User Roles and Access Control](#32-user-roles-and-access-control)
   - 3.3 [Core Functional Modules](#33-core-functional-modules)
     - 3.3.1 [Question Management](#331-question-management)
     - 3.3.2 [Answer and Comment Management](#332-answer-and-comment-management)
     - 3.3.3 [Rating and Points](#333-rating-and-points)
     - 3.3.4 [Leaderboard](#334-leaderboard)
     - 3.3.5 [Tagging and Recommendations](#335-tagging-and-recommendations)
     - 3.3.6 [Administration and Moderation](#336-administration-and-moderation)
   - 3.4 [System Design](#34-system-design)
     - 3.4.1 [Use Case Diagram](#341-use-case-diagram)
     - 3.4.2 [DFD Diagram](#342-dfd-diagram)
   - 3.5 [Data Model](#35-data-model)
   - 3.6 [Technologies and Tools](#36-technologies-and-tools)
4. [Project Scope](#4-project-scope)
   - 4.1 [In-Scope Functionality (Phase 1 – This Project)](#41-in-scope-functionality-phase-1--this-project)
   - 4.2 [Out-of-Scope / Future Enhancements](#42-out-of-scope--future-enhancements)
5. [Development Plan](#5-development-plan)
   - 5.1 [Timeline](#51-timeline)
   - 5.2 [Development Method](#52-development-method)
6. [Expected Outcome](#6-expected-outcome)

---

## 1. Problem Statement

Most students at universities and various institutions feel shy and are afraid of being judged by their peers or instructors whenever they attempt to pose an educational issue during a lecture, a tutorial, or a discussion with their fellow students. Because of this, many students have unresolved issues and unanswered questions, as they feel that their queries may not make any sense, leading to an impact on their learning process as well as their academic performance.

A means of seeking help is by means of private chat groups, social media groups, among others. Though these methods have helped to some extent, they are disorganized, unmanageable, and unsuitable for long-term academic knowledge-sharing platforms. Acquired knowledge and solutions are easily hidden in long chat histories, and they cannot be accessed at a later time by other students. Some questions are frequently asked in multiple groups, with valuable knowledge not being maximally utilized.

As it is in Sabaragamuwa University of Sri Lanka, currently, there is no centralized student community platform that is focused on academics, where students can ask questions anonymously and also obtain academic guidance from their peers and lecturers while at the same time helping to maintain student accountability. Currently, most platforms are used for formal situations like sharing assignments and so on, but do not offer Q&A services, thereby indicating a need for this service.

---

## 2. Project Objectives

The main objective of this project is to design and develop a secure, university-centric anonymous question and answer web platform in order to facilitate communication at Sabaragamuwa University of Sri Lanka.

The specific objectives of the project are:

1. To develop a web-based platform that allows students and lecturers to ask and answer academic questions anonymously using verified university credentials.
2. To encourage student participation and engagement by providing a safe environment where users can interact without fear of judgment.
3. To ensure authenticity and accountability by restricting access to registered university members while hiding real identities from public view.
4. To provide a structured system for organizing academic questions and answers based on subjects, courses, or topics.
5. To implement moderation features that help maintain the quality, relevance, and accuracy of shared academic content.
6. To design a user-friendly interface that supports easy navigation and effective knowledge sharing.

---

## 3. Proposed Solution

### 3.1 System Overview

> *"A Web-based, Anonymous Academic Q&A Platform Specially Designed for the Sabaragamuwa"*

CampusQ is designed specifically for the community of Sabaragamuwa University of Sri Lanka. The system will deliver its user-defined question-and-answer service in the form of a special web space available for students who can post their questions there and get answers from other students as well as academics within an academic-based environment. Unlike casual social media groups, CampusQ is strictly academic where questions and answers are maintained in a way that is searchable and can be re-used by past, present, and future students.

In the proposed system, users will log in using their real university identity, such as registration number or university email, but interact with the platform using a chosen nickname. This approach is foreseen to achieve a balance between anonymity and accountability. From the user's perspective, his/her real name will be hidden in public views, which is supposed to make him/her feel more comfortable asking questions without the fear of embarrassment and judgment. Simultaneously, the system will be internally connected to a real user account with each nickname in such a way that misuse can be kept under control through appropriate moderation by authorized staff.

The platform will have three distinct user roles: **students**, **lecturers**, and **administrators**. Users will have the ability to participate by posing and answering questions in line with their respective courses or subjects. The contributions of lecturers will have the ability to be marked with a special tag, indicating that the user is a lecturer. In addition, there will be a rating and points system whereby users submitting answers will have their answers rated using a star-based system. These ratings will then contribute to points given to the submitters of answers, which will be used to generate a leaderboard highlighting the most active users on the platform.

Overall, the proposed system of CampusQ will bridge the existing gap between classroom learning and online discussions by providing academic support to students through a platform that will be university-centric for continuous support. If the proposed system is successful, CampusQ will ensure to clarify students' doubts, share existing knowledge, and also provide lecturers with a platform to guide students.

---

### 3.2 User Roles and Access Control

The three main users of CampusQ are: **Student**, **Lecturer**, and **Administrator**. The permissions and responsibilities granted for different user roles guarantee that they make good use of the platform, while also imposing tight security and control. Any user will need to supply verified university credentials in order to create an account — such as a university email address or registration number — so that only members of Sabaragamuwa University of Sri Lanka have access rights.

The registration and login process for both students and lecturers will be very similar. Users will register with their actual information, but will then choose a unique nickname to be used as their public representation on the platform. Upon asking questions, posting answers, or interacting with content, other users will only see the nickname and a simple, general role label such as "Student" or "Lecturer". This design consideration is intended to protect the real identity of users from public views, with the aim of enabling freer and more honest participation in academic discussions.

Compared to regular users, lecturers will have slightly more functionality and responsibilities. In addition to being able to ask and respond to questions, lecturers may also provide additional comments on answers as well as provide clarifications or corrections to responses where appropriate. Each lecturer will have a visible **"Lecturer"** tag next to their public username so that other users can identify academic contributions made by that individual. However, just like students, the individual real identity and registration information for each lecturer will be kept private and not publicly available to other users.

Administrators will be provided with additional access privileges for system administration and moderation, enabling them to see user account information (real identity and associated nickname) and use this information when dealing with suspected misuse or violations of policy. Administrators will also be able to view and act on reported questions and/or answers, hide or delete inappropriate content, and deactivate or reactivate user accounts. By having these different access levels, the proposed system is intended to provide an acceptable balance between anonymity in participation, user privacy, and institutional accountability.

---

### 3.3 Core Functional Modules

The proposed CampusQ system will be divided into several core modules that work together to support anonymous academic question and answer activities for the university community.

#### 3.3.1 Question Management

Users (students and lecturers) will have the ability to create and manage questions. They will be able to submit a question including a title, description, and tags/subjects, as well as view all of the questions submitted. Users will be able to open a question to view the question and answers created by other users.

#### 3.3.2 Answer and Comment Management

User-specific responses for each question will be managed in the answers module, with users able to post, view, and modify their own responses. Additionally, lecturers may choose to comment on student responses by providing clarifying or correcting comments that help improve response quality across the board.

#### 3.3.3 Rating and Points

Through this module, the user who posted a question will be able to rate the answers received using a simple star-based system. The system will convert these ratings into points for the answer authors. Each user's total points will be stored and later used for ranking in leaderboards.

#### 3.3.4 Leaderboard

The leaderboard module is designed to showcase the most active and helpful members of the system according to their point score. There will be an **Overall Most Active User Leaderboard** (all time) as well as a **Monthly Most Active User Leaderboard**. Each user that appears on these leaderboards will display their nickname, student or lecturer role, and point value.

#### 3.3.5 Tagging and Recommendations

Questions will be categorized by topic through the use of tags and keywords. When users ask a question, they will select from a list of pre-defined tags (that relate to their question) before submission. Users will be able to identify the types of topics they are interested in, and these topics will be used by the system to recommend and highlight appropriate questions in their newsfeed.

#### 3.3.6 Administration and Moderation

Administrators will have a dedicated moderation panel to review reported content. They will be able to hide or delete inappropriate questions and answers, deactivate or reactivate user accounts, and access real identity information where necessary for investigating policy violations. This module ensures the integrity and safety of the platform's academic environment.

---

### 3.4 System Design

The system design of CampusQ will be illustrated using a UML use case diagram and a data flow diagram (DFD). The UML use case diagram will show the main user roles (student, lecturer, administrator) and their key actions, such as asking questions, answering, rating, and moderating content. The DFD will present how data flows between users, system processes, and data stores for functions like authentication, question management, answer handling, and leaderboard generation.

#### 3.4.1 Use Case Diagram

The use case diagram below illustrates the interactions between the three main actors — Student, Lecturer, and Administrator — and the core system functions:

| Actor | Use Cases |
|---|---|
| Student | Authenticate User, Manage Anonymous Profile, View Academic Discussions, Post Academic Questions, Answer Questions, Interact with Content (Upvote/Mark Helpful), Report Inappropriate Content |
| Lecturer | All Student use cases, plus additional comment/clarification capabilities |
| Administrator | Manage Users, Moderate Content, Manage Academic Structure |

```
CampusQ – Anonymous Academic Q&A Platform

         ┌─────────────────────────────────────────────────────┐
         │                                                     │
         │   ( Authenticate User              )  ◄────────────┼── Administrator
         │   ( Manage Anonymous Profile       )               │
Student ─┼── ( View Academic Discussions      )               │
         │   ( Post Academic Questions        )               │
Lecturer ┼── ( Answer Questions               )               │
         │   ( Interact with Content          )               │
         │   ( Report Inappropriate Content   )               │
         │   ( Manage Users                   )  ◄────────────┼── Administrator
         │   ( Moderate Content               )  ◄────────────┼── Administrator
         │   ( Manage Academic Structure      )  ◄────────────┼── Administrator
         │                                                     │
         └─────────────────────────────────────────────────────┘
```

#### 3.4.2 DFD Diagram

The Data Flow Diagram below describes how data moves between the main system processes and data stores:

| Process | Inputs | Outputs | Data Stores |
|---|---|---|---|
| 1.0 Manage Questions | Questions from Student/Lecturer | Question list/confirmation, Question details | D2 – Questions |
| 2.0 Manage Answers & Comments | Answer/Comment from users | Posted answer/updated view | D3 – Answers & Comments |
| 3.0 Rating & Points Calculation | Ratings from users | Store ratings/points | D4 – Rating & Points |
| 4.0 Leaderboard Management | User points (from D4) | Leaderboard display | D5 – Leaderboard |
| 5.0 Admin & Moderation | Moderation commands from Admin | Moderation status/reports | D1 – Users |

**Data Stores:**
- **D1** – Users
- **D2** – Questions
- **D3** – Answers & Comments
- **D4** – Rating & Points
- **D5** – Leaderboard

---

### 3.5 Data Model

The data model of CampusQ will be described using an Entity-Relationship (ER) diagram. It defines the main entities and their relationships:

**Entities and Key Attributes:**

| Entity | Key Attributes |
|---|---|
| **Students** | student_id, registration_number, email, password, nickname, total_points |
| **Lecturer** | registration_number, nickname, email, password, total_points |
| **Admin** | admin_id, username, password, total_points |
| **Question** | question_id, title, description, subject, semester, year, tags, created_at |
| **Answers** | answer_id, question_id (FK), author_id (FK), rating, points, created_at |
| **Comments** | comment_id, author_id (FK), answer_id (FK), created_at |
| **Tag** | tag_id, tag_name |
| **Leaderboard** | leaderboard_id, nickname, role, rank, type, month, Points_Contribute |

**Key Relationships:**
- Students and Lecturers **Post** Questions
- Questions **Has** Answers
- Answers **Has** Comments
- Questions are **Tagged With** Tags
- Users **Appear In** the Leaderboard
- Admins **Moderate** Questions, Answers, and Comments

---

### 3.6 Technologies and Tools

**Frontend: React**  
React will be used to build a component-based, single-page interface, which makes it easier to manage views such as question lists, answer pages, leaderboards, and user profiles. It also has strong community support and many ready-made examples, which is helpful within a limited timeline.

**Styling: Tailwind CSS**  
Tailwind CSS will be used to design the user interface quickly using utility classes instead of writing extensive custom CSS. This helps to create a clean, responsive layout for CampusQ while reducing the time required for styling.

**Backend: Node.js with Express.js**  
Node.js with Express.js will be used to develop the server-side REST APIs for handling authentication, question and answer management, rating logic, and leaderboards. Using JavaScript on both frontend and backend simplifies development and speeds up integration.

**Database: PostgreSQL**  
PostgreSQL will be used as the relational database to store users, questions, answers, ratings, and tags with clear table structures and relationships. It is reliable, widely used in industry, and supports structured queries suitable for reporting and future extensions.

**Authentication & Security: JWT, bcrypt, RBAC, HTTPS**  
JSON Web Tokens (JWT) will manage user sessions in a stateless way, while bcrypt will be used to securely hash passwords before storing them in the database. A role-based access control (RBAC) approach will differentiate permissions for students, lecturers, and administrators, and HTTPS will be used during deployment to protect data in transit.

**Deployment: Vercel and Heroku**  
Vercel will be used to host and serve the React frontend, providing simple and fast deployment for static and single-page applications. Heroku will host the Node.js backend and PostgreSQL database, allowing easy deployment and environment configuration suitable for a student project.

**Development and Collaboration Tools: VS Code, Git, GitHub, Postman**  
Visual Studio Code will be used as the main code editor, while Git and GitHub will support version control and backup of the project source code. Postman (or a similar API testing tool) will help in testing and debugging backend endpoints during development.

---

## 4. Project Scope

### 4.1 In-Scope Functionality (Phase 1 – This Project)

**User Registration and Login**
- Account creation using university email or registration number.
- Role assignment as student, lecturer, or administrator.
- Nickname selection and use of nickname in all public views.

**Question Management**
- Students and lecturers can post academic questions with title, description, subject, and tags.
- View list of questions with basic search and filtering (e.g., by keyword or tag).
- View full question details and associated answers.

**Answer and Comment Management**
- Students and lecturers can submit answers to questions.
- Users can edit or delete their own answers within reasonable limits.
- Lecturers can comment on answers to provide clarifications or corrections.

**Rating and Points System**
- Question owner can rate answers using a 1–5 star scale.
- System converts star ratings into points for answer authors and stores total points per user.

**Leaderboards**
- All-time Top 10 users based on total points.
- Monthly Top 10 users based on points earned during the current month.
- Display of nickname, role, and total points for each ranked user.

**Tagging and Interest-Based Suggestions**
- Tagging questions with relevant keywords or topics.
- Users can select preferred tags in their profile.
- Question feed can highlight or suggest questions that match user interests.

**Administration and Moderation**
- Admin view of users, questions, and answers.
- Ability to hide or delete inappropriate content.
- Ability to deactivate or reactivate user accounts.
- Access to real identity information for investigation when necessary.

**Basic Security and Usability**
- Password hashing, session handling with JWT, and basic role-based access control.
- Simple, user-friendly web interface with clear navigation and responsive layout.

---

### 4.2 Out-of-Scope / Future Enhancements

The following features are not planned to be implemented within the three-month project period but may be considered as future enhancements:

**Multi-University Support**  
Extending the platform to support multiple universities with separate spaces or institutions.

**Advanced Analytics and Dashboards**  
Detailed statistics on popular topics, most frequently asked questions, and student performance trends.

**AI-Assisted Features**
- Automatic suggestion of tags based on question content.
- Recommendation of similar existing questions while a new question is being typed.
- AI-generated draft answers for users to review and edit.

**Rich Notification System**  
Email or in-app notifications for new answers, ratings, or comments.

**Mobile Application**  
Native Android or iOS app; the current project will focus only on a responsive web application.

**Advanced Moderation Features**  
User reporting workflows, automated flagging of abusive content, and more detailed admin tools.

---

## 5. Development Plan

### 5.1 Timeline

The project is planned to be completed over a period of approximately three months. Development work will be carried out through each week. The work will be divided into the following phases:

| Phase | Duration | Tasks |
|---|---|---|
| **Month 1 – Planning & Core Setup** | Mar 01 – Mar 28 | Finalize requirements & system design; Database schema & ER diagram; Frontend setup & repo configuration; Authentication & role management |
| **Month 2 – Core Functionality** | Mar 29 – Apr 25 | Question management & search; Answers & comments CRUD; Rating system & points logic; Leaderboards, tagging & recommendations |
| **Month 3 – Admin, Testing & Deployment** | Apr 26 – May 24 | Admin panel & moderation; UI improvements & usability; Functional testing & bug fixes; Deployment & documentation |

### 5.2 Development Method

The project will follow a simple **iterative approach**. At the end of each phase, the implemented features will be reviewed and adjusted where necessary before moving to the next phase. This will help to manage the limited available time and ensure that the most important features are completed first.

---

## 6. Expected Outcome

The end result of this project will be a fully functional web-based prototype for **CampusQ** that has been customized for Sabaragamuwa University of Sri Lanka. The web-based system will provide the following key functional features:

- University user registration and login using university credentials.
- Anonymous posting of questions and answers using nicknames.
- Star-based rating system for answers.
- Points system and leaderboards (all-time and monthly).
- Tagging and interest-based question recommendations.
- Basic administration and moderation features.

CampusQ aims to bridge the gap between formal classroom learning and peer-based online discussion, providing a safe, structured, and sustainable academic support environment for the university community.

---

*Project Proposal – DSE/006 | Diploma in Software Engineering | Centre for Open and Distance Learning | Sabaragamuwa University of Sri Lanka*
