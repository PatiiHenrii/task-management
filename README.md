# Task Management API

![Java 17](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.5.16-6DB33F?logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6DB33F?logo=springsecurity&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

REST API backend for a task management application. It provides account registration and login, issues JWTs for authenticated requests, and lets each user create and manage their own tasks. The backend is designed to serve a separate web or mobile frontend over JSON/HTTP.

## Contents

- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [API](#api)
- [Database schema](#database-schema)
- [Security](#security)
- [Tests](#tests)
- [Docker](#docker)

## Tech Stack

| Technology | Role |
| --- | --- |
| Java 17 | Language and runtime |
| Spring Boot 3 | Application framework and REST API |
| Spring Web | HTTP controllers and JSON serialization |
| Spring Security | Stateless request authentication and authorization |
| JJWT | JWT creation and verification |
| Spring Data JPA / Hibernate | Persistence and ORM |
| Flyway | Versioned database migrations |
| PostgreSQL 16 | Relational database |
| Docker Compose | Local database and full-stack backend runtime |
| Gradle Wrapper | Reproducible build and dependency management |

## Architecture

The application follows a layered design:

```text
HTTP request
    ↓
Controller  — validates input and maps HTTP requests/responses
    ↓
Service     — applies authentication and task ownership rules
    ↓
Repository  — reads and writes entities using Spring Data JPA
    ↓
PostgreSQL
```

Packages live under `com.patt.task_management`:

| Package | Responsibility |
| --- | --- |
| `controller` | Auth and task REST endpoints, API exception handling |
| `service` | Registration, login, and task business logic |
| `repository` | Spring Data JPA repositories |
| `model` | JPA entities for users and tasks |
| `dto` | Validated request and response records |
| `security` | JWT service, request filter, and user lookup |
| `config` | Spring Security filter chain and password encoder |

## Prerequisites

- Java 17
- Docker Engine and Docker Compose v2
- Git
- Maven is optional if you use it in your own tooling. **This repository uses Gradle**, includes the Gradle Wrapper, and does not contain a `pom.xml`; use `./gradlew` commands below.

## Run Locally

1. Clone the repository and enter its directory:

   ```bash
   git clone <repository-url>
   cd task-management
   ```

2. Start PostgreSQL. Flyway applies the schema migration automatically when the application starts:

   ```bash
   docker compose up -d postgres
   ```

3. Configure the application. Defaults in `src/main/resources/application.properties` match the local Compose database. Export a development JWT signing key (Base64-encoded, at least 32 bytes):

   ```bash
   export JWT_SECRET="$(openssl rand -base64 32)"
   ```

   For a non-default database, also export `DB_URL`, `DB_USER`, and `DB_PASSWORD` as described in [Environment Variables](#environment-variables).

4. Start the API:

   ```bash
   ./gradlew bootRun
   ```

   The API listens on `http://localhost:8080`.

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DB_URL` | No | `jdbc:postgresql://localhost:5432/taskmanager` | JDBC URL for PostgreSQL |
| `DB_USER` | No | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | No | `postgres` | PostgreSQL password; change the local default for shared or deployed environments |
| `JWT_SECRET` | No for local development; required for secure deployments | Development-only Base64 key | HMAC signing key; provide a unique Base64-encoded value containing at least 32 bytes |
| `JWT_EXPIRATION` | No | `3600000` | Token lifetime in milliseconds (one hour by default) |

The property placeholders also accept the earlier names `DB_USERNAME` and `JWT_EXPIRATION_MS` as fallbacks. The built-in JWT key and database credentials are only for local development. Set strong, private values through the environment in any shared or deployed environment.

## API

All request and response bodies use JSON. Requests to `/api/tasks` must include `Authorization: Bearer <token>`.

| Method | Path | Auth required | Request body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | `{"name":"Ada Lovelace","email":"ada@example.com","password":"correct-horse-42"}` | `201 Created`; public user object: `id`, `name`, `email` |
| `POST` | `/api/auth/login` | No | `{"email":"ada@example.com","password":"correct-horse-42"}` | `200 OK`; `{"token":"<jwt>","tokenType":"Bearer"}` |
| `GET` | `/api/tasks` | Yes | None | `200 OK`; array of the authenticated user's tasks |
| `POST` | `/api/tasks` | Yes | Task request below | `201 Created`; created task object |
| `PUT` | `/api/tasks/{id}` | Yes | Task request below | `200 OK`; updated task object |
| `DELETE` | `/api/tasks/{id}` | Yes | None | `204 No Content` |

Task create and update bodies have this shape. `title` is required; `status` defaults to `PENDING` when omitted or blank; `dueDate` is an ISO-8601 date/time with an offset or `null`.

```json
{
  "title": "Prepare release notes",
  "description": "Summarize the changes for this release.",
  "status": "IN_PROGRESS",
  "dueDate": "2026-11-15T17:00:00Z"
}
```

Task responses contain `id`, `title`, `description`, `status`, `dueDate`, and `createdAt`. A task ID that does not belong to the authenticated user returns `404 Not Found` for update and delete.

### Example

Register, log in, then use the returned token for a task request:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"correct-horse-42"}'

curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"correct-horse-42"}'

curl -X GET http://localhost:8080/api/tasks \
  -H 'Authorization: Bearer <jwt>'
```

## Database Schema

Flyway migration `V1__create_tables.sql` creates:

- **`users`** — identity `id`, `name`, unique `email`, encoded `password`, and `created_at` timestamp.
- **`tasks`** — identity `id`, `title`, optional `description`, `status`, optional `due_date`, `created_at`, and required `user_id`.

Each task belongs to one user through `tasks.user_id → users.id`. The task listing and item operations are scoped by the authenticated user's email. Hibernate is configured to validate the schema; Flyway owns schema changes.

## Security

- Registration hashes passwords with BCrypt before storing them.
- Login delegates credential checks to Spring Security and returns a signed JWT on success.
- Send that token as `Authorization: Bearer <token>` on protected requests.
- A JWT filter verifies the token signature and expiry, resolves the user, and sets the request security context.
- The security filter chain is stateless. `/api/auth/**` is public; all other routes require authentication.
- Task reads and writes include the authenticated email in their repository query, so knowing another task's ID does not grant access.
- Configure a unique `JWT_SECRET` of at least 32 bytes (Base64-encoded) outside local development. Never commit production secrets.

## Tests

Run the test suite with the Gradle Wrapper:

```bash
./gradlew test
```

The repository currently uses Gradle and does not include Maven metadata, so `mvn test` is not available without adding a Maven build.

## Docker

The multi-stage `Dockerfile` builds the Spring Boot executable JAR with the Gradle Wrapper and runs it on a Java 17 JRE. `frontend/Dockerfile` builds the Angular app with Node.js and serves it with Nginx. Nginx forwards `/api` calls to the backend, so the browser uses one origin and avoids CORS during local development. `docker-compose.yml` starts PostgreSQL, the API, and the frontend; the API waits for the database health check.

Build and start the full local stack:

```bash
export JWT_SECRET="$(openssl rand -base64 32)"
docker compose up --build -d
```

Open the frontend at `http://localhost:4200`. The API is also available directly at `http://localhost:8080`.

View application logs or stop the services:

```bash
docker compose logs -f app
docker compose down
```

The PostgreSQL data is stored in the `postgres_data` named volume and remains after `docker compose down`. To delete the local database volume as well, run `docker compose down -v`.
