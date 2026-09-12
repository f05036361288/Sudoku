import { generatePuzzle, TARGET_CLUES } from '../src/generate.ts'
import type { Difficulty } from '../src/puzzles.ts'

for (const d of [1, 2, 3, 4, 5] as Difficulty[]) {
  const t0 = performance.now()
  const { puzzle } = generatePuzzle(d)
  const ms = Math.round(performance.now() - t0)
  const clues = puzzle.filter((v) => v !== 0).length
  console.log(`LV${d}: ${clues} clues (target ${TARGET_CLUES[d]}) in ${ms}ms`)
}
