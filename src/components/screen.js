/**
 * "Algorithm" to select the presentation screen
 * @param {ScreenDetails} screens
 * @returns {ScreenDetailed}
 */
export function selectScreen(screens) {
  const secondaryScreens = screens.screens.filter(
    (screen) => !screen.isPrimary
  );

  // If there are no secondary screens, use the primary screen
  if (secondaryScreens.length === 0) return screens.currentScreen;

  // If there is only one secondary screen, use it
  if (secondaryScreens.length === 1) return secondaryScreens[0];

  // Use first not built in secondary screen
  const externalScreen = secondaryScreens.find((screen) => !screen.isInternal);

  // If there is no external screen, use the first secondary screen
  if (!externalScreen) return secondaryScreens[0];

  return externalScreen;
}
