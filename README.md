# 🚼 DevPulse


---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [User Roles & Permissions](#user-roles--permissions)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
  - [Authentication](#-authentication)
  - [Issues](#-issues)
- [Response Formats](#response-formats)
- [HTTP Status Codes](#http-status-codes)

---

## Overview

DevPulse is an internal tech issue and feature tracker built for software teams. It allows contributors to report bugs and request features, while maintainers can triage, update, and resolve issues across the board.

---

## Tech Stack

| Technology | Details |
|---|---|
| **Node.js** | LTS runtime (v24.x or higher) |
| **TypeScript** | Latest stable version |
| **Express.js** | Modular router architecture |
| **PostgreSQL** | Relational database, native `pg` driver only |
| **Raw SQL** | Direct `pool.query()` calls — no ORMs, no query builders, no JOINs |
| **bcrypt** | Password hashing (salt rounds: 8–12) |
| **jsonwebtoken** | JWT generation & verification |
| **http-status-codes** | Consistent HTTP status code references |

---

## User Roles & Permissions

| Role | Permissions |
|---|---|
| `contributor` | Register & log in · Create issues · View all issues · Update **own** issue |
| `maintainer` | All contributor permissions · Update **any** issue · Delete any issue · Change issue status independently |

---

## Database Schema

### `users`

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `name` | Full display name — required |
| `email` | Unique login address — required |
| `password` | Bcrypt-hashed string — required, never returned in responses |
| `role` | `contributor` (default) or `maintainer` |
| `created_at` | Auto-generated on insert |
| `updated_at` | Auto-refreshed on update |

### `issues`

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `title` | Short headline — required, max 150 characters |
| `description` | Detailed explanation — required, min 20 characters |
| `type` | `bug` or `feature_request` |
| `status` | `open` (default) · `in_progress` · `resolved` |
| `reporter_id` | ID of the submitting user (validated in app logic, no FK constraint) |
| `created_at` | Auto-generated on insert |
| `updated_at` | Auto-refreshed on update |

---

## API Reference

### 🔐 Authentication

#### `POST /api/auth/signup` — Register a new user

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

---

#### `POST /api/auth/login` — Authenticate and receive JWT

**Access:** Public

**Request Body:**
```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}
```

> **Note:** The JWT payload includes `id`, `name`, and `role` — used for identity and permission checks on protected routes.

---

### 📌 Issues

#### `POST /api/issues` — Create an issue

**Access:** Authenticated (`contributor`, `maintainer`)

**Headers:** `Authorization: <JWT_TOKEN>`

**Request Body:**
```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

> **Note:** `reporter_id` is extracted from the decoded JWT (`req.user.id`), not the request body.

---

#### `GET /api/issues` — Get all issues

**Access:** Public

**Query Parameters:**

| Param | Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | _(none)_ |
| `status` | `open`, `in_progress`, `resolved` | _(none)_ |

**Example:** `GET /api/issues?sort=newest&type=bug&status=open`

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Issues retrived successfully",
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}
```

---

#### `GET /api/issues/:id` — Get a single issue

**Access:** Public

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Issue retrived successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

#### `PATCH /api/issues/:id` — Update an issue

**Access:**
- `maintainer` — can update any issue
- `contributor` — can only update their **own** issue while status is `open`

**Headers:** `Authorization: <JWT_TOKEN>`

**Request Body:**
```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

#### `DELETE /api/issues/:id` — Delete an issue

**Access:** `maintainer` only

**Headers:** `Authorization: <JWT_TOKEN>`

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## Response Formats

### Success
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

---

## HTTP Status Codes

| Code | Reason | Usage |
|---|---|---|
| `200` | OK | Successful GET, PATCH, PUT, DELETE |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE with no response body |
| `400` | Bad Request | Validation errors, invalid input, duplicate resource |
| `401` | Unauthorized | Missing, expired, or invalid JWT token |
| `403` | Forbidden | Valid token but insufficient role/permissions |
| `404` | Not Found | Requested resource does not exist |
| `409` | Conflict | Business logic conflict (e.g., editing a resolved issue) |
| `500` | Internal Server Error | Unexpected server or database error |

---

## 🔒 Security Notes

- Passwords are **never** exposed in responses or logs.
- All protected endpoints reject requests without a valid JWT.
- Role verification occurs **before** any privileged operation.
- JWT is passed via `Authorization: <token>` header (no `Bearer` prefix).
