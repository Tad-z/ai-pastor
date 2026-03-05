# Architecture

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Runtime | Node.js + TypeScript | Team expertise, async-friendly for AI calls |
| Framework | Express.js | Simple, well-documented |
| Database | MongoDB (Mongoose ODM) | Flexible schemas, great for chat data |
| AI Provider | Google Gemini 2.5 Flash (primary) | Cheapest quality option, generous free tier |
| Auth | Firebase Auth | Google + Apple Sign-In, free tier |
| Push Notifications | Firebase Cloud Messaging (FCM) | Free, iOS + Android |
| Caching | Redis | Daily verses, rate limits, session data |
| File Storage | Cloudinary or Firebase Storage | Profile photos, media uploads |
| Mobile App | Kotlin Multiplatform | iOS + Android single codebase |
| Deployment | Railway or Render | Affordable, easy Node.js deployment |

## System Architecture

Modular service-based architecture. Each feature area has its own route, controller, logic, and DAO files.

**Request Flow:**
1. Mobile app sends HTTPS request with Firebase auth token (works for Google, Apple, AND anonymous users)
2. Auth middleware verifies Firebase token, loads user
3. Rate limiter checks API call limits (abuse prevention)
4. Usage tracker checks daily message allowance
5. For gated features: requireSignedIn middleware blocks anonymous users with 403
6. Request routed to controller → logic → DAO
7. For chat: logic calls safety service → AI provider → saves response
8. Response returned to app

**Key Modules:** Auth (Google/Apple/Anonymous + account linking), User, Chat (Conversation + Message), Commitment (Commitment + CheckIn), Notification service, Safety service, AI Provider layer, Verse, Topic, Feedback

**Communication (v1):** REST over HTTPS. AI response returned as complete message. SSE streaming planned for v2.

## AI Provider Strategy

### Abstraction Layer
All providers implement the same interface in `src/providers/ai/types.ts`. Takes messages + config, returns response text + token usage + latency. `src/providers/ai/router.ts` handles smart model routing.

### Model Routing Tiers

| Tier | Model | Used For | % of Traffic |
|------|-------|----------|-------------|
| 0 | No API call (cached/templated) | Daily verses, greetings, check-in prompts, milestones | 15-20% |
| 1 | Gemini 2.5 Flash | Simple questions, prayers, verse lookups, encouragement | 60-70% |
| 2 | Gemini 2.5 Pro | Deep theology, sensitive topics, long conversations, relapse responses | 15-20% |
| 3 | Claude/GPT-4o (future) | Premium subscribers only | 0% (future) |

### Router Classification Logic
- Greeting or very short message → Tier 0 or 1
- Sensitive topic keywords (addiction, suicide, abuse, self-harm, depression, grief, divorce) → Tier 2
- Conversation beyond 10 turns → Tier 2
- User explicitly asked for depth → Tier 2
- Everything else → Tier 1

### Context Window Management
- Only last 15-20 messages sent as context
- Older conversations use compressed summary
- User memories injected as brief paragraph in system prompt
- System prompt under 800 tokens
- Total context: under 4,000 tokens for Flash, 8,000 for Pro

## Caching Strategy (Redis)

| What | TTL | Why |
|------|-----|-----|
| Today's daily verse | 24 hours | Prevents DB hit on every app open |
| User profile/session | 15 minutes | Reduces repeated lookups |
| Templated encouragements | 1 hour | Frequently accessed, rarely changes |
| Commitment streak data | 5 minutes | Accessed often for home screen |
| Rate limit counters | Native | Fast atomic increments |
| Topic list | 1 hour | Rarely changes |

## Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Daily usage reset | 00:00 WAT | Reset dailyMessageCount and dailyTokensUsed for all users |
| Commitment reminders | Every minute | Push to users with active commitments matching current time |
| Daily verse notification | 06:00 WAT | Push today's verse to opted-in users |
| Verse cache refresh | 05:55 WAT | Pre-load verse into Redis |
| Mark missed check-ins | 23:59 WAT | Create "skipped" check-in for unchecked commitments |
| Memory extraction | Every 6 hours | Extract facts from recent conversations to UserMemory |
| Context compression | 03:00 WAT | Generate summaries for conversations with 30+ messages |

## Safety & Content Moderation

### Pre-Processing Layer (src/services/safety.ts)
Every user message passes through safety service BEFORE reaching AI.

**Crisis Detection:** Checks for suicidal ideation, self-harm, immediate danger. If detected, modifies AI system prompt to: acknowledge pain with empathy, include crisis resources (SURPIN Nigeria: 09010003401), encourage speaking with trusted person.

**Abuse Detection:** If user describes being a victim, injects instructions to validate, affirm not their fault, provide helplines (FIDA Nigeria, NAPTIP).

**Design Principle:** Safety layer NEVER blocks communication. Only augments AI instructions. Someone in crisis should feel heard, not hit with an error.

### Post-Processing Check
Lightweight check that crisis resources were included when needed and response doesn't contradict pastoral identity.

## Deployment

### MVP Infrastructure (1,000-5,000 Users)

| Service | Provider | Cost |
|---------|----------|------|
| Backend | Railway/Render (free → starter) | $0-7/month |
| Database | MongoDB Atlas (free tier, 512MB) | $0 |
| Redis | Upstash (free tier) | $0 |
| AI API | Gemini 2.5 Flash | $0-5/month |
| Auth + Push | Firebase (free tier) | $0 |
| File storage | Cloudinary (free tier) | $0 |
| **Total** | | **$0-12/month** |

### Scaling Triggers
- 1,000+ DAU: Upgrade hosting ($7-25/month), upgrade Redis
- 5,000+ DAU: MongoDB Atlas M10 (~$57/month)
- 10,000+ DAU: Monetization should be live

### AI API Cost Projections (Gemini 2.5 Flash)

| Users | Daily Msgs | Monthly Msgs | Est. Monthly Cost |
|-------|-----------|-------------|-------------------|
| 100 | 1,500 | 45,000 | $0.50-$2 |
| 500 | 7,500 | 225,000 | $2-$8 |
| 1,000 | 15,000 | 450,000 | $5-$15 |
| 3,000 | 45,000 | 1,350,000 | $15-$40 |
| 5,000 | 75,000 | 2,250,000 | $25-$65 |

Budget runway: ₦50,000/month (~$33) serves 2,000-3,000 DAU on Gemini Flash.

### Environment Variables Needed
MongoDB URI, Redis URL, Firebase credentials (project ID, private key, client email), Gemini API key, Cloudinary credentials. Future: Paystack and Flutterwave keys.

## Future Considerations
- SSE streaming for token-by-token responses
- Spiritual growth reports
- Church/organization plans
- Sponsored devotionals
- Voice input/output
- Multi-language (Yoruba, Igbo, Hausa)
- Progress analytics dashboard
- Paystack/Flutterwave subscriptions
- USSD payment support
