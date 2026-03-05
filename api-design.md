# API Design

All endpoints prefixed with `/api/v1`. All routes except auth require a valid Firebase Bearer token in the Authorization header.

## Authentication

| Method | Endpoint | Controller | Description |
|--------|----------|-----------|-------------|
| POST | /auth/register | auth.ts | Create account using Firebase token. Works for Google, Apple, AND anonymous tokens. If anonymous, creates user with isAnonymous: true, no email, displayName: "Friend". |
| POST | /auth/login | auth.ts | Verify Firebase token, return user profile + session. |
| POST | /auth/refresh | auth.ts | Refresh expired session. |
| POST | /auth/link-account | auth.ts | Called after anonymous user signs in with Google/Apple. Firebase links accounts client-side (same UID preserved). This endpoint updates the User document: sets authProvider, isAnonymous: false, populates email, displayName, profilePhoto from the provider. All data preserved. |
| DELETE | /auth/account | auth.ts | Delete account + all associated data across all collections. |

## User Profile & Settings

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| GET | /user/profile | user.ts | auth | Get profile, preferences, notification settings, usage stats. |
| PATCH | /user/profile | user.ts | auth | Update display name, profile photo. |
| PATCH | /user/preferences | user.ts | auth | Update AI preferences (tone, length, emojis, etc.). |
| PATCH | /user/notifications | user.ts | auth | Update notification toggles, FCM token. |
| PATCH | /user/data-controls | user.ts | auth | Update memory and model training consent. |
| GET | /user/usage | user.ts | auth | Get daily usage: messages sent, remaining, reset time. |

## Conversations

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| GET | /conversations | conversation.ts | auth | List conversations (paginated, searchable by title). |
| POST | /conversations | conversation.ts | auth | Start new conversation. Optional body: `{ topic: "slug" }`. |
| GET | /conversations/:id | conversation.ts | auth | Get conversation details with recent messages (paginated). |
| DELETE | /conversations/:id | conversation.ts | auth | Delete single conversation and all its messages. |
| DELETE | /conversations | conversation.ts | auth | Delete all user conversations. |

## Messages (Chat)

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| POST | /conversations/:id/messages | message.ts | auth, usageLimiter | Send message. Backend runs safety check → AI call → saves both messages → returns AI response. |
| GET | /conversations/:id/messages | message.ts | auth | Get messages for conversation (paginated, for scroll-back). |
| POST | /messages/:id/react | message.ts | auth | Like/dislike/save a message. Body: `{ liked?, disliked?, saved?, shared? }`. |

## Commitments

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| GET | /commitments | commitment.ts | auth, requireSignedIn | List user's commitments. Query: `?status=active`. |
| POST | /commitments | commitment.ts | auth, requireSignedIn | Create commitment. Body: `{ title, category, description?, reminderTime?, timezone? }`. |
| GET | /commitments/:id | commitment.ts | auth, requireSignedIn | Get commitment details + streak + stats. |
| PATCH | /commitments/:id | commitment.ts | auth, requireSignedIn | Update commitment (pause, resume, change reminder time). |
| DELETE | /commitments/:id | commitment.ts | auth, requireSignedIn | Delete commitment and all its check-ins. |

## Check-Ins

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| POST | /commitments/:id/check-in | checkIn.ts | auth, requireSignedIn | Submit daily check-in. Body: `{ status: "success" | "relapse", note?, mood? }`. Returns encouragement. |
| GET | /commitments/:id/history | checkIn.ts | auth, requireSignedIn | Get check-in history for a commitment (paginated). |

## Daily Verse

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| GET | /daily-verse | dailyVerse.ts | auth | Get today's verse (served from Redis cache first). |
| GET | /daily-verse/:date | dailyVerse.ts | auth | Get verse for a specific date. |

## Topics

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| GET | /topics | topic.ts | auth | Get active topics for home screen, sorted by order. |

## Media

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| POST | /media/upload | media.ts | auth | Upload image/file to Cloudinary. Returns URL. |

## Feedback

| Method | Endpoint | Controller | Middleware | Description |
|--------|----------|-----------|-----------|-------------|
| POST | /feedback | feedback.ts | auth, requireSignedIn | Submit feedback. Body: `{ content, appVersion, platform }`. |

## Middleware Stack

### Auth Middleware (`src/middleware/auth.ts`)
Applied to all routes except /auth/register and /auth/login. Extracts Bearer token from Authorization header, verifies with Firebase Admin SDK, loads User document, attaches to `req.user`. Works identically for anonymous and real accounts — Firebase anonymous tokens verify the same way.

### Require Signed In Middleware (`src/middleware/requireSignedIn.ts`)
Applied to routes that need a real (non-anonymous) account. Checks `req.user.isAnonymous` — if true, returns 403:
```json
{
  "error": true,
  "message": "Please sign in to use this feature"
}
```

**Routes that require signed-in user (apply requireSignedIn middleware):**
- All commitment endpoints (create, check-in, history)
- Notification settings (PATCH /user/notifications)
- Data controls (PATCH /user/data-controls)
- Feedback (POST /feedback)

**Routes that work for anonymous users (auth middleware only):**
- Chat (send/get messages, create/list conversations)
- Daily verse
- Topics
- User profile (GET/PATCH)
- User usage
- Media upload

### Rate Limiter (`src/middleware/rateLimiter.ts`)
API-level abuse prevention. 30 requests per minute per user. Uses Redis for distributed counting. Applied globally.

### Usage Limiter (`src/middleware/usageLimiter.ts`)
Daily message limit enforcement. Applied only to `POST /conversations/:id/messages`. Checks `user.usage.dailyMessageCount` against plan limit (20 for free). If exceeded, returns 429 with:
```json
{
  "error": true,
  "message": "You've had a blessed day of conversation. Take time to reflect on what we've discussed. Your messages refresh tomorrow morning.",
  "resetAt": "2026-03-01T00:00:00+01:00",
  "remaining": 0
}
```

## Response Format

All successful responses:
```json
{
  "error": false,
  "message": "Description of what happened",
  "data": { }
}
```

All error responses:
```json
{
  "error": true,
  "message": "What went wrong"
}
```

## Pagination

Use existing pagination helpers from `src/helpers/pagination.ts`:
- `extractPageOptions(req)` — extract page, limit from query params
- `queryFilter(req)` — extract filter params
- `preparePagingValues(page, limit)` — calculate skip/limit
- `getPagingResponseDetails(total, page, limit)` — build pagination metadata

Paginated response shape:
```json
{
  "error": false,
  "message": "Conversations retrieved",
  "data": {
    "items": [],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```
