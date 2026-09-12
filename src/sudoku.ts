export type CellValue = number // 0–9
export type Board = CellValue[] // length 81

export function parsePuzzle(puzzle: string): Board {
  if (puzzle.length !== 81) {
    throw new Error('Puzzle must be 81 characters')
  }
  return [...puzzle].map((ch) => {
    const n = Number(ch)
    return Number.isFinite(n) && n >= 0 && n <= 9 ? n : 0
  })
}

export function cloneBoard(board: Board): Board {
  return board.slice()
}

export function indexOf(row: number, col: number): number {
  return row * 9 + col
}

export function rowColOf(index: number): { row: number; col: number } {
  return { row: Math.floor(index / 9), col: index % 9 }
}

/** Returns set of cell indices that conflict with another same digit. */
export function findConflicts(board: Board): Set<number> {
  const conflicts = new Set<number>()

  const markDupes = (indices: number[]) => {
    const seen = new Map<number, number>()
    for (const i of indices) {
      const v = board[i]
      if (!v) continue
      const prev = seen.get(v)
      if (prev !== undefined) {
        conflicts.add(prev)
        conflicts.add(i)
      } else {
        seen.set(v, i)
      }
    }
  }

  for (let r = 0; r < 9; r++) {
    markDupes(Array.from({ length: 9 }, (_, c) => indexOf(r, c)))
  }
  for (let c = 0; c < 9; c++) {
    markDupes(Array.from({ length: 9 }, (_, r) => indexOf(r, c)))
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const box: number[] = []
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          box.push(indexOf(r, c))
        }
      }
      markDupes(box)
    }
  }

  return conflicts
}

export function isCompleteAndValid(board: Board): boolean {
  if (board.some((v) => v === 0)) return false
  return findConflicts(board).size === 0
}

export function sameUnit(a: number, b: number): boolean {
  const { row: ra, col: ca } = rowColOf(a)
  const { row: rb, col: cb } = rowColOf(b)
  if (ra === rb || ca === cb) return true
  return Math.floor(ra / 3) === Math.floor(rb / 3) && Math.floor(ca / 3) === Math.floor(cb / 3)
}
