export function hashtagPrompt({ niche, platform }) {
  return `You are a social media organic growth strategist.

For the niche "${niche}" on ${platform}, generate 30 relevant hashtags organized into exactly 3 categories:

**Broad — 10 hashtags**
High-volume, highly searchable hashtags relevant to the niche.

**Medium — 10 hashtags**
Targeted hashtags connecting the niche with typical content topics.

**Niche — 10 hashtags**
Low-competition, specific hashtags designed to reach a qualified audience.

Rules:
Every hashtag MUST begin with #.
Avoid generic hashtags like #viral, #fyp or #trending unless genuinely strategic for this niche.
Prefer relevance over raw popularity.
Keep hashtags concise and easy to copy.

Output ONLY the 3 titled sections separated by blank lines.`
}
