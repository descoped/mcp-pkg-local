# Shell-RPC Timeout Strategy: Review and Recommendation

## 1. Introduction

This document contains the validation of the analysis presented in `shell-rpc-timeout-analysis.md` and includes critical feedback that refines the final recommendation. The result is a proposal for a "Profile-Driven Circuit Breaker" that is robust, precise, and maintainable.

## 2. Validation of the Initial Analysis

The initial analysis document is **validated as a thorough and accurate** assessment of the problem.

-   It correctly identifies the weaknesses of the current activity-based timeout.
-   The industry analysis is relevant and draws sound conclusions.
-   The failure scenarios are realistic and critical to consider.
-   The recommendation to use a Circuit Breaker pattern (Solution 1) is well-supported and correct.

## 3. Critical Refinement: Command-Specific Profiles

While the circuit breaker is the right *engine*, the initial analysis's configuration examples (`Conservative`, `CI/CD`) were too high-level. A critical requirement is to control timeout policies on a **per-command basis**.

Different commands have vastly different execution characteristics. For example:
-   `uv venv` should complete in seconds.
-   `pip install -r requirements.txt` can legitimately run for many minutes.

A one-size-fits-all configuration for the circuit breaker would fail to address these different contexts.

## 4. Final Recommendation: Profile-Driven Circuit Breaker

We recommend a hybrid approach that combines the resilience of the **Enhanced Circuit Breaker (Solution 1)** with the precision of the **Command-Aware Strategy (Solution 4)**.

The circuit breaker will be the core engine for state management, but it will be configured by a series of command-specific profiles. The Shell-RPC will match the executing command against a profile and use that profile's specific configuration to drive the circuit breaker.

### Example Configuration

```typescript
const commandProfiles = [
  {
    id: 'fast-command',
    commandPattern: /^(which|ls|mkdir|python -m venv|uv venv|uv --version|pip --version)/,
    circuitBreaker: {
      states: {
        CLOSED: { triggers: { toHalfOpen: ['no_activity_5s'] } },
        HALF_OPEN: { timeout: 5000, triggers: { toOpen: ['timeout_expired'] } },
      }
    }
  },
  {
    id: 'pip-install',
    commandPattern: /pip install -r/,
    circuitBreaker: {
      states: {
        CLOSED: { triggers: { toHalfOpen: ['no_activity_120s', 'stderr_error_pattern'] } },
        HALF_OPEN: { timeout: 60000, triggers: { toClosed: ['stdout_progress'], toOpen: ['timeout_expired'] } },
      },
      patterns: {
        progress: [/\d+%/, /downloading/i, /installing/i],
        error: [/error:/i, /failed building wheel/i]
      }
    }
  },
  {
    id: 'default',
    commandPattern: /.*/,
    circuitBreaker: { /* A balanced, general-purpose configuration */ }
  }
];
```

## 5. Architectural Requirement

To ensure a clean separation of concerns, this new Profile-Driven Circuit Breaker functionality should be implemented in its own dedicated module or namespace within the Shell-RPC package.

**Proposed Location:** `src/bottles/shell-rpc/circuit-breaker/`

This will contain all the logic for the state machine, pattern matching, and profile management, keeping the core `shell-rpc/index.ts` clean and focused on command execution.

## 6. Conclusion

The recommended path forward is to implement a **Profile-Driven Circuit Breaker**. This approach is:
-   **Intelligent:** It uses a state machine to understand process health.
-   **Precise:** It applies tailored configurations to specific commands.
-   **Maintainable:** The logic is centralized, and only the profiles need to be managed.

This design provides the best balance of resilience, precision, and long-term maintainability.
