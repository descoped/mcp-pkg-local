# JetBrains MCP Tool Instructions

## Overview
The JetBrains MCP (Model Context Protocol) tool provides direct integration between Claude and WebStorm/IntelliJ IDEs, enabling real-time code inspection, file manipulation, and IDE control without relying on CLI tools.

## Tool Categories and Usage

### 1. Code Inspection & Analysis
**Primary tools for code quality checks:**
- `get_file_problems` - Analyzes specific files for errors and warnings using IntelliJ's inspections
  - Returns severity levels: ERROR, WARNING, WEAK WARNING
  - Provides line numbers, column positions, and descriptions
  - More comprehensive than TypeScript/ESLint CLI tools
  
- `get_project_problems` - Retrieves all project-wide problems
  - Use for initial project health assessment
  - Identifies compilation errors, inspection problems across all files

- `get_current_file_errors` - Analyzes the currently active file in editor
  - Quick feedback on current work
  - Real-time inspection results

### 2. File Navigation & Search
**Efficient project exploration:**
- `search_in_files_by_text` / `search_in_files_by_regex` - IntelliJ's powerful search engine
  - Faster than grep/ripgrep for large codebases
  - Supports file masks and directory scoping
  - Returns context around matches

- `find_files_by_name_keyword` - Quick file location by name
  - Case-insensitive substring matching
  - Faster than find/fd commands

- `list_directory_tree` - Hierarchical project structure
  - Better than `tree` command - respects .gitignore
  - Configurable depth

- `get_all_open_file_paths` - Track user's working context
  - Shows what files the developer is actively working on

### 3. Code Modification
**Direct file manipulation:**
- `replace_text_in_file` - Targeted text replacement
  - Supports regex patterns
  - Case sensitivity control
  - Replace all or specific occurrences

- `create_new_file` - File creation with content
  - Creates parent directories automatically
  - Immediate IDE indexing

- `reformat_file` - Apply IDE code formatting
  - Uses project's code style settings
  - Consistent with developer's preferences

### 4. Execution & Testing
**Run configurations and debugging:**
- `get_run_configurations` - List available run configs
  - Test suites, build tasks, application runners
  
- `execute_run_configuration` - Execute specific configurations
  - Returns exit codes and output
  - Configurable timeout

- `execute_terminal_command` - Shell command execution
  - Integrated terminal environment
  - Captures output up to 2000 lines

### 5. Version Control
**Git integration:**
- `get_project_vcs_status` - Current file changes
  - MODIFICATION, ADDITION, DELETION, MOVED statuses
  
- `find_commit_by_message` - Search commit history
  - Returns matching commit hashes

### 6. Symbol Information
**Code intelligence:**
- `get_symbol_info` - Symbol documentation and type info
  - Quick Documentation equivalent
  - Returns declarations, types, and documentation

- `rename_refactoring` - Intelligent symbol renaming
  - Updates all references across project
  - Preserves code integrity

## Best Practices

### When to Use JetBrains MCP over CLI Tools

**ALWAYS prefer JetBrains MCP for:**
1. **Code inspections** - `get_file_problems` instead of ESLint/TypeScript CLI
2. **File search** - `search_in_files_*` instead of grep/ripgrep
3. **File navigation** - `find_files_by_name_keyword` instead of find
4. **Code formatting** - `reformat_file` instead of prettier
5. **Running tests** - `execute_run_configuration` instead of npm test
6. **Symbol information** - `get_symbol_info` for understanding code

**Use CLI tools when:**
1. Specific CLI-only operations (npm install, git operations)
2. Continuous output monitoring needed
3. Background processes
4. Package manager specific commands

### Inspection Workflow

1. **Initial Assessment:**
   ```
   get_all_open_file_paths → understand context
   get_file_problems → check current file issues
   get_project_problems → overall project health
   ```

2. **Targeted Analysis:**
   ```
   search_in_files_by_text → find pattern occurrences
   get_symbol_info → understand symbol usage
   rename_refactoring → safe symbol renaming
   ```

3. **Fix Application:**
   ```
   replace_text_in_file → apply fixes
   reformat_file → ensure formatting
   get_file_problems → verify fixes
   ```

## PyCharm/WebStorm Inspection Levels

### Severity Levels
- **ERROR**: Compilation errors, syntax errors
- **WARNING**: Code quality issues, potential bugs
- **WEAK WARNING**: Style suggestions, minor improvements
- **INFO**: Informational messages

### Common PyCharm Inspections Not in TypeScript/ESLint
1. **Redundant code**: Unused variables, redundant type checks
2. **Code flow analysis**: Uninitialized variables, unreachable code
3. **Security**: HTTP vs HTTPS, SQL injection risks
4. **Performance**: Inefficient patterns, memory leaks
5. **Framework-specific**: React hooks rules, Angular patterns

## Integration Examples

### Example 1: Comprehensive File Inspection
```typescript
// Instead of:
npm run lint src/file.ts
npx tsc --noEmit src/file.ts

// Use:
mcp__jetbrains__get_file_problems('src/file.ts', false)
```

### Example 2: Project-wide Search
```typescript
// Instead of:
grep -r "pattern" src/
rg "pattern" --type ts

// Use:
mcp__jetbrains__search_in_files_by_text('pattern', 'src/', '*.ts')
```

### Example 3: Safe Refactoring
```typescript
// Instead of:
Manual find-and-replace across files

// Use:
mcp__jetbrains__rename_refactoring('src/file.ts', 'oldName', 'newName')
```

## Advantages Over CLI Tools

1. **Speed**: IntelliJ's indexed search is faster than grep
2. **Accuracy**: IDE understands code semantics, not just text
3. **Context**: Inspections use project configuration
4. **Safety**: Refactoring tools prevent breaking changes
5. **Integration**: Direct IDE feedback, no context switching

## Limitations

1. **File size**: Some operations truncate large outputs
2. **Timeout**: Terminal commands timeout after configurable period
3. **Scope**: Only works within project directory
4. **State**: Requires IDE to be running with MCP server

## Tool Availability Check

Always verify tool availability:
```typescript
// Check if JetBrains MCP is available
if (mcp__jetbrains__get_all_open_file_paths) {
  // Use JetBrains tools
} else {
  // Fallback to CLI tools
}
```

## Permanent Rules

1. **Inspection Priority**: Always use `get_file_problems` for code inspection before CLI linters
2. **Search Priority**: Use `search_in_files_*` before grep/ripgrep
3. **Refactoring**: Use `rename_refactoring` for any symbol renaming
4. **Formatting**: Use `reformat_file` to match project style
5. **Context Awareness**: Check `get_all_open_file_paths` to understand user's focus

## Troubleshooting

### Common Issues
1. **Tool not available**: Ensure WebStorm/IntelliJ is running with MCP server
2. **Timeout errors**: Increase timeout for long operations
3. **Path issues**: Use relative paths from project root
4. **Permission denied**: Check file permissions and IDE access

### Debugging Workflow
1. Check IDE connection: `mcp__jetbrains__get_all_open_file_paths`
2. Verify project root: `mcp__jetbrains__list_directory_tree`
3. Test simple operation: `mcp__jetbrains__get_project_modules`