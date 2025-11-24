# PsychWebMD - Behavioral Healthcare Web Application

## Project Overview
PsychWebMD is a comprehensive behavioral healthcare web application designed to provide compassionate, personalized mental health services. The platform offers both in-person and online care with a focus on user-friendly appointment booking and provider matching.

## Technology Stack
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage)
- **Routing**: Wouter (React)
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query (React Query)

## Key Features
1. **Landing Page**
   - Hero section with prominent appointment booking CTA
   - Comprehensive services showcase (12 behavioral health services)
   - About section highlighting compassionate care philosophy
   - Insurance providers display
   - FAQ accordion
   - Contact information and locations (Jamestown, Olean, Ridgway)

2. **Appointment Booking System**
   - Three appointment types: New Patient, Existing Patient, Intake Form
   - Multi-step form with progress indicator
   - Steps include:
     - Personal Information
     - Insurance Information
     - Medical History (for new/intake)
     - Symptoms & History (for intake)
     - Appointment Details & Preferences
   - Comprehensive validation and error handling

3. **Services Offered**
   - Psychiatric Evaluations
   - Psychotherapy
   - Medication Management
   - Child/Adolescent Therapy
   - Spravato (esketamine treatment)
   - TMS (Transcranial Magnetic Stimulation)
   - Couples Therapy
   - Group Therapy
   - DBT Skill Therapy
   - Schema Therapy
   - Play Therapy
   - General Wellness

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── InsuranceSection.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── AppointmentForm.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── BookAppointment.tsx
│   │   │   └── not-found.tsx
│   │   ├── lib/              # Utilities and data
│   │   │   ├── services-data.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # In-memory storage
│   └── vite.ts               # Vite integration
├── shared/
│   └── schema.ts             # Shared data schemas
└── attached_assets/          # Static assets (logo)
```

## Design System
- **Primary Color**: Teal (#17A2B8) - Matches PsychWebMD branding
- **Typography**: Inter font family
- **Spacing**: Consistent 4, 6, 8, 12, 16, 20, 24, 32px scale
- **Components**: Shadcn UI components with custom theming
- **Responsive**: Mobile-first approach with breakpoints at sm, md, lg, xl

## API Endpoints (To Be Implemented)
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get specific appointment
- `POST /api/contact` - Submit contact form

## Data Models
- **Appointment**: Comprehensive patient and appointment information
- **ContactSubmission**: Contact form submissions

## Running the Application
```bash
npm run dev
```
The application runs on port 5000 (frontend) with Express backend on the same port using Vite's proxy.

## Contact Information
- **Email**: info@psychwebmd.com
- **Phone**: +1 (716) 526-4041
- **Fax**: +1 (716) 526-4161

## Locations
1. Jamestown, NY - 1465 Foote Avenue, Jamestown, NY 14701
2. Olean, NY - 237 Delaware Ave, Olean, NY 14760 | +1 (716) 790-8847
3. Ridgway, PA - 20 Gillis Ave, Ridgway, PA 15853 | +1 (814) 772-5741

## Office Hours
- Monday - Friday: 9:00 AM - 5:00 PM
- Saturday - Sunday: Closed

## Recent Changes
- **Database Integration**: Migrated to PostgreSQL with Drizzle ORM (December 2024)
- **Professional Healthcare Imagery**: 
  - Generated 6 hero/background images for Hero, About, and Journey sections
  - Generated 12 unique service-specific background images (70% opacity with gradients)
  - Generated 10 custom service category icons with teal branding
- **Logo Update**: Replaced with new PsychWebMD logo site-wide
- **Routing**: Added /book alias to prevent 404 errors  
- Initial project setup with React + Express fullstack
- Implemented teal color scheme matching PsychWebMD branding
- Created comprehensive landing page with all sections
- Built multi-step appointment booking system with three types
- Added form validation using Zod and React Hook Form
- Implemented responsive design for mobile and desktop
- Created reusable component library with Shadcn UI
