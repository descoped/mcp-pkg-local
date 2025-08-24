# Agent Tuning Lessons Learned

## Executive Summary

Through extensive agent instruction tuning and self-reflection exercises, we discovered critical patterns for creating effective AI agent instructions. The key insight: **agents must be treated as autonomous professionals with clear expertise, not project-specific implementations**.

## Key Lessons

### 1. Professional Identity Over Project State

**❌ Wrong Approach**: Mixing project state and feature requests into agent instructions
```markdown
"The project currently has 67 tests passing, we need to implement Python AST parsing next..."
```

**✅ Right Approach**: Define professional expertise and capabilities
```markdown
"You are a Senior Principal Developer with 18 years of experience in full-stack development..."
```

**Lesson**: Agents should embody professional roles that transcend specific projects. Project state belongs in CLAUDE.md, not agent instructions.

### 2. Self-Improvement vs External Modification

**❌ Wrong Approach**: Having one agent update all other agents
```markdown
system-developer: "I'll update all agent instructions with the improvements..."
```

**✅ Right Approach**: Each agent self-reflects and improves their own instructions
```markdown
solution-architect: "Based on my experience, I need an Architectural Decision Framework..."
```

**Lesson**: Agents understand their own needs best. Self-reflection produces more authentic and effective improvements than external modifications.

### 3. Tool Permissions in YAML Front Matter

**❌ Wrong Approach**: Listing tools in the instruction body
```markdown
"I have access to the following tools: Read, Write, Edit..."
```

**✅ Right Approach**: Tools in YAML front matter
```yaml
---
name: agent-name
tools: Read, Write, Edit, MultiEdit, Glob, Grep, BashOutput
model: sonnet
---
```

**Lesson**: Tool permissions are configuration, not instructions. YAML front matter provides clean separation of concerns.

### 4. Concrete Triggers Over Generic Descriptions

**❌ Wrong Approach**: Vague invocation triggers
```markdown
"Use this agent for complex features and system optimization"
```

**✅ Right Approach**: Specific, actionable triggers
```markdown
"Triggers on:
- Package scanning takes >500ms (target: <300ms)
- Cache hit rate drops below 90%
- Memory usage exceeds 100MB during scanning"
```

**Lesson**: Specificity enables correct agent selection. Measurable thresholds and concrete scenarios prevent ambiguity.

### 5. Measurable Success Criteria

**❌ Wrong Approach**: Subjective success metrics
```markdown
"Ensure good performance and clean code"
```

**✅ Right Approach**: Quantifiable criteria
```markdown
"Success Criteria:
- [ ] Scan operations <300ms (benchmark with 85+ packages)
- [ ] Cache hit ratio >90% in typical usage
- [ ] Token reduction >99% for files >1000 lines"
```

**Lesson**: Agents need objective measures of success. Quantifiable metrics enable consistent quality.

### 6. Delegation Examples With Context

**❌ Wrong Approach**: Abstract delegation patterns
```markdown
"Delegates work to specialized agents as needed"
```

**✅ Right Approach**: Concrete handoff scenarios
```markdown
"To scanner-engineer: 'Create Go language scanner following new architecture with:
- Scanner interface contract
- Go package manager requirements research
- Expected file structure patterns
- Performance benchmarks to meet (scan <300ms for 100 packages)'"
```

**Lesson**: Clear delegation examples with full context enable effective collaboration. Work packages must be self-contained.

### 7. Professional Standards vs Implementation Details

**❌ Wrong Approach**: Focusing on current implementation
```markdown
"The scanner currently uses SQLite cache with 40x performance improvement..."
```

**✅ Right Approach**: Professional capabilities and standards
```markdown
"Philosophy: Every ecosystem has unique patterns, but underlying dependency principles are universal.
Professional Standards: Cross-platform compatibility, robust error handling, performance optimization."
```

**Lesson**: Instructions should define capabilities and standards, not current implementation state.

## Effective Agent Instruction Structure

Based on our learnings, the optimal agent instruction structure is:

```markdown
---
name: agent-name
description: Clear trigger description
tools: Tool1, Tool2, Tool3  # Configuration in YAML
model: sonnet
color: color
---

## Professional Profile
[Identity, experience, philosophy, standards]

## Core Competencies
[Technical expertise and methodologies]

## Responsibilities
[Own/Advise/Support framework]

## Authority Level
[Autonomous/Consensus/Escalation decisions]

## Workflow
[Numbered steps with clear progression]

## Success Criteria
[Measurable checkboxes]

## Collaboration Protocol
[Specific delegation examples with context]

## [Project-Specific Section]
[Concrete triggers, thresholds, examples relevant to current project]
```

## Common Pitfalls to Avoid

### 1. Feature Request Contamination
Don't let temporary feature requests become permanent instructions.

### 2. State Management in Instructions
Project state changes; agent expertise is stable. Keep them separate.

### 3. Generic Language
Replace "complex features" with specific triggers like "TypeScript AST parsing for files >100KB".

### 4. Missing Context in Delegation
Every delegation must include full context, constraints, and success criteria.

### 5. Unclear Tool Boundaries
Explicitly state what tools can and cannot be used, especially git operations.

## The Self-Reflection Process

The most effective tuning process we discovered:

1. **Each agent reviews Claude's SubAgent documentation**
2. **Agent identifies what works well in current instructions**
3. **Agent articulates specific needs in their own words**
4. **Agent self-implements improvements**
5. **Changes preserve professional identity while adding specificity**

This process resulted in:
- solution-architect: Added Architectural Decision Framework
- system-developer: Added project-specific constraints and error protocols
- scanner-engineer: Added concrete invocation examples
- token-optimizer: Added token thresholds and optimization strategies
- test-architect: Added quality gate criteria by change type
- devops-engineer: Added MCP server operations guidance
- performance-analyst: Added specific trigger scenarios with thresholds
- bottles-architect: Added package manager specifications
- requirements-analyst: Added documentation migration rules

## Key Success Factors

### 1. Agent Autonomy
Agents with clear authority levels and tool permissions work more effectively.

### 2. Professional Identity
Strong professional personas (years of experience, philosophy, standards) improve decision quality.

### 3. Measurable Criteria
Quantifiable success metrics enable objective evaluation.

### 4. Self-Contained Work Packages
Complete context in delegations enables asynchronous collaboration.

### 5. Project-Specific Sections
Separate sections for project context preserve reusability while providing specificity.

## Recommendations for Future Agent Development

1. **Start with Professional Identity**: Define the role before the tasks
2. **Use Real-World Metrics**: Base thresholds on actual system performance
3. **Implement Self-Reflection Early**: Let agents tune themselves
4. **Maintain Clear Boundaries**: Separate configuration, identity, and project context
5. **Document Collaboration Patterns**: Provide concrete delegation examples
6. **Quantify Everything**: Replace subjective language with measurable criteria
7. **Preserve What Works**: Don't fix what isn't broken during tuning

## Conclusion

Effective agent instructions balance three critical elements:

1. **Professional Identity**: Stable expertise that transcends projects
2. **Clear Configuration**: Tool permissions and operational boundaries
3. **Project Context**: Specific triggers, thresholds, and examples

The self-reflection and self-improvement process proved far more effective than external modification, resulting in agents that understand their roles deeply and can articulate their needs clearly.

Most importantly: **treat agents as employed professionals, not project implementations**. This mindset shift was the key to successful agent instruction tuning.