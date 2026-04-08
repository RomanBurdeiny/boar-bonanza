/** Global display ordering — higher draws on top */
export const Z_INDEX = {
  backdrop: -50,
  slotBoard: 0,
  winLineOverlay: 40,
  winHighlight: 50,
  uiPanels: 100,
  banners: 200,
} as const;
