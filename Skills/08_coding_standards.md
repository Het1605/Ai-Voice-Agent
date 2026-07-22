# AI Phone Agent Platform - Coding Standards

## Purpose
These rules apply to every file in the project. Always follow them unless explicitly instructed otherwise.

---

## General Rules
* Write production-quality code.
* Prefer readability over clever code.
* Keep code simple and modular.
* Follow consistent naming throughout the project.
* Avoid unnecessary complexity.
* Avoid duplicate code.
* Follow the existing project structure.
* Do not create random folders or files.
* Never hardcode values that belong in configuration.

---

## Naming
Use meaningful names.

**Examples of Good Names:**
* `ConversationService`
* `AgentRepository`
* `CallManager`
* `KnowledgeService`

**Avoid Names Like:**
* `Helper`
* `Utils`
* `Temp`
* `Data`
* `Manager1`

---

## File Organization
* Each file should have a single responsibility.
* Keep related code together.
* Avoid very large files.
* Split files only when it improves readability.

---

## Comments
Every file must begin with a short documentation block explaining:
* Purpose of the file
* Main responsibilities
* How it fits into the overall architecture

**Header Example:**
* What this file does
* When it is used
* Which modules use it

Keep this header concise and useful.

### Inside the Code:
* Write comments only where logic is not immediately obvious.
* Keep comments short.
* Explain *why*, not *what*.
* Remove commented-out code.

---

## Functions
* Keep functions focused on one responsibility.
* Use descriptive function names.
* Avoid long functions.
* Prefer early returns instead of deeply nested conditions.

---

## Classes
* One clear responsibility per class.
* Keep public APIs simple.
* Avoid giant classes.

---

## Variables
* Use descriptive names.
* Avoid abbreviations unless they are widely understood.
* Avoid single-letter variable names except in simple loops.

---

## Error Handling
* Handle expected failures.
* Return meaningful errors.
* Never silently ignore exceptions.

---

## Logging
* Log important events.
* Avoid excessive logging.
* Never log secrets or sensitive information.

---

## Configuration
* Read configuration from environment variables or configuration classes.
* Never hardcode credentials.

---

## Architecture
* Keep business logic independent of providers.
* Use interfaces where appropriate.
* Keep modules loosely coupled.
* Follow the plugin architecture.

---

## Dependencies
Before adding a new package:
* Check if it is really needed.
* Prefer mature libraries.
* Avoid unnecessary dependencies.

---

## Code Style
* Follow language best practices.
* Use type hints where applicable.
* Keep formatting consistent.
* Keep imports organized.

---

## AI-Specific Rules
* Do not couple business logic to any AI provider.
* AI providers must remain replaceable.
* Keep LangGraph inside the AI runtime only.
* Keep provider implementations isolated.

---

## Frontend-Specific Rules (CRITICAL)
> [!IMPORTANT]
> Responsive architecture and code/design reusability are the **most important rules** for all frontend implementations.

* **Responsive Architecture (Compulsory)**: All frontend views and components must look perfect on mobile, tablet, and desktop viewports.
  * Use fluid flexbox/grid containers and tailwind responsive modifiers (e.g., `md:`, `lg:`).
  * **Never** use hardcoded values (like `width: 600px` or `top: 140px`) that break formatting on smaller viewports.
* **Component & Design Reusability**:
  * Reuse standard layouts (e.g., dashboard shell, sidebar, auth templates) across all pages.
  * Centralize shared features (like common header navigation, page headers, status badges, and input wrappers) in the `components/` directory.
* **Consistent Design Tokens**:
  * **Never** hardcode ad-hoc colors, hex values (e.g., `#FF5733`), fonts, or spacings inside page-level files.
  * Always use Tailwind's configuration utility or CSS custom properties (theme variables) to ensure design consistency and easy dark-mode support.

---

## Before Creating New Code
Always check:
1. Can existing code be reused?
2. Does this follow the project architecture?
3. Does this follow the folder structure?
4. Is the code easy to understand?
5. Would another developer understand this after six months?

If the answer is **"No"**, improve the design before writing code.

