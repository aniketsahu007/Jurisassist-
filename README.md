# JurisAssist

### AI-Powered Legal Case Intelligence Platform

JurisAssist is an AI-powered legal-tech platform designed to help lawyers manage, organize, and research complex case information.

Lawyers often deal with large numbers of FIRs, chargesheets, judgments, and other legal documents. JurisAssist aims to reduce the manual effort involved in organizing these documents, understanding case history, finding potentially relevant cases, and identifying patterns across previous cases.

## 🚀 Current Progress

This repository currently contains the **frontend landing page and authentication UI**.

### Implemented

* Premium 3D landing page
* Interactive 3D legal-tech visualizations
* JurisAssist branding
* Responsive UI
* Login page
* Signup UI
* Glassmorphism-based interface
* Interactive animations and hover effects
* Frontend-only authentication placeholders

### Planned

The following features will be integrated by the team:

* User authentication
* Legal document upload
* OCR for scanned documents
* Case information extraction
* Automatic case timeline generation
* Similar-case retrieval
* Indian legal case research
* RAG-based legal research assistant
* Case pattern detection
* Lawyer-specific case memory
* AI-generated case summaries
* Backend and database integration
* WhatsApp integration

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Vite
* 3D/animation libraries used by the project

### Planned Backend

* Python
* FastAPI
* PostgreSQL
* Redis
* Vector database
* OCR/NLP pipeline
* LLM + RAG

## 💻 Running the Project Locally

### Prerequisites

Make sure you have:

* Node.js
* npm
* Git

### Clone the repository

```bash
git clone <repository-url>
cd cortex-legal-orb
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The terminal will provide a local URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## 📁 Project Structure

The main frontend code is located inside:

```text
src/
```

Other important directories/files include:

```text
public/          → Images and static assets
src/components/ → Reusable UI components
src/             → Main application code
package.json     → Project dependencies and scripts
```

## 🔐 Environment Variables

If environment variables are required in the future, create a local `.env` file.

**Do not commit API keys, passwords, database credentials, or other secrets to GitHub.**

Use `.env.example` to document required variables without exposing their values.

## 🤝 Team Development

This repository is the shared source of truth for the JurisAssist project.

Before starting work:

```bash
git pull
```

After making changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

Coordinate with the team before making major structural changes.

## ⚠️ Disclaimer

JurisAssist is intended to provide **AI-assisted legal research and case-management support**. It is not intended to replace qualified legal professionals or provide guaranteed legal conclusions.

---

### JurisAssist

**Turn Legal Complexity Into Intelligence.**

