# 📝 Notes App

A modern, responsive note-taking application built with Next.js and Supabase modeled after Google Keep.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **Deployment**: Vercel

## ✨ Features

### Core Functionality
- Create, read, update, delete notes
- Pin/unpin notes
- Color-code notes (6 color options)
- Search across note titles and content
- Responsive design

### UI/UX
- Modern, clean interface
- Card-based note layout
- Hover interactions
- Toast notifications
- Mobile-friendly

## 📂 Project Structure
```
notes-app/
├── app/               # Next.js app router
├── components/        # React components
│   ├── ui/            # Shadcn UI components
│   └── ...            # Custom components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions, Supabase client
├── public/            # Static assets
└── styles/            # Global styles
```

## 🎯 Acceptance Criteria
- [x] Real-time data persistence
- [x] Optimistic UI updates
- [x] Error handling
- [x] Type-safe development
- [x] Accessible design
- [x] Performance optimized

## 📝 Getting Started
1. Clone the repository
2. Install dependencies
3. Set up Supabase project
4. Configure environment variables
5. Run `npm run dev`

## 🚀 Quick Start

### Setup

## 1. Install dependencies
```bash
 npm install
```
## 2. Environment
Create .env.local with Supabase credentials
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development
Run local development server
```bash
npm run dev
```
### Scripts
```bash
npm run dev     (start dev server)
npm run build   (production build)
npm run start   (run production build locally)
```

## 🔧 Troubleshooting
- 400 Bad Request on insert/update
    Make sure your Supabase table has all columns used by the app (color, pinned, etc.). The payload must match column names.

- “Could not find the 'color' column”
    Add the color text column (default 'default'), then redeploy/rerun.

- Cannot update/delete (RLS errors)
    In dev, use permissive policies (allow all). In prod, write proper auth-based policies.

- Pinned notes don’t move
    Ensure the client sorts: pinned first, then created_at desc. (This repo’s page.tsx already does it.)

### Deploy on Vercel
1. Connect repository to Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License: MIT
