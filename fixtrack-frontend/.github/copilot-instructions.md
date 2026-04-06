# FixTrack Frontend — AI Agent Instructions

## Project Overview

**FixTrack** is a React+Vite maintenance ticket management system with role-based dashboards. The app uses **Material-UI (MUI)** for components, **React Router** for navigation, and **localStorage** for session persistence.

**Tech Stack:** React 19, Vite, MUI 7, React Router 7, Emotion (MUI theming)

---

## Architecture & Data Flows

### Authentication & Session Management

- **Single source of truth:** `AuthContext.jsx` provides `user` object and `isAuth` boolean via `useAuth()` hook
- **Persistence:** `localStorage.getItem("currentUser")` stores user object; validated on mount (checks `id` field exists)
- **Protected routes:** Wrapper component `<PrivateRoute>` in `App.jsx` redirects unauthenticated users to `/login`
- **Login flow:** `LoginPage.jsx` validates credentials against mock data, stores user, calls `onLoginSuccess(role)` callback to redirect

### Role-Based Structure

Dashboards are organized by user role, each with unique routes under a shared `Layout` wrapper:

- **User** (`/user/dashboard`): View own tickets, create new (MyTickets, CreateTicket)
- **Technician** (`/technician/dashboard`): Assigned tickets (AssignedTicket)
- **Manager** (`/manager/*`): All tickets, team, reports (mostly placeholders)
- **Admin** (`/admin/dashboard`): System analytics (AdminDashboard with charts)

All protected routes nest inside `<PrivateRoute><Layout notifCount={3}><Routes>...</Routes></Layout></PrivateRoute>`.

### Mock Data & State

- `mockData.js` exports `users` array (with role, competences, contact) and `tickets` array (with auteurId, statut, priorite, dateCreation)
- Components pull data directly from mock; no API integration yet (see `api.js` stub for future expansion)
- Components derive filtered/computed data using `useMemo()` to avoid unnecessary recalculations

---

## Global Patterns & Conventions

### Styling Approach

**All styling uses MUI's `sx` prop** (Emotion-powered inline styles). No CSS modules in core components except:

- `Auth.module.css`, `MyTickets.module.css` (legacy—avoid new additions)
- Theme overrides in `theme/` directory

**Common patterns in `sx` prop:**

```jsx
sx={{
  display: "flex", alignItems: "center", gap: "14px",
  padding: "13px 18px", borderRadius: "10px",
  transition: "background 0.15s",
  "&:hover": { backgroundColor: "#F8FAFF" },
  "&:focus": { outline: "none" }
}}
```

### Dashboard Patterns

- **KPI Cards** (`DashboardShared.jsx`): Reusable metric displays with icon, count, color, description
- **Charts** (internal to components): Custom SVG charts (DonutChart, MiniBarChart in EmpDashboard)
  - Use `useMemo()` for expensive calculations (segments, fractions)
  - Use `useState(hovered)` for interactivity; track hover index, not data objects
- **Filter Tabs** and dynamic counts: Built inline; tab state stored in component's `activeFilter` state

### Form & Input Conventions

- **Wizard-style forms:** `Wizardsteps.jsx` + `Wizardconstants.jsx` + `Wizardstyles.js` organize multi-step ticket creation
- **Button groups** use `onClick={() => setState(value)}` with conditional styling based on state
- **Validation:** `passwordUtils.js` exports strength checks; no centralized form validation library detected

### Component Organization

- **Shared:** `components/common/` (Badge, Button, Modal, SkeletonLoader, StarRating, Timeline, DashboardShared)
- **Auth forms:** `components/auth/` (ProtectedRoute, SidePanel, PasswordStrength)
- **Layout wrapper:** `components/layout/Layout.jsx` renders persistent header/sidebar; uses `notifCount` prop
- **Page components** are the source of truth; sub-components receive filtered data as props

---

## Key Files & Critical Patterns

### Essential Files to Understand First

1. **`src/App.jsx`** — Route structure, private/public routes, role-based redirects
2. **`src/context/AuthContext.jsx`** — Auth logic, localStorage sync, user provider
3. **`src/components/common/DashboardShared.jsx`** — Reusable dashboard utilities (KpiCard, DashboardIcon, getGreeting)
4. **`src/theme/index.js`** — Global MUI theme; defines colors, typography overrides

### Data Flows by Feature

- **Ticket list rendering:** Component calls `useMemo()` to filter by auteur/status/priority, then `.map()` over sorted array
- **Status tracking:** Config objects (`STATUS_CONFIG`, `PRIORITY_BORDER`) map status/priority strings to color/label pairs
- **Monthly charts:** Date operations extract month from `dateCreation`, accumulate counts by month index, render as bars

### Common Mistakes to Avoid

- Don't import from wrong paths (e.g., `./MyTickets` instead of `./my-ticket/MyTickets`)
- Ensure `useMemo` dependencies are exhaustive (e.g., if filtering by `user.id`, include it in deps array)
- Don't mutate state directly in reduce/map; always return new objects
- Theme colors must match palette (e.g., `#3B82F6` for blue, not custom hex)

---

## Development Workflows

### Build & Run

```bash
npm install         # Install deps
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Production build (dist/)
npm run lint        # ESLint check
npm run preview     # Preview production build locally
```

### Testing Flows

- No test suite configured; manual browser testing via dev server
- Use browser DevTools to inspect localStorage (stored under `currentUser` key)
- Mock data updates in `mockData.js` immediately reflect in UI on page reload

### Git Conventions

- Branch naming: `feature/FeatureName`, `bugfix/BugName`
- Merge conflicts often occur in App.jsx (route imports) and dashboard components (styling/state)
- Example merge resolution: prefer cleaner code in feature branches when adding new pages/components

---

## Integration Points & Future Expansion

### API Layer

`src/services/api.js` is a stub—when backend is ready:

- Fetch user from `/api/auth/login` instead of `mockData.js`
- Fetch tickets from `/api/tickets` with role-based filtering
- Update login flow in `LoginPage.jsx` to call API instead of mock validation

### New Role/Dashboard Addition

1. Add user with new `role: "newRole"` to `mockData.js`
2. Create page component at `src/pages/[newRole]/Dashboard.jsx`
3. Add route in `App.jsx`: `<Route path="newRole/dashboard" element={<NewRoleDashboard />} />`
4. If needed, create shared components in `components/common/` for reuse

---

## Code Style & Conventions

- **Imports:** Group by external libs, then local paths; use absolute paths from `src/`
- **Naming:** camelCase for functions/variables, PascalCase for components
- **Comments:** Use `// ── Section ──` header blocks for code organization (see EmpDashboard.jsx)
- **Responsive design:** Primary breakpoint is single-column layout—no explicit media queries detected; relies on flex/grid defaults

---

## Common Tasks & Examples

### Add a new ticket status filter

1. Add status string to `STATUS_CONFIG` object (e.g., `on_hold: { label: "En attente", color: "#..." }`)
2. Add a new filter tab in `FILTER_TABS` array
3. Update filtering logic in `useMemo(() => { if (activeFilter === "on_hold") return ... })`

### Customize dashboard KPI card colors

- Edit `src/theme/palette.js` or pass color directly to `<KpiCard color="#HEX" />`
- Follow existing palette: blues (#3B82F6, #2563EB), ambers (#F59E0B), greens (#22C55E)

### Add a required field to ticket creation

1. Add field to `Wizardconstants.jsx` step definition
2. Add validation rule if needed (check `Wizardsteps.jsx` for pattern)
3. Update mock ticket shape in `mockData.js` to include new field
