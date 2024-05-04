/**
 * "Algorithm" to select the presentation screen
 * @param {ScreenDetails} screens
 * @returns {[presenation: ScreenDetailed, notes?: ScreenDetailed]}
 */
export function selectScreens(screens) {
  // Don't confuse current screen with the primary screen
  const { primary, internals, externals } = screens.screens.reduce(
    (accumulator, current) => {
      if (current.isPrimary) {
        accumulator.primary = current;
        return accumulator;
      }

      if (current.isInternal) {
        accumulator.internals.push(current);
        return accumulator;
      }

      accumulator.externals.push(current);
      return accumulator;
    },
    /** @type {{ primary: ScreenDetailed | null, internals: ScreenDetailed[], externals: ScreenDetailed[] }} */
    ({ primary: null, internals: [], externals: [] })
  );

  console.debug("Screens", { primary, internals, externals });

  // Assume there is always primary screen
  if (primary === null)
    throw new Error(
      "No primary screen found. Are you running in headless mode?"
    );

  // Use first not built in secondary screen
  if (externals.length > 0) return [externals[0], primary];

  // If there is no external screen, use the first secondary internal screen
  if (internals.length > 0) return [internals[0], primary];

  // Fallback to the primary screen
  return [primary];
}
