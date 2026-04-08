export type GameState =
  | 'IDLE'
  | 'SPIN_REQUESTED'
  | 'SPINNING'
  | 'RESULT_READY'
  | 'WIN_PRESENTATION'
  | 'FEATURE_TRIGGERED'
  | 'ERROR';
