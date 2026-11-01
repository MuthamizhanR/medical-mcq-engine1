## 2024-11-01 - Interactive `div` Elements as Buttons
**Learning:** Custom `div` elements used as interactive components (like topic cards and quiz options) are not inherently keyboard accessible. They require explicit `role="button"`, `tabindex="0"`, and keyboard event handlers (for Enter and Space keys) to function properly for keyboard users.
**Action:** When creating custom interactive UI elements, always ensure they are fully accessible by adding semantic roles, focusability, and keyboard event handlers, along with visible focus states.
