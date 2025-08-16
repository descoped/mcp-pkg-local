# AST Parser Test Results

Generated: 2025-08-16T12:45:07.917Z

## Test Packages

- **vitest**: Testing framework (should have classes/functions)
- **typescript**: TypeScript compiler (large complex package)
- **zod**: Schema validation (TypeScript classes/interfaces)
- **@babel/types**: AST types (functional package)
- **chalk**: Terminal colors (simple package)
- **minimist**: Argument parser (minimal package)

## Files Generated

- `{package}-unified-output.md`: Full unified schema output
- `{package}-stats.json`: Processing statistics
- `SUMMARY.md`: This summary report

## How to Evaluate

1. Check each `*-unified-output.md` file for:
   - Proper markdown structure
   - Extracted classes with methods and properties
   - Function signatures with parameters and return types
   - Interface definitions
   - Export information

2. Review `*-stats.json` files for:
   - Processing performance
   - Component extraction counts
   - Content size metrics

3. Compare outputs against expected behavior from the original Python example in `ai_docs/venv-read-package.txt`
