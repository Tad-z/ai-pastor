# Feature Flows

Step-by-step implementation flows for all core features. Each flow describes what happens in the logic layer.

---

## 0. Authentication Flows

### 0.1 Sign In with Google/Apple

1. App calls Firebase `signInWithCredential()` with Google/Apple credential
2. Firebase returns a token with the user's UID, email, displayName, photoURL
3. App calls `POST /auth/register` with the Firebase token
4. Backend verifies token via Firebase Admin SDK
5. Logic checks if User with this firebaseUid already exists
   - If exists: return existing user profile (this is a login)
   - If new: create User document with authProvider: "google"/"apple", isAnonymous: false, populate email, displayName, profilePhoto from the decoded token
6. Return user profile

### 0.2 Skip Sign-In (Anonymous Auth)

1. User taps "Skip" on onboarding screen
2. App calls `firebase.auth().signInAnonymously()` — Firebase generates a UID and auth token
3. App calls `POST /auth/register` with the anonymous Firebase token
4. Backend verifies token, sees `decoded.firebase.sign_in_provider === "anonymous"`
5. Logic creates User document with:
   - authProvider: "anonymous"
   - isAnonymous: true
   - email: null
   - displayName: "Friend"
   - profilePhoto: null
   - All preferences set to defaults
6. Return user profile
7. User can now chat, see daily verse, browse topics — full core experience

### 0.3 Account Linking (Anonymous → Google/Apple)

This happens when an anonymous user later decides to sign in. All their data is preserved.

1. User taps "Sign in with Google" from settings or when prompted (e.g., trying to create a commitment)
2. App gets Google credential, calls Firebase `currentUser.linkWithCredential(googleCredential)`
3. Firebase links the Google identity to the existing anonymous UID — same UID is preserved
4. App calls `POST /auth/link-account` with the updated Firebase token
5. Backend verifies token, decodes email, displayName, photoURL from the Google identity
6. Logic updates User document:
   - Set authProvider: "google"
   - Set isAnonymous: false
   - Set email from decoded token
   - Set displayName from decoded token
   - Set profilePhoto from decoded token
7. Return updated user profile
8. All conversations, messages, usage data — everything stays attached to the same userId. Zero data loss.

### Feature Gating for Anonymous Users

When an anonymous user tries to access a gated feature (commitments, notifications, data controls, feedback), the `requireSignedIn` middleware returns 403. The app should catch this and show a "Sign in to unlock this feature" prompt that triggers the account linking flow (0.3 above).

---

## 1. Sending a Message (Core Chat Flow)

This is the most important flow. Lives in `src/logic/message.ts` → `_sendMessage()`.

**Steps:**
1. Validate: content is not empty, conversation exists and belongs to user
2. Run safety check via `src/services/safety.ts` on the user's message
   - If crisis language detected: prepare crisis instructions to inject into AI prompt
   - If abuse described: prepare abuse resource instructions
   - If safe: proceed normally
3. Save user message to Messages collection via DAO
4. Build AI context:
   - Load user preferences (tone, length, emojis)
   - Load user memories from UserMemory collection (if personalizeWithMemories enabled)
   - Load topic context if conversation has a topic
   - Construct full system prompt = base prompt + tone + length + emoji + memories + topic + safety overrides
   - Load last 15-20 messages from this conversation via DAO
   - Include conversation summary if it exists
5. Call AI router (`src/providers/ai/router.ts`) to classify message and pick model tier
   - Tier 0: return cached/templated response, skip AI call
   - Tier 1/2: call Gemini via provider
6. Save AI response to Messages collection via DAO, including aiMetadata (model, tokens, latency, provider)
7. Update user usage counters: increment dailyMessageCount, dailyTokensUsed, totalMessagesAllTime
8. Update conversation: set lastMessageAt, increment messageCount
9. Extract scripture references from AI response using `src/helpers/scripture.ts`
10. Check if AI response contains commitment tracking suggestion — if so, set commitmentPrompt on the message
11. Return AI response message

---

## 2. Commitment Creation (From Chat)

Can be triggered from chat when AI suggests tracking, or directly by the user.

**From chat:**
1. AI detects recurring struggle in conversation and appends offer
2. AI response message is saved with `commitmentPrompt.responseOptions`: ["Yes, start tracking", "Maybe later"]
3. App renders these as tappable buttons
4. User taps "Yes, start tracking" → app calls `POST /commitments`

**Logic in `src/logic/commitment.ts` → `_createCommitment()`:**
1. Validate: title required, category valid
2. Create Commitment document via DAO with defaults:
   - status: active
   - streak: { current: 0, longest: 0, lastCheckInDate: now }
   - schedule: { frequency: daily, reminderTime: "09:00", timezone: "Africa/Lagos" }
   - stats: all zeros
   - startDate: now
3. If originConversationId provided, store it
4. Return the created commitment

---

## 3. Daily Check-In

**Logic in `src/logic/checkIn.ts` → `_submitCheckIn()`:**

1. Validate: commitment exists, belongs to user, status is active
2. Normalize today's date to midnight (using user's timezone)
3. Check if check-in already exists for today → if yes, return error "Already checked in today"
4. Create CheckIn document via DAO with the given status

**If status is "success":**
5. Increment commitment.streak.current
6. Update commitment.streak.longest if current exceeds it
7. Increment commitment.stats.successfulDays
8. Select encouragement:
   - streak 1-3 → pick from EncouragementTemplate where scenario = "early_success"
   - streak is 7/14/30/60/90 → pick from milestone template for that day
   - normal day → random message from "daily_success" templates
9. Save encouragement as checkIn.aiResponse
10. Save updated commitment
11. If milestone reached, trigger push notification via notification service

**If status is "relapse":**
5. Reset commitment.streak.current to 0
6. Increment commitment.stats.relapseDays
7. Generate encouragement via LIVE AI CALL (never use template for relapse):
   - Send to Gemini: "Generate a brief, compassionate encouragement for someone who relapsed on their commitment to [title]. Their streak was [X] days."
   - Must be personalized and sensitive
8. Save encouragement as checkIn.aiResponse
9. Save updated commitment

**Return:** the check-in document with the encouragement message

---

## 4. Missed Check-In (Background Job)

**Runs at 23:59 WAT via cron in `src/jobs/index.ts`:**

1. Find all Commitments where status = "active"
2. For each, check if a CheckIn exists for today's date
3. If no check-in exists:
   - Create CheckIn with status: "skipped"
   - Increment commitment.stats.skippedDays
   - Save commitment
4. Next day, when app loads commitments, the app shows a gentler prompt: "We missed you yesterday. No pressure — just checking in."

---

## 5. Streak Milestones

Detected inside the check-in flow (Step 11 of success path).

**Milestone days:** 7, 14, 30, 60, 90

When detected:
1. Return special celebration from milestone EncouragementTemplate
2. Send push notification via `src/services/notification.ts`: "You've been strong for [X] days! Open AI Pastor to celebrate."

---

## 6. Daily Verse Delivery

**Verse cache refresh (05:55 WAT cron):**
1. Query DailyVerse for today's date via DAO
2. Store in Redis with 24-hour TTL: key = `daily-verse:YYYY-MM-DD`

**Verse notification (06:00 WAT cron):**
1. Get today's verse (from Redis)
2. Query all users where notifications.dailyVerse = true AND notifications.fcmToken exists
3. Batch send push notifications via FCM

**API: GET /daily-verse:**
1. Check Redis for `daily-verse:YYYY-MM-DD`
2. If cache hit: return cached verse
3. If cache miss: query DB, cache result, return

---

## 7. Starting a Conversation from Topic

**Logic in `src/logic/conversation.ts` → `_createConversation()`:**

1. If topic slug provided:
   - Look up Topic document by slug via DAO
   - Get systemPromptAddition and suggestedFirstMessage
2. Create Conversation document with topic set
3. Return conversation ID + suggestedFirstMessage (if any)
4. App pre-fills input with suggestedFirstMessage
5. When first message is sent, the topic's systemPromptAddition is injected into system prompt

---

## 8. Commitment Reminder Notifications

**Runs every minute via cron:**

1. Get current time as HH:MM string
2. Find Commitments where:
   - status = "active"
   - schedule.reminderTime = current time
3. For each commitment, populate the user
4. Skip if user.notifications.commitmentReminders is false
5. Skip if user.notifications.fcmToken is missing
6. Check if user already checked in today → skip if yes
7. Send push notification:
   - If streak > 0: "Great job. Each strong day builds momentum. (X day streak!)"
   - If streak = 0: "It's okay. Progress isn't perfection. Let's try again today."

---

## 9. Memory Extraction (Background Job)

**Runs every 6 hours via cron:**

1. Find users where dataControls.personalizeWithMemories = true
2. For each user, find conversations with new messages since last memory extraction
3. Load the recent messages from those conversations
4. Send to Gemini Flash with prompt: "Based on these conversations, extract key personal facts about this user. Return as JSON array of { fact, confidence }. Only include new facts not in the existing memory: [existing facts list]"
5. Parse response, append new facts to UserMemory.memories array
6. Update UserMemory.lastUpdated

---

## 10. Account & Data Deletion

**Delete all conversations (`_deleteAllConversations()` in logic/conversation.ts):**
1. Find all conversation IDs for user
2. Delete all Messages where conversationId is in that list
3. Delete all Conversations for user
4. Clear UserMemory document (set memories to empty array)

**Delete account (`_deleteAccount()` in logic/auth.ts):**
1. Delete all Messages for user
2. Delete all Conversations for user
3. Delete all CheckIns for user
4. Delete all Commitments for user
5. Delete UserMemory for user
6. Delete all Feedback for user
7. Delete User document
8. Delete Firebase Auth account via admin SDK
