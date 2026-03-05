/**
 * Seed: Default Topics
 * Run: npx ts-node src/seeds/seed-topics.ts
 *
 * Populates the Topic collection with the home screen quick-start chips.
 * These match the Figma designs: "Battling Addiction", "Daily Devotional", "Prayer for Anxiety"
 */

import mongoose from "mongoose";
import { Topic } from "../database/models/topic";
import { env } from "../config/env";

const topics = [
  {
    slug: "battling-addiction",
    label: "Battling Addiction",
    icon: "🔗",
    order: 1,
    isDefault: true,
    suggestedFirstMessage:
      "I've been struggling with an addiction and I need guidance and support.",
    systemPromptAddition: `TOPIC CONTEXT: This person selected "Battling Addiction." They are seeking help with addiction. Be extra compassionate and never judgmental. Acknowledge that relapse is part of recovery. Do not minimize their struggle. When appropriate (after they share details), offer to help them track their progress with a commitment. Remember that addiction carries shame — create a safe space.`,
  },
  {
    slug: "daily-devotional",
    label: "Daily Devotional",
    icon: "📖",
    order: 2,
    isDefault: true,
    suggestedFirstMessage:
      "I'd like a devotional for today. Something to meditate on and carry with me.",
    systemPromptAddition: `TOPIC CONTEXT: This person wants a daily devotional. Provide a thoughtful devotional that includes: a Scripture passage, a brief reflection on its meaning, and a practical application for their day. Keep it warm and encouraging. End with a short prayer they can pray.`,
  },
  {
    slug: "prayer-for-anxiety",
    label: "Prayer for Anxiety",
    icon: "🕊️",
    order: 3,
    isDefault: true,
    suggestedFirstMessage:
      "I've been feeling really anxious lately. Can you pray with me and share some words of comfort?",
    systemPromptAddition: `TOPIC CONTEXT: This person selected "Prayer for Anxiety." They are dealing with anxiety. Acknowledge that anxiety is real and valid — do not dismiss it. Offer both spiritual comfort and practical coping advice. If the anxiety seems severe or persistent, gently encourage professional help alongside prayer. Lead with calming, reassuring language. Include a prayer they can pray.`,
  },
  {
    slug: "marriage-relationships",
    label: "Marriage & Relationships",
    icon: "💑",
    order: 4,
    isDefault: true,
    suggestedFirstMessage:
      "I need guidance about my relationship. Can we talk?",
    systemPromptAddition: `TOPIC CONTEXT: This person wants to discuss marriage or relationships. Be sensitive to Nigerian cultural context: family involvement in marriages, bride price, societal pressure around singleness, and the weight of community expectations. Provide balanced, scripture-grounded advice. Do not take sides in conflicts without hearing the full picture. If abuse is mentioned, follow safety protocols.`,
  },
  {
    slug: "grief-and-loss",
    label: "Grief & Loss",
    icon: "🕯️",
    order: 5,
    isDefault: true,
    suggestedFirstMessage:
      "I recently lost someone close to me. I'm struggling to cope.",
    systemPromptAddition: `TOPIC CONTEXT: This person is grieving a loss. Lead with empathy and compassion — do not rush to "fix" their pain. Acknowledge that grief takes time and looks different for everyone. Share comforting Scripture gently, not as a lecture. Let them express their feelings without judgment. If they seem stuck in deep despair, gently encourage speaking with a counselor or trusted person.`,
  },
  {
    slug: "financial-struggles",
    label: "Financial Struggles",
    icon: "💰",
    order: 6,
    isDefault: false,
    suggestedFirstMessage:
      "I'm going through serious financial difficulties. I need encouragement and wisdom.",
    systemPromptAddition: `TOPIC CONTEXT: This person is dealing with financial hardship. Understand the Nigerian economic context: sapa, inflation, unemployment, business failures. Do not give specific financial advice (you're not a financial advisor). Focus on spiritual encouragement, Biblical principles of stewardship and trust in provision, and practical wisdom. Be sensitive — financial stress is deeply connected to dignity and identity in Nigerian culture.`,
  },
  {
    slug: "anger-management",
    label: "Controlling Anger",
    icon: "😤",
    order: 7,
    isDefault: false,
    suggestedFirstMessage:
      "I have a problem with anger. I keep losing my temper and it's affecting my relationships.",
    systemPromptAddition: `TOPIC CONTEXT: This person struggles with anger. Be non-judgmental — anger itself is not sinful, but uncontrolled anger can be destructive. Help them identify triggers and patterns. Share Scripture on self-control and patience. If appropriate, suggest commitment tracking for managing anger. If the anger seems connected to deeper issues (trauma, abuse), gently explore that.`,
  },
  {
    slug: "faith-doubts",
    label: "Doubting My Faith",
    icon: "❓",
    order: 8,
    isDefault: false,
    suggestedFirstMessage:
      "I've been having doubts about my faith. I'm not sure what I believe anymore.",
    systemPromptAddition: `TOPIC CONTEXT: This person is experiencing faith doubts. This is extremely sensitive — do NOT be dismissive or preachy. Doubt is a normal part of faith for many believers. Create a safe space for honest questions. Share stories of Biblical figures who also doubted (Thomas, David, Job). Encourage them that questioning can lead to deeper faith. Do not pressure them or make them feel guilty for doubting.`,
  },
  {
    slug: "career-purpose",
    label: "Career & Purpose",
    icon: "🎯",
    order: 9,
    isDefault: false,
    suggestedFirstMessage:
      "I feel lost about my career and purpose in life. I need guidance.",
    systemPromptAddition: `TOPIC CONTEXT: This person is seeking guidance about their career or life purpose. Understand Nigerian context: pressure to "make it," comparisons with peers, family expectations about career choices, JAPA culture. Help them explore purpose through Scripture and self-reflection. Do not give specific career advice — focus on principles of discernment, using their gifts, and trusting God's timing.`,
  },
  {
    slug: "forgiveness",
    label: "Forgiveness",
    icon: "🤝",
    order: 10,
    isDefault: false,
    suggestedFirstMessage:
      "I'm struggling to forgive someone who hurt me deeply.",
    systemPromptAddition: `TOPIC CONTEXT: This person is struggling with forgiveness. Be empathetic — forgiveness is a process, not a switch. Do not minimize the pain they experienced. Acknowledge that what happened to them was wrong. Share Scripture on forgiveness gently, framing it as freedom for themselves, not excusing the offender. If the hurt involves abuse, follow safety protocols and do not pressure forgiveness.`,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log("Connected to MongoDB");

    await Topic.deleteMany({});
    console.log("Cleared existing topics");

    await Topic.insertMany(topics);
    console.log(`Seeded ${topics.length} topics (${topics.filter((t) => t.isDefault).length} default, ${topics.filter((t) => !t.isDefault).length} additional)`);

    await mongoose.disconnect();
    console.log("Done!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
