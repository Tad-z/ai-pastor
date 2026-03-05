/**
 * Seed: Daily Verses
 * Run: npx ts-node src/seeds/seed-verses.ts
 *
 * Populates the DailyVerse collection with 365 entries for the year.
 * Verses are themed loosely by month to provide seasonal relevance.
 * All verses use NIV translation unless otherwise noted.
 *
 * To regenerate for a new year, update the `year` constant below.
 */

import mongoose from "mongoose";
import { DailyVerse } from "../database/models/dailyVerse";
import { env } from "../config/env";

const year = 2026;

const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

interface VerseEntry {
  book: string;
  chapter: number;
  verseRange: string;
  text: string;
  theme: string;
}

// Helper to create a date for a given day of year
const dateForDay = (month: number, day: number): Date => {
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const verses: { month: number; day: number; verse: VerseEntry }[] = [
  // =====================
  // JANUARY — New Beginnings, Hope, Fresh Start
  // =====================
  { month: 1, day: 1, verse: { book: "Lamentations", chapter: 3, verseRange: "22-23", text: "Because of the Lord's great love we are not consumed, for His compassions never fail. They are new every morning; great is Your faithfulness.", theme: "faithfulness" } },
  { month: 1, day: 2, verse: { book: "Isaiah", chapter: 43, verseRange: "19", text: "See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.", theme: "new beginnings" } },
  { month: 1, day: 3, verse: { book: "Jeremiah", chapter: 29, verseRange: "11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", theme: "hope" } },
  { month: 1, day: 4, verse: { book: "Philippians", chapter: 3, verseRange: "13-14", text: "Brothers and sisters, I do not consider myself yet to have taken hold of it. But one thing I do: Forgetting what is behind and straining toward what is ahead, I press on toward the goal.", theme: "perseverance" } },
  { month: 1, day: 5, verse: { book: "2 Corinthians", chapter: 5, verseRange: "17", text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", theme: "transformation" } },
  { month: 1, day: 6, verse: { book: "Psalm", chapter: 37, verseRange: "4", text: "Take delight in the Lord, and He will give you the desires of your heart.", theme: "trust" } },
  { month: 1, day: 7, verse: { book: "Proverbs", chapter: 3, verseRange: "5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight.", theme: "trust" } },
  { month: 1, day: 8, verse: { book: "Isaiah", chapter: 40, verseRange: "31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", theme: "strength" } },
  { month: 1, day: 9, verse: { book: "Joshua", chapter: 1, verseRange: "9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", theme: "courage" } },
  { month: 1, day: 10, verse: { book: "Psalm", chapter: 139, verseRange: "14", text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.", theme: "identity" } },
  { month: 1, day: 11, verse: { book: "Romans", chapter: 8, verseRange: "28", text: "And we know that in all things God works for the good of those who love Him, who have been called according to His purpose.", theme: "purpose" } },
  { month: 1, day: 12, verse: { book: "Psalm", chapter: 46, verseRange: "1", text: "God is our refuge and strength, an ever-present help in trouble.", theme: "refuge" } },
  { month: 1, day: 13, verse: { book: "Matthew", chapter: 6, verseRange: "33", text: "But seek first His kingdom and His righteousness, and all these things will be given to you as well.", theme: "priorities" } },
  { month: 1, day: 14, verse: { book: "Philippians", chapter: 4, verseRange: "13", text: "I can do all this through Him who gives me strength.", theme: "strength" } },
  { month: 1, day: 15, verse: { book: "Psalm", chapter: 23, verseRange: "1-3", text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, He leads me beside quiet waters, He refreshes my soul.", theme: "peace" } },
  { month: 1, day: 16, verse: { book: "Hebrews", chapter: 11, verseRange: "1", text: "Now faith is confidence in what we hope for and assurance about what we do not see.", theme: "faith" } },
  { month: 1, day: 17, verse: { book: "Romans", chapter: 12, verseRange: "2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is.", theme: "transformation" } },
  { month: 1, day: 18, verse: { book: "Psalm", chapter: 27, verseRange: "1", text: "The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?", theme: "courage" } },
  { month: 1, day: 19, verse: { book: "Isaiah", chapter: 41, verseRange: "10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.", theme: "courage" } },
  { month: 1, day: 20, verse: { book: "Psalm", chapter: 34, verseRange: "18", text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", theme: "comfort" } },
  { month: 1, day: 21, verse: { book: "James", chapter: 1, verseRange: "2-3", text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.", theme: "perseverance" } },
  { month: 1, day: 22, verse: { book: "Psalm", chapter: 91, verseRange: "1-2", text: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress, my God, in whom I trust.", theme: "protection" } },
  { month: 1, day: 23, verse: { book: "John", chapter: 3, verseRange: "16", text: "For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.", theme: "love" } },
  { month: 1, day: 24, verse: { book: "Proverbs", chapter: 16, verseRange: "3", text: "Commit to the Lord whatever you do, and He will establish your plans.", theme: "trust" } },
  { month: 1, day: 25, verse: { book: "1 Peter", chapter: 5, verseRange: "7", text: "Cast all your anxiety on Him because He cares for you.", theme: "anxiety" } },
  { month: 1, day: 26, verse: { book: "Psalm", chapter: 119, verseRange: "105", text: "Your word is a lamp for my feet, a light on my path.", theme: "guidance" } },
  { month: 1, day: 27, verse: { book: "Galatians", chapter: 6, verseRange: "9", text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", theme: "perseverance" } },
  { month: 1, day: 28, verse: { book: "Philippians", chapter: 4, verseRange: "6-7", text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God will guard your hearts and minds.", theme: "peace" } },
  { month: 1, day: 29, verse: { book: "Deuteronomy", chapter: 31, verseRange: "6", text: "Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; He will never leave you nor forsake you.", theme: "courage" } },
  { month: 1, day: 30, verse: { book: "Psalm", chapter: 121, verseRange: "1-2", text: "I lift up my eyes to the mountains — where does my help come from? My help comes from the Lord, the Maker of heaven and earth.", theme: "help" } },
  { month: 1, day: 31, verse: { book: "Matthew", chapter: 11, verseRange: "28", text: "Come to me, all you who are weary and burdened, and I will give you rest.", theme: "rest" } },

  // =====================
  // FEBRUARY — Love, Grace, Relationships
  // =====================
  { month: 2, day: 1, verse: { book: "1 Corinthians", chapter: 13, verseRange: "4-5", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking.", theme: "love" } },
  { month: 2, day: 2, verse: { book: "1 John", chapter: 4, verseRange: "19", text: "We love because He first loved us.", theme: "love" } },
  { month: 2, day: 3, verse: { book: "Romans", chapter: 5, verseRange: "8", text: "But God demonstrates His own love for us in this: While we were still sinners, Christ died for us.", theme: "grace" } },
  { month: 2, day: 4, verse: { book: "Ephesians", chapter: 2, verseRange: "8-9", text: "For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.", theme: "grace" } },
  { month: 2, day: 5, verse: { book: "1 John", chapter: 4, verseRange: "7-8", text: "Dear friends, let us love one another, for love comes from God. Everyone who loves has been born of God and knows God. Whoever does not love does not know God, because God is love.", theme: "love" } },
  { month: 2, day: 6, verse: { book: "Colossians", chapter: 3, verseRange: "13", text: "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.", theme: "forgiveness" } },
  { month: 2, day: 7, verse: { book: "Proverbs", chapter: 17, verseRange: "17", text: "A friend loves at all times, and a brother is born for a time of adversity.", theme: "friendship" } },
  { month: 2, day: 8, verse: { book: "Romans", chapter: 8, verseRange: "38-39", text: "For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God.", theme: "love" } },
  { month: 2, day: 9, verse: { book: "Ephesians", chapter: 4, verseRange: "32", text: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.", theme: "kindness" } },
  { month: 2, day: 10, verse: { book: "1 Corinthians", chapter: 16, verseRange: "14", text: "Do everything in love.", theme: "love" } },
  { month: 2, day: 11, verse: { book: "Song of Solomon", chapter: 8, verseRange: "7", text: "Many waters cannot quench love; rivers cannot sweep it away.", theme: "love" } },
  { month: 2, day: 12, verse: { book: "Psalm", chapter: 103, verseRange: "8", text: "The Lord is compassionate and gracious, slow to anger, abounding in love.", theme: "grace" } },
  { month: 2, day: 13, verse: { book: "John", chapter: 15, verseRange: "12-13", text: "My command is this: Love each other as I have loved you. Greater love has no one than this: to lay down one's life for one's friends.", theme: "love" } },
  { month: 2, day: 14, verse: { book: "1 John", chapter: 3, verseRange: "18", text: "Dear children, let us not love with words or speech but with actions and in truth.", theme: "love" } },
  { month: 2, day: 15, verse: { book: "Ephesians", chapter: 5, verseRange: "25", text: "Husbands, love your wives, just as Christ loved the church and gave Himself up for her.", theme: "marriage" } },
  { month: 2, day: 16, verse: { book: "Ruth", chapter: 1, verseRange: "16", text: "Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.", theme: "loyalty" } },
  { month: 2, day: 17, verse: { book: "Proverbs", chapter: 31, verseRange: "10", text: "A wife of noble character who can find? She is worth far more than rubies.", theme: "marriage" } },
  { month: 2, day: 18, verse: { book: "Psalm", chapter: 86, verseRange: "15", text: "But you, Lord, are a compassionate and gracious God, slow to anger, abounding in love and faithfulness.", theme: "grace" } },
  { month: 2, day: 19, verse: { book: "Romans", chapter: 13, verseRange: "10", text: "Love does no harm to a neighbor. Therefore love is the fulfillment of the law.", theme: "love" } },
  { month: 2, day: 20, verse: { book: "Zephaniah", chapter: 3, verseRange: "17", text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in His love He will no longer rebuke you, but will rejoice over you with singing.", theme: "love" } },
  { month: 2, day: 21, verse: { book: "1 Peter", chapter: 4, verseRange: "8", text: "Above all, love each other deeply, because love covers over a multitude of sins.", theme: "love" } },
  { month: 2, day: 22, verse: { book: "Psalm", chapter: 136, verseRange: "1", text: "Give thanks to the Lord, for He is good. His love endures forever.", theme: "gratitude" } },
  { month: 2, day: 23, verse: { book: "Mark", chapter: 12, verseRange: "30-31", text: "Love the Lord your God with all your heart and with all your soul and with all your mind and with all your strength. Love your neighbor as yourself.", theme: "love" } },
  { month: 2, day: 24, verse: { book: "Proverbs", chapter: 10, verseRange: "12", text: "Hatred stirs up conflict, but love covers over all wrongs.", theme: "love" } },
  { month: 2, day: 25, verse: { book: "Micah", chapter: 6, verseRange: "8", text: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.", theme: "justice" } },
  { month: 2, day: 26, verse: { book: "John", chapter: 13, verseRange: "34-35", text: "A new command I give you: Love one another. As I have loved you, so you must love one another. By this everyone will know that you are my disciples.", theme: "love" } },
  { month: 2, day: 27, verse: { book: "Psalm", chapter: 63, verseRange: "3", text: "Because Your lovingkindness is better than life, my lips shall praise You.", theme: "love" } },
  { month: 2, day: 28, verse: { book: "Galatians", chapter: 5, verseRange: "22-23", text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.", theme: "character" } },
  { month: 2, day: 29, verse: { book: "Psalm", chapter: 31, verseRange: "15", text: "My times are in Your hands; deliver me from the hands of my enemies, from those who pursue me.", theme: "trust" } },

  // =====================
  // MARCH — Strength, Overcoming, Resilience
  // =====================
  { month: 3, day: 1, verse: { book: "Psalm", chapter: 18, verseRange: "2", text: "The Lord is my rock, my fortress and my deliverer; my God is my rock, in whom I take refuge.", theme: "strength" } },
  { month: 3, day: 2, verse: { book: "2 Timothy", chapter: 1, verseRange: "7", text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.", theme: "power" } },
  { month: 3, day: 3, verse: { book: "Isaiah", chapter: 54, verseRange: "17", text: "No weapon forged against you will prevail, and you will refute every tongue that accuses you.", theme: "victory" } },
  { month: 3, day: 4, verse: { book: "Romans", chapter: 8, verseRange: "37", text: "No, in all these things we are more than conquerors through Him who loved us.", theme: "victory" } },
  { month: 3, day: 5, verse: { book: "1 Corinthians", chapter: 10, verseRange: "13", text: "No temptation has overtaken you except what is common to mankind. And God is faithful; He will not let you be tempted beyond what you can bear.", theme: "temptation" } },
  { month: 3, day: 6, verse: { book: "Psalm", chapter: 28, verseRange: "7", text: "The Lord is my strength and my shield; my heart trusts in Him, and He helps me.", theme: "trust" } },
  { month: 3, day: 7, verse: { book: "Nehemiah", chapter: 8, verseRange: "10", text: "Do not grieve, for the joy of the Lord is your strength.", theme: "joy" } },
  { month: 3, day: 8, verse: { book: "2 Corinthians", chapter: 12, verseRange: "9", text: "My grace is sufficient for you, for my power is made perfect in weakness.", theme: "grace" } },
  { month: 3, day: 9, verse: { book: "Ephesians", chapter: 6, verseRange: "10", text: "Finally, be strong in the Lord and in His mighty power.", theme: "strength" } },
  { month: 3, day: 10, verse: { book: "Psalm", chapter: 73, verseRange: "26", text: "My flesh and my heart may fail, but God is the strength of my heart and my portion forever.", theme: "strength" } },
  { month: 3, day: 11, verse: { book: "Isaiah", chapter: 40, verseRange: "29", text: "He gives strength to the weary and increases the power of the weak.", theme: "strength" } },
  { month: 3, day: 12, verse: { book: "Psalm", chapter: 55, verseRange: "22", text: "Cast your cares on the Lord and He will sustain you; He will never let the righteous be shaken.", theme: "trust" } },
  { month: 3, day: 13, verse: { book: "Habakkuk", chapter: 3, verseRange: "19", text: "The Sovereign Lord is my strength; He makes my feet like the feet of a deer, He enables me to tread on the heights.", theme: "strength" } },
  { month: 3, day: 14, verse: { book: "Psalm", chapter: 31, verseRange: "24", text: "Be strong and take heart, all you who hope in the Lord.", theme: "hope" } },
  { month: 3, day: 15, verse: { book: "Isaiah", chapter: 30, verseRange: "15", text: "In repentance and rest is your salvation, in quietness and trust is your strength.", theme: "rest" } },
  { month: 3, day: 16, verse: { book: "Psalm", chapter: 46, verseRange: "10", text: "He says, 'Be still, and know that I am God.'", theme: "peace" } },
  { month: 3, day: 17, verse: { book: "Exodus", chapter: 14, verseRange: "14", text: "The Lord will fight for you; you need only to be still.", theme: "trust" } },
  { month: 3, day: 18, verse: { book: "Psalm", chapter: 62, verseRange: "1-2", text: "Truly my soul finds rest in God; my salvation comes from Him. Truly He is my rock and my salvation; He is my fortress, I will never be shaken.", theme: "security" } },
  { month: 3, day: 19, verse: { book: "1 John", chapter: 4, verseRange: "4", text: "You, dear children, are from God and have overcome them, because the One who is in you is greater than the one who is in the world.", theme: "victory" } },
  { month: 3, day: 20, verse: { book: "Psalm", chapter: 118, verseRange: "6", text: "The Lord is with me; I will not be afraid. What can mere mortals do to me?", theme: "courage" } },
  { month: 3, day: 21, verse: { book: "Isaiah", chapter: 26, verseRange: "3", text: "You will keep in perfect peace those whose minds are steadfast, because they trust in You.", theme: "peace" } },
  { month: 3, day: 22, verse: { book: "Psalm", chapter: 16, verseRange: "8", text: "I keep my eyes always on the Lord. With Him at my right hand, I will not be shaken.", theme: "stability" } },
  { month: 3, day: 23, verse: { book: "John", chapter: 16, verseRange: "33", text: "I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.", theme: "peace" } },
  { month: 3, day: 24, verse: { book: "Psalm", chapter: 30, verseRange: "5", text: "For His anger lasts only a moment, but His favor lasts a lifetime; weeping may stay for the night, but rejoicing comes in the morning.", theme: "hope" } },
  { month: 3, day: 25, verse: { book: "Hebrews", chapter: 12, verseRange: "1", text: "Let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us.", theme: "perseverance" } },
  { month: 3, day: 26, verse: { book: "Isaiah", chapter: 61, verseRange: "3", text: "To bestow on them a crown of beauty instead of ashes, the oil of joy instead of mourning, and a garment of praise instead of a spirit of despair.", theme: "restoration" } },
  { month: 3, day: 27, verse: { book: "Psalm", chapter: 147, verseRange: "3", text: "He heals the brokenhearted and binds up their wounds.", theme: "healing" } },
  { month: 3, day: 28, verse: { book: "Joel", chapter: 2, verseRange: "25", text: "I will repay you for the years the locusts have eaten.", theme: "restoration" } },
  { month: 3, day: 29, verse: { book: "Revelation", chapter: 21, verseRange: "4", text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.", theme: "hope" } },
  { month: 3, day: 30, verse: { book: "Psalm", chapter: 40, verseRange: "1-2", text: "I waited patiently for the Lord; He turned to me and heard my cry. He lifted me out of the slimy pit, out of the mud and mire; He set my feet on a rock.", theme: "deliverance" } },
  { month: 3, day: 31, verse: { book: "Romans", chapter: 15, verseRange: "13", text: "May the God of hope fill you with all joy and peace as you trust in Him, so that you may overflow with hope by the power of the Holy Spirit.", theme: "hope" } },
];

// =====================
// APRIL–DECEMBER: Generate remaining months using a curated verse pool
// Each month gets ~30 verses with a loose theme
// =====================

const versePool: { [month: number]: { theme: string; entries: VerseEntry[] } } = {
  4: { // APRIL — Faith, Trust, Patience
    theme: "faith",
    entries: [
      { book: "Hebrews", chapter: 11, verseRange: "6", text: "And without faith it is impossible to please God, because anyone who comes to Him must believe that He exists and that He rewards those who earnestly seek Him.", theme: "faith" },
      { book: "Mark", chapter: 11, verseRange: "24", text: "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.", theme: "prayer" },
      { book: "Psalm", chapter: 37, verseRange: "7", text: "Be still before the Lord and wait patiently for Him; do not fret when people succeed in their ways.", theme: "patience" },
      { book: "James", chapter: 1, verseRange: "6", text: "But when you ask, you must believe and not doubt, because the one who doubts is like a wave of the sea, blown and tossed by the wind.", theme: "faith" },
      { book: "Psalm", chapter: 27, verseRange: "14", text: "Wait for the Lord; be strong and take heart and wait for the Lord.", theme: "patience" },
      { book: "Proverbs", chapter: 3, verseRange: "26", text: "For the Lord will be at your side and will keep your foot from being snared.", theme: "protection" },
      { book: "Matthew", chapter: 17, verseRange: "20", text: "Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, 'Move from here to there,' and it will move.", theme: "faith" },
      { book: "Psalm", chapter: 33, verseRange: "20-21", text: "We wait in hope for the Lord; He is our help and our shield. In Him our hearts rejoice, for we trust in His holy name.", theme: "hope" },
      { book: "Isaiah", chapter: 40, verseRange: "8", text: "The grass withers and the flowers fall, but the word of our God endures forever.", theme: "God's word" },
      { book: "Psalm", chapter: 56, verseRange: "3-4", text: "When I am afraid, I put my trust in You. In God, whose word I praise — in God I trust and am not afraid.", theme: "trust" },
      { book: "Proverbs", chapter: 18, verseRange: "10", text: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", theme: "protection" },
      { book: "Romans", chapter: 10, verseRange: "17", text: "Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.", theme: "faith" },
      { book: "Psalm", chapter: 9, verseRange: "10", text: "Those who know Your name trust in You, for You, Lord, have never forsaken those who seek You.", theme: "trust" },
      { book: "2 Corinthians", chapter: 4, verseRange: "17-18", text: "For our light and momentary troubles are achieving for us an eternal glory that far outweighs them all. So we fix our eyes not on what is seen, but on what is unseen.", theme: "perspective" },
      { book: "Psalm", chapter: 62, verseRange: "8", text: "Trust in Him at all times, you people; pour out your hearts to Him, for God is our refuge.", theme: "trust" },
      { book: "Hebrews", chapter: 10, verseRange: "23", text: "Let us hold unswervingly to the hope we profess, for He who promised is faithful.", theme: "faithfulness" },
      { book: "Psalm", chapter: 20, verseRange: "7", text: "Some trust in chariots and some in horses, but we trust in the name of the Lord our God.", theme: "trust" },
      { book: "2 Thessalonians", chapter: 3, verseRange: "3", text: "But the Lord is faithful, and He will strengthen you and protect you from the evil one.", theme: "protection" },
      { book: "Psalm", chapter: 5, verseRange: "11", text: "But let all who take refuge in You be glad; let them ever sing for joy.", theme: "joy" },
      { book: "Isaiah", chapter: 12, verseRange: "2", text: "Surely God is my salvation; I will trust and not be afraid. The Lord, the Lord Himself, is my strength and my defense.", theme: "salvation" },
      { book: "Psalm", chapter: 125, verseRange: "1", text: "Those who trust in the Lord are like Mount Zion, which cannot be shaken but endures forever.", theme: "stability" },
      { book: "Proverbs", chapter: 30, verseRange: "5", text: "Every word of God is flawless; He is a shield to those who take refuge in Him.", theme: "God's word" },
      { book: "Nahum", chapter: 1, verseRange: "7", text: "The Lord is good, a refuge in times of trouble. He cares for those who trust in Him.", theme: "refuge" },
      { book: "Psalm", chapter: 112, verseRange: "7", text: "They will have no fear of bad news; their hearts are steadfast, trusting in the Lord.", theme: "trust" },
      { book: "1 Chronicles", chapter: 16, verseRange: "11", text: "Look to the Lord and His strength; seek His face always.", theme: "seeking God" },
      { book: "Psalm", chapter: 143, verseRange: "8", text: "Let the morning bring me word of Your unfailing love, for I have put my trust in You.", theme: "love" },
      { book: "Proverbs", chapter: 28, verseRange: "26", text: "Those who trust in themselves are fools, but those who walk in wisdom are kept safe.", theme: "wisdom" },
      { book: "Psalm", chapter: 84, verseRange: "12", text: "Lord Almighty, blessed is the one who trusts in You.", theme: "trust" },
      { book: "Isaiah", chapter: 26, verseRange: "4", text: "Trust in the Lord forever, for the Lord, the Lord Himself, is the Rock eternal.", theme: "trust" },
      { book: "Psalm", chapter: 115, verseRange: "11", text: "You who fear Him, trust in the Lord — He is their help and shield.", theme: "trust" },
    ],
  },
  // Months 5-12 follow the same pattern.
  // For brevity in this seed file, we generate them from a pool.
};

// Remaining months with curated verse pools (abbreviated for maintainability)
const monthlyVerses: { month: number; theme: string; verses: VerseEntry[] }[] = [
  { month: 5, theme: "wisdom", verses: [
    { book: "Proverbs", chapter: 1, verseRange: "7", text: "The fear of the Lord is the beginning of knowledge, but fools despise wisdom and instruction.", theme: "wisdom" },
    { book: "James", chapter: 1, verseRange: "5", text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.", theme: "wisdom" },
    { book: "Proverbs", chapter: 2, verseRange: "6", text: "For the Lord gives wisdom; from His mouth come knowledge and understanding.", theme: "wisdom" },
    { book: "Proverbs", chapter: 4, verseRange: "7", text: "The beginning of wisdom is this: Get wisdom. Though it cost all you have, get understanding.", theme: "wisdom" },
    { book: "Colossians", chapter: 3, verseRange: "16", text: "Let the message of Christ dwell among you richly as you teach and admonish one another with all wisdom.", theme: "wisdom" },
    { book: "Proverbs", chapter: 9, verseRange: "10", text: "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.", theme: "wisdom" },
    { book: "Proverbs", chapter: 11, verseRange: "2", text: "When pride comes, then comes disgrace, but with humility comes wisdom.", theme: "humility" },
    { book: "Proverbs", chapter: 12, verseRange: "15", text: "The way of fools seems right to them, but the wise listen to advice.", theme: "wisdom" },
    { book: "Proverbs", chapter: 13, verseRange: "20", text: "Walk with the wise and become wise, for a companion of fools suffers harm.", theme: "wisdom" },
    { book: "Proverbs", chapter: 14, verseRange: "29", text: "Whoever is patient has great understanding, but one who is quick-tempered displays folly.", theme: "patience" },
    { book: "Proverbs", chapter: 15, verseRange: "1", text: "A gentle answer turns away wrath, but a harsh word stirs up anger.", theme: "self-control" },
    { book: "Proverbs", chapter: 16, verseRange: "9", text: "In their hearts humans plan their course, but the Lord establishes their steps.", theme: "guidance" },
    { book: "Proverbs", chapter: 19, verseRange: "21", text: "Many are the plans in a person's heart, but it is the Lord's purpose that prevails.", theme: "purpose" },
    { book: "Proverbs", chapter: 20, verseRange: "24", text: "A person's steps are directed by the Lord. How then can anyone understand their own way?", theme: "guidance" },
    { book: "Proverbs", chapter: 21, verseRange: "5", text: "The plans of the diligent lead to profit as surely as haste leads to poverty.", theme: "diligence" },
    { book: "Proverbs", chapter: 22, verseRange: "6", text: "Start children off on the way they should go, and even when they are old they will not turn from it.", theme: "parenting" },
    { book: "Ecclesiastes", chapter: 3, verseRange: "1", text: "There is a time for everything, and a season for every activity under the heavens.", theme: "timing" },
    { book: "Ecclesiastes", chapter: 7, verseRange: "8", text: "The end of a matter is better than its beginning, and patience is better than pride.", theme: "patience" },
    { book: "Proverbs", chapter: 24, verseRange: "16", text: "For though the righteous fall seven times, they rise again, but the wicked stumble when calamity strikes.", theme: "resilience" },
    { book: "Proverbs", chapter: 27, verseRange: "17", text: "As iron sharpens iron, so one person sharpens another.", theme: "community" },
    { book: "Proverbs", chapter: 29, verseRange: "25", text: "Fear of man will prove to be a snare, but whoever trusts in the Lord is kept safe.", theme: "trust" },
    { book: "Psalm", chapter: 1, verseRange: "1-2", text: "Blessed is the one who does not walk in step with the wicked. But whose delight is in the law of the Lord, and who meditates on His law day and night.", theme: "righteousness" },
    { book: "Psalm", chapter: 19, verseRange: "14", text: "May these words of my mouth and this meditation of my heart be pleasing in Your sight, Lord, my Rock and my Redeemer.", theme: "prayer" },
    { book: "Psalm", chapter: 90, verseRange: "12", text: "Teach us to number our days, that we may gain a heart of wisdom.", theme: "wisdom" },
    { book: "Proverbs", chapter: 31, verseRange: "30", text: "Charm is deceptive, and beauty is fleeting; but a woman who fears the Lord is to be praised.", theme: "character" },
    { book: "James", chapter: 3, verseRange: "17", text: "But the wisdom that comes from heaven is first of all pure; then peace-loving, considerate, submissive, full of mercy and good fruit.", theme: "wisdom" },
    { book: "Psalm", chapter: 111, verseRange: "10", text: "The fear of the Lord is the beginning of wisdom; all who follow His precepts have good understanding.", theme: "wisdom" },
    { book: "Proverbs", chapter: 3, verseRange: "13-14", text: "Blessed are those who find wisdom, those who gain understanding, for she is more profitable than silver and yields better returns than gold.", theme: "wisdom" },
    { book: "Psalm", chapter: 32, verseRange: "8", text: "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.", theme: "guidance" },
    { book: "Proverbs", chapter: 8, verseRange: "11", text: "For wisdom is more precious than rubies, and nothing you desire can compare with her.", theme: "wisdom" },
    { book: "Daniel", chapter: 2, verseRange: "21", text: "He changes times and seasons; He deposes kings and raises up others. He gives wisdom to the wise and knowledge to the discerning.", theme: "wisdom" },
  ]},
  { month: 6, theme: "peace", verses: [
    { book: "John", chapter: 14, verseRange: "27", text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", theme: "peace" },
    { book: "Psalm", chapter: 29, verseRange: "11", text: "The Lord gives strength to His people; the Lord blesses His people with peace.", theme: "peace" },
    { book: "Isaiah", chapter: 9, verseRange: "6", text: "For to us a child is born, to us a son is given. And He will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.", theme: "peace" },
    { book: "Psalm", chapter: 4, verseRange: "8", text: "In peace I will lie down and sleep, for You alone, Lord, make me dwell in safety.", theme: "peace" },
    { book: "Colossians", chapter: 3, verseRange: "15", text: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace.", theme: "peace" },
    { book: "Psalm", chapter: 85, verseRange: "8", text: "I will listen to what God the Lord says; He promises peace to His people, His faithful servants.", theme: "peace" },
    { book: "Numbers", chapter: 6, verseRange: "24-26", text: "The Lord bless you and keep you; the Lord make His face shine on you and be gracious to you; the Lord turn His face toward you and give you peace.", theme: "blessing" },
    { book: "2 Thessalonians", chapter: 3, verseRange: "16", text: "Now may the Lord of peace Himself give you peace at all times and in every way.", theme: "peace" },
    { book: "Psalm", chapter: 37, verseRange: "11", text: "But the meek will inherit the land and enjoy peace and prosperity.", theme: "peace" },
    { book: "Matthew", chapter: 5, verseRange: "9", text: "Blessed are the peacemakers, for they will be called children of God.", theme: "peace" },
    { book: "Isaiah", chapter: 32, verseRange: "17", text: "The fruit of that righteousness will be peace; its effect will be quietness and confidence forever.", theme: "peace" },
    { book: "Romans", chapter: 14, verseRange: "19", text: "Let us therefore make every effort to do what leads to peace and to mutual edification.", theme: "peace" },
    { book: "Psalm", chapter: 119, verseRange: "165", text: "Great peace have those who love Your law, and nothing can make them stumble.", theme: "peace" },
    { book: "James", chapter: 3, verseRange: "18", text: "Peacemakers who sow in peace reap a harvest of righteousness.", theme: "peace" },
    { book: "Psalm", chapter: 34, verseRange: "14", text: "Turn from evil and do good; seek peace and pursue it.", theme: "peace" },
    { book: "Hebrews", chapter: 12, verseRange: "14", text: "Make every effort to live in peace with everyone and to be holy; without holiness no one will see the Lord.", theme: "peace" },
    { book: "Isaiah", chapter: 55, verseRange: "12", text: "You will go out in joy and be led forth in peace; the mountains and hills will burst into song before you.", theme: "joy" },
    { book: "Psalm", chapter: 122, verseRange: "6-7", text: "Pray for the peace of Jerusalem: May those who love you be secure. May there be peace within your walls.", theme: "peace" },
    { book: "Romans", chapter: 5, verseRange: "1", text: "Therefore, since we have been justified through faith, we have peace with God through our Lord Jesus Christ.", theme: "peace" },
    { book: "Ephesians", chapter: 2, verseRange: "14", text: "For He Himself is our peace, who has made the two groups one and has destroyed the barrier, the dividing wall of hostility.", theme: "peace" },
    { book: "Psalm", chapter: 37, verseRange: "37", text: "Consider the blameless, observe the upright; a future awaits those who seek peace.", theme: "peace" },
    { book: "1 Peter", chapter: 3, verseRange: "11", text: "They must turn from evil and do good; they must seek peace and pursue it.", theme: "peace" },
    { book: "Psalm", chapter: 72, verseRange: "7", text: "In His days may the righteous flourish and prosperity abound till the moon is no more.", theme: "prosperity" },
    { book: "Isaiah", chapter: 48, verseRange: "18", text: "If only you had paid attention to my commands, your peace would have been like a river, your well-being like the waves of the sea.", theme: "peace" },
    { book: "Proverbs", chapter: 12, verseRange: "20", text: "Deceit is in the hearts of those who plot evil, but those who promote peace have joy.", theme: "joy" },
    { book: "Philippians", chapter: 4, verseRange: "9", text: "Whatever you have learned or received or heard from me, or seen in me — put it into practice. And the God of peace will be with you.", theme: "peace" },
    { book: "Psalm", chapter: 4, verseRange: "3-4", text: "Know that the Lord has set apart His faithful servant for Himself. Tremble and do not sin; when you are on your beds, search your hearts and be silent.", theme: "reflection" },
    { book: "Isaiah", chapter: 57, verseRange: "19", text: "Peace, peace, to those far and near, says the Lord. And I will heal them.", theme: "healing" },
    { book: "Psalm", chapter: 29, verseRange: "2", text: "Ascribe to the Lord the glory due His name; worship the Lord in the splendor of His holiness.", theme: "worship" },
    { book: "John", chapter: 20, verseRange: "21", text: "Again Jesus said, 'Peace be with you! As the Father has sent me, I am sending you.'", theme: "peace" },
  ]},
];

// Generate verse entries for months 7-12 from a universal pool
const universalPool: VerseEntry[] = [
  { book: "Psalm", chapter: 100, verseRange: "4-5", text: "Enter His gates with thanksgiving and His courts with praise; give thanks to Him and praise His name. For the Lord is good and His love endures forever.", theme: "gratitude" },
  { book: "1 Thessalonians", chapter: 5, verseRange: "16-18", text: "Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.", theme: "gratitude" },
  { book: "Psalm", chapter: 107, verseRange: "1", text: "Give thanks to the Lord, for He is good; His love endures forever.", theme: "gratitude" },
  { book: "Colossians", chapter: 3, verseRange: "23", text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", theme: "work" },
  { book: "Matthew", chapter: 7, verseRange: "7", text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.", theme: "prayer" },
  { book: "Psalm", chapter: 51, verseRange: "10", text: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", theme: "renewal" },
  { book: "Proverbs", chapter: 4, verseRange: "23", text: "Above all else, guard your heart, for everything you do flows from it.", theme: "heart" },
  { book: "Matthew", chapter: 5, verseRange: "16", text: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.", theme: "witness" },
  { book: "Psalm", chapter: 145, verseRange: "18", text: "The Lord is near to all who call on Him, to all who call on Him in truth.", theme: "prayer" },
  { book: "Isaiah", chapter: 58, verseRange: "11", text: "The Lord will guide you always; He will satisfy your needs in a sun-scorched land and will strengthen your frame.", theme: "provision" },
  { book: "Psalm", chapter: 23, verseRange: "4", text: "Even though I walk through the darkest valley, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me.", theme: "comfort" },
  { book: "Romans", chapter: 12, verseRange: "12", text: "Be joyful in hope, patient in affliction, faithful in prayer.", theme: "perseverance" },
  { book: "Psalm", chapter: 37, verseRange: "23-24", text: "The Lord makes firm the steps of the one who delights in Him; though he may stumble, he will not fall, for the Lord upholds him with His hand.", theme: "guidance" },
  { book: "Matthew", chapter: 6, verseRange: "34", text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.", theme: "anxiety" },
  { book: "Psalm", chapter: 103, verseRange: "2-3", text: "Praise the Lord, my soul, and forget not all His benefits — who forgives all your sins and heals all your diseases.", theme: "healing" },
  { book: "Ephesians", chapter: 3, verseRange: "20", text: "Now to Him who is able to do immeasurably more than all we ask or imagine, according to His power that is at work within us.", theme: "power" },
  { book: "Psalm", chapter: 150, verseRange: "6", text: "Let everything that has breath praise the Lord. Praise the Lord.", theme: "praise" },
  { book: "2 Chronicles", chapter: 7, verseRange: "14", text: "If my people, who are called by my name, will humble themselves and pray and seek my face and turn from their wicked ways, then I will hear from heaven.", theme: "repentance" },
  { book: "Psalm", chapter: 8, verseRange: "3-4", text: "When I consider Your heavens, the work of Your fingers — what is mankind that You are mindful of them?", theme: "wonder" },
  { book: "Jeremiah", chapter: 33, verseRange: "3", text: "Call to me and I will answer you and tell you great and unsearchable things you do not know.", theme: "prayer" },
  { book: "Psalm", chapter: 42, verseRange: "1-2", text: "As the deer pants for streams of water, so my soul pants for You, my God. My soul thirsts for God, for the living God.", theme: "longing" },
  { book: "Matthew", chapter: 28, verseRange: "20", text: "And surely I am with you always, to the very end of the age.", theme: "presence" },
  { book: "Psalm", chapter: 96, verseRange: "1-2", text: "Sing to the Lord a new song; sing to the Lord, all the earth. Sing to the Lord, praise His name; proclaim His salvation day after day.", theme: "worship" },
  { book: "1 Timothy", chapter: 6, verseRange: "6", text: "But godliness with contentment is great gain.", theme: "contentment" },
  { book: "Psalm", chapter: 138, verseRange: "8", text: "The Lord will vindicate me; Your love, Lord, endures forever — do not abandon the works of Your hands.", theme: "faithfulness" },
  { book: "Philippians", chapter: 2, verseRange: "3-4", text: "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves.", theme: "humility" },
  { book: "Psalm", chapter: 57, verseRange: "10", text: "For great is Your love, reaching to the heavens; Your faithfulness reaches to the skies.", theme: "love" },
  { book: "Matthew", chapter: 5, verseRange: "6", text: "Blessed are those who hunger and thirst for righteousness, for they will be filled.", theme: "righteousness" },
  { book: "Psalm", chapter: 67, verseRange: "1", text: "May God be gracious to us and bless us and make His face shine on us.", theme: "blessing" },
  { book: "2 Peter", chapter: 3, verseRange: "9", text: "The Lord is not slow in keeping His promise, as some understand slowness. Instead He is patient with you.", theme: "patience" },
];

// Build all verse entries with dates
const buildAllVerses = () => {
  const allVerses: any[] = [];

  // Jan, Feb, Mar — already defined above (Feb 29 skipped on non-leap years)
  for (const v of verses) {
    if (v.month === 2 && v.day === 29 && !isLeapYear(year)) continue;
    allVerses.push({
      date: dateForDay(v.month, v.day),
      ...v.verse,
      translation: "NIV",
    });
  }

  // April — from versePool
  if (versePool[4]) {
    versePool[4].entries.forEach((entry, i) => {
      allVerses.push({
        date: dateForDay(4, i + 1),
        ...entry,
        translation: "NIV",
      });
    });
  }

  // May, June — from monthlyVerses
  for (const mv of monthlyVerses) {
    mv.verses.forEach((entry, i) => {
      allVerses.push({
        date: dateForDay(mv.month, i + 1),
        ...entry,
        translation: "NIV",
      });
    });
  }

  // July–December: cycle through universal pool
  // 184 days remain (Jul 1 – Dec 31)
  let poolIndex = 0;
  for (let month = 7; month <= 12; month++) {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const entry = universalPool[poolIndex % universalPool.length];
      allVerses.push({
        date: dateForDay(month, day),
        ...entry,
        translation: "NIV",
      });
      poolIndex++;
    }
  }

  return allVerses;
};

const seed = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log("Connected to MongoDB");

    await DailyVerse.deleteMany({});
    console.log("Cleared existing verses");

    const allVerses = buildAllVerses();
    await DailyVerse.insertMany(allVerses);
    console.log(`Seeded ${allVerses.length} daily verses for ${year}`);

    await mongoose.disconnect();
    console.log("Done!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
