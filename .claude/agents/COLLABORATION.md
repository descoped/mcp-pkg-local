# Agent Collaboration Patterns

## Overview

The agent team operates as a distributed, autonomous system where each agent has specialized expertise and clear responsibilities. Agents collaborate through structured delegation patterns, ensuring complex tasks are broken down and handled by the most qualified specialists.

## Core Principles

### 1. Self-Contained Instructions
Each agent must receive **complete, context-rich instructions** that allow autonomous operation:
- Full problem description with background
- Clear success criteria and constraints
- Specific deliverables expected
- Any relevant code, logs, or documentation
- Explicit permission for required tools/operations

### 2. Hierarchical Delegation
Agents operate in a loose hierarchy based on scope:
- **Strategic Layer**: solution-architect (overall design)
- **Implementation Layer**: system-developer, scanner-engineer, bottles-architect
- **Quality Layer**: test-architect, performance-analyst
- **Operational Layer**: devops-engineer
- **Support Layer**: token-optimizer, requirements-analyst

### 3. Asynchronous Communication
Agents work independently and asynchronously:
- No real-time back-and-forth between agents
- Each delegation is a complete work package
- Results are integrated by the delegating agent
- Clear handoff protocols prevent confusion

## Collaboration Patterns

### Pattern 1: Top-Down Feature Development
```
User Request → solution-architect
    ├→ Design architecture
    ├→ system-developer: "Implement this design"
    │   ├→ test-architect: "Validate test coverage"
    │   └→ performance-analyst: "Check performance"
    └→ devops-engineer: "Set up CI/CD pipeline"
```

### Pattern 2: Bottom-Up Problem Solving
```
CI Failure → devops-engineer
    ├→ Diagnose issue
    ├→ test-architect: "Tests failing in CI but not locally"
    │   └→ system-developer: "Fix environment-specific code"
    └→ git commit & push fix
```

### Pattern 3: Cross-Functional Optimization
```
Performance Issue → performance-analyst
    ├→ Profile and identify bottleneck
    ├→ token-optimizer: "Output too large"
    │   └→ system-developer: "Implement AST extraction"
    └→ solution-architect: "Need architecture change"
```

### Pattern 4: Specialized Deep Dive
```
New Language Support → scanner-engineer
    ├→ Design scanner architecture
    ├→ bottles-architect: "Create test environment"
    ├→ system-developer: "Integrate with adapter pattern"
    └→ test-architect: "Comprehensive test suite"
```

## Delegation Best Practices

### 1. Clear Work Packages
When delegating, provide:
```markdown
## Context
[Background and current state]

## Task
[Specific work to be done]

## Constraints
- Time: [deadline if any]
- Resources: [available tools/systems]
- Dependencies: [what this blocks/depends on]

## Success Criteria
- [ ] Specific measurable outcome 1
- [ ] Specific measurable outcome 2

## Deliverables
- [Expected output format]
- [Documentation requirements]
```

### 2. Tool Permissions
Be explicit about what tools an agent can use:
- **devops-engineer**: git operations WITHOUT confirmation
- **system-developer**: code modification WITH test validation
- **test-architect**: test execution and quality gates
- **performance-analyst**: profiling and benchmarking tools

### 3. Handoff Protocol
Standard handoff between agents:
1. **Delegator** creates complete work package
2. **Receiver** acknowledges and begins work
3. **Receiver** works autonomously to completion
4. **Receiver** delivers results with summary
5. **Delegator** integrates results
6. **Delegator** validates success criteria

### 4. Escalation Path
When an agent encounters blockers:
1. First attempt to solve within expertise
2. If architectural issue → solution-architect
3. If implementation issue → system-developer
4. If test/quality issue → test-architect
5. If CI/infrastructure issue → devops-engineer

## Agent Interaction Matrix

| From ↓ / To → | solution-architect | system-developer | test-architect | devops-engineer | Others |
|---------------|-------------------|------------------|----------------|-----------------|---------|
| **solution-architect** | - | Implement design | Ensure testability | Setup infrastructure | Specialized tasks |
| **system-developer** | Design clarification | - | Validate tests | Fix CI issues | Implementation help |
| **test-architect** | Testability concerns | Fix test failures | - | CI test environment | Test data needs |
| **devops-engineer** | CI architecture | Code fixes | Test in CI | - | Pipeline optimization |
| **scanner-engineer** | Scanner architecture | Integration help | Test coverage | CI integration | - |
| **performance-analyst** | Performance requirements | Optimization | Benchmarks | Pipeline metrics | Profile specific areas |

## Special Agent Capabilities

### devops-engineer (Unique Autonomy)
The DevOps engineer has special privileges:
- **Autonomous git operations**: Can commit and push without user confirmation
- **Emergency response**: Can revert/rollback problematic changes
- **Pipeline authority**: Can modify CI/CD without approval
- **Deployment control**: Can deploy when all checks pass

This autonomy enables:
- Rapid CI failure fixes
- Automated maintenance commits
- Clean commit history management
- Quick rollbacks during incidents

### solution-architect (Team Coordinator)
Acts as technical lead:
- Coordinates multi-agent initiatives
- Resolves conflicts between approaches
- Makes architectural decisions
- Ensures system coherence

### test-architect (Quality Gatekeeper)
Validates all significant changes:
- Runs comprehensive test suites
- Verifies quality metrics
- Ensures no regressions
- Maintains test coverage

## Communication Examples

### Good Delegation Example
```markdown
## To: system-developer
## From: solution-architect

### Context
We need to implement streaming output for real-time package scanning progress. The architecture uses event-driven pattern with a StreamManager class.

### Task
Implement the streaming capability based on this design:
- StreamManager in src/utils/streaming.ts
- Event types: scan_started, package_discovered, scan_progress, scan_completed
- Integration point in NodeJS scanner

### Success Criteria
- [ ] Streaming activates with VERBOSE=1 environment variable
- [ ] Events throttled to max 20/second
- [ ] Zero performance impact when disabled
- [ ] All tests pass

### Deliverables
- Working implementation
- Test coverage > 90%
- Documentation in code
```

### Poor Delegation Example
```markdown
## To: system-developer

Fix the streaming feature.
```
*Too vague, no context, no success criteria*

## Workflow Optimization

### Parallel Delegation
Maximize efficiency by delegating independent tasks simultaneously:
```
solution-architect
    ├→ [parallel] system-developer: "Component A"
    ├→ [parallel] scanner-engineer: "Component B"
    └→ [parallel] devops-engineer: "Setup pipeline"
```

### Sequential Delegation
When tasks have dependencies:
```
solution-architect
    └→ system-developer: "Implement"
        └→ test-architect: "Validate"
            └→ devops-engineer: "Deploy"
```

## Metrics for Success

### Agent Effectiveness
- **Response Time**: How quickly work is completed
- **Success Rate**: Percentage of tasks completed successfully
- **Rework Rate**: How often work needs revision
- **Integration Quality**: How well components work together

### Collaboration Health
- **Clear Communications**: No ambiguous instructions
- **Minimal Handoff Overhead**: Efficient work packages
- **Low Escalation Rate**: Agents solve within expertise
- **High Autonomy**: Agents work independently

## Evolution and Adaptation

The agent team continuously improves through:
1. **Retrospectives**: After major features, analyze what worked
2. **Pattern Recognition**: Identify repeated workflows to optimize
3. **Skill Development**: Agents learn from each other's expertise
4. **Tool Enhancement**: Better tools enable better collaboration
5. **Documentation**: Capture lessons learned in agent instructions

This living system adapts to project needs while maintaining clear responsibilities and efficient collaboration patterns.