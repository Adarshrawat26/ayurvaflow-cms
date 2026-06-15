# Kairali CMS — Design System & Product Spec

**Product:** AyurvaFlow / Kairali CMS  
**Client:** Kairali Ayurvedic Centre (Gurgaon)  
**Version:** 1.0 · June 2026

---

## 1. Product overview

Kairali CMS is a clinic management platform for Ayurveda centres. It serves two audiences from one codebase:

| Surface | Users | Purpose |
|---------|-------|---------|
| **Staff CMS** | Admin, reception, doctors, therapists | Run the clinic day-to-day |
| **Patient portal** | Registered & new patients | Book follow-ups, view care, documents |

**Design principles**

- **Calm & clinical** — green palette inspired by Ayurveda / nature; white cards on soft gray backgrounds
- **Mobile-first for patients** — bottom navigation, large tap targets, minimal chrome
- **Desktop-first for staff** — sidebar navigation, dense data tables, calendar views
- **Role-aware** — each staff role sees only what they need

---

## 2. Brand identity

### Logo

- **Component:** `src/components/Logo.tsx` (inline SVG)
- **Mark colours:** gold `#eaaf1e`, bronze `#bc832c`, sage `#899835`
- **Favicon:** green rounded square `#1B4332` with mark (`public/favicon.svg`)

### Wordmark

- Product name: **Kairali CMS**
- Clinic context shown in header: e.g. *Kairali Ayurvedic Centre*

---

## 3. Colour palette

### Primary (UI chrome)

| Token | Hex | Usage |
|-------|-----|--------|
| **Forest** | `#1B4332` | Primary buttons, active nav, avatars, headings accent |
| **Forest dark** | `#163828` | Button hover |
| **Forest tint** | `#1B4332/10` | Active nav background, subtle highlights |
| **Mint** | `#52B788` | Success dots, progress bars, appointment indicators |
| **Sage light** | `#A8D5B5` | Login panel subtitle (staff) |

### Neutrals

| Token | Usage |
|-------|--------|
| `gray-50` | Page background |
| `gray-200` | Borders, dividers |
| `gray-500` | Labels, secondary text |
| `gray-900` | Primary text |
| `white` | Cards, headers, nav bars |

### Semantic

| State | Colours |
|-------|---------|
| **Success / paid** | `#52B788`, green-50 borders |
| **Warning / balance due** | amber-50, amber-700, amber-900 |
| **Error** | red-50, red-600 borders |
| **Info / scheduled** | blue-50, blue-700 |

### Theme meta

```html
<meta name="theme-color" content="#1B4332" />
```

---

## 4. Typography

System font stack (no custom webfonts — fast load, native feel).

| Role | Classes | Size |
|------|---------|------|
| Page title | `.page-title` | `text-lg font-semibold` |
| Section heading | — | `text-sm font-semibold` |
| Body | — | `text-sm` |
| Label | `.label` | `text-xs font-medium text-gray-500` |
| Micro / meta | — | `text-[10px]` |
| Portal nav | — | `text-[10px] font-medium` |

**Hierarchy example**

```
Hi, Priya                    ← text-sm font-semibold
KACPL/2026/001/GRG          ← text-[10px] text-gray-400
```

---

## 5. Spacing & layout

### Grid

- **Max content width (portal):** `max-w-lg` (512px) — centred, phone-like
- **Staff content:** full width inside sidebar layout
- **Sidebar width:** `w-56` (224px), fixed left on `lg+`

### Radius

| Element | Radius |
|---------|--------|
| Cards | `rounded-xl` (12px) |
| Buttons, inputs | `rounded-lg` (8px) |
| Calendar day cells | `rounded-xl` |
| Modals (mobile) | `rounded-t-2xl` |
| Avatars | `rounded-full` |

### Breakpoints (Tailwind)

| Breakpoint | Staff nav | Patient nav |
|------------|-----------|-------------|
| `< lg` (mobile/tablet) | Bottom tab bar | Bottom tab bar |
| `≥ lg` (desktop) | Left sidebar | Top tab bar (`md+`) |

---

## 6. Core components

Defined in `src/index.css` `@layer components`:

```css
.card          → white, rounded-xl, border gray-200
.btn-primary   → forest green, white text
.btn-outline   → gray border, subtle hover
.input-field   → full width, focus ring forest/30
.label         → xs, medium, gray-500
.page-title    → lg, semibold
```

### Shared UI (`src/lib/ui.tsx`)

| Component | Purpose |
|-----------|---------|
| `EmptyState` | Icon + title + description for empty lists |
| `Badge` | Small status pills |
| `CheckRow` | Consent / checkbox rows in forms |
| `Field` | Labelled input/textarea for registration forms |

### Modals (`src/components/ModalShell.tsx`)

- **Desktop:** centred dialog, fade + scale
- **Mobile:** bottom sheet, drag-to-dismiss, swipe handle
- Used for: registration guide, appointment detail, forms

### Feedback

- **Toasts:** Sonner (`AppToaster.tsx`)
- **Loading:** spinning ring `border-[#1B4332] border-t-transparent`
- **Errors:** red-50 card with message + retry button

---

## 7. Navigation patterns

### Staff CMS (`src/pages/Layout.tsx`)

```
Desktop (lg+)
┌──────────┬─────────────────────────────┐
│ Sidebar  │ Topbar (page title)         │
│ Logo     ├─────────────────────────────┤
│ Nav      │                             │
│ items    │ Page content                │
│          │                             │
│ Sign out │                             │
└──────────┴─────────────────────────────┘

Mobile (< lg)
┌─────────────────────────────────────┐
│ Topbar: title + sign out              │
├─────────────────────────────────────┤
│                                       │
│ Page content                          │
│                                       │
├─────────────────────────────────────┤
│ [Home][Patients][Calendar]… scroll → │
└─────────────────────────────────────┘
```

**Role-based pages**

| Role | Pages |
|------|-------|
| Admin | Dashboard, Patients, Appointments, Treatments, Consultations, Billing, Settings |
| Receptionist | Dashboard, Patients, Appointments, Billing |
| Doctor | Dashboard, Patients, Appointments, Consultations, Treatments |
| Therapist | Dashboard, Appointments, Treatments |

### Patient portal (`src/pages/PatientPortal.tsx`)

```
Header: avatar + "Hi, {name}" + reg number + sign out

Mobile bottom nav:
[Calendar] [Care] [Balance] [Docs]

Registered member tabs:
- My calendar → booking flow
- My care → treatment progress
- My balance → invoices (if due)
- My documents → KYC uploads

New patient tabs:
- One-Time Registration → registration onboarding guide
- Documents → upload optional docs
```

---

## 8. Key screens

### 8.1 Login (`Login.tsx`)

- Split layout: forest-green brand panel (desktop) + form card
- Toggle: **Staff** | **Patient Portal**
- Dev-only quick-fill buttons (hidden in production build)

### 8.2 Dashboard

- KPI cards: patients, appointments, revenue, referrals
- Charts: revenue bar, referral pie, condition breakdown
- Role: landing page for all staff

### 8.3 Patients

- Searchable table + patient detail drawer
- Tabs: Overview · History · Registration · Documents
- One-time registration form (3-page wizard + PDF + e-sign)

### 8.4 Appointments

- Week / day / list views
- Time-grid calendar with doctor filter
- Status workflow: Scheduled → Arrived → In progress → Completed
- Mini month picker (desktop sidebar)

### 8.5 Patient portal booking (`PortalBooking.tsx`)

**3-step flow**

```
1. Pick time     → week strip + slot grid
2. Pay           → UPI / Card / Net banking (simulated)
3. Done          → confirmation code CFM-{id}-{txn}
```

- **Full calendar modal:** month view + upcoming/past visits
- Care doctor slots only (personalised portal)

### 8.6 Consultations

- Tabbed form: Complaints · Assessment · Plan
- Ayurvedic suggestion chips (pulse, tongue, prakriti, etc.)

### 8.7 Billing

- Invoice list, GST line items, partial payments
- Print-friendly invoice layout

---

## 9. Motion & interaction

| Pattern | Library | Usage |
|---------|---------|-------|
| Page transitions | Framer Motion | Fade + slide on route change |
| Nav pill | `layoutId="nav-pill"` | Active sidebar item |
| Modal enter/exit | AnimatePresence | Sheet slide up / dialog scale |
| Button feedback | `active:scale-95` | Primary buttons |
| Drawer swipe | drag controls | Staff mobile drawer (removed — bottom nav now) |

**Timing:** ~180–220ms page transitions; spring damping 30 for modals.

---

## 10. Icons

**Library:** [Lucide React](https://lucide-react.dev)

| Context | Icons |
|---------|-------|
| Nav | `Gauge`, `UserRound`, `CalendarClock`, `HeartPulse`, `ClipboardPlus`, `Receipt`, `SlidersHorizontal` |
| Portal | `CalendarClock`, `FileText`, `HeartPulse`, `Receipt`, `LogOut` |
| Actions | `Plus`, `ChevronLeft/Right`, `Loader2`, `Download`, `Upload` |

**Stroke:** 1.75 default; 2.25 when active (portal bottom nav).

---

## 11. Forms & validation

- **React Hook Form** + **Zod** for complex forms (registration)
- Inline field errors: `text-xs text-red-500`
- Required fields marked in labels
- File uploads: PDF, JPEG, PNG — max 5 MB (documents)

### Registration number format

```
KACPL/{year}/{seq}/GRG
Example: KACPL/2026/001/GRG
```

---

## 12. Accessibility notes

- `aria-label` on icon-only buttons (sign out, nav)
- `aria-current="page"` on active nav items
- Logo: `aria-label="Kairali logo"`
- Modals: `role="dialog"`, `aria-modal="true"`
- Focus rings on inputs: `focus:ring-2 focus:ring-[#1B4332]/30`
- Safe area insets on mobile bottom nav: `env(safe-area-inset-bottom)`

---

## 13. File map (design-relevant)

```
src/
├── index.css              # Design tokens + utility classes
├── components/
│   ├── Logo.tsx           # Brand mark
│   ├── ModalShell.tsx     # Sheet / dialog
│   ├── portal/            # Patient portal UI
│   │   ├── PortalBooking.tsx
│   │   ├── PortalCalendarModal.tsx
│   │   └── BookingConfirmation.tsx
│   ├── OneTimeRegistrationForm.tsx
│   └── ui/                # shadcn/Radix primitives
├── pages/
│   ├── Layout.tsx         # Staff shell
│   ├── PatientPortal.tsx  # Patient shell
│   ├── Login.tsx
│   └── …                  # Feature pages
public/
└── favicon.svg
```

---

## 14. Design do's & don'ts

**Do**

- Use forest green `#1B4332` for primary actions — one clear CTA per screen
- Keep patient portal minimal — name, next action, one primary task
- Use cards to group related content
- Show INR amounts with `toLocaleString('en-IN')` and ₹ prefix

**Don't**

- Don't use multiple competing greens — stick to the palette above
- Don't show staff-only features in patient portal
- Don't use dark mode yet (not implemented)
- Don't embed demo credentials in production builds

---

## 15. Future design backlog

| Item | Priority |
|------|----------|
| Razorpay payment UI (real checkout) | High |
| Dark mode tokens | Low |
| Hindi / regional language support | Medium |
| Printable registration PDF brand refresh | Medium |
| Staff mobile appointment quick-actions | Low |

---

*For technical architecture see `README.md`. For deployment see Railway section in README.*
