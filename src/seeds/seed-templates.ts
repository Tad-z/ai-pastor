/**
 * Seed: Encouragement Templates
 * Run: npx ts-node src/seeds/seed-templates.ts
 * 
 * Populates the EncouragementTemplate collection with pre-written messages
 * for commitment check-in responses. These save API costs by avoiding
 * live AI calls on predictable scenarios.
 */

import mongoose from "mongoose";
import { EncouragementTemplate } from "../database/models/encouragementTemplate";
import { env } from "../config/env";

const templates = [
  // === FIRST CHECK-IN ===
  {
    scenario: "first_checkin",
    category: null,
    messages: [
      "I'm proud of you for taking this step. Growth starts with one decision. I'll help you track your progress and stay encouraged. Let's take this one day at a time. 🙏",
      "This is a brave move. The fact that you're choosing accountability says everything about your heart. I'm here with you — one day at a time.",
      "You've made a powerful decision today. 'For I know the plans I have for you,' declares the Lord. — Jeremiah 29:11. Let's walk this journey together.",
    ],
    scriptureRef: "Jeremiah 29:11",
  },

  // === EARLY SUCCESS (streak 1-3) ===
  {
    scenario: "early_success",
    category: null,
    messages: [
      "One day at a time. You showed up today, and that matters. 🙏",
      "Day by day, you're building something real. Keep going.",
      "Every journey starts with a single step. You've taken yours. Proud of you.",
      "You chose strength today. That's not small — that's everything.",
      "The hardest part is starting, and you've already done that. Keep this momentum.",
      "Today you proved something to yourself. Hold onto that feeling.",
    ],
    scriptureRef: "Lamentations 3:22-23",
  },

  // === DAILY SUCCESS (rotation pool for normal days) ===
  {
    scenario: "daily_success",
    category: null,
    messages: [
      "Another day, another victory. God sees your faithfulness.",
      "You stayed strong today. That's not small — that's everything.",
      "Consistency beats perfection. And you're being consistent. 💪",
      "The fact that you checked in shows real commitment. Keep this energy.",
      "'But those who hope in the Lord will renew their strength.' — Isaiah 40:31. That's you.",
      "You're writing a new story, one day at a time. Keep writing.",
      "Your strength today builds tomorrow's foundation. Well done.",
      "God's grace is sufficient, and your effort is showing. Keep pressing forward.",
      "Each day you stand firm is a testimony in the making.",
      "You didn't just survive today — you overcame. That matters.",
      "'The Lord is my strength and my shield; my heart trusts in Him, and He helps me.' — Psalm 28:7",
      "Progress isn't always loud. Sometimes it's quiet faithfulness like this. Keep going.",
      "You're building discipline that will overflow into every area of your life.",
      "Another day of choosing God's strength over your own. Beautiful.",
      "Your persistence is inspiring. Don't stop now.",
      "Small victories compound into life-changing transformation. This is one of those victories.",
      "'He who began a good work in you will carry it on to completion.' — Philippians 1:6",
      "You showed up again. That's not habit yet — that's heart. It'll become both.",
      "Steady and faithful. That's what God sees in you right now.",
      "The chains are loosening. Keep going — freedom is ahead.",
    ],
    scriptureRef: null,
  },

  // === MILESTONES ===
  {
    scenario: "milestone",
    milestoneDay: 7,
    category: null,
    messages: [
      "🎉 7 days strong! A full week of victory. 'The Lord your God is with you, the Mighty Warrior who saves.' — Zephaniah 3:17. You're proving what's possible.",
      "One whole week! 7 days of choosing strength. You should be proud — this is real progress. 'Be strong and courageous. Do not be afraid.' — Joshua 1:9",
      "7 days! A full week of standing firm. Most people don't make it this far. You did. Keep going. 🙏",
    ],
    scriptureRef: "Zephaniah 3:17",
  },
  {
    scenario: "milestone",
    milestoneDay: 14,
    category: null,
    messages: [
      "Two weeks! 14 days of consistency. Your discipline is proof of God's strength working in you. 'I can do all things through Christ who strengthens me.' — Philippians 4:13 💪",
      "14 days! That's not luck — that's transformation happening in real time. God is doing something powerful in your life.",
      "Two full weeks of victory. You're building a testimony that will encourage others. Keep standing strong.",
    ],
    scriptureRef: "Philippians 4:13",
  },
  {
    scenario: "milestone",
    milestoneDay: 30,
    category: null,
    messages: [
      "🎉 30 DAYS! A whole month of standing strong. This isn't willpower alone — this is God's grace at work. 'Therefore, if anyone is in Christ, the new creation has come.' — 2 Corinthians 5:17",
      "One month! 30 days of choosing freedom. You're not the same person who started this journey. God is making you new.",
      "30 days! 🎉 Most people give up in the first week. You're here, standing, growing, transforming. This is your testimony.",
    ],
    scriptureRef: "2 Corinthians 5:17",
  },
  {
    scenario: "milestone",
    milestoneDay: 60,
    category: null,
    messages: [
      "60 days of victory! Two full months. You are living proof that change is possible. Your faithfulness is an inspiration. 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.' — Galatians 6:9",
      "Two months strong! 60 days. The habits you're building now are becoming part of who you are. God is reshaping you from the inside out.",
      "60 days! What started as a commitment has become a lifestyle. You're not just resisting — you're transforming. 🙏",
    ],
    scriptureRef: "Galatians 6:9",
  },
  {
    scenario: "milestone",
    milestoneDay: 90,
    category: null,
    messages: [
      "🎉 90 DAYS! Three months of standing strong! You didn't just resist — you grew. You didn't just survive — you overcame. This is a powerful testimony. 'But thanks be to God! He gives us the victory through our Lord Jesus Christ.' — 1 Corinthians 15:57",
      "THREE MONTHS! 90 days of faithfulness. If you could see yourself the way God sees you right now — radiant, strong, victorious. This journey has changed you. 🎉",
      "90 days! Most people said it couldn't be done. You proved them wrong. God's strength carried you here, and it will carry you forward. You are a new creation.",
    ],
    scriptureRef: "1 Corinthians 15:57",
  },

  // === RETURN AFTER ABSENCE (not templated — AI generated) ===
  // This scenario is handled by live AI call in the logic layer.
  // Including a fallback in case AI call fails.
  {
    scenario: "return_after_absence",
    category: null,
    messages: [
      "Welcome back. No judgment here — just glad you're here. Every day is a fresh start. 'His mercies are new every morning.' — Lamentations 3:22-23. Ready to try again?",
      "You're back, and that takes courage. Missing a day (or a few) doesn't erase your progress. Let's pick up where we left off. 🙏",
      "Hey — I noticed you were away. No pressure, no guilt. Just glad you showed up today. That matters more than you know.",
    ],
    scriptureRef: "Lamentations 3:22-23",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log("Connected to MongoDB");

    await EncouragementTemplate.deleteMany({});
    console.log("Cleared existing templates");

    await EncouragementTemplate.insertMany(templates);
    console.log(`Seeded ${templates.length} encouragement templates`);

    await mongoose.disconnect();
    console.log("Done!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
