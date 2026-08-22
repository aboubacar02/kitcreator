export function hookPrompt({ topic, platform, tone }) {
  return `You are a top-tier viral content strategist specializing in short-form social media.

Generate 5 scroll-stopping hooks for a ${platform} video.

<user_data>
Topic: ${topic}
Tone: ${tone}
</user_data>

Use five different psychological angles, one per hook:
1. Curiosity / information gap
2. Bold or controversial claim
3. Relatable pain point
4. Counter-intuitive insight
5. Fear of missing out / urgency

Rules:
Maximum 15 words per hook.
Each hook must work when spoken aloud in the first 2 seconds.
Make every hook substantially different from the others.
Prefer concrete, specific wording over vague claims.

Output ONLY:

1. **Curiosity:** ...
2. **Bold Claim:** ...
3. **Pain Point:** ...
4. **Counter-Intuitive:** ...
5. **Urgency:** ...`
}
