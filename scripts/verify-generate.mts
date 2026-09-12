import { generatePuzzle } from '../src/generate.ts'

const puzzles = [1, 2, 3, 4, 5].map((d) => {
  const { puzzle } = generatePuzzle(d as 1 | 2 | 3 | 4 | 5)
  const clues = puzzle.filter((v) => v !== 0).length
  return { d, clues, sample: puzzle.slice(0, 18).join('') }
})

console.log(JSON.stringify(puzzles, null, 2))

const a = generatePuzzle(3).puzzle
const b = generatePuzzle(3).puzzle
console.log('two LV3 different?', a.join('') !== b.join(''))
