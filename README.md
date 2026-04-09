# Project Root

This repository contains a full-stack application with:

- `backend/`: Spring Boot API (Maven)
- `frontend/`: React app (JavaScript + CRACO)

## Backend

From `backend/`:

```bash
./mvnw spring-boot:run -Dspring-boot.run.main-class=com.smartcampus.SmartCampusApplication
```

Run tests:

```bash
./mvnw.cmd test
```

## Frontend

From `frontend/`:

```bash
npm install
npm start
```

Build frontend:

```bash
npm run build
```

## Notes

- Root `.gitignore` handles common backend/frontend generated files.
- Backend keeps its own module-specific ignore rules in `backend/.gitignore`.
