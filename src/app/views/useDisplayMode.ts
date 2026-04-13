import { useOutletContext } from 'react-router-dom'
import type { DisplayMode } from '../displayMode'

export function useDisplayMode(): DisplayMode {
  const ctx = useOutletContext<{ displayMode?: DisplayMode }>()
  return ctx?.displayMode ?? 'en'
}

