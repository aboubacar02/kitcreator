function stripLeadingFiller(text) {
  return text
    .replace(/^\s*(?:here(?:'s| is)[^:\n]*|voici[^:\n]*)[:!]?\s*/i, '')
    .replace(/^\s*(?:sure|of course|certainly|bien sûr)[,.!]*\s*/i, '')
    .trim()
}

function validateHook(text) {
  const numbered = text
    .split('\n')
    .filter((line) => /^\s*\d+\s*[.)]/.test(line))
  if (numbered.length >= 3) {
    return numbered.slice(0, 5).join('\n').trim()
  }
  return text
}

export function validateOutput(toolId, output) {
  let text = String(output || '').trim()
  if (!text) return text

  text = stripLeadingFiller(text)

  if (toolId === 'hook') {
    text = validateHook(text)
  }

  return text
}
