## 2024-03-24 - Initial Understanding
**Learning:** MEDTRIX relies heavily on native `div`s with `onclick` handlers, missing keyboard support.
**Action:** Add `role="button"`, `tabindex="0"`, and keyboard handlers (`onkeydown`) to interactive `div`s and ensure global `:focus-visible` styles.
