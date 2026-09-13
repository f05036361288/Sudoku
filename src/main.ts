import './style.css'
import { registerSW } from 'virtual:pwa-register'
import { generatePuzzle, solvePuzzle } from './generate'
import {
  difficultyName,
  getLocale,
  loadLocale,
  LOCALES,
  LOCALE_LABEL,
  LOCALE_SHORT,
  setLocale,
  t,
  type Locale,
} from './i18n'
import { DIFFICULTIES, type Difficulty } from './puzzles'
import {
  clearSave,
  emptyNotes,
  loadSave,
  saveGame,
  type Notes,
} from './storage'
import {
  cloneBoard,
  findConflicts,
  indexOf,
  isCompleteAndValid,
  sameUnit,
  type Board,
} from './sudoku'

registerSW({ immediate: true })

loadLocale()

type State = {
  difficulty: Difficulty
  given: Board
  board: Board
  notes: Notes
  solution: Board
  selected: number | null
  pencilMode: boolean
  instantCheck: boolean
  won: boolean
  status: string
}

function startPuzzle(
  difficulty: Difficulty,
): Pick<State, 'difficulty' | 'given' | 'board' | 'notes' | 'solution'> {
  const { puzzle, solution } = generatePuzzle(difficulty)
  return {
    difficulty,
    given: puzzle,
    board: cloneBoard(puzzle),
    notes: emptyNotes(),
    solution,
  }
}

function resolveSolution(given: Board, stored: Board | null): Board {
  if (stored) return stored
  return solvePuzzle(given) ?? cloneBoard(given)
}

function createInitialState(): State {
  const saved = loadSave()
  if (saved) {
    const won = isCompleteAndValid(saved.board)
    return {
      difficulty: saved.difficulty,
      given: saved.given,
      board: saved.board,
      notes: saved.notes,
      solution: resolveSolution(saved.given, saved.solution),
      selected: null,
      pencilMode: false,
      instantCheck: saved.instantCheck,
      won,
      status: won
        ? t().completed(saved.difficulty, difficultyName(saved.difficulty))
        : t().restored(difficultyName(saved.difficulty)),
    }
  }
  const difficulty: Difficulty = 2
  return {
    ...startPuzzle(difficulty),
    selected: null,
    pencilMode: false,
    instantCheck: false,
    won: false,
    status: t().selectCell,
  }
}

const state: State = createInitialState()

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="shell">
    <header class="top">
      <div class="top-row">
        <h1 id="title"></h1>
        <div class="lang" id="lang">
          <button type="button" class="lang-btn" id="lang-btn" aria-haspopup="listbox" aria-expanded="false"></button>
          <div class="lang-menu" id="lang-menu" role="listbox" hidden>
            ${LOCALES.map(
              (loc) =>
                `<button type="button" class="lang-option" role="option" data-locale="${loc}">${LOCALE_LABEL[loc]}</button>`,
            ).join('')}
          </div>
        </div>
      </div>
      <p class="status" id="status" aria-live="polite"></p>
    </header>

    <div class="level-row">
      <p class="level-badge" id="level-badge" aria-live="polite"></p>
      <button type="button" class="btn btn-secondary btn-icon top-new" id="new-game">
        <svg class="btn-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
        <span class="btn-label" data-label="new"></span>
      </button>
    </div>

    <div class="board" id="board" role="grid"></div>

    <div class="actions">
      <button type="button" class="btn btn-secondary btn-icon" id="instant-check" aria-pressed="false">
        <svg class="btn-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.1 14.2-3.7-3.7 1.4-1.4 2.3 2.3 5.1-5.1 1.4 1.4-6.5 6.5z"/>
        </svg>
        <span class="btn-label" data-label="check"></span>
      </button>
      <button type="button" class="btn btn-secondary btn-icon" id="undo" disabled>
        <svg class="btn-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12.5 8c-2.65 0-5.05 1.02-6.85 2.69L3 8v7h7l-2.49-2.49C8.86 11.07 10.58 10 12.5 10c3.03 0 5.61 2.01 6.49 4.78l1.94-.63C19.88 10.92 16.53 8 12.5 8z"/>
        </svg>
        <span class="btn-label" data-label="undo"></span>
      </button>
      <button type="button" class="btn btn-secondary btn-icon" id="pencil-toggle" aria-pressed="false">
        <svg class="btn-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        <span class="btn-label" data-label="notes"></span>
      </button>
      <button type="button" class="btn btn-secondary btn-icon" id="hint">
        <svg class="btn-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M9 21h6v-1.5H9V21zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2zm2.5 12.2-.5.3V15.5h-4v-1l-.5-.3A5 5 0 1 1 14.5 14.2z"/>
        </svg>
        <span class="btn-label" data-label="hint"></span>
      </button>
    </div>

    <div class="pad" id="pad">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
        .map(
          (n) =>
            `<button type="button" class="key" data-num="${n}">
              <span class="key-digit">${n}</span>
              <span class="key-remain" aria-hidden="true">9</span>
            </button>`,
        )
        .join('')}
      <button type="button" class="key key-erase" data-erase id="erase-btn"></button>
    </div>
  </div>

  <div class="modal" id="lv-modal" hidden>
    <div class="modal-backdrop" data-close-modal></div>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="lv-modal-title">
      <h2 id="lv-modal-title"></h2>
      <p class="modal-hint" id="lv-modal-hint"></p>
      <div class="modal-levels" id="lv-modal-levels">
        ${DIFFICULTIES.map(
          (d) =>
            `<button type="button" class="modal-lv" data-pick-lv="${d}">
              <span class="diff-lv">LV${d}</span>
              <span class="diff-name" data-diff-name="${d}"></span>
            </button>`,
        ).join('')}
      </div>
      <button type="button" class="btn btn-secondary modal-cancel" data-close-modal id="lv-modal-cancel"></button>
    </div>
  </div>

  <div class="modal" id="win-modal" hidden>
    <div class="modal-backdrop" data-close-win></div>
    <div class="modal-card win-card" role="dialog" aria-modal="true" aria-labelledby="win-title">
      <p class="win-badge" aria-hidden="true">✓</p>
      <h2 id="win-title"></h2>
      <p class="modal-hint" id="win-body"></p>
      <button type="button" class="btn" id="win-again"></button>
      <button type="button" class="btn btn-secondary" data-close-win id="win-keep"></button>
    </div>
  </div>
`

const boardEl = document.querySelector<HTMLDivElement>('#board')!
const statusEl = document.querySelector<HTMLParagraphElement>('#status')!
const levelBadgeEl = document.querySelector<HTMLParagraphElement>('#level-badge')!
const titleEl = document.querySelector<HTMLHeadingElement>('#title')!
const eraseBtn = document.querySelector<HTMLButtonElement>('#erase-btn')!
const newGameBtn = document.querySelector<HTMLButtonElement>('#new-game')!
const pencilBtn = document.querySelector<HTMLButtonElement>('#pencil-toggle')!
const instantCheckBtn = document.querySelector<HTMLButtonElement>('#instant-check')!
const undoBtn = document.querySelector<HTMLButtonElement>('#undo')!
const hintBtn = document.querySelector<HTMLButtonElement>('#hint')!
const lvModal = document.querySelector<HTMLDivElement>('#lv-modal')!
const lvModalTitle = document.querySelector<HTMLHeadingElement>('#lv-modal-title')!
const lvModalHint = document.querySelector<HTMLParagraphElement>('#lv-modal-hint')!
const lvModalCancel = document.querySelector<HTMLButtonElement>('#lv-modal-cancel')!
const winModal = document.querySelector<HTMLDivElement>('#win-modal')!
const winTitle = document.querySelector<HTMLHeadingElement>('#win-title')!
const winBody = document.querySelector<HTMLParagraphElement>('#win-body')!
const winAgainBtn = document.querySelector<HTMLButtonElement>('#win-again')!
const winKeepBtn = document.querySelector<HTMLButtonElement>('#win-keep')!
const padEl = document.querySelector<HTMLDivElement>('#pad')!
const langBtn = document.querySelector<HTMLButtonElement>('#lang-btn')!
const langMenu = document.querySelector<HTMLDivElement>('#lang-menu')!
const langRoot = document.querySelector<HTMLDivElement>('#lang')!

type HistoryEntry = { board: Board; notes: Notes }

const MAX_HISTORY = 50
const history: HistoryEntry[] = []

function cloneNotes(notes: Notes): Notes {
  return notes.map((cell) => cell.slice())
}

function pushHistory(): void {
  history.push({
    board: cloneBoard(state.board),
    notes: cloneNotes(state.notes),
  })
  if (history.length > MAX_HISTORY) history.shift()
  syncUndoButton()
}

function clearHistory(): void {
  history.length = 0
  syncUndoButton()
}

function undoMove(): void {
  const prev = history.pop()
  if (!prev) {
    setStatus(t().nothingToUndo)
    syncUndoButton()
    return
  }
  state.board = prev.board
  state.notes = prev.notes
  if (state.won && !isCompleteAndValid(state.board)) {
    state.won = false
    closeWinModal()
  }
  persist()
  setStatus(t().undone)
  render()
}

function syncUndoButton(): void {
  const copy = t()
  setBtnLabel(undoBtn, copy.undo)
  undoBtn.disabled = history.length === 0
}

function persist(): void {
  saveGame({
    difficulty: state.difficulty,
    given: state.given,
    board: state.board,
    notes: state.notes,
    solution: state.solution,
    instantCheck: state.instantCheck,
  })
}

function setStatus(msg: string): void {
  state.status = msg
  statusEl.textContent = msg
}

function syncLevelBadge(): void {
  const d = state.difficulty
  levelBadgeEl.textContent = t().currentLevel(d, difficultyName(d))
}

function setBtnLabel(btn: HTMLButtonElement, text: string): void {
  const label = btn.querySelector<HTMLElement>('.btn-label')
  if (label) label.textContent = text
  else btn.textContent = text
  btn.setAttribute('aria-label', text)
}

function syncPencilButton(): void {
  const copy = t()
  pencilBtn.classList.toggle('active', state.pencilMode)
  pencilBtn.setAttribute('aria-pressed', String(state.pencilMode))
  setBtnLabel(pencilBtn, state.pencilMode ? copy.notesOn : copy.notes)
}

function syncInstantCheckButton(): void {
  const copy = t()
  instantCheckBtn.classList.toggle('active', state.instantCheck)
  instantCheckBtn.setAttribute('aria-pressed', String(state.instantCheck))
  setBtnLabel(instantCheckBtn, state.instantCheck ? copy.checkOn : copy.check)
}

function syncLangButton(): void {
  const locale = getLocale()
  langBtn.textContent = LOCALE_SHORT[locale]
  langBtn.setAttribute('aria-label', t().language)
  langMenu.querySelectorAll<HTMLButtonElement>('.lang-option').forEach((btn) => {
    const active = btn.dataset.locale === locale
    btn.classList.toggle('active', active)
    btn.setAttribute('aria-selected', String(active))
  })
}

function applyStaticI18n(): void {
  const copy = t()
  titleEl.textContent = copy.title
  document.title = copy.title
  eraseBtn.textContent = copy.erase
  setBtnLabel(hintBtn, copy.hint)
  setBtnLabel(newGameBtn, copy.newGame)
  setBtnLabel(undoBtn, copy.undo)
  lvModalTitle.textContent = copy.pickDifficulty
  lvModalHint.textContent = copy.pickDifficultyHint
  lvModalCancel.textContent = copy.cancel
  winTitle.textContent = copy.winTitle
  winAgainBtn.textContent = copy.playAgain
  winKeepBtn.textContent = copy.keepPlaying
  if (state.won) {
    const d = state.difficulty
    winBody.textContent = copy.winBody(d, difficultyName(d))
    setStatus(copy.completed(d, difficultyName(d)))
  }
  boardEl.setAttribute('aria-label', copy.boardAria)
  padEl.setAttribute('aria-label', copy.padAria)
  lvModal.querySelectorAll<HTMLElement>('[data-diff-name]').forEach((el) => {
    const d = Number(el.dataset.diffName) as Difficulty
    el.textContent = difficultyName(d)
  })
  syncLangButton()
  syncPencilButton()
  syncInstantCheckButton()
  syncUndoButton()
  syncLevelBadge()
  syncPadCounts()
}

function remainingCounts(): number[] {
  const used = Array(10).fill(0) as number[]
  for (const v of state.board) {
    if (v) used[v]!++
  }
  const rem = Array(10).fill(0) as number[]
  for (let d = 1; d <= 9; d++) rem[d] = Math.max(0, 9 - used[d]!)
  return rem
}

function syncPadCounts(): void {
  const rem = remainingCounts()
  const copy = t()
  padEl.querySelectorAll<HTMLButtonElement>('button[data-num]').forEach((btn) => {
    const digit = Number(btn.dataset.num)
    const left = rem[digit] ?? 0
    const badge = btn.querySelector<HTMLElement>('.key-remain')
    if (badge) badge.textContent = String(left)
    btn.classList.toggle('key-exhausted', left === 0)
    btn.setAttribute('aria-label', copy.digitKeyAria(digit, left))
  })
}

function refreshStatusForSelection(): void {
  if (state.won) {
    const d = state.difficulty
    setStatus(t().completed(d, difficultyName(d)))
    return
  }
  if (state.selected === null) {
    setStatus(t().selectCell)
    return
  }
  if (state.given[state.selected]) {
    setStatus(t().givenLocked)
  } else if (state.pencilMode) {
    setStatus(t().notesModeHint)
  } else {
    setStatus(t().selectCell)
  }
}

function isWrongFill(index: number): boolean {
  if (!state.instantCheck) return false
  if (state.given[index] !== 0) return false
  const value = state.board[index]!
  return value !== 0 && value !== state.solution[index]
}

function notesMarkup(cellNotes: number[], highlightDigit = 0): string {
  const cells = Array.from({ length: 9 }, (_, i) => {
    const n = i + 1
    const on = cellNotes.includes(n)
    const match = on && highlightDigit === n
    return `<span class="note${on ? ' on' : ''}${match ? ' match' : ''}">${
      on ? n : ''
    }</span>`
  })
  return `<span class="notes">${cells.join('')}</span>`
}

function afterFill(index: number, statusOk: string): void {
  persist()
  const copy = t()
  const d = state.difficulty
  if (isCompleteAndValid(state.board)) {
    state.won = true
    setStatus(copy.completed(d, difficultyName(d)))
    render()
    openWinModal()
    return
  }
  state.won = false
  if (isWrongFill(index)) {
    setStatus(copy.wrong)
  } else if (findConflicts(state.board).has(index)) {
    setStatus(copy.conflict)
  } else {
    setStatus(statusOk)
  }
  render()
}

function render(): void {
  const conflicts = findConflicts(state.board)
  const selected = state.selected
  const selectedValue = selected !== null ? state.board[selected] : 0
  const copy = t()

  boardEl.innerHTML = ''
  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9)
    const col = i % 9
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'cell'
    btn.role = 'gridcell'
    btn.dataset.index = String(i)

    const isGiven = state.given[i] !== 0
    const value = state.board[i]!
    const cellNotes = state.notes[i]!

    if (isGiven) btn.classList.add('given')
    if (selected === i) btn.classList.add('selected')
    if (conflicts.has(i)) btn.classList.add('conflict')
    if (isWrongFill(i)) btn.classList.add('wrong')
    if (selected !== null && selected !== i && sameUnit(selected, i)) {
      btn.classList.add('related')
    }
    if (selectedValue && value === selectedValue) {
      btn.classList.add('same-digit')
    } else if (selectedValue && !value && cellNotes.includes(selectedValue)) {
      btn.classList.add('same-note')
    }
    if (row % 3 === 0) btn.classList.add('box-top')
    if (col % 3 === 0) btn.classList.add('box-left')
    if (row === 8) btn.classList.add('box-bottom')
    if (col === 8) btn.classList.add('box-right')

    if (value) {
      btn.textContent = String(value)
    } else if (cellNotes.length) {
      btn.innerHTML = notesMarkup(cellNotes, selectedValue || 0)
    } else {
      btn.textContent = ''
    }

    btn.setAttribute(
      'aria-label',
      copy.cellAria(row + 1, col + 1, value, cellNotes),
    )
    boardEl.appendChild(btn)
  }

  statusEl.textContent = state.status
  boardEl.classList.toggle('completed', state.won)
  syncLevelBadge()
  syncPencilButton()
  syncInstantCheckButton()
  syncUndoButton()
  syncPadCounts()
}

function selectCell(index: number): void {
  state.selected = index
  if (state.won) {
    const d = state.difficulty
    setStatus(t().completed(d, difficultyName(d)))
  } else if (state.given[index]) {
    setStatus(t().givenLocked)
  } else if (state.pencilMode) {
    setStatus(t().notesModeHint)
  } else {
    setStatus(t().selectCell)
  }
  render()
}

function clearNoteDigitInPeers(index: number, num: number): void {
  for (let i = 0; i < 81; i++) {
    if (i === index || !sameUnit(index, i) || state.board[i]) continue
    const notes = state.notes[i]!
    const next = notes.filter((n) => n !== num)
    if (next.length !== notes.length) state.notes[i] = next
  }
}

function toggleNote(num: number): void {
  const copy = t()
  if (state.selected === null) {
    setStatus(copy.selectFirst)
    return
  }
  if (state.given[state.selected] !== 0) {
    setStatus(copy.givenLocked)
    return
  }

  const i = state.selected
  pushHistory()
  if (state.board[i]) {
    state.board[i] = 0
  }

  const notes = state.notes[i]!
  if (notes.includes(num)) {
    state.notes[i] = notes.filter((n) => n !== num)
    setStatus(copy.noteRemoved(num))
  } else {
    state.notes[i] = [...notes, num].sort((a, b) => a - b)
    setStatus(copy.noteAdded(num))
  }
  persist()
  render()
}

function placeNumber(num: number): void {
  const copy = t()
  if (state.selected === null) {
    setStatus(copy.selectFirst)
    return
  }
  if (state.given[state.selected] !== 0) {
    setStatus(copy.givenLocked)
    return
  }

  const i = state.selected
  pushHistory()
  state.board[i] = num
  state.notes[i] = []
  clearNoteDigitInPeers(i, num)
  afterFill(i, copy.placed)
}

function applyHint(): void {
  const copy = t()
  if (state.selected === null) {
    setStatus(copy.selectFirst)
    return
  }
  const i = state.selected
  if (state.given[i] !== 0) {
    setStatus(copy.givenLocked)
    return
  }
  const answer = state.solution[i]!
  if (!answer) {
    setStatus(copy.hintUnavailable)
    return
  }
  if (state.board[i] === answer) {
    setStatus(copy.alreadyCorrect(answer))
    return
  }
  pushHistory()
  state.board[i] = answer
  state.notes[i] = []
  clearNoteDigitInPeers(i, answer)
  afterFill(i, copy.hintFilled(answer))
}

function inputDigit(num: number, forcePencil = false): void {
  if (forcePencil || state.pencilMode) {
    toggleNote(num)
  } else {
    placeNumber(num)
  }
}

function erase(): void {
  const copy = t()
  if (state.selected === null) {
    setStatus(copy.selectFirst)
    return
  }
  if (state.given[state.selected] !== 0) {
    setStatus(copy.givenLocked)
    return
  }
  const i = state.selected
  if (state.board[i]) {
    pushHistory()
    state.board[i] = 0
    setStatus(copy.digitErased)
  } else if (state.notes[i]!.length) {
    pushHistory()
    state.notes[i] = []
    setStatus(copy.notesCleared)
  } else {
    setStatus(copy.cellEmpty)
    return
  }
  if (state.won && !isCompleteAndValid(state.board)) {
    state.won = false
    closeWinModal()
  }
  persist()
  render()
}

function togglePencilMode(): void {
  state.pencilMode = !state.pencilMode
  setStatus(state.pencilMode ? t().pencilOn : t().pencilOff)
  syncPencilButton()
}

function toggleInstantCheck(): void {
  state.instantCheck = !state.instantCheck
  persist()
  setStatus(state.instantCheck ? t().checkOnStatus : t().checkOffStatus)
  render()
}

function applyNewGame(difficulty: Difficulty): void {
  setStatus(t().generating)
  closeWinModal()
  requestAnimationFrame(() => {
    const next = startPuzzle(difficulty)
    state.difficulty = next.difficulty
    state.given = next.given
    state.board = next.board
    state.notes = next.notes
    state.solution = next.solution
    state.selected = null
    state.won = false
    clearHistory()
    clearSave()
    persist()
    setStatus(t().newGameStarted(difficulty, difficultyName(difficulty)))
    render()
  })
}

function openLevelPicker(): void {
  lvModal.querySelectorAll<HTMLButtonElement>('.modal-lv').forEach((btn) => {
    const d = Number(btn.dataset.pickLv)
    btn.classList.toggle('active', d === state.difficulty)
  })
  lvModal.hidden = false
}

function closeLevelPicker(): void {
  lvModal.hidden = true
}

function openWinModal(): void {
  const copy = t()
  const d = state.difficulty
  winTitle.textContent = copy.winTitle
  winBody.textContent = copy.winBody(d, difficultyName(d))
  winAgainBtn.textContent = copy.playAgain
  winKeepBtn.textContent = copy.keepPlaying
  winModal.hidden = false
}

function closeWinModal(): void {
  winModal.hidden = true
}

function requestNewGame(): void {
  if (!state.won && !confirm(t().confirmNewGame)) return
  openLevelPicker()
}

function closeLangMenu(): void {
  langMenu.hidden = true
  langBtn.setAttribute('aria-expanded', 'false')
}

function toggleLangMenu(): void {
  const open = langMenu.hidden
  langMenu.hidden = !open
  langBtn.setAttribute('aria-expanded', String(open))
}

function changeLanguage(locale: Locale): void {
  if (locale === getLocale()) {
    closeLangMenu()
    return
  }
  setLocale(locale)
  closeLangMenu()
  applyStaticI18n()
  refreshStatusForSelection()
  render()
}

boardEl.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLButtonElement>('.cell')
  if (!target) return
  selectCell(Number(target.dataset.index))
})

padEl.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLButtonElement>('button')
  if (!target) return
  if (target.hasAttribute('data-erase')) {
    erase()
    return
  }
  const num = Number(target.dataset.num)
  if (num >= 1 && num <= 9) inputDigit(num)
})

pencilBtn.addEventListener('click', () => {
  togglePencilMode()
})

instantCheckBtn.addEventListener('click', () => {
  toggleInstantCheck()
})

undoBtn.addEventListener('click', () => {
  undoMove()
})

hintBtn.addEventListener('click', () => {
  applyHint()
})

newGameBtn.addEventListener('click', () => {
  requestNewGame()
})

langBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  toggleLangMenu()
})

langMenu.addEventListener('click', (e) => {
  const option = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-locale]')
  if (!option?.dataset.locale) return
  changeLanguage(option.dataset.locale as Locale)
})

document.addEventListener('click', (e) => {
  if (!langMenu.hidden && !langRoot.contains(e.target as Node)) {
    closeLangMenu()
  }
})

lvModal.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.closest('[data-close-modal]')) {
    closeLevelPicker()
    return
  }
  const pick = target.closest<HTMLButtonElement>('[data-pick-lv]')
  if (!pick?.dataset.pickLv) return
  const lv = Number(pick.dataset.pickLv) as Difficulty
  closeLevelPicker()
  applyNewGame(lv)
})

winModal.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.closest('[data-close-win]')) {
    closeWinModal()
    return
  }
})

winAgainBtn.addEventListener('click', () => {
  closeWinModal()
  openLevelPicker()
})

window.addEventListener('keydown', (e) => {
  if (!langMenu.hidden && e.key === 'Escape') {
    e.preventDefault()
    closeLangMenu()
    return
  }
  if (!winModal.hidden && e.key === 'Escape') {
    e.preventDefault()
    closeWinModal()
    return
  }
  if (!lvModal.hidden && e.key === 'Escape') {
    e.preventDefault()
    closeLevelPicker()
    return
  }
  if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) {
    return
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault()
    undoMove()
    return
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'n' || e.key === 'N') {
    e.preventDefault()
    togglePencilMode()
    return
  }
  if (e.key === 'c' || e.key === 'C') {
    e.preventDefault()
    toggleInstantCheck()
    return
  }
  if (e.key === 'h' || e.key === 'H') {
    e.preventDefault()
    applyHint()
    return
  }
  if (e.key >= '1' && e.key <= '9') {
    inputDigit(Number(e.key), e.shiftKey)
    return
  }
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    erase()
    return
  }
  if (state.selected === null) return
  const row = Math.floor(state.selected / 9)
  const col = state.selected % 9
  if (e.key === 'ArrowUp' && row > 0) selectCell(indexOf(row - 1, col))
  if (e.key === 'ArrowDown' && row < 8) selectCell(indexOf(row + 1, col))
  if (e.key === 'ArrowLeft' && col > 0) selectCell(indexOf(row, col - 1))
  if (e.key === 'ArrowRight' && col < 8) selectCell(indexOf(row, col + 1))
})

applyStaticI18n()
persist()
render()
