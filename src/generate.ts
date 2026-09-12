import type { Difficulty } from './puzzles'
import type { Board } from './sudoku'
import { cloneBoard } from './sudoku'

/** Target given clues; lower = harder. */
export const TARGET_CLUES: Record<Difficulty, number> = {
  1: 48,
  2: 42,
  3: 36,
  4: 30,
  5: 26,
}

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function bit(n: number): number {
  return 1 << n
}

function boxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3)
}

type Masks = {
  rows: number[]
  cols: number[]
  boxes: number[]
}

function buildMasks(board: Board): Masks {
  const rows = Array(9).fill(0)
  const cols = Array(9).fill(0)
  const boxes = Array(9).fill(0)
  for (let i = 0; i < 81; i++) {
    const v = board[i]!
    if (!v) continue
    const r = Math.floor(i / 9)
    const c = i % 9
    const b = bit(v)
    rows[r] |= b
    cols[c] |= b
    boxes[boxIndex(r, c)] |= b
  }
  return { rows, cols, boxes }
}

function candidatesAt(masks: Masks, index: number): number {
  const r = Math.floor(index / 9)
  const c = index % 9
  const used = masks.rows[r]! | masks.cols[c]! | masks.boxes[boxIndex(r, c)]!
  return (~used) & 0b1111111110 // bits 1..9
}

function place(masks: Masks, index: number, num: number): void {
  const r = Math.floor(index / 9)
  const c = index % 9
  const b = bit(num)
  masks.rows[r]! |= b
  masks.cols[c]! |= b
  masks.boxes[boxIndex(r, c)]! |= b
}

function unplace(masks: Masks, index: number, num: number): void {
  const r = Math.floor(index / 9)
  const c = index % 9
  const b = bit(num)
  masks.rows[r]! &= ~b
  masks.cols[c]! &= ~b
  masks.boxes[boxIndex(r, c)]! &= ~b
}

function fillComplete(board: Board, masks: Masks): boolean {
  let empty = -1
  let emptyBits = 0
  let emptyCount = 10

  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) continue
    const bits = candidatesAt(masks, i)
    const count = bitCount(bits)
    if (count === 0) return false
    if (count < emptyCount) {
      empty = i
      emptyBits = bits
      emptyCount = count
      if (count === 1) break
    }
  }

  if (empty === -1) return true

  const nums = bitsToShuffledNums(emptyBits)
  for (const num of nums) {
    board[empty] = num
    place(masks, empty, num)
    if (fillComplete(board, masks)) return true
    unplace(masks, empty, num)
    board[empty] = 0
  }
  return false
}

function bitCount(bits: number): number {
  let n = 0
  let x = bits
  while (x) {
    x &= x - 1
    n++
  }
  return n
}

function bitsToShuffledNums(bits: number): number[] {
  const nums: number[] = []
  for (let n = 1; n <= 9; n++) {
    if (bits & bit(n)) nums.push(n)
  }
  return shuffle(nums)
}

/** Count solutions up to `limit` (mutates board temporarily). */
function countSolutions(board: Board, masks: Masks, limit: number): number {
  let empty = -1
  let emptyBits = 0
  let emptyCount = 10

  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) continue
    const bits = candidatesAt(masks, i)
    const count = bitCount(bits)
    if (count === 0) return 0
    if (count < emptyCount) {
      empty = i
      emptyBits = bits
      emptyCount = count
      if (count === 1) break
    }
  }

  if (empty === -1) return 1

  let found = 0
  for (let n = 1; n <= 9; n++) {
    if ((emptyBits & bit(n)) === 0) continue
    board[empty] = n
    place(masks, empty, n)
    found += countSolutions(board, masks, limit - found)
    unplace(masks, empty, n)
    board[empty] = 0
    if (found >= limit) return found
  }
  return found
}

function clueCount(board: Board): number {
  let n = 0
  for (const v of board) if (v !== 0) n++
  return n
}

function hasUniqueSolution(board: Board): boolean {
  const copy = cloneBoard(board)
  return countSolutions(copy, buildMasks(copy), 2) === 1
}

export type GeneratedPuzzle = {
  puzzle: Board
  solution: Board
}

/** Solve a unique-solution puzzle; returns null if unsolvable. */
export function solvePuzzle(puzzle: Board): Board | null {
  const board = cloneBoard(puzzle)
  if (!fillComplete(board, buildMasks(board))) return null
  return board
}

/** Generate a unique-solution puzzle for the given difficulty. */
export function generatePuzzle(difficulty: Difficulty): GeneratedPuzzle {
  const board: Board = Array(81).fill(0)
  const masks = buildMasks(board)
  fillComplete(board, masks)

  const solution = cloneBoard(board)
  const puzzle = cloneBoard(board)
  const target = TARGET_CLUES[difficulty]
  const order = shuffle([...Array(81).keys()])

  for (const pos of order) {
    if (clueCount(puzzle) <= target) break
    if (puzzle[pos] === 0) continue

    const backup = puzzle[pos]!
    puzzle[pos] = 0
    if (!hasUniqueSolution(puzzle)) {
      puzzle[pos] = backup
    }
  }

  return { puzzle, solution }
}
