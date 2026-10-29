# Project rules

- Use Happy DOM for frontend unit tests to avoid optional native canvas startup failures; verify iframe execution, media rendering and sandbox enforcement in real Chromium separately.
- Security regression tests may record pending approval-dependent cases with `it.todo`; never count these as verified protection or silently change production behavior to pass them.