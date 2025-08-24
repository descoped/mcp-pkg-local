# AI Documentation Reorganization Plan

**Date**: 2025-01-22  
**Purpose**: Clean up and reorganize ai_docs/ folder for better clarity and historical preservation

## Current State
- **33 documents** in ai_docs/ folder
- Mix of completed work, ongoing work, outdated plans, and unclear status
- No clear organization structure

## Proposed Structure

```
ai_docs/
├── done/           # Completed work that's still relevant for reference
├── wip/            # Work in progress - active development
├── outdated/       # Outdated plans or superseded documents
├── unclear/        # Documents with unclear status or purpose
└── REORGANIZATION-PLAN.md  # This document
```

`.claude/history/` - For completed milestones and historical records

## Classification Criteria

### 1. DONE (Completed but still relevant)
- Implemented features that are working
- Completed analysis that provides ongoing value
- Architecture decisions that were implemented
- Recent milestone achievements

### 2. WIP (Work in Progress)
- Active development tasks
- Plans being executed
- Recent analyses for upcoming work
- TODO items still being worked on

### 3. OUTDATED (No longer relevant)
- Old plans that were superseded
- Analysis for features that changed direction
- Requirements that are no longer valid
- Plans that were abandoned

### 4. UNCLEAR (Needs review)
- Documents with ambiguous status
- Partial implementations with unknown state
- Documents that need more context to classify

### 5. HISTORY (Move to .claude/history/)
- Completed milestones
- Historical records of major achievements
- Documents that are complete and only needed for reference

## Document Analysis & Classification

### Updated Classification (Based on Document Analysis)

#### DONE → .claude/history/ (Completed Milestones)
1. **bottles-try-fix-safe-environemnt-initialization-anomaly.md** - MILESTONE ACHIEVED (60+ hours, all CI passing)
2. **ADR-002-CI-Pipeline-Architecture-Resolution.md** - Architecture decision completed and implemented
3. **bottles-implementation-kickoff.md** - Kickoff complete, work finished
4. **bottles-implementation-tasks.md** - All tasks completed in milestone
5. **bottles-work-breakdown.md** - Work completed in milestone
6. **IMPLEMENTATION-DELEGATION-CI-ARCHITECTURE-FIX.md** - CI fix completed

#### DONE → ai_docs/done/ (Completed, Still Referenced)
7. **bottles-architecture.md** - Authoritative architecture document, implemented
8. **bottles-architecture-diagrams.md** - Reference diagrams for architecture
9. **bottles-integration-tests-quality-review.md** - Recent quality review (2025-01-22)
10. **shell-rpc-timeout-analysis.md** - Completed analysis, implemented
11. **shell-rpc-resilient-timeout-capability.md** - Implemented capability
12. **shell-rpc-command-instrumentation-flow.md** - Technical reference
13. **shell-rpc-timeout-strategy-review.md** - Completed strategy review
14. **python-implementation-gaps.md** - RESOLVED, parity achieved
15. **mcp-tool-performance-analysis.md** - Completed performance analysis
16. **bottles-index.md** - Navigation document for bottles docs

#### WIP → ai_docs/wip/ (Active/Future Work)
17. **TODO.md** - Active task list (needs update - bottles tasks are actually done)
18. **nodejs-source-extraction-plan.md** - AST extraction for future enhancement
19. **smart-package-prioritization-plan.md** - Future optimization (currently removed)
20. **mcp-sdk-enhancement-opportunities.md** - Future SDK improvements
21. **bottles-python-ast-strategy.md** - Future Python AST implementation

#### OUTDATED → ai_docs/outdated/ (Superseded/Abandoned)
22. **bottles-architecture-plan.md** - Initial plan, superseded by bottles-architecture.md
23. **bottles-fix-shellrpc-env-init-revised-plan.md** - Fixed in milestone
24. **bottles-requirements-analysis.md** - Initial requirements, now implemented
25. **bottles-team-coordination-plan.md** - Team coordination completed
26. **timeout-integration-plan.md** - Already integrated
27. **interface-stability-framework.md** - Not implemented, different approach taken
28. **mcp-protocol-communication-improvements.md** - Old analysis, not pursued
29. **node-mcp-issues.txt** - Issues resolved
30. **compare-results.md** - Old comparison, no longer relevant

#### UNCLEAR → ai_docs/unclear/ (Need Context)
31. **bottles-rust-go-tech-note.md** - Future language support?
32. **bottles-storage-volumes-tech-note.md** - Partially implemented?
33. **mcp-tools-architecture-analysis.md** - Reference or outdated?
34. **node-mcp-efficiency-analysis.md** - Current or historical?

## Execution Steps

### Phase 1: Document Analysis (Current)
1. Read each document to understand its status
2. Check for completion markers, dates, TODOs
3. Cross-reference with CLAUDE.md and git history
4. Identify relationships between documents

### Phase 2: Create Folder Structure
```bash
mkdir -p ai_docs/done
mkdir -p ai_docs/wip
mkdir -p ai_docs/outdated  
mkdir -p ai_docs/unclear
```

### Phase 3: Document Classification
For each document:
1. Read content thoroughly
2. Check for:
   - Completion status indicators
   - Date stamps
   - TODO items (completed vs pending)
   - References to implemented features
   - Cross-references with other docs
3. Classify based on criteria
4. Move to appropriate location

### Phase 4: Special Handling

#### TODO.md Processing
1. **Extract Completed Bottles Tasks**:
   - Phase 1: Core Infrastructure ✅ COMPLETED
   - Phase 2: Python Package Managers ✅ COMPLETED
   - Phase 3: Python Feature Parity ✅ COMPLETED
   - Move to: `.claude/history/20250122_TODO-bottles-completed.md`

2. **Keep Active Tasks in wip/TODO.md**:
   - Priority 3: MCP SDK Guardrails (future work)
   - Priority 4: Testing & Documentation (ongoing)
   - Priority 5: Performance Monitoring (future)

#### Milestone Document Processing
1. **bottles-try-fix-safe-environemnt-initialization-anomaly.md**
   - Move to: `.claude/history/20250122_bottles-milestone-achievement.md`
   - This is the 60+ hour milestone achievement

2. **Cross-Reference Updates**
   - Update bottles-index.md references
   - Update CLAUDE.md references to moved documents
   - Add forwarding notes in original locations

### Phase 5: Create Index
Create `ai_docs/INDEX.md` with:
- Summary of reorganization
- Location of each document
- Brief description of each category
- Cross-reference to historical docs

## Validation Questions

Before proceeding, we need to confirm:

1. Should TODO.md completed items be extracted to a separate history file?
2. Should we preserve the bottles-* prefix for grouped documentation?
3. Are there any documents that should NOT be moved?
4. Should we add README files to each subfolder explaining the category?
5. How should we handle cross-document references after moving?

## Success Criteria

✅ All documents classified into appropriate categories
✅ Historical achievements preserved in .claude/history/
✅ Active work clearly identified in wip/
✅ No duplicate or conflicting information
✅ Clear navigation via INDEX.md
✅ All cross-references updated

## Risk Mitigation

- Create backup before moving (not doing actual file operations until approved)
- Document all moves in a changelog
- Preserve git history (no deletions, only moves)
- Test all cross-references after reorganization

## Execution Summary

### Files to Move (34 total)

**To .claude/history/** (6 files - completed milestones):
- bottles-try-fix-safe-environemnt-initialization-anomaly.md
- ADR-002-CI-Pipeline-Architecture-Resolution.md  
- bottles-implementation-kickoff.md
- bottles-implementation-tasks.md
- bottles-work-breakdown.md
- IMPLEMENTATION-DELEGATION-CI-ARCHITECTURE-FIX.md

**To ai_docs/done/** (10 files - completed, still referenced):
- bottles-architecture.md
- bottles-architecture-diagrams.md
- bottles-integration-tests-quality-review.md
- shell-rpc-* (4 files)
- python-implementation-gaps.md
- mcp-tool-performance-analysis.md
- bottles-index.md

**To ai_docs/wip/** (5 files - active/future work):
- TODO.md (updated with completed items removed)
- nodejs-source-extraction-plan.md
- smart-package-prioritization-plan.md
- mcp-sdk-enhancement-opportunities.md
- bottles-python-ast-strategy.md

**To ai_docs/outdated/** (9 files - superseded):
- bottles-architecture-plan.md
- bottles-fix-shellrpc-env-init-revised-plan.md
- bottles-requirements-analysis.md
- bottles-team-coordination-plan.md
- timeout-integration-plan.md
- interface-stability-framework.md
- mcp-protocol-communication-improvements.md
- node-mcp-issues.txt
- compare-results.md

**To ai_docs/unclear/** (4 files - need context):
- bottles-rust-go-tech-note.md
- bottles-storage-volumes-tech-note.md
- mcp-tools-architecture-analysis.md
- node-mcp-efficiency-analysis.md

---

**Ready for Execution**: 
1. ✅ Plan complete with classifications
2. ✅ Special handling identified for TODO.md
3. ✅ Cross-reference updates planned
4. ⏳ Awaiting approval to execute reorganization

**Note**: No git operations will be performed. This is purely file organization.