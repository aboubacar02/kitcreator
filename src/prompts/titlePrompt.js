export function titlePrompt({ title }) {
  return `You are a top-tier YouTube copywriting and CTR strategist.

Analyze this title.

<user_data>
Title: ${title}
</user_data>

Evaluate curiosity, emotional impact, clarity, search intent and click-through potential.

Output ONLY the analysis in clean Markdown using exactly this structure:

**Score:** X/100

**Key Critique**
- Strength: ...
- Strength: ...
- Weakness: ...
- Weakness: ...

**5 High-CTR Alternatives**
1. ...
2. ...
3. ...
4. ...
5. ...

Rules:
Alternatives must be genuinely different angles, not simple paraphrases.
Preserve the core topic without misleading clickbait.`
}
