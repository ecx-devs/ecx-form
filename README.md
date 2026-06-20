# ECX Forms

<div align="center">
  <h1>
    <span style="color: #2699e3">E</span><span style="color: #fab12d">C</span><span style="color: #f2443f">X</span> Forms
  </h1>
  <p><strong>A powerful, beautiful form builder for Engineering Career Expo</strong></p>
</div>

## 🎯 Overview

ECX Forms is a proprietary data collection platform designed to replace Google Forms with a clean, branded experience. Built with modern technologies and following best practices in software architecture.

## ✨ Features

- **Form Builder** - Drag-and-drop question editor with Google Forms-like UI
- **Multiple Question Types** - Short text, long text, numbers, multiple choice, checkboxes, dropdown, file upload
- **Auto-Save** - Changes are saved automatically, no save button needed
- **No Login Required** - Frictionless submission for respondents
- **Response Management** - View, filter, and export submissions to Excel/JSON
- **Mobile Responsive** - Optimized for all screen sizes
- **ECX Branding** - Consistent with ECX brand identity

## 🏗️ Architecture

### Backend (Clean Architecture)

```
backend/
├── src/
│   ├── domain/           # Entities, Value Objects, Repository Interfaces
│   ├── application/      # Use Cases, DTOs
│   ├── infrastructure/   # Supabase Repositories, Services
│   └── interfaces/       # HTTP Controllers, Routes, Middleware
```

### Frontend (Feature Sliced Design)

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── widgets/          # Page-level components (FormBuilder, PublicForm)
│   ├── features/         # Business features (question-editor, form-settings)
│   ├── entities/         # Business entities (form, question, submission)
│   └── shared/           # UI Kit, API client, utilities
```

## 🔐 Authentication

ECX Forms uses session-based authentication for admin access. Public form submissions do not require authentication.

### Default Admin Credentials

| Email | Password |
|-------|----------|
| `admin@ecx.com.ng` | `ecx@2026!` |

> **Note:** Change the default password in production by updating the database migration or using the Supabase dashboard.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file:
   ```env
   PORT=3001
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   FRONTEND_URL=http://localhost:3000
   MAX_FILE_SIZE_MB=2
   ```

3. Run database migrations in Supabase SQL editor:
   - `001_initial_schema.sql` - Forms and submissions tables
   - `002_storage_bucket.sql` - File storage bucket
   - `003_admins_table.sql` - Admin users and sessions (seeds default admin)

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/logout` | Logout current session |
| GET | `/api/v1/auth/me` | Get current admin info |

### Form Management (Admin - Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/forms` | Create new form (Draft) |
| GET | `/api/v1/forms` | List all forms |
| GET | `/api/v1/forms/:id/admin` | Get form for editing |
| PUT | `/api/v1/forms/:id` | Update form (auto-save) |
| PATCH | `/api/v1/forms/:id/publish` | Publish form |
| DELETE | `/api/v1/forms/:id` | Delete form |

### Public Access

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/public/forms/:ecx_id` | Get published form |
| POST | `/api/v1/public/forms/:ecx_id/submit` | Submit response |

### Results & Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/forms/:id/submissions` | List responses |
| GET | `/api/v1/forms/:id/export?format=xlsx` | Export data |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload/sign` | Get signed upload URL |

## 🎨 ECX Brand Colors

| Color | Name | Hex |
|-------|------|-----|
| 🔵 | ECX Blue (Dart) | `#2699e3` |
| 🟡 | ECX Yellow (Swift) | `#fab12d` |
| 🔴 | ECX Red (Ruby) | `#f2443f` |

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand, TanStack Query |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |

## 📱 ID System

| Entity | Format | Example |
|--------|--------|---------|
| Form ID | ECXF + 4 Letters | ECXFABCD |
| Submission ID | [Form ID] + - + 4 Digits | ECXFABCD-0001 |

## 🚀 Production Deployment

### Frontend (Netlify)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy from frontend directory:**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=.next
   ```

   Or connect via GitHub for auto-deploy:
   ```bash
   netlify init
   ```

4. **Set Environment Variables in Netlify Dashboard:**
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api/v1`
   - `NEXT_PUBLIC_APP_URL` = `https://forms.ecx.com.ng`

### Backend (Render)

1. **Push code to GitHub**

2. **Create new Web Service on Render:**
   - Go to [render.com](https://render.com) → New → Web Service
   - Connect your GitHub repository
   - Select the `backend` folder as root directory

3. **Configure Build & Start Commands:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Set Environment Variables in Render Dashboard:**
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://forms.ecx.com.ng
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   MAX_FILE_SIZE_MB=2
   ```

5. **Deploy** - Render will auto-deploy on push to main branch

### Quick Deploy Commands

**Frontend (Netlify):**
```bash
# One-time setup
cd frontend
netlify init

# Deploy
npm run build && netlify deploy --prod
```

**Backend (Render):**
```bash
# Push to trigger auto-deploy
git add .
git commit -m "Deploy to production"
git push origin main
```

### Production URLs

| Service | URL |
|---------|-----|
| Frontend | `https://forms.ecx.com.ng` |
| Backend API | `https://ecx-forms-api.onrender.com` |
| API Docs | `https://ecx-forms-api.onrender.com/api/v1/docs` |

## 🤝 Contributing

1. Follow the existing code style and architecture patterns
2. Write meaningful commit messages
3. Update documentation as needed

## 📄 License

Proprietary - Engineering Career Expo

---

<div align="center">
  <p>Built with ❤️ by ECX Team</p>
</div>

