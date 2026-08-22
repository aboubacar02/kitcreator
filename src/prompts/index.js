import { hookPrompt } from './hookPrompt.js'
import { scriptPrompt } from './scriptPrompt.js'
import { hashtagPrompt } from './hashtagPrompt.js'
import { titlePrompt } from './titlePrompt.js'
import { packPrompt } from './packPrompt.js'

export { SYSTEM_PROMPT, LANGUAGE_NAMES } from './systemPrompt.js'
export { validateOutput } from './validators.js'

const PROMPTS = {
  hook: hookPrompt,
  script: scriptPrompt,
  hashtag: hashtagPrompt,
  title: titlePrompt,
  pack: packPrompt,
}

export function buildToolPrompt(toolId, params) {
  const builder = PROMPTS[toolId]
  if (!builder) throw new Error(`Unknown tool: ${toolId}`)
  return builder(params)
}
