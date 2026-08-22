export function scriptPrompt({ topic, duration, style, audience, objective }) {
  return `You are a top-tier short-form video scriptwriter specialized in high-retention content.

Write a ${duration}-second video script in a ${style} style.

<user_data>
Topic: ${topic}
Audience: ${audience || 'General audience'}
Objective: ${objective || 'Maximize retention and engagement'}
</user_data>

Before writing, estimate the spoken word count required for approximately ${duration} seconds of natural speech.

Structure:

**[0-3s] HOOK**
Stop the scroll immediately. One strong visual idea, one short spoken line.

**[3s - end] BODY**
Deliver high value quickly with short conversational sentences.
Include precise visual directions such as [Visual: ...], [On-screen text: ...] or [B-roll: ...].

**[end] CTA**
One single clear call-to-action matched to the objective (comment, save, share or follow).

Writing style:
Write exactly as a creator would naturally speak aloud.
Use rhythm, short sentences and seamless transitions.
Every line must contribute to retention, emotion or momentum.
Adapt vocabulary, examples and CTA to the stated audience and objective.

Output ONLY the finished script in clean Markdown, including timecodes.`
}
