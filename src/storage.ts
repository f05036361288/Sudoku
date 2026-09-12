import { isDifficulty, type Difficulty } from './puzzles'
import type { Board } from './sudoku'

const KEY = 'sudoku-save-v6'
const LEGACY_KEYS = [
  'sudoku-save-v5',
  'sudoku-save-v4',
  'sudoku-save-v3',
  'sudoku-save-v2',
  'sudoku-save-v1',
]

export type Notes = number[][] // length 81; each cell is a sorted list of 1–9

export type SaveData = {
  difficulty: Difficulty
  given: Board
  board: Board
  notes: Notes
  /** Present on v5+; older saves may omit it. */
  solution: Board | null
  /** Instant feedback when a filled digit ≠ solution. */
  instantCheck: boolean
}

export function emptyNotes(): Notes {
  return Array.from({ length: 81 }, () => [])
}

function isBoard(raw: unknown): raw is Board {
  return (
    Array.isArray(raw) &&
    raw.length === 81 &&
    raw.every(
      (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 9,
    )
  )
}

function normalizeNotes(raw: unknown): Notes | null {
  if (!Array.isArray(raw) || raw.length !== 81) return null
  const notes: Notes = []
  for (const cell of raw) {
    if (!Array.isArray(cell)) return null
    const set = new Set<number>()
    for (const n of cell) {
      if (typeof n !== 'number' || n < 1 || n > 9 || !Number.isInteger(n)) {
        return null
      }
      set.add(n)
    }
    notes.push([...set].sort((a, b) => a - b))
  }
  return notes
}

function parseSave(raw: string): SaveData | null {
  try {
    const data = JSON.parse(raw) as Partial<SaveData>
    if (
      !isDifficulty(data.difficulty) ||
      !isBoard(data.given) ||
      !isBoard(data.board)
    ) {
      return null
    }
    const notes = data.notes === undefined ? emptyNotes() : normalizeNotes(data.notes)
    if (!notes) return null
    const solution =
      data.solution === undefined || data.solution === null
        ? null
        : isBoard(data.solution)
          ? data.solution
          : null
    if (data.solution !== undefined && data.solution !== null && !solution) {
      return null
    }
    return {
      difficulty: data.difficulty,
      given: data.given,
      board: data.board,
      notes,
      solution,
      instantCheck: data.instantCheck === true,
    }
  } catch {
    return null
  }
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = parseSave(raw)
      if (parsed) return parsed
    }
    for (const legacy of LEGACY_KEYS) {
      const legacyRaw = localStorage.getItem(legacy)
      if (!legacyRaw) continue
      const parsed = parseSave(legacyRaw)
      if (parsed) {
        localStorage.removeItem(legacy)
        return parsed
      }
    }
    return null
  } catch {
    return null
  }
}

export function saveGame(data: SaveData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function clearSave(): void {
  localStorage.removeItem(KEY)
  for (const legacy of LEGACY_KEYS) {
    localStorage.removeItem(legacy)
  }
}
