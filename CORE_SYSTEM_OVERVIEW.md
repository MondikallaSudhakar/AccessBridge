# Core System Overview

This file is a quick map of the project so new chats can understand the system without reading the entire codebase.

## 1) High-Level Architecture

- Backend: Spring Boot application in `src/main/java/com/community/community`
- Frontend: React + Vite app in `frontend/`
- Auth model: Frontend auth context + backend security config/JWT layer
- Domain focus: Schools, NGOs, Startups/Products, Donations, Admin approvals

## 2) Backend Quick Map

Main boot file:
- `src/main/java/com/community/community/CommunityApplication.java`

Key backend packages:
- `config/`: security and initialization (`SecurityConfig`, `AdminInitializer`)
- `controller/`: REST entry points (`AuthController`, `SchoolController`, `NGOController`, `ProductController`, `DonationController`, `AdminController`, `StartupController`)
- `dto/`: request/response payloads (`LoginRequest`, `RegisterRequest`, etc.)
- `model/`: JPA entities (School, NGO, Donation, Product, Achievement, Event, and others)
- `repository/`: Spring Data repositories
- `service/`: business logic layer
- `security/`: token/auth support classes
- `exception/`: custom error handling

Main config:
- `src/main/resources/application.properties`

## 3) Frontend Quick Map

Frontend entry:
- `frontend/src/main.jsx`
- `frontend/src/App.jsx` (router)

Core frontend areas:
- `frontend/src/context/AuthContext.jsx`: global auth/user state
- `frontend/src/services/api.js`: API client wiring
- `frontend/src/services/authService.js`: login/register/token calls
- `frontend/src/pages/`: route-level screens
- `frontend/src/components/`: reusable UI by domain (auth/common/marketplace/ngo/school/startup)

## 4) Current Main Routes

Public:
- `/` -> Home feed/dashboard-style landing
- `/login` -> Login
- `/register` -> Register
- `/marketplace` -> Marketplace
- `/search` -> Search
- `/schools/:id` -> School detail

Protected/role-oriented:
- `/dashboard` -> Main dashboard
- `/admin/approvals` -> Admin review flow
- `/school/profile` -> School profile management
- `/ngo/profile` -> NGO dashboard management (requirements, hiring jobs, products, services, achievements)
- `/startup/profile` -> Startup profile management

Public detail:
- `/ngos/:id` -> NGO public profile (shows requirements, jobs, products, and profile-only services/achievements)

Fallback:
- `*` -> NotFound page

## 5) Data Flow Snapshot

1. User opens frontend route.
2. React page requests data from backend API.
3. Controllers accept request and delegate to service layer.
4. Services use repositories/entities for persistence.
5. JSON response is rendered in frontend components.

For Home page specifically:
- Frontend calls:
  - `/api/products/available`
  - `/api/schools`
  - `/api/ngos`
- Results are merged into a tabbed feed (`All`, `NGOs`, `Schools`, `Products`).

For NGO dashboard/profile specifically:
- NGO dashboard APIs:
  - `/api/ngos/{id}/needs`
  - `/api/ngos/{id}/jobs`
  - `/api/ngos/{id}/products`
  - `/api/ngos/{id}/services`
  - `/api/ngos/{id}/achievements`
- Services and achievements are displayed only in NGO profile context on user side.

## 6) Fast Onboarding for New Chat

If a new chat asks for UI change:
- Start in `frontend/src/pages/` for route-level behavior.
- Check `frontend/src/App.jsx` for route mapping.
- Check `frontend/src/context/AuthContext.jsx` for user state/role constraints.

If a new chat asks for API/backend change:
- Start in matching `controller/` file.
- Trace to corresponding `service/` and `repository/`.
- Confirm model fields in `model/` entity.

## 7) Run Commands

Backend (from repo root):
- `./mvnw spring-boot:run` (or `mvnw.cmd spring-boot:run` on Windows)

Frontend (from `frontend/`):
- `npm install`
- `npm run dev`
- `npm run build`

## 8) Notes for Future Changes

- Keep role-specific UI inside dedicated domain folders under `frontend/src/components/`.
- Keep business rules in backend `service/`, not in controllers.
- Add new API endpoint docs in this file when introducing major modules.
