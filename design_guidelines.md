# PsychWebMD Design Guidelines

## Design Approach

**Reference-Based Healthcare Design** - Drawing inspiration from Brightside's compassionate warmth and Talkiatry's clean professionalism. This creates a trustworthy, accessible experience that reduces anxiety around seeking behavioral health care.

**Key Design Principles:**
- Compassionate accessibility over clinical sterility
- Clear pathways to care with minimal friction
- Trust-building through visual warmth and professionalism
- Mobile-first responsive design for on-the-go access

## Typography System

**Font Stack:**
- Primary: 'Inter' or 'DM Sans' (Google Fonts) - Clean, highly readable for body text and UI
- Headings: Same family, varying weights for hierarchy

**Type Scale:**
- Hero headline: text-5xl/text-6xl (bold, max-w-4xl)
- Section headings: text-3xl/text-4xl (semibold)
- Card titles: text-xl (semibold)
- Body text: text-base/text-lg (regular)
- Small text/captions: text-sm (medium)

**Hierarchy Rules:**
- Hero sections use large, bold statements with generous line-height (leading-tight for headings, leading-relaxed for subtext)
- Service cards maintain consistent title sizing
- Form labels: text-sm font-medium
- CTA buttons: text-base/text-lg font-semibold

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16, 20, 24, 32
- Component padding: p-6 to p-8
- Section vertical spacing: py-16 to py-24 on desktop, py-12 on mobile
- Card gaps: gap-6 to gap-8
- Form field spacing: space-y-6

**Container Strategy:**
- Max-width containers: max-w-7xl for full sections, max-w-4xl for forms and focused content
- Hero sections: Full-width backgrounds with centered max-w-6xl content
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for service cards
- Form layouts: Single column max-w-2xl for optimal readability

## Component Library

### Navigation
- Sticky header with logo left, nav center/right
- Transparent on hero with subtle backdrop blur
- CTA button (Book Appointment) prominently positioned
- Mobile: Hamburger menu with slide-in drawer

### Hero Section
- Large hero image with warm, diverse patients in consultation/smiling
- Overlaid content with backdrop-blur-sm on button containers
- Primary headline emphasizing care and accessibility
- Dual CTAs: "Book Appointment" (primary) and "Learn More" (secondary outline)
- Trust indicators: Insurance logos or "Accepting New Patients" badge

### Appointment Booking System
**Appointment Type Selection:**
- Three large cards in grid (md:grid-cols-3)
- Icons with titles: "New Patient", "Existing Patient", "Intake Form"
- Brief descriptions below each
- Hover state: subtle shadow lift (shadow-lg)

**Multi-Step Form:**
- Progress indicator at top (numbered steps with connecting lines)
- Steps: 1) Appointment Type → 2) Personal Info → 3) Insurance → 4) Medical History → 5) Preferences → 6) Review & Submit
- Form fields: Consistent input styling with labels above, helper text below
- Required field indicators (asterisk or "Required" text)
- Navigation: "Back" and "Next/Submit" buttons at bottom
- Validation: Inline error messages in red below fields

### Service Cards
- Grid layout: 3 or 4 columns on desktop
- Card structure: Icon top, title, 2-3 line description, "Learn More" link
- Icons: Use Heroicons outline style, size-8 to size-12
- Rounded corners: rounded-xl
- Hover: Subtle scale transform (hover:scale-105 transition)
- White background with shadow-md

### Insurance Display
- Horizontal scrolling logo strip on mobile
- Grid on desktop showing 6-8 major insurers
- Grayscale logos with hover color reveal
- "and more" indicator

### Contact & Locations
- Two-column layout: Contact form | Location cards
- Location cards show: Office name, address, phone, map link
- Office hours clearly displayed

### FAQ Section
- Accordion pattern with expand/collapse
- Clean dividers between questions
- Icons indicate open/closed state

## Images

**Hero Image:**
- Large, full-width hero image (1920x800px minimum)
- Subject: Warm, professional provider-patient interaction or diverse patients smiling
- Tone: Natural lighting, authentic, not stock-photo feel
- Placement: Top of landing page behind hero content

**Additional Images:**
- Services section: Optional small icons (can use icon library instead)
- About section: Provider team photo or welcoming office space (800x600px)
- Testimonials: Patient headshots if available (small circular crops)

**Image Treatment:**
- Hero: Slight overlay gradient for text readability
- All images: rounded-lg or rounded-xl corners
- Lazy loading for performance

## Accessibility Standards

- WCAG 2.1 AA compliance minimum
- Form inputs: Proper labels, aria-labels, focus states with visible outlines
- Color contrast: Minimum 4.5:1 for body text, 3:1 for large text
- Keyboard navigation: Full tab order through all interactive elements
- Focus indicators: ring-2 ring-offset-2 on interactive elements
- Screen reader support: Semantic HTML, aria-labels on icons

## Animation Strategy

**Minimal, Purposeful Animations:**
- Page transitions: Subtle fade-in on scroll for section reveals
- Form progression: Smooth height transitions between steps
- Hover states: transform scale-105 with transition-all duration-200
- Loading states: Spinner for form submissions
- Avoid: Distracting parallax, excessive motion that could trigger anxiety

## Responsive Breakpoints

- Mobile-first approach
- Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
- Navigation: Hamburger below md:
- Service grid: 1 column mobile, 2 columns tablet, 3-4 desktop
- Forms: Always single column, max-w-2xl

## Form Design Specifics

- Input fields: h-12, rounded-lg, border-2, focus:ring-2
- Dropdowns: Custom styled to match inputs
- Radio/Checkbox: Larger touch targets (min 44x44px)
- Date picker: Native or accessible calendar widget
- Textarea: min-h-32 for adequate space
- Error states: Red border, text-red-600 message below
- Success states: Green checkmark, text-green-600 confirmation