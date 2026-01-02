# Nihongo

Nihongo is a modern, interactive Japanese language learning application designed to help you master Hiragana, Katakana, and N5 Kanji. Built with React and optimized for mobile via Capacitor, it offers a smooth, engaging study experience.

## Features

- **Dashboard**: Track your daily progress, streaks, and total characters learned at a glance.
- **Study Mode**:  Focused learning sessions for new characters and vocabulary.
- **Revision System**:  Smart revision queue to reinforce what you've learned.
- **Quizzes**:  Test your knowledge and retention with interactive quizzes.
- **Session Management**: Support for multiple user profiles/sessions on a single device.
- **Personalization**:
  - Light and Dark themes.
  - Customizable daily learning goals.
- **Mobile Optimized**: Built with a mobile-first approach, featuring a bottom tab bar navigation and responsive design.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, Framer Motion (for animations)
- **Mobile**: Capacitor 8 (Android)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nihongo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/src`
  - `/components`: Reusable UI components.
  - `/pages`: Main application views (Dashboard, Study, Quiz, etc.).
  - `/data`: Static data for characters and kanji.
  - `App.tsx`: Main application logic and state management.
