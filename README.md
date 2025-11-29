---

# 🚀 ACYRX — AI-Powered Learning & School Tools Platform

Welcome to the **ACYRX** project!
This is the codebase that powers the ACYRX platform hosted at **[https://acyrx.com](https://acyrx.com)**, built using **Next.js**, **Supabase**, **shadcn/ui**, and modern React tooling.

ACYRX provides intelligent learning tools such as:

* 📚 **AI Tutor**
* ✍️ **AI Exam Maker & Marker**
* 🧠 **AI Student + Teacher Assistants**
* 🗂️ **School Management Tools**
* 🔐 **Authentication (Supabase)**
* 🎨 **Modern UI with shadcn/ui**

---

# 📦 Tech Stack

* **Next.js 14+ (App Router)**
* **React 18**
* **Supabase** (Auth, Database, Storage)
* **Tailwind CSS**
* **shadcn/ui**
* **TypeScript**
* **Vercel Deployment**

---

# 🛠️ Getting Started

Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

Run the development server:

```bash
npm run dev
# or yarn dev
# or pnpm dev
# or bun dev
```

Visit the project at:

👉 **[http://localhost:3000](http://localhost:3000)**

The main entry page is:

```
app/page.tsx
```

Any changes will automatically reload in the browser.

---

# 🎨 UI & Styling

This project uses:

* **Tailwind CSS** for utility-first styling
* **shadcn/ui** for reusable, accessible components
* **next-themes** for light/dark mode
* **Geist font** for clean typography

---

# 🔐 Supabase Setup

The app uses Supabase for:

* Authentication (email/password, OAuth, etc.)
* Database (student data, exam results, messages)
* Storage (images, files)
* Server-side rendering with `@supabase/ssr`

Environment variables needed:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

# 🚀 Deployment

ACYRX is deployed on **Vercel**.

To deploy your own version:

1. Push your project to GitHub
2. Visit: [https://vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Add all environment variables
5. Deploy

Vercel will automatically build and optimize your Next.js app.

---

# 📚 Learn More

* **Next.js Documentation**
  [https://nextjs.org/docs](https://nextjs.org/docs)

* **Supabase Docs**
  [https://supabase.com/docs](https://supabase.com/docs)

* **shadcn/ui Docs**
  [https://ui.shadcn.com](https://ui.shadcn.com)

---

# 🤝 Contributing

Contributions are welcome!
Feel free to open issues, request features, or improve the platform.

---

# 📄 License

This project is licensed under the MIT License.

---

Great — I’ll add **all the extra documentation** you need:

✅ API Documentation
✅ AI Architecture Documentation
✅ Supabase Database Schema Documentation
✅ Environment Variables Guide
✅ Project Workflow & Folder Explanations
✅ System Diagram (ASCII format)
✅ Additional Developer Notes

Below is an extended professional **full documentation README** for ACYRX.

---

# 🚀 ACYRX — AI-Powered Learning & School Management Platform

**[https://acyrx-ten.vercel.app](https://acyrx-ten.vercel.app)**

ACYRX is a next-generation learning platform powered by AI, designed for students, teachers, and schools.
It integrates tutoring, exam generation, feedback systems, school communication tools, and AI-driven insights into one unified platform.

---

# 📘 Table of Contents

* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [System Architecture](#-system-architecture)
* [AI Architecture](#️-ai-architecture)
* [Supabase Database Schema](#-supabase-database-schema)
* [API Documentation](#-api-documentation)
* [Project Structure](#-project-structure)
* [Environment Variables](#-environment-variables)
* [Installation](#-installation)
* [Development Workflow](#-development-workflow)
* [Roadmap](#-roadmap)
* [Contributing](#-contributing)
* [License](#-license)

---

# 🌟 Features

### 🧠 AI Learning Tools

* AI Tutor (chat + voice)
* AI Exam Maker (MCQ, essays, structured questions)
* AI Exam Marker (automatic grading)
* AI Debate Assistant
* AI Notes Summarizer & Flashcards

### 🏫 School Tools

* Class communication
* School news updates
* Attendance tracking
* Results tracking
* Teacher assistant tools

### 🎨 Interface

* Beautiful UI with shadcn/ui
* Dark/Light mode
* Fully responsive
* Smooth animations with React

---

# 🧱 Tech Stack

| Layer       | Technology                   |
| ----------- | ---------------------------- |
| Framework   | Next.js 14                   |
| UI          | Tailwind + shadcn/ui         |
| AI          | OpenAI / HuggingFace         |
| Database    | Supabase PostgreSQL          |
| Auth        | Supabase Auth                |
| Deployment  | Vercel                       |
| Type Safety | TypeScript                   |
| SSR         | @supabase/ssr                |
| State       | React Hooks + Server Actions |

---

# 🏗 System Architecture

```
             ┌─────────────────────────┐
             │       User (Web)        │
             └────────────┬────────────┘
                          │
                          ▼
                Next.js (App Router)
                          │
      ┌───────────────────┴─────────────────┐
      │                                     │
      ▼                                     ▼
AI Engines (OpenAI/HF)            Supabase Backend
      │                            │  ├─ Auth
      │                            │  ├─ Database (Postgres)
      │                            │  └─ Storage
      ▼                                     ▼
   AI Responses                    App Data / Sessions
                          │
                          ▼
                    Frontend UI
```

---

# 🧠 AI Architecture

ACYRX AI system is structured into multiple agents:

### 1. **AI Tutor Agent**

* Chat-based and voice-based
* Topic-aware
* Supports Swahili + English
* Can teach step-by-step

### 2. **AI Exam Maker Agent**

* Generates exams by topic, chapter, level
* Exports MCQs, structured, essay

### 3. **AI Marker Agent**

* Grades answers
* Gives scoring + correction + model answers

### 4. **AI Debate Agent**

* Argues for/against any topic
* Great for school debates

### 5. **AI Revision Agent**

* Summaries
* Flashcards
* Key points

All agents communicate with:

* OpenAI GPT-4/5 API
* HuggingFace LLMs (optional)
* School DB for personalized output

---

# 🗄 Supabase Database Schema

A simplified schema (you can extend):

```
users
├ id (uuid)
├ email
├ name
├ role (student | teacher | admin)

profiles
├ id (uuid, FK -> users.id)
├ school
├ class_level

exams
├ id
├ title
├ questions (jsonb)
├ owner_id

results
├ id
├ exam_id (FK)
├ user_id (FK)
├ score
├ answers (jsonb)

news
├ id
├ title
├ content
├ image_url

messages
├ id
├ sender_id
├ receiver_id
├ content
├ created_at

attendance
├ id
├ user_id
├ date
├ status
```

---

# 🔌 API Documentation

### **1. Create Supabase Client (Client-Side)**

```ts
import { createBrowserClient } from "@supabase/ssr"
```

### **2. Create Supabase Client (Server-Side)**

```ts
import { createServerClient } from "@supabase/ssr"
```

### **3. Authentication**

Signup:

```ts
supabase.auth.signUp({
  email,
  password,
})
```

Login:

```ts
supabase.auth.signInWithPassword({
  email,
  password,
})
```

### **4. Insert Data**

```ts
supabase.from("exams").insert({...})
```

### **5. Real-time Listeners**

```ts
supabase.channel("room").on("postgres_changes", {...})
```

Full API examples can be added if needed.

---

# 📂 Project Structure

```
/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   └── custom-components/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── ai/
├── public/
│   ├── images/
│   └── screenshots/
└── styles/
```

---

# 🔧 Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=        # For AI Tutor
HF_API_KEY=            # HuggingFace (optional)

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

# 🛠 Installation

```bash
git clone yourrepo
cd acyrx
npm install
npm run dev
```

Open:
👉 [http://localhost:3000](http://localhost:3000)

---

# 🧪 Development Workflow

1. All UI components inside `components/ui`
2. API logic in `app/api/*`
3. Supabase clients inside `lib/supabase`
4. Styles in `globals.css`
5. AI functions inside `lib/ai`
6. Shared types inside `types/`

---

# 📅 Roadmap

### Completed

✔ Supabase Auth
✔ Basic AI Tutor
✔ Exam Maker (beta)
✔ Responsive UI

### Coming Next

* [ ] Voice Tutor (real-time voice conversations)
* [ ] Teacher Dashboard
* [ ] Student Performance Analytics
* [ ] Class Groups + AI Moderator
* [ ] Mobile App (Expo / React Native)
* [ ] Offline mode

---

# 🤝 Contributing

Pull requests are welcome!

1. Fork
2. Create a feature branch
3. Commit and push
4. Open PR

---

# 📄 License

MIT — free to use and modify.

---

If you'd like, I can also:

✅ Generate a **Landing Page copy** for your app
✅ Create a **Product Pitch Deck PDF**
✅ Write **API reference docs**
✅ Build a **system diagram image**
✅ Generate **logo + branding guidelines**

Just say **“yes”** or tell me which one you want!


Here is your **ACYRX Product Vision Document** (clear, professional, and ready for investors, developers, and stakeholders):

---

# 🌟 **ACYRX — Product Vision Document**

**Version:** 1.0
**Updated:** 2025
**Website:** [https://acyrx-ten.vercel.app](https://acyrx-ten.vercel.app)

---

# 1. **Vision Statement**

ACYRX is an intelligent, AI-powered learning and school management ecosystem designed to **revolutionize how students learn, how teachers teach, and how schools operate**.

Our vision is to make high-quality education accessible, personalized, and efficient — powered by AI, modern design, and seamless automation.

---

# 2. **The Problem**

### Students struggle with:

* Limited personalized help
* Boring revision methods
* Inconsistent performance tracking
* Lack of motivation
* Difficulty understanding complex concepts

### Teachers struggle with:

* Heavy marking workloads
* Administrative overload
* Inconsistent student monitoring
* Limited time to provide personalized support

### Schools struggle with:

* Communication inefficiency
* Outdated tools
* Low insight into learning patterns

---

# 3. **The ACYRX Solution**

ACYRX provides a unified AI-driven platform for:

### ✅ Students

* AI Tutor (chat or voice)
* AI Exam Maker
* AI Exam Marker
* AI Study Helper
* Personalized learning paths
* Progress insights

### ✅ Teachers

* Automated marking
* AI-powered lesson plans
* Student analytics
* Content generation
* Messaging & announcements tools

### ✅ Schools

* News & announcements
* Attendance (future)
* Results management (future)
* Multi-role user support

---

# 4. **Product Goals**

### 🎯 Primary Goals

1. Deliver a fully personalized AI learning experience
2. Reduce teacher workload through automation
3. Modernize school operations
4. Provide actionable insights to improve learning
5. Create an easy, intuitive, beautiful user experience

### 🎯 Secondary Goals

6. Support multiple languages
7. Enable mobile access (future app)
8. Scale globally with low infrastructure overhead

---

# 5. **Core Features (MVP)**

## 👇 **Already Implemented**

### **1. AI Tutor**

Conversational learning for any subject with smart explanations.

### **2. AI Exam Maker**

Generate quizzes, structured questions, and mock tests instantly.

### **3. AI Exam Marker**

Upload answers → receive instant marking with detailed feedback.

### **4. AI Revision Tools**

Summaries, flashcards, corrections, explanations.

### **5. User Authentication**

Secure login via Supabase.

### **6. Modern Dashboard UI**

Clean, responsive, dark/light mode support.

---

# 6. **Future Features (Vision Roadmap)**

### 🔜 **Short-Term (1–3 months)**

* Voice AI Tutor (real-time conversation)
* AI Debate Trainer
* Student performance analytics
* Teacher dashboard 1.0
* School announcements module v2
* File uploads for exams & lessons

### 🚀 **Mid-Term (3–9 months)**

* Full school management suite
* Attendance system
* Results tracking
* Timetable management
* Homework automation
* Smart notifications
* Parent accounts

### 🧠 **Long-Term Vision (1–3 years)**

* Region-specific curriculum engines
* Adaptive learning engine
* Fully automated exam generator with difficulty progression
* ACYRX Mobile App (iOS/Android)
* Offline learning mode
* Global teacher marketplace

---

# 7. **Target Users**

### 🎓 Students

Ages 10–24
Need homework help, exam prep, study guidance

### 🍎 Teachers

Needing faster marking, smart lesson plans, class insights

### 🏫 Schools

Want automation, efficiency, improved communication

### 👨‍👩‍👧 Parents (future)

Want visibility into student progress

---

# 8. **Success Metrics (KPIs)**

### 📘 Student Success

* Avg. study time per day
* Improvement percentage
* Test scores over time
* Retention rate

### 🍎 Teacher Efficiency

* Time saved marking
* Automated work volume
* Lesson plan usage

### 🏫 School Adoption

* # of schools onboarded
* Daily active users
* Feature usage metrics

---

# 9. **Competitive Advantage**

ACYRX stands out through:

### 🚀 1. AI-first design

Not an add-on — AI is at the core of learning and operations.

### 🎨 2. Beautiful and modern UI

Clean, smooth, responsive, and student-friendly.

### ⚡ 3. Speed + Simplicity

Super fast experience powered by Next.js + Vercel.

### 🔐 4. Secure and scalable authentication

Supabase-native user management.

### 🌍 5. Global readiness

Designed to scale internationally.

---

# 10. **Technology Stack**

* **Next.js 14**
* **TypeScript**
* **Supabase (DB + Auth)**
* **shadcn/ui**
* **Tailwind CSS**
* **OpenAI (AI models)**
* **Vercel (hosting)**

---

# 11. **Long-Term Vision Summary**

ACYRX is not just a website.
It’s a **complete AI-powered education ecosystem** being built for:

* Students
* Teachers
* Schools
* Parents

Our vision is to become the **world’s most efficient AI-powered education platform**, blending:

* Personalization
* Automation
* Accessibility
* Intelligence
* Beautiful design

Education re-imagined.

---

If you want, I can now generate:

### 👉 1. Full **System Architecture Document**

### 👉 2. Full **Business Plan**

### 👉 3. **Pitch Deck**

### 👉 4. **Investor 1-Pager**

### 👉 5. **Brand Identity kit**

Which one next?
