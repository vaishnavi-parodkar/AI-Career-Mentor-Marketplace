// Thin wrapper over the Fullscreen API (with the old WebKit prefix for Safari).
// Not every device has it: iPhone Safari has no fullscreen for web pages, for example.
// Callers should check isFullscreenSupported() and degrade gracefully.

const root = () => (typeof document === "undefined" ? null : document.documentElement);

export const isFullscreenSupported = () => {
  const el = root();
  return !!el && !!(el.requestFullscreen || el.webkitRequestFullscreen);
};

export const isFullscreen = () =>
  typeof document !== "undefined" && !!(document.fullscreenElement || document.webkitFullscreenElement);

// Must be called directly from a user gesture (a click handler), before any await.
export const enterFullscreen = async () => {
  const el = root();
  if (!el) return false;
  try {
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    else return false;
    return isFullscreen();
  } catch {
    return false;
  }
};

export const exitFullscreen = async () => {
  if (!isFullscreen()) return;
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
  } catch {
    // Already leaving, or the browser refused: nothing useful to do.
  }
};

export const onFullscreenChange = (handler) => {
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
  };
};
