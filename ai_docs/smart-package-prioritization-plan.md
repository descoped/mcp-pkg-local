# Smart Package Prioritization Plan (v0.1.2)

**Date**: 2025-08-15  
**Status**: Planning phase - awaiting user approval  
**Context**: Enhancement request for intelligent package ranking

## Problem Statement

Currently, the 50-package limit in scan-packages is applied after scanning all packages but doesn't prioritize project-declared dependencies over transitive ones. This means LLMs might receive irrelevant transitive dependencies instead of the packages actually used in the project.

## Core Concept: Intelligent Package Ranking

**Goal**: Make scan-packages return the most relevant packages first, prioritizing project-declared dependencies over transitive ones.

## 1. Project Configuration Analysis

### Supported Project Management Detection
Based on CLAUDE.md, we support:

**Python:**
- **pip**: `requirements.txt`, `setup.py`, `pyproject.toml`
- **poetry**: `pyproject.toml` (with `[tool.poetry]`)
- **uv**: `pyproject.toml` (superior Rust-based manager)
- **pipenv**: `Pipfile`/`Pipfile.lock`
- **conda**: `environment.yml`

**Node.js:**
- **npm**: `package.json` + `package-lock.json`
- **pnpm**: `package.json` + `pnpm-lock.yaml`
- **yarn**: `package.json` + `yarn.lock`
- **bun**: `package.json` + `bun.lockb`

### Detection Strategy
- **Detect project management tool** from file presence
- **Parse dependency declarations** from config files
- **Categorize dependencies** by declaration type
- **Fail fast** if no supported project management detected

## 2. Smart Package Ranking Algorithm

### Priority System
```
Priority 1: Direct project dependencies (production)     - Score: 1000+
Priority 2: Direct project dev dependencies              - Score: 800+
Priority 3: Popular/commonly used transitive dependencies - Score: 600+
Priority 4: Other transitive dependencies                - Score: 400+
Priority 5: @types packages (unless explicitly needed)   - Score: 200+
```

### Scoring Factors
- **Direct dependency**: +1000 points
- **Development dependency**: +800 points
- **Popular package**: +200 points (based on download stats or common patterns)
- **Recently updated**: +100 points
- **Has TypeScript definitions**: +50 points

## 3. Enhanced Default Behavior

### Current vs Proposed
- **Current**: Returns first 50 packages from alphabetical/scan order
- **Proposed**: Returns top 50 packages by relevance score
- **Backward compatibility**: Existing behavior preserved when no ranking possible

### New Parameters
```typescript
interface ScanPackagesParams {
  // Existing parameters...
  relevanceOnly?: boolean;    // Return only direct project dependencies
  includeTransitive?: boolean; // Include transitive deps (default: true)
  sortBy?: 'relevance' | 'name' | 'size'; // Sort order (default: relevance)
}
```

## 4. Implementation Strategy

### Phase 1: Smart Ranking (1-2 days)
1. **Enhance dependency categorization** in scanners
   - Add priority scoring to PackageInfo type
   - Parse all supported project configuration files
   - Implement relevance scoring algorithm

2. **Add dependency parsing** for all supported project files
   - Python: requirements.txt, pyproject.toml, Pipfile, environment.yml
   - Node.js: package.json (already partially implemented)
   - Handle version constraints and dependency groups

3. **Implement ranking algorithm** with priority scoring
   - Create scoring utility functions
   - Add popular package detection
   - Implement sorting by relevance score

4. **Update scan-packages** to sort by relevance before limiting
   - Apply scoring during package processing
   - Sort packages by score descending
   - Apply limit to top-ranked packages

### Phase 2: Project Management Validation (1 day)
1. **Add project detection validation** in scanner factory
   - Enhance detectAndCreateScanner with validation
   - Check for supported project files before scanning
   - Return descriptive errors for unsupported projects

2. **Throw descriptive errors** for unsupported projects
   - Custom error class for unsupported project types
   - Include list of supported project management tools
   - Provide guidance for adding support

3. **List supported project types** in error messages
   - Clear error message format
   - Examples of supported file structures
   - Links to documentation

### Phase 3: Enhanced Filtering (1 day)
1. **Add `relevanceOnly` parameter** to return only declared dependencies
   - Filter to only direct project dependencies
   - Exclude all transitive dependencies
   - Useful for focused project analysis

2. **Add `includeTransitive` parameter** for full dependency trees
   - Control transitive dependency inclusion
   - Default: true (current behavior)
   - Can be combined with relevanceOnly

3. **Enhance summary mode** with dependency source breakdown
   - Add direct vs transitive counts
   - Show project management tool detected
   - Include relevance distribution

4. **Update documentation** with smart prioritization details
   - Document new parameters
   - Explain scoring algorithm
   - Provide usage examples

## 5. Project Management Support Matrix

```
✅ Fully Supported:
- Python: pip (requirements.txt), poetry (pyproject.toml), uv, pipenv
- Node.js: npm, pnpm, yarn, bun (all use package.json)

⚠️ Partial Support:
- Python: conda (environment.yml) - needs enhancement
- Python: setup.py only - can detect but limited dependency info

❌ Not Supported:
- Go modules, Rust/Cargo, Ruby/Bundler, PHP/Composer
- Error message: "Project type not supported. Supported: Python (pip/poetry/uv/pipenv), Node.js (npm/pnpm/yarn/bun)"
```

## 6. Background Scanning Considerations

### MCP Constraints
- **MCP constraint**: Tools are request-response, no persistent background processes
- **No background scanning possible** within current MCP model
- **Alternative**: Implement "warm cache" on first scan with smart prioritization

### Future Enhancements
- Could explore MCP streaming or notification patterns
- Proactive cache warming on project file changes
- Integration with file watchers (outside MCP scope)

## 7. Expected Outcomes

### User Experience Improvements
- **Better LLM relevance**: Primary project dependencies appear first in default 50
- **Faster development feedback**: Most relevant packages prioritized
- **Clear error handling**: No mystery failures on unsupported projects
- **Intelligent defaults**: Tool "understands" project structure

### Performance Characteristics
- **Backward compatibility**: Existing behavior preserved
- **Token efficiency maintained**: 90% reduction from v0.1.1 preserved
- **Smart caching**: Relevance scores cached with packages
- **Minimal overhead**: Scoring done during existing scan process

### API Enhancements
```javascript
// Get most relevant packages only
scan-packages --relevanceOnly

// Get summary with dependency breakdown
scan-packages --summary
// Returns: { direct: 12, transitive: 292, tool: "npm" }

// Traditional behavior still available
scan-packages --sortBy name --includeTransitive
```

## 8. Implementation Files to Modify

### Core Scanner Changes
- `src/scanners/nodejs.ts` - Enhance dependency parsing
- `src/scanners/python.ts` - Add project file parsing
- `src/utils/scanner-factory.ts` - Add validation logic

### Type Definitions
- `src/types.ts` - Add relevance scoring types and new parameters

### Tool Implementations
- `src/tools/scan-packages.ts` - Add sorting and filtering logic
- `src/server.ts` - Add new parameter definitions

### New Utilities
- `src/utils/package-scoring.ts` - Relevance scoring algorithms
- `src/utils/project-detection.ts` - Project management detection

### Tests
- `tests/unit/package-scoring.test.ts` - Test scoring algorithms
- `tests/integration/smart-prioritization.test.ts` - Test end-to-end behavior

## 9. Risks and Mitigation

### Risks
- **Breaking changes**: Changing default sort order
- **Performance impact**: Additional parsing and scoring
- **Complex configuration**: Multiple project file formats

### Mitigation
- **Feature flags**: Make smart ranking opt-in initially
- **Graceful fallbacks**: Fall back to current behavior on errors
- **Comprehensive testing**: Test with real project configurations
- **Documentation**: Clear migration guide and examples

## 10. Success Metrics

### Quantitative
- **Relevance score**: >80% of top 10 packages are direct dependencies
- **Performance**: <10% overhead for scoring and sorting
- **Error reduction**: 100% of unsupported projects show helpful errors

### Qualitative
- **Developer feedback**: Improved LLM code generation relevance
- **Ease of use**: Tool "just works" with project dependencies
- **Error clarity**: Developers understand why tool failed

This enhancement maintains the 90% token reduction achieved in v0.1.1 while making the default responses significantly more valuable for LLM code generation and analysis.