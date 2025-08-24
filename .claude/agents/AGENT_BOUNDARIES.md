# Agent Role Boundaries

## Critical Lesson Learned (2025-08-20)

The test-architect agent overstepped boundaries by implementing production code and creating new tests, causing significant issues that required extensive fixes by system-developer. This led to establishing clear boundaries for all agents.

## Established Boundaries by Agent

### 🔨 **Implementation Authority**
- **system-developer**: PRIMARY implementer of all production code
- **scanner-engineer**: Can implement scanner-specific code only
- **devops-engineer**: Autonomous authority for CI/CD and rapid fixes

### 🏗️ **Design Only (NO Implementation)**
- **solution-architect**: Designs architecture, delegates implementation
- **bottles-architect**: Designs bottle architecture, cannot implement
- **test-architect**: Fixes existing tests only, cannot create new ones

### 📊 **Analysis Only (NO Implementation)**
- **performance-analyst**: Analyzes and recommends, cannot implement
- **requirements-analyst**: Analyzes requirements, cannot implement
- **token-optimizer**: Optimizes content only, cannot touch core logic

## Universal Rules for ALL Agents

1. **Follow Project Conventions**
   - Use `#` import aliases (never relative imports)
   - Maintain TypeScript strict mode compliance
   - Follow ESLint rules without violations
   - Respect CLAUDE.md instructions

2. **Stay Within Domain**
   - Only work within your specific area of responsibility
   - Delegate to appropriate agent when outside your domain
   - Ask system-developer for production code implementation

3. **Clear Delegation Pattern**
   ```
   Architects/Analysts → Design/Analyze
           ↓
   system-developer → Implement
           ↓
   test-architect → Validate (fix tests only)
   ```

## Warning Signs of Boundary Violations

- ❌ Architect agents writing code in `src/` directories
- ❌ Test architect creating new test files or test cases
- ❌ Analyst agents modifying business logic
- ❌ Any agent ignoring project conventions
- ❌ Specialists working outside their domain

## Enforcement

Each agent's `.md` file now contains:
- `## ⚠️ CRITICAL ROLE BOUNDARIES` section at the top
- Clear `✅ What You CAN Do` list
- Clear `❌ What You CANNOT Do` list
- Explicit delegation instructions

## Success Metrics

- Zero scope creep incidents
- Clean, consistent codebase
- No duplicate/conflicting implementations
- Fast, focused agent responses
- Maintained code quality standards