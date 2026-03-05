# Database Schemas

All collections use MongoDB via Mongoose. Every model file goes in `src/database/models/`. Every interface file goes in `src/interface/`.

---

## Users

**File:** `src/database/models/user.ts` | **Interface:** `src/interface/user.ts`

| Field | Type | Description |
|-------|------|-------------|
| firebaseUid | String (unique) | Firebase Auth UID, primary lookup key |
| email | String (unique, optional) | User's email. Null for anonymous users |
| displayName | String | Display name. Defaults to "Friend" for anonymous users |
| profilePhoto | String (optional) | URL to profile photo |
| authProvider | Enum: google, apple, anonymous | Sign-in method. "anonymous" = user tapped Skip on onboarding |
| isAnonymous | Boolean | True if user skipped sign-in. Gates features requiring real auth |
| preferences.aiTone | Enum: gentle, direct, reflective | AI personality (Gentle & Encouraging, Direct & Practical, Deep & Reflective) |
| preferences.responseLength | Enum: short, detailed | AI response length |
| preferences.useEmojis | Boolean | AI emoji usage |
| preferences.autoCorrectSpelling | Boolean | Auto-correct before sending to AI |
| preferences.autocompleteSuggestions | Boolean | Show suggested prompts |
| preferences.commitmentTracking | Boolean | Allow AI to suggest tracking |
| preferences.followUpSuggestions | Boolean | Allow AI to suggest next steps |
| preferences.dailySpiritualPrompts | Boolean | Daily guided reflection in chat |
| notifications.commitmentReminders | Boolean | Push for check-ins |
| notifications.dailyVerse | Boolean | Push for daily verse |
| notifications.prayerEncouragement | Boolean | Occasional uplifting messages |
| notifications.appUpdates | Boolean | New features notifications |
| notifications.fcmToken | String (optional) | FCM device token |
| dataControls.improveModel | Boolean | Consent for model training |
| dataControls.personalizeWithMemories | Boolean | Allow cross-conversation memory |
| usage.dailyMessageCount | Number | Messages sent today (resets midnight WAT) |
| usage.dailyTokensUsed | Number | Tokens consumed today (internal) |
| usage.lastResetAt | Date | Last daily reset timestamp |
| usage.totalMessagesAllTime | Number | Lifetime message count |
| subscription.plan | Enum: free, weekly, monthly, annual | Current plan (all "free" for now) |
| subscription.status | Enum: active, expired, cancelled | Plan status |
| subscription.expiresAt | Date (optional) | Plan expiry |
| createdAt | Date | Account creation |
| lastActiveAt | Date | Last interaction |

**Indexes:** firebaseUid (unique), email (unique, sparse — allows null for anonymous users), lastActiveAt (desc), isAnonymous

---

## Conversations

**File:** `src/database/models/conversation.ts` | **Interface:** `src/interface/conversation.ts`

| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId → Users | Owner |
| title | String | Auto-generated from first message or topic |
| topic | String (optional) | Topic slug if started from chip |
| tags | [String] | Searchable tags from content |
| summary | String (optional) | AI-generated summary for context management |
| messageCount | Number | Total messages |
| lastMessageAt | Date | Most recent message timestamp |
| isArchived | Boolean | Archived by user |
| createdAt | Date | Created |

**Indexes:** userId + updatedAt (desc), userId + tags, text index on title

---

## Messages

**File:** `src/database/models/message.ts` | **Interface:** `src/interface/message.ts`

| Field | Type | Description |
|-------|------|-------------|
| conversationId | ObjectId → Conversations | Parent conversation |
| userId | ObjectId → Users | User (denormalized) |
| role | Enum: user, assistant, system | Sender |
| content | String | Message text |
| media | Object (optional) | { type: image/file, url, mimeType, fileName } |
| aiMetadata | Object (optional) | { model, inputTokens, outputTokens, latencyMs, provider } |
| scriptureReferences | [Object] (optional) | [{ book, chapter, verse, text }] |
| reactions | Object (optional) | { liked, disliked, saved, shared } (all booleans) |
| commitmentPrompt | Object (optional) | { commitmentId, type: check_in/follow_up/progress_tracking, responseOptions: [string] } |
| createdAt | Date | Sent |

**Indexes:** conversationId + createdAt, userId + createdAt (desc)

---

## User Memories

**File:** `src/database/models/userMemory.ts` | **Interface:** `src/interface/userMemory.ts`

One document per user. Only populated if `dataControls.personalizeWithMemories` is true.

| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId → Users (unique) | One per user |
| memories | [Object] | [{ fact, source: conversation/explicit, conversationId (optional), extractedAt, confidence: 0-1 }] |
| lastUpdated | Date | Last extraction |

**How it works:** Every 5-10 messages, background job sends recent messages to Gemini Flash: "Extract key personal facts about this user that would be helpful in future conversations. Return only new facts." Results appended to memories array. Injected into system prompt for all future conversations.

**Indexes:** userId (unique)

---

## Commitments

**File:** `src/database/models/commitment.ts` | **Interface:** `src/interface/commitment.ts`

| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId → Users | Owner |
| title | String | e.g., "Overcoming Addiction" |
| description | String (optional) | e.g., "Building consistency one day at a time" |
| category | String | addiction, prayer, bible_reading, anger, pornography, lying, custom |
| status | Enum: active, paused, completed, abandoned | Current state |
| streak.current | Number | Consecutive success days |
| streak.longest | Number | All-time best streak |
| streak.lastCheckInDate | Date | Last check-in date |
| schedule.frequency | Enum: daily, weekly | Check-in frequency |
| schedule.reminderTime | String (optional) | e.g., "09:00" |
| schedule.timezone | String | e.g., "Africa/Lagos" |
| originConversationId | ObjectId → Conversations (optional) | Where commitment was discussed |
| stats.totalCheckIns | Number | Total check-ins |
| stats.successfulDays | Number | Success days |
| stats.relapseDays | Number | Relapse days |
| stats.skippedDays | Number | Missed days |
| startDate | Date | Commitment start |
| createdAt | Date | Created |

**Indexes:** userId + status, schedule.reminderTime + status

---

## Check-Ins

**File:** `src/database/models/checkIn.ts` | **Interface:** `src/interface/checkIn.ts`

One per commitment per day.

| Field | Type | Description |
|-------|------|-------------|
| commitmentId | ObjectId → Commitments | Parent commitment |
| userId | ObjectId → Users | User |
| date | Date | Calendar date (normalized to midnight) |
| status | Enum: success, relapse, skipped | What happened |
| note | String (optional) | Personal reflection |
| mood | Enum: great, good, okay, struggling, low (optional) | How they feel |
| aiResponse | String (optional) | Encouragement message generated after check-in |
| createdAt | Date | Submitted |

**Indexes:** commitmentId + date (unique compound), userId + date

---

## Topics

**File:** `src/database/models/topic.ts` | **Interface:** `src/interface/topic.ts`

Quick-start conversation topic chips on the home screen. Managed from backend — no app update needed to change.

| Field | Type | Description |
|-------|------|-------------|
| slug | String (unique) | e.g., "battling-addiction" |
| label | String | e.g., "Battling Addiction" |
| icon | String (optional) | Emoji or icon name |
| systemPromptAddition | String | Extra AI instructions when topic selected |
| suggestedFirstMessage | String (optional) | Pre-filled first message |
| isDefault | Boolean | Show on home screen |
| order | Number | Display order |

**Indexes:** slug (unique), isDefault + order

---

## Daily Verses

**File:** `src/database/models/dailyVerse.ts` | **Interface:** `src/interface/dailyVerse.ts`

Pre-loaded in bulk (365/year). Cached in Redis.

| Field | Type | Description |
|-------|------|-------------|
| date | Date (unique) | Calendar date |
| book | String | e.g., "Proverbs" |
| chapter | Number | e.g., 3 |
| verseRange | String | e.g., "5-6" |
| text | String | Full verse text |
| translation | String | e.g., "NIV", "KJV" |
| theme | String (optional) | e.g., "trust", "strength" |

**Indexes:** date (unique)

---

## Encouragement Templates

**File:** `src/database/models/encouragementTemplate.ts` | **Interface:** `src/interface/encouragementTemplate.ts`

Pre-written messages for commitment check-ins. Saves API costs on predictable scenarios.

| Field | Type | Description |
|-------|------|-------------|
| scenario | Enum: early_success, milestone, daily_success, first_checkin, return_after_absence | When to use |
| milestoneDay | Number (optional) | 7, 14, 30, 60, 90 |
| category | String (optional) | Specific commitment category or null for universal |
| messages | [String] | Variations to rotate through |
| scriptureRef | String (optional) | Associated verse |

**When to use templates vs AI:**

| Scenario | Source |
|----------|--------|
| Success, streak 1-3 | Template (early_success) |
| Success, milestone day | Template (milestone) |
| Success, normal day | Template (daily_success) — random rotation |
| Relapse | LIVE AI CALL — must be personalized |
| Return after missed days | LIVE AI CALL — context-dependent |
| First ever check-in | Template (first_checkin) |

---

## Feedback

**File:** `src/database/models/feedback.ts` | **Interface:** `src/interface/feedback.ts`

| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId → Users | Submitter |
| content | String | Feedback text |
| appVersion | String | App version |
| platform | Enum: ios, android | Device |
| createdAt | Date | Submitted |
