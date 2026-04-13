export type DisplayMode = 'en' | 'bilingual'

const KEY = 'dha:displayMode:v1'

export function getDisplayMode(): DisplayMode {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'bilingual') return 'bilingual'
    return 'en'
  } catch {
    return 'en'
  }
}

export function setDisplayMode(mode: DisplayMode): void {
  localStorage.setItem(KEY, mode)
}

