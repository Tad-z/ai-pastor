interface ScriptureReference {
  book: string;
  chapter: number;
  verse: string;
  text: string;
}

// Common Bible book names and abbreviations
const BOOK_PATTERN = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "Samuel", "Kings", "Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms?", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah",
  "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "Thessalonians", "Timothy", "Titus", "Philemon", "Hebrews",
  "James", "Peter", "John", "Jude", "Revelation",
  "Gen", "Ex", "Lev", "Num", "Deut", "Josh", "Judg", "Sam", "Kgs",
  "Chr", "Neh", "Est", "Ps", "Prov", "Eccl", "Isa", "Jer", "Lam",
  "Ezek", "Dan", "Hos", "Mic", "Hab", "Zeph", "Hag", "Zech", "Mal",
  "Matt", "Mk", "Lk", "Jn", "Acts", "Rom", "Cor", "Gal", "Eph",
  "Phil", "Col", "Thess", "Tim", "Tit", "Phlm", "Heb", "Jas", "Rev",
].join("|");

const SCRIPTURE_REGEX = new RegExp(
  `((?:1|2|3)?\\s?(?:${BOOK_PATTERN}))\\s+(\\d+):(\\d+(?:-\\d+)?)`,
  "gi"
);

export const parseScriptureReferences = (text: string): ScriptureReference[] => {
  const matches: ScriptureReference[] = [];
  let match;

  SCRIPTURE_REGEX.lastIndex = 0;
  while ((match = SCRIPTURE_REGEX.exec(text)) !== null) {
    matches.push({
      book: match[1].trim(),
      chapter: parseInt(match[2]),
      verse: match[3],
      text: "",
    });
  }

  return matches;
};
