# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Name:** MenoNavigator

**Product Vision:** MenoNavigator empowers women aged 45-55 experiencing perimenopause or menopause to understand their bodies through daily symptom tracking and pattern recognition. By providing an intuitive, warm interface for logging symptoms with granular detail, visualizing trends over time, and accessing trusted educational content, MenoNavigator helps users identify patterns, prepare for healthcare conversations, and feel supported through their menopause journey.

**Core Purpose:** Women navigating perimenopause and menopause often struggle to understand what's happening in their bodies, identify symptom patterns, and communicate effectively with healthcare providers. MenoNavigator solves this by providing a simple daily logging system that captures symptom severity at a granular level, visualizes patterns through calendar and chart views, and offers personalized educational content based on their menopause stage and symptoms.

**Target Users:** Women aged 45-55 experiencing perimenopause or menopause symptoms who want to track their health journey, understand symptom patterns, and have data-driven conversations with healthcare providers.

**Key MVP Features:**
- User Authentication & Profile - System/Configuration
- Onboarding Questionnaire - User-Generated/Configuration
- Daily Symptom Logging - User-Generated
- Symptom History Calendar - System Data (View)
- Symptom Trends Visualization - System Data (View)
- Educational Content Library - System Data (View)
- Data Export - System Data (Export)

**Platform:** Web application (responsive design, accessible on desktop, tablet, and mobile browsers)

**Complexity Assessment:** Moderate
- State Management: Backend database (MongoDB) with frontend caching
- External Integrations: None for MVP (reduces complexity)
- Business Logic: Moderate - dynamic personalization based on user profile, symptom pattern calculations, multi-dimensional data visualization

**MVP Success Criteria:**
- Users complete full onboarding and log symptoms within first session
- Daily symptom logging takes under 2 minutes
- Calendar view displays 30 days of symptom history accurately
- Trends charts show both frequency and intensity correctly
- Educational content personalizes based on onboarding answers
- Data export generates complete CSV/PDF of user's symptom history
- Responsive design functions properly on mobile, tablet, desktop

---

## 1. USERS & PERSONAS

**Primary Persona:**
- **Name:** "Sarah the Perimenopausal Professional"
- **Context:** 48-year-old working professional experiencing irregular periods, hot flushes, and brain fog. Frustrated by unpredictable symptoms affecting work performance and personal life. Wants to understand patterns before her next doctor appointment in 6 weeks.
- **Goals:** Track symptoms daily to identify triggers, have concrete data for healthcare conversations, understand if symptoms are menopause-related, feel less alone and more in control
- **Pain Points:** Symptoms feel random and overwhelming, can't remember details when talking to doctor, unsure if experiences are "normal" for menopause, existing tracking apps are too generic or complex

**Secondary Persona:**
- **Name:** "Maria the Post-Menopausal Tracker"
- **Context:** 53-year-old who hasn't had a period in 18 months but still experiences hot flushes and sleep disruption. Wants to monitor if symptoms are improving or if lifestyle changes help.
- **Goals:** Track symptom intensity over time, validate that symptoms are decreasing, identify what helps (diet, exercise, supplements)
- **Pain Points:** Symptoms persist longer than expected, needs evidence to decide if medical intervention is necessary

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Core MVP Features (Priority 0)

**FR-001: User Authentication & Profile Management**
- **Description:** Secure user registration, login, session management, and profile editing with age and menstrual status
- **Entity Type:** System/Configuration
- **Operations:** Register, Login, View profile, Edit profile (age, menstrual status, primary symptoms), Reset password, Logout, Delete account
- **Key Rules:** Secure password storage (hashed), session persistence across browser sessions, email uniqueness validation
- **Acceptance:** Users can register with email/password, login securely, view and update their profile information, and maintain logged-in state across sessions

**FR-002: Onboarding Questionnaire**
- **Description:** Multi-step guided questionnaire collecting baseline information (age range, menstrual status, primary symptoms, lifestyle factors) to personalize app experience
- **Entity Type:** User-Generated/Configuration
- **Operations:** Create (complete questionnaire), View (review answers), Edit (update responses), Reset (retake questionnaire)
- **Key Rules:** 5-7 questions maximum, answers stored in user profile, completion required before accessing main app, responses drive content personalization
- **Acceptance:** New users complete questionnaire during first session, answers populate profile, app personalizes symptom suggestions and educational content based on responses

**FR-003: Daily Symptom Logging**
- **Description:** Quick daily form to log 6-8 core symptoms (hot flushes, night sweats, sleep quality, mood changes, brain fog, cycle changes, joint pain, energy levels) with individual severity ratings (1-5 scale) and optional notes
- **Entity Type:** User-Generated
- **Operations:** Create (log daily entry), View (see individual log), Edit (modify today's or past entries), Delete (remove incorrect entries), List (browse all logs), Search/Filter (by date range, symptom type)
- **Key Rules:** Each symptom has independent severity scale, one log entry per day (editing replaces), logs under 2 minutes to complete, timestamps auto-generated
- **Acceptance:** Users can log symptoms in under 2 minutes, select multiple symptoms with individual severity ratings, add optional notes, edit past entries, and see confirmation after saving

**FR-004: Symptom History Calendar View**
- **Description:** Visual calendar grid displaying last 30 days of logged symptom data with color-coded intensity indicators showing which days have logs and overall severity
- **Entity Type:** System Data (View)
- **Operations:** View (calendar grid), Filter (by symptom type), Navigate (previous/next months), Drill-down (click day to see detail)
- **Key Rules:** Color intensity reflects highest symptom severity for that day, empty days clearly marked, clicking day opens detailed log view
- **Acceptance:** Users can view 30-day calendar with color-coded symptom intensity, identify patterns visually, click any logged day to see full symptom details, navigate between months

**FR-005: Symptom Trends Visualization**
- **Description:** Interactive charts showing symptom frequency (count of occurrences) and average intensity over selectable time periods (7/14/30 days) for each tracked symptom
- **Entity Type:** System Data (View)
- **Operations:** View (charts), Filter (time period: 7/14/30 days), Filter (specific symptoms), Export (chart as image)
- **Key Rules:** Dual visualization - bar chart for frequency, line chart for average intensity, calculations based on logged data only, updates in real-time as new logs added
- **Acceptance:** Users can view frequency and intensity trends for each symptom, select different time periods, see which symptoms are most common/severe, and understand patterns over time

**FR-006: Educational Content Library**
- **Description:** Curated library of articles about menopause symptoms, stages, nutrition, and self-care, personalized based on user's onboarding answers and logged symptoms
- **Entity Type:** System Data (View)
- **Operations:** View (article list), View (individual article), Search (by keyword), Filter (by category: Symptoms, Nutrition, Essential Articles), Bookmark (save favorites)
- **Key Rules:** Content personalized to show relevant articles first based on user's menstrual status and primary symptoms, categories include Symptoms, Nutrition, Essential Articles
- **Acceptance:** Users can browse personalized educational content, read articles about their specific symptoms, search for topics, filter by category, and bookmark helpful articles

**FR-007: Data Export Functionality**
- **Description:** Generate downloadable CSV or PDF summary of user's complete symptom history with date ranges, symptom details, severity ratings, and notes for healthcare visits
- **Entity Type:** System Data (Export)
- **Operations:** Export (generate CSV), Export (generate PDF), Preview (before download), Select date range (custom export period)
- **Key Rules:** Export includes all symptom logs with dates, severity ratings, notes, and summary statistics, user can select date range or export all data
- **Acceptance:** Users can export their symptom history as CSV or PDF, select custom date ranges, preview export before downloading, and use exported data in healthcare conversations

---

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: Complete Onboarding and First Symptom Log

**Trigger:** New user registers for MenoNavigator account
**Outcome:** User completes profile setup, onboarding questionnaire, and logs first day of symptoms, seeing personalized dashboard

**Steps:**
1. User registers with email and password, receives confirmation
2. System presents onboarding questionnaire (5-7 questions about age, menstrual status, primary symptoms, lifestyle)
3. User completes questionnaire, system saves responses to profile and personalizes app experience
4. System displays personalized dashboard with suggested symptoms to track based on onboarding answers
5. User logs first daily symptom entry, selecting symptoms and rating severity (1-5) for each
6. System saves log, displays confirmation, and shows calendar view with first logged day highlighted
7. User sees personalized educational content recommendations based on their profile and logged symptoms

### 3.2 Key Supporting Workflows

**Daily Symptom Logging:** User navigates to "Log Today" → selects symptoms from personalized list → rates each symptom severity (1-5) → adds optional notes → saves → sees confirmation and updated calendar

**View Symptom History:** User opens calendar view → sees 30-day grid with color-coded logged days → clicks specific day → views detailed symptom log with all ratings and notes

**Analyze Trends:** User navigates to Trends dashboard → selects time period (7/14/30 days) → views frequency bar chart and intensity line chart → filters by specific symptom → identifies patterns

**Edit Past Log:** User opens calendar → clicks logged day → clicks "Edit" → modifies symptom ratings or notes → saves → sees updated calendar and trends

**Export Data:** User navigates to Settings → clicks "Export Data" → selects date range → chooses format (CSV/PDF) → previews export → downloads file

**Read Educational Content:** User browses personalized article feed → clicks article of interest → reads content → bookmarks for later → returns to feed for more articles

**Update Profile:** User opens Settings → clicks "Edit Profile" → updates age, menstrual status, or primary symptoms → saves → app re-personalizes content and symptom suggestions

---

## 4. BUSINESS RULES

### 4.1 Entity Lifecycle Rules

| Entity | Type | Who Creates | Who Edits | Who Deletes | Delete Action |
|--------|------|-------------|-----------|-------------|---------------|
| User Profile | System/Configuration | User (registration) | User | User | Hard delete (with confirmation) |
| Onboarding Answers | User-Generated/Config | User (first session) | User | User (reset) | Soft delete (archived) |
| Daily Symptom Log | User-Generated | User | User (own logs) | User (own logs) | Soft delete (archived 90 days) |
| Educational Article | System Data | Admin | Admin | Admin | Not user-accessible |
| Bookmarked Article | User-Generated | User | User (unbookmark) | User | Hard delete |
| Exported Data | System Data | System (on demand) | None | None | Not stored (generated on-demand) |

### 4.2 Data Validation Rules

| Entity | Required Fields | Key Constraints |
|--------|-----------------|-----------------|
| User Profile | email, password, age range, menstrual status | Email unique, password min 8 chars, age 18-100 |
| Onboarding Answers | age range, menstrual status, primary symptoms | All questions required, 1-3 primary symptoms selected |
| Daily Symptom Log | date, at least one symptom | One log per day, severity 1-5, date not future, notes max 500 chars |
| Symptom Rating | symptom name, severity | Severity 1-5 integer, symptom from predefined list |

### 4.3 Access & Process Rules
- Users can only view, edit, and delete their own symptom logs and profile data
- Daily symptom logs can be edited for past 30 days only (prevents data manipulation for trends)
- Deleted symptom logs are soft-deleted and archived for 90 days before permanent removal
- Educational content is read-only for users; only admins can create/edit articles
- Data export includes all user's symptom logs regardless of date (no time limit)
- Onboarding questionnaire can be retaken, but previous answers are archived (not deleted)
- Bookmarked articles are user-specific and don't affect other users' content recommendations
- Account deletion requires confirmation and permanently removes all user data after 30-day grace period

---

## 5. DATA REQUIREMENTS

### 5.1 Core Entities

**User**
- **Type:** System/Configuration | **Storage:** MongoDB (backend)
- **Key Fields:** id, email, passwordHash, ageRange, menstrualStatus, primarySymptoms[], createdAt, updatedAt, lastLoginAt
- **Relationships:** has many SymptomLogs, has many OnboardingAnswers, has many BookmarkedArticles
- **Lifecycle:** Full CRUD with account deletion (30-day grace period), password reset, profile export

**OnboardingAnswer**
- **Type:** User-Generated/Configuration | **Storage:** MongoDB (backend)
- **Key Fields:** id, userId, questionId, answerValue, completedAt, createdAt, updatedAt
- **Relationships:** belongs to User, references Question
- **Lifecycle:** Create (on first completion), View (review answers), Edit (retake questionnaire), Archive (on retake)

**SymptomLog**
- **Type:** User-Generated | **Storage:** MongoDB (backend)
- **Key Fields:** id, userId, logDate, symptoms[] (array of {symptomName, severity, notes}), overallNotes, createdAt, updatedAt
- **Relationships:** belongs to User
- **Lifecycle:** Full CRUD with soft delete (90-day archive), one log per user per day, editable for 30 days

**SymptomRating**
- **Type:** User-Generated (embedded in SymptomLog) | **Storage:** MongoDB (embedded document)
- **Key Fields:** symptomName, severity (1-5), notes (optional)
- **Relationships:** embedded in SymptomLog
- **Lifecycle:** Created/edited/deleted as part of SymptomLog

**EducationalArticle**
- **Type:** System Data | **Storage:** MongoDB (backend)
- **Key Fields:** id, title, content, category (Symptoms/Nutrition/Essential), tags[], relevantSymptoms[], relevantMenstrualStatuses[], publishedAt, updatedAt
- **Relationships:** has many BookmarkedArticles
- **Lifecycle:** View only for users, full CRUD for admins

**BookmarkedArticle**
- **Type:** User-Generated | **Storage:** MongoDB (backend)
- **Key Fields:** id, userId, articleId, bookmarkedAt
- **Relationships:** belongs to User, references EducationalArticle
- **Lifecycle:** Create (bookmark), View (list bookmarks), Delete (unbookmark)

**Question**
- **Type:** System Data | **Storage:** MongoDB (backend)
- **Key Fields:** id, questionText, questionType (single-select/multi-select/text), options[], order, category
- **Relationships:** has many OnboardingAnswers
- **Lifecycle:** View only for users, full CRUD for admins

### 5.2 Data Storage Strategy
- **Primary Storage:** MongoDB backend database for all user data, symptom logs, and content
- **Capacity:** No practical limit with MongoDB, designed for thousands of users with years of daily logs
- **Persistence:** All data persists indefinitely unless user deletes account or logs are archived after 90 days
- **Audit Fields:** All entities include createdAt, updatedAt, createdBy (userId), updatedBy (userId)
- **Caching:** Frontend caches recent symptom logs (last 30 days) and user profile for faster calendar rendering
- **Backup:** Daily automated backups of MongoDB database, 30-day retention

---

## 6. INTEGRATION REQUIREMENTS

No external integrations required for MVP. All functionality is self-contained within the MenoNavigator application using MongoDB for data storage and frontend rendering for visualizations.

---

## 7. VIEWS & NAVIGATION

### 7.1 Primary Views

**Registration/Login** (`/register`, `/login`) - Clean, warm authentication forms with email/password fields, password reset link, and welcoming messaging

**Onboarding Questionnaire** (`/onboarding`) - Multi-step guided form (5-7 questions) with progress indicator, back/next navigation, and encouraging copy

**Dashboard** (`/`) - Personalized home showing today's log status, recent symptom summary, quick "Log Today" button, personalized educational content feed, and trends snapshot

**Daily Symptom Logging** (`/log`) - Simple form with personalized symptom checkboxes, individual severity sliders (1-5) for each selected symptom, optional notes field, and prominent save button

**Symptom History Calendar** (`/calendar`) - 30-day calendar grid with color-coded logged days, month navigation, symptom filter dropdown, and click-to-view-detail interaction

**Trends Dashboard** (`/trends`) - Interactive charts showing symptom frequency (bar chart) and average intensity (line chart), time period selector (7/14/30 days), symptom filter, and export chart option

**Educational Library** (`/learn`) - Categorized article list (Symptoms, Nutrition, Essential) with search bar, personalized recommendations at top, bookmark icons, and article preview cards

**Article Detail** (`/learn/:articleId`) - Full article content with warm, readable typography, bookmark button, related articles section, and back-to-library navigation

**Settings** (`/settings`) - Profile management (edit age, menstrual status, primary symptoms), retake onboarding link, data export options (CSV/PDF with date range selector), account deletion, and logout

**User Profile** (`/profile`) - View-only summary of user's profile information, onboarding answers, and account creation date with edit button linking to Settings

### 7.2 Navigation Structure

**Main Nav:** Dashboard | Log Today | Calendar | Trends | Learn | Settings
**User Menu:** Profile | Settings | Logout (accessible from top-right avatar/icon)
**Default Landing:** Dashboard (after login) | Registration (if not logged in)
**Mobile:** Bottom tab bar with icons for Dashboard, Log, Calendar, Trends, Learn; hamburger menu for Settings and Profile

---

## 8. MVP SCOPE & CONSTRAINTS

### 8.1 MVP Success Definition

The MVP is successful when:
- ✅ Users complete registration, onboarding, and first symptom log in single session
- ✅ Daily symptom logging takes under 2 minutes consistently
- ✅ Calendar view accurately displays 30 days of symptom history with color-coded intensity
- ✅ Trends charts correctly calculate and display both frequency and average intensity for each symptom
- ✅ Educational content personalizes based on user's onboarding answers and logged symptoms
- ✅ Data export generates complete, accurate CSV/PDF of user's symptom history
- ✅ Responsive design functions properly on mobile (iOS/Android browsers), tablet, and desktop
- ✅ 70% of users complete onboarding, 60% view calendar within 3 days, 50% log symptoms 3+ times in first week

### 8.2 In Scope for MVP

Core features included:
- FR-001: User Authentication & Profile Management
- FR-002: Onboarding Questionnaire (5-7 questions, dynamic personalization)
- FR-003: Daily Symptom Logging (6-8 symptoms, individual severity ratings, under 2 minutes)
- FR-004: Symptom History Calendar View (30-day grid, color-coded intensity, drill-down detail)
- FR-005: Symptom Trends Visualization (frequency + intensity charts, 7/14/30-day periods)
- FR-006: Educational Content Library (Symptoms, Nutrition, Essential categories, personalized recommendations)
- FR-007: Data Export Functionality (CSV/PDF with date range selection)

### 8.3 Technical Constraints

- **Data Storage:** MongoDB backend database with no practical storage limits for MVP user base
- **Concurrent Users:** Designed for 100-500 concurrent users initially, scalable to thousands
- **Performance:** Page loads <2s on 3G connection, symptom logging interactions instant (<200ms), chart rendering <1s
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions), iOS Safari, Android Chrome
- **Mobile:** Fully responsive design with touch-optimized interactions, works on iOS 13+ and Android 8+
- **Offline:** Not supported in MVP - requires internet connection for all functionality
- **Data Sync:** Real-time sync across devices when user logs in (no multi-device simultaneous editing)

### 8.4 Known Limitations

**For MVP:**
- No AI-powered insights or red-flag symptom detection (manual pattern recognition only)
- No care navigation or healthcare provider recommendations
- No social/community features or peer support
- No medication or supplement tracking (focus on symptoms only)
- No integration with wearables or health apps (manual entry only)
- No multi-language support (English only)
- No offline mode (requires internet connection)
- Educational content is static (no personalized AI-generated advice)

**Future Enhancements:**
- V2 will add AI-powered pattern detection and red-flag symptom alerts
- V3 will include care navigation, provider recommendations, and telehealth integration
- V4 will add community features, medication tracking, and wearable integrations

---

## 9. ASSUMPTIONS & DECISIONS

### 9.1 Platform Decisions
- **Type:** Full-stack web application (React frontend + Node.js backend + MongoDB)
- **Storage:** MongoDB backend database for all user data, symptom logs, and educational content
- **Auth:** JWT-based authentication with secure password hashing (bcrypt), session tokens stored in httpOnly cookies
- **Hosting:** Cloud-hosted (AWS/Heroku/Vercel) for scalability and reliability

### 9.2 Entity Lifecycle Decisions

**User Profile:** Full CRUD with account deletion (30-day grace period)
- **Reason:** Users need full control over their personal information and right to delete account per data privacy regulations

**Onboarding Answers:** Create/View/Edit with archiving on retake
- **Reason:** Users may need to update answers as their menopause stage changes, but historical answers inform personalization evolution

**Daily Symptom Log:** Full CRUD with soft delete (90-day archive), editable for 30 days only
- **Reason:** Users need to correct mistakes but preventing long-term edits maintains data integrity for trend analysis

**Educational Article:** View only for users, full CRUD for admins
- **Reason:** Content is curated and medically reviewed; user modifications would compromise quality and accuracy

**Bookmarked Article:** Create/View/Delete
- **Reason:** Simple user preference with no need for editing (unbookmark = delete)

### 9.3 Key Assumptions

1. **Users will log symptoms consistently if the process takes under 2 minutes**
   - Reasoning: User research shows time commitment is primary barrier to health tracking; keeping logging quick and simple maximizes adherence

2. **Granular severity ratings (per symptom) provide more value than overall day ratings**
   - Reasoning: Users need detailed data for healthcare conversations and root cause identification; individual symptom tracking enables better pattern recognition

3. **30-day calendar view is sufficient for pattern recognition without overwhelming users**
   - Reasoning: Most menopause symptom patterns emerge within 2-4 weeks; longer views can be added post-MVP based on user feedback

4. **Personalization based on onboarding answers will increase engagement and content relevance**
   - Reasoning: Women in perimenopause have different needs than post-menopausal women; tailoring symptom suggestions and educational content improves user experience

5. **Educational content library is essential for MVP despite being "read-only"**
   - Reasoning: Users need trusted information to understand if symptoms are menopause-related; this validates tracking efforts and reduces anxiety

6. **CSV/PDF export is sufficient for healthcare conversations without direct provider integration**
   - Reasoning: Most healthcare providers accept printed or emailed symptom summaries; complex EHR integrations are unnecessary for MVP validation

### 9.4 Clarification Q&A Summary

**Q:** What specific visual style do you envision for MenoNavigator?
**A:** Warm, encouraging, intuitive, and inviting to a global audience of girls and women. Visually think like the best design and designers (e.g., Stripe, Jony Ive).
**Decision:** Design system will prioritize clean, minimalist aesthetics with warm color palette (soft pinks, purples, earth tones), generous white space, clear typography, and encouraging microcopy. Avoid clinical/medical aesthetics in favor of approachable, premium feel.

**Q:** Should severity scale be applied to each individual symptom or one overall day rating?
**A:** Granularity is better so users can use this information when consulting with doctors and to help identify root causes.
**Decision:** Each symptom gets individual severity rating (1-5 scale). Daily log form shows selected symptoms with independent sliders/scales. Trends charts visualize per-symptom frequency and intensity.

**Q:** Does onboarding need to dynamically change app experience based on answers?
**A:** Collect core data and personalize dynamically based on answers. Imagine it's a team of the world's best practitioners and doctors available to the user.
**Decision:** Onboarding answers drive personalization throughout app: symptom suggestions prioritize user's primary symptoms, educational content filters by menstrual status and logged symptoms, dashboard highlights relevant trends. System acts as intelligent guide, not generic tracker.

**Q:** Do you have specific categories for educational content library?
**A:** Symptoms to help users identify if what they're experiencing "could be related" or something else. Include nutrition as well as a short list of essential articles.
**Decision:** Three main categories: (1) Symptoms - articles explaining each symptom and menopause connection, (2) Nutrition - diet and supplement guidance for symptom management, (3) Essential Articles - foundational menopause education. Content tagged by symptom type and menstrual status for personalization.

**Q:** Should trends visualize only frequency or also average intensity?
**A:** Both.
**Decision:** Trends dashboard includes dual visualization: bar chart showing symptom frequency (count of occurrences) and line chart showing average intensity over time. Users can toggle between views or see both simultaneously. Time period selector (7/14/30 days) applies to both charts.

---

**PRD Complete - Ready for Development**