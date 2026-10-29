import { describe, it } from "vitest";

// These are explicit acceptance cases for unapproved changes, NOT passing tests.
// Sandbox execution must be exercised in Chromium, not inferred from DOM attributes.
describe("HTML isolation — pending first security-group approval", () => {
  it.todo("story event handlers cannot access the parent DOM, session storage or authenticated client");
  it.todo("admin game previews cannot read parent storage or remove their own sandbox");
  it.todo("real HTML game clicks, scoring, reset, relative assets and resizing still work");
  it.todo("real stories retain reading, interactive actions and font controls");
});

describe("cookie cleanup — pending subsequent security-group approval", () => {
  it.todo("login and signup do not create duplicate access/refresh token cookies");
  it.todo("logout expires legacy token cookies without removing unrelated cookies");
  it.todo("normal session persistence, refresh and logout continue to work");
});