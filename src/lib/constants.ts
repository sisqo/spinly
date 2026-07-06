export const MIN_SPIN_SECONDS = 2
export const MAX_SPIN_SECONDS = 15

export const MIN_FONT_SCALE = 0.5
export const MAX_FONT_SCALE = 2
export const FONT_SCALE_STEP = 0.1

// Shared by FinalistCards, PodiumChoreography's shuffle cards, and
// PodiumSlot's flip card — one source of truth so face-down and revealed
// cards never drift apart in size again.
export const QUIZ_SHOW_CARD_SIZE_CLASSES = 'h-48 w-32 sm:h-80 sm:w-56'
