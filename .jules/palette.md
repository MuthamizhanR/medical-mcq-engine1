## 2024-11-05 - Keyboard Accessibility for Custom Interactive Elements
**Learning:** In MEDTRIX, interactive options in the quiz UI were implemented using standard `div` elements with `onclick` handlers but no keyboard support or focus states, which completely breaks accessibility for keyboard users and screen readers.
**Action:** When implementing or reviewing custom interactive elements (like `div` based buttons), ensure they always include `role="button"`, `tabindex="0"`, a keyboard event handler (e.g. `onkeydown` for Enter/Space), and visible `:focus-visible` styles.
