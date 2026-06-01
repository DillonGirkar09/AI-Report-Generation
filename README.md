# ForceEquals AI-Powered Report Generator

A full-stack, real-time AI-powered report and data analytics dashboard. The application is built with a sleek two-panel layout: an interactive conversation chat on the left and a live, dynamically rendered report panel on the right (similar to Claude's Artifacts).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Google Fonts (Inter)
- **Backend**: Express.js (Node.js) on Port 3001, CORS Enabled
- **AI Engine**: Anthropic Claude API (`claude-sonnet-4-20250514`) via the official `@anthropic-ai/sdk`
- **Data Layer**: 100% in-memory / stateful React pipeline

---

## 📦 Project Structure

```text
/
├── backend/
│   ├── index.js          (Express server & middleware bootstrap)
│   ├── routes/
│   │   └── report.js     (POST /api/report Anthropic controller)
│   ├── package.json      (Express, CORS, SDK, Dotenv dependencies)
│   └── .env              (Private environment config)
├── frontend/
│   ├── app/
│   │   ├── layout.js     (Root App shell, Metadata, and Inter Font setup)
│   │   ├── page.js       (Central coordinate state and split container)
│   │   └── globals.css   (Animations, WebKit custom scrollbar utility)
│   ├── components/
│   │   ├── ChatPanel.jsx    (Auto-scrolling prompt log and input panel)
│   │   ├── ReportPanel.jsx  (Artifact panel holding empty/loading/report states)
│   │   ├── MetricCard.jsx   (Sleek KPI indicators with trend color badges)
│   │   ├── BarChart.jsx     (CSS-transition bar graphs with dynamic HSL fills)
│   │   └── InsightBlock.jsx (Accent-bordered strategic takeaways)
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Setup & Execution Guide

### 1. Backend Setup & Startup

First, open a terminal window, move to the backend directory, and install its required Node packages:

```bash
cd backend
npm install
```

Configure your Anthropic environment credentials by copying the `.env.example` file:

```bash
cp .env.example .env
```

Open `backend/.env` in your text editor and supply your official Claude developer key:

```env
ANTHROPIC_API_KEY=sk-ant-your_key_here
PORT=3001
```

> [!TIP]
> **Developer Mock Mode**: If `ANTHROPIC_API_KEY` is not provided or remains at `'your_key_here'`, the server will automatically transition to **Mock Mode**. In Mock Mode, the server generates rich, context-aware, schema-compliant mock responses instantly, letting you preview and explore the entire responsive frontend UI without spending API credits or needing an active Anthropic key!

Launch the Express server:

```bash
node index.js
```

The backend server will run securely at **`http://localhost:3001`**.

---

### 2. Frontend Setup & Startup

In a second terminal window, move to the frontend directory and install the Next.js dependencies:

```bash
cd frontend
npm install
```

Launch the hot-reloading Next.js local development web server:

```bash
npm run dev
```

The frontend client dashboard will open at **`http://localhost:3000`**.

---

## 🛡️ Robust Schema Validation

To guarantee absolute visual uptime, the frontend's `<ReportPanel />` processes the AI's returned JSON through a validation pipeline:
- Any property omission (like custom charts or list items) defaults gracefully to a standard safe fallback (such as empty list arrays `[]` or standard string keys `""`).
- High-performance, reactive CSS-width transition blocks are protected from numeric conversion failures (automatically clamping undefined or non-numerical metrics).
- This prevents the React application shell from crashing, regardless of formatting inconsistencies from frontier models.
