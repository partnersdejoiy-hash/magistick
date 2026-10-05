/** Pinned-app persistence (localStorage). Shared by the rail and the directory. */
const PIN_KEY = "magistick:pinned-apps";

export function loadPins(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PIN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function savePins(pins: string[]) {
  try {
    localStorage.setItem(PIN_KEY, JSON.stringify(pins));
  } catch {
    /* private mode — pinning just won't persist */
  }
}
