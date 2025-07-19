export const TOPIC_EMOJIS = {
  mathematics: "🔢",
  programming: "💻",
  physics: "⚡",
  chemistry: "🧪",
  biology: "🧬",
  language: "🗣️",
  design: "🎨",
  music: "🎵",
  business: "💼",
  history: "📜",
  default: "📚",
};

export const POPULAR_TOPICS = [
  { name: "Mathematics", emoji: "🔢" },
  { name: "Programming", emoji: "💻" },
  { name: "Physics", emoji: "⚡" },
  { name: "Chemistry", emoji: "🧪" },
  { name: "Biology", emoji: "🧬" },
  { name: "Language", emoji: "🗣️" },
];

export const QUICK_DURATIONS = [15, 30, 45, 60, 90, 120];

export const getTopicEmoji = (topic) => {
  if (!topic) return TOPIC_EMOJIS.default;
  const lowerTopic = topic.toLowerCase();
  const matchedKey = Object.keys(TOPIC_EMOJIS).find((key) =>
    lowerTopic.includes(key)
  );
  return TOPIC_EMOJIS[matchedKey] || TOPIC_EMOJIS.default;
};
