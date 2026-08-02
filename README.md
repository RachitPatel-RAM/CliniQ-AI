# CliniQ AI — Multilingual Clinical Intake Platform

CliniQ AI is an AI-powered clinical patient intake assistant built with **Next.js 15**, **Express.js**, **Ollama (Gemma 3:4b)**, and **Firebase Realtime Database**.

## Features

- **Multilingual Voice Intake**: Support for Gujarati (ગુજરાતી), Hindi (हिन्दी), and English using Web Speech API.
- **AI Clinical Extraction**: Structured SOAP-style reporting powered by Gemma 3:4b local LLM.
- **Real-Time Data Persistence**: Instant synchronization with Firebase Realtime Database.
- **Doctor Dashboard**: Isolated physician portal to view, filter, and review patient intake queues.
- **PDF Export**: Download pixel-perfect clinical intake reports in PDF format.

## Architecture

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Zustand
- **Backend**: Express.js REST API (`http://localhost:3001`)
- **AI Engine**: Ollama Gemma 3:4b model (`http://localhost:11434/api/chat`)
- **Database**: Firebase Realtime Database

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to start patient intake.  
Physicians can access the queue at `http://localhost:3000/doctor`.
