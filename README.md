# Project Root

This repository contains a full-stack application with:

- `backend/`: Spring Boot API (Maven)
- `frontend/`: React + TypeScript app (Vite)

## Backend

From `backend/`:

```bash
./mvnw.cmd spring-boot:run
```

Run tests:

```bash
./mvnw.cmd test
```

## Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Build frontend:

```bash
npm run build
```

## Notes

- Root `.gitignore` handles common backend/frontend generated files.
- Backend keeps its own module-specific ignore rules in `backend/.gitignore`.
