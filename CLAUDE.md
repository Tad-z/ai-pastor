# AI Pastor Backend

Faith-based AI spiritual companion for Nigerian Christians. Node.js + TypeScript + MongoDB + Express + Gemini 2.5 Flash.

## Project Structure

```
src/
├── config/          # env, database, redis, firebase init
├── database/models/ # Mongoose schema definitions
├── interface/       # TypeScript interfaces (index.ts has shared Response type)
├── dto/             # Request body validation shapes
├── dao/             # Data Access Objects — pure DB queries, no logic
├── logic/           # Business logic — validation, orchestration, calls DAOs & providers
├── controller/      # Thin layer — extract req data, call logic, return response
├── routes/          # Express route definitions with middleware
├── middleware/       # auth (Firebase), rateLimiter, usageLimiter, requireSignedIn
├── providers/ai/    # AI provider abstraction (types, gemini, claude, router)
├── services/        # Cross-cutting: safety, notification, memory, cache
├── jobs/            # Cron jobs (daily reset, reminders, verse notifications)
├── helpers/         # utility, pagination, scripture parser, date helpers, tokenCounter
└── app.ts           # Express setup, MongoDB connection, mount routes
```

## Request Flow

Route → Controller → Logic → DAO → Model. Every layer has one job. Never skip layers.

## Coding Patterns

### Controller (thin — extract data, call logic, return response)
```typescript
import { responseBad, responseOk } from "../helpers/utility";
import { _sendMessage } from "../logic/message";

export const sendMessage = async (req, res) => {
  const userId = req.user._id.toString();
  const { conversationId } = req.params;
  const { content } = req.body;
  try {
    const request = await _sendMessage(userId, conversationId, content);
    return responseOk(req, res, request);
  } catch (error) {
    return responseBad(req, res, error);
  }
};
```

### Logic (all business logic — prefixed with underscore, returns Promise<Response>)
```typescript
import { response } from "../helpers/utility";
import { Response } from "../interface";

export const _sendMessage = async (
  userId: string, conversationId: string, content: string
): Promise<Response> => {
  if (!content || content.trim().length === 0) {
    return response({ error: true, message: "Message content is required" });
  }
  // ... business logic, call DAOs, call providers
  return response({ error: false, message: "Message sent", data: { /* ... */ } });
};
```

### DAO (pure DB queries — no logic, no validation, always .exec())
```typescript
import { Message } from "../database/models/message";

export const createMessage = async (data: any) => {
  const message = new Message(data);
  return await message.save();
};

export const getRecentMessages = async (conversationId: string, limit: number = 20) => {
  return await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(limit).exec();
};
```

### Routes (map URLs to controllers, apply middleware)
```typescript
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { usageLimiter } from "../middleware/usageLimiter";
import { sendMessage, getMessages } from "../controller/message";

const router = Router();
router.post("/:conversationId/messages", authMiddleware, usageLimiter, sendMessage);
router.get("/:conversationId/messages", authMiddleware, getMessages);
export default router;
```

### Shared Response Interface
```typescript
// interface/index.ts
export interface Response<T = any> {
  error: boolean;
  message: string;
  data?: T;
}
```

### Helper Utilities
```typescript
// helpers/utility.ts
export const response = (data: { error: boolean; message: string; data?: any }) => data;
export const responseOk = (req, res, data) => res.status(200).json(data);
export const responseBad = (req, res, error) => res.status(400).json({ error: true, message: error.message || "Something went wrong" });
```

## Rules

- Never put business logic in controllers. Controllers only extract req data and call logic.
- Logic functions always prefixed with underscore: `_functionName`
- Logic always returns `Promise<Response>` using the `response()` helper
- DAOs are pure Mongoose queries. No validation, no logic. Always use `.exec()`.
- One DAO file per collection. One controller file per module. One logic file per module.
- Use Firebase Auth for authentication. Verify tokens in auth middleware.
- Anonymous users (skipped sign-in) use Firebase Anonymous Auth. Same auth flow, same middleware. They get a real firebaseUid and token.
- Use `requireSignedIn` middleware on routes that need a real account (commitments, notifications, data controls, feedback).
- AI provider is abstracted — never call Gemini directly from logic. Always go through the provider layer.
- Daily message limit: 20 messages/day for free users. Enforced in usageLimiter middleware.

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm run start        # Start production server
npm test             # Run tests
```

## Detailed Documentation

- See @docs/architecture.md for full system architecture and deployment
- See @docs/schemas.md for all database collection schemas
- See @docs/api-design.md for complete API endpoint design
- See @docs/feature-flows.md for step-by-step feature implementation flows
- See @docs/system-prompt.md for AI Pastor system prompt and dynamic injection
