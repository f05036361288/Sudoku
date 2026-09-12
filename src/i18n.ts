export type Locale = 'en' | 'zh-TW' | 'zh-CN'

export const LOCALES: Locale[] = ['en', 'zh-TW', 'zh-CN']

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
}

export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  'zh-TW': '繁',
  'zh-CN': '简',
}

const LOCALE_KEY = 'sudoku-locale'

type Difficulty = 1 | 2 | 3 | 4 | 5

type Dict = {
  title: string
  erase: string
  notes: string
  notesOn: string
  check: string
  checkOn: string
  hint: string
  newGame: string
  pickDifficulty: string
  pickDifficultyHint: string
  cancel: string
  boardAria: string
  padAria: string
  language: string
  digitKeyAria: (digit: number, remaining: number) => string
  currentLevel: (lv: Difficulty, name: string) => string
  difficulty: Record<Difficulty, string>
  confirmNewGame: string
  generating: string
  restored: (name: string) => string
  selectCell: string
  givenLocked: string
  notesModeHint: string
  selectFirst: string
  placed: string
  wrong: string
  conflict: string
  completed: (lv: Difficulty, name: string) => string
  noteAdded: (n: number) => string
  noteRemoved: (n: number) => string
  notesCleared: string
  digitErased: string
  cellEmpty: string
  pencilOn: string
  pencilOff: string
  checkOnStatus: string
  checkOffStatus: string
  hintUnavailable: string
  alreadyCorrect: (n: number) => string
  hintFilled: (n: number) => string
  newGameStarted: (lv: Difficulty, name: string) => string
  cellAria: (row: number, col: number, value: number, notes: number[]) => string
}

const en: Dict = {
  title: 'Sudoku',
  erase: 'Erase',
  notes: 'Notes',
  notesOn: 'Notes · On',
  check: 'Check',
  checkOn: 'Check · On',
  hint: 'Hint',
  newGame: 'New',
  pickDifficulty: 'Choose level',
  pickDifficultyHint: 'Pick a level to start a new game',
  cancel: 'Cancel',
  boardAria: 'Sudoku board',
  padAria: 'Number pad',
  language: 'Language',
  digitKeyAria: (digit, remaining) =>
    remaining === 0
      ? `Digit ${digit}, complete`
      : `Digit ${digit}, ${remaining} remaining`,
  currentLevel: (lv, name) => `Level · LV${lv} ${name}`,
  difficulty: {
    1: 'Beginner',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Expert',
  },
  confirmNewGame: 'Start a new game? Current progress will be replaced.',
  generating: 'Generating puzzle…',
  restored: (name) => `Restored · ${name}`,
  selectCell: 'Select a cell, then tap a number',
  givenLocked: 'Clue cells cannot be changed',
  notesModeHint: 'Notes mode: tap a number to mark candidates',
  selectFirst: 'Select a cell first',
  placed: 'Entered',
  wrong: 'Incorrect',
  conflict: 'Conflict — check again',
  completed: (lv, name) => `Completed! · LV${lv} ${name}`,
  noteAdded: (n) => `Note added ${n}`,
  noteRemoved: (n) => `Note removed ${n}`,
  notesCleared: 'Notes cleared',
  digitErased: 'Digit erased',
  cellEmpty: 'Cell is already empty',
  pencilOn: 'Notes on · tap numbers to mark candidates',
  pencilOff: 'Notes off · tap numbers to fill',
  checkOnStatus: 'Instant check on · wrong entries turn red',
  checkOffStatus: 'Instant check off',
  hintUnavailable: 'Cannot hint this cell',
  alreadyCorrect: (n) => `Already correct: ${n}`,
  hintFilled: (n) => `Hint: ${n}`,
  newGameStarted: (lv, name) => `New game · LV${lv} ${name}`,
  cellAria: (row, col, value, notes) => {
    const base = `Row ${row}, column ${col}`
    if (value) return `${base}, ${value}`
    if (notes.length) return `${base}, empty, notes ${notes.join('')}`
    return `${base}, empty`
  },
}

const zhCN: Dict = {
  title: '数独',
  erase: '擦除',
  notes: '笔记',
  notesOn: '笔记 · 开',
  check: '校对',
  checkOn: '校对 · 开',
  hint: '提示',
  newGame: '新游戏',
  pickDifficulty: '选择难度',
  pickDifficultyHint: '选一个等级开始新游戏',
  cancel: '取消',
  boardAria: '数独棋盘',
  padAria: '数字键盘',
  language: '语言',
  digitKeyAria: (digit, remaining) =>
    remaining === 0 ? `数字 ${digit}，已用完` : `数字 ${digit}，还剩 ${remaining} 个`,
  currentLevel: (lv, name) => `当前难度 · LV${lv} ${name}`,
  difficulty: {
    1: '入门',
    2: '简单',
    3: '中等',
    4: '困难',
    5: '专家',
  },
  confirmNewGame: '开始新游戏？当前进度会被替换。',
  generating: '生成题目中…',
  restored: (name) => `已恢复 · ${name}`,
  selectCell: '选中格子，再点数字',
  givenLocked: '题目数字不可修改',
  notesModeHint: '笔记模式：点数字标记候选',
  selectFirst: '请先点选一个格子',
  placed: '已填入',
  wrong: '填错了',
  conflict: '有冲突，再检查一下',
  completed: (lv, name) => `完成！· LV${lv} ${name}`,
  noteAdded: (n) => `已标记笔记 ${n}`,
  noteRemoved: (n) => `已取消笔记 ${n}`,
  notesCleared: '已清除笔记',
  digitErased: '已擦除数字',
  cellEmpty: '格子已是空的',
  pencilOn: '笔记模式已开 · 点数字标记候选',
  pencilOff: '笔记模式已关 · 点数字填入',
  checkOnStatus: '即时校对已开 · 填错会标红',
  checkOffStatus: '即时校对已关',
  hintUnavailable: '无法提示这一格',
  alreadyCorrect: (n) => `已经是正确答案 ${n}`,
  hintFilled: (n) => `提示：${n}`,
  newGameStarted: (lv, name) => `新游戏 · LV${lv} ${name}`,
  cellAria: (row, col, value, notes) => {
    const base = `第${row}行第${col}列`
    if (value) return `${base}，${value}`
    if (notes.length) return `${base}，空，笔记 ${notes.join('')}`
    return `${base}，空`
  },
}

const zhTW: Dict = {
  title: '數獨',
  erase: '擦除',
  notes: '筆記',
  notesOn: '筆記 · 開',
  check: '校對',
  checkOn: '校對 · 開',
  hint: '提示',
  newGame: '新遊戲',
  pickDifficulty: '選擇難度',
  pickDifficultyHint: '選一個等級開始新遊戲',
  cancel: '取消',
  boardAria: '數獨棋盤',
  padAria: '數字鍵盤',
  language: '語言',
  digitKeyAria: (digit, remaining) =>
    remaining === 0 ? `數字 ${digit}，已用完` : `數字 ${digit}，還剩 ${remaining} 個`,
  currentLevel: (lv, name) => `目前難度 · LV${lv} ${name}`,
  difficulty: {
    1: '入門',
    2: '簡單',
    3: '中等',
    4: '困難',
    5: '專家',
  },
  confirmNewGame: '開始新遊戲？目前進度會被取代。',
  generating: '產生題目中…',
  restored: (name) => `已還原 · ${name}`,
  selectCell: '選取格子，再點數字',
  givenLocked: '題目數字不可修改',
  notesModeHint: '筆記模式：點數字標記候選',
  selectFirst: '請先點選一個格子',
  placed: '已填入',
  wrong: '填錯了',
  conflict: '有衝突，再檢查一下',
  completed: (lv, name) => `完成！· LV${lv} ${name}`,
  noteAdded: (n) => `已標記筆記 ${n}`,
  noteRemoved: (n) => `已取消筆記 ${n}`,
  notesCleared: '已清除筆記',
  digitErased: '已擦除數字',
  cellEmpty: '格子已是空的',
  pencilOn: '筆記模式已開 · 點數字標記候選',
  pencilOff: '筆記模式已關 · 點數字填入',
  checkOnStatus: '即時校對已開 · 填錯會標紅',
  checkOffStatus: '即時校對已關',
  hintUnavailable: '無法提示這一格',
  alreadyCorrect: (n) => `已經是正確答案 ${n}`,
  hintFilled: (n) => `提示：${n}`,
  newGameStarted: (lv, name) => `新遊戲 · LV${lv} ${name}`,
  cellAria: (row, col, value, notes) => {
    const base = `第${row}行第${col}列`
    if (value) return `${base}，${value}`
    if (notes.length) return `${base}，空，筆記 ${notes.join('')}`
    return `${base}，空`
  },
}

const DICTS: Record<Locale, Dict> = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
}

let currentLocale: Locale = 'en'

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'zh-TW' || value === 'zh-CN'
}

export function loadLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_KEY)
    if (isLocale(raw)) {
      currentLocale = raw
      return raw
    }
  } catch {
    /* ignore */
  }
  currentLocale = 'en'
  return 'en'
}

export function saveLocale(locale: Locale): void {
  currentLocale = locale
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch {
    /* ignore */
  }
}

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale): void {
  saveLocale(locale)
}

export function t(): Dict {
  return DICTS[currentLocale]
}

export function difficultyName(lv: Difficulty): string {
  return DICTS[currentLocale].difficulty[lv]
}
