export function hashtagPrompt({ niche, platform, keywords }) {
  return `You are a social media organic growth strategist.

Generate 30 relevant hashtags for a ${platform} video, organized into exactly 3 categories:

<user_data>
Niche: ${niche}
Specific keywords: ${keywords || 'None provided'}
</user_data>

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
If specific keywords are provided, include closely related variants naturally across the 3 groups.
Keep hashtags concise and easy to copy.

Output ONLY the 3 titled sections separated by blank lines.`
}
