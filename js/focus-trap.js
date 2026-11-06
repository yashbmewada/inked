const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter((n) => !n.closest('[hidden]') && n.getClientRects().length > 0);
}

// Keeps Tab and Shift+Tab inside root, and pulls focus back if it lands outside. Returns the release function.
export function trapFocus(root) {
  function onKeydown(e) {
    if (e.key !== 'Tab') return;
    const items = focusables(root);
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === root || !root.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !root.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  }
  function onFocusin(e) {
    if (!root.contains(e.target)) (focusables(root)[0] || root).focus();
  }
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('focusin', onFocusin);
  return () => {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('focusin', onFocusin);
  };
}
