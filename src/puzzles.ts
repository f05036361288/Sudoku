export type Difficulty = 1 | 2 | 3 | 4 | 5

export const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5]

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}
