# Python AST Parsing Strategy - Dual Parser Approach

**Status**: 🎯 APPROVED - Ready for Phase 3 Implementation  
**Date**: 2025-08-19  
**Decision**: Use BOTH tree-sitter-python AND Python's built-in ast module  
**Priority**: CRITICAL for Python feature parity

## Executive Summary

Implement a dual-parser approach for Python AST extraction, using tree-sitter-python for fast initial parsing and Python's built-in ast module for deep semantic analysis. This eliminates complex regex patterns and provides super-fast, accurate Python code analysis.

## Why Dual Parser Approach?

### tree-sitter-python (Fast Path)
- **Speed**: ~10ms for 100KB file (100x faster than Python ast)
- **Use Cases**: Quick structure extraction, syntax highlighting, navigation
- **No Python Required**: Pure C parser with Node.js bindings
- **Incremental**: Can parse partial files and updates

### Python ast Module (Deep Path)
- **Accuracy**: 100% Python-compliant parsing
- **Use Cases**: Type hints, decorators, docstrings, semantic analysis
- **Native**: Guaranteed compatibility with Python version
- **Rich Data**: Full AST with all Python language features

## Architecture Design

```typescript
// src/parsers/python-ast-parser.ts
export class PythonASTParser {
  private treeParser: TreeSitterParser;
  private shellRPC: ShellRPC; // For Python ast module
  
  constructor(shellRPC: ShellRPC) {
    this.treeParser = new TreeSitterParser();
    this.treeParser.setLanguage(Python);
    this.shellRPC = shellRPC;
  }
  
  // Fast path: tree-sitter for immediate structure
  async quickParse(content: string): Promise<QuickStructure> {
    const tree = this.treeParser.parse(content);
    return {
      classes: this.extractClassesTreeSitter(tree),
      functions: this.extractFunctionsTreeSitter(tree),
      imports: this.extractImportsTreeSitter(tree),
      parseTime: tree.parseTime // ~10ms
    };
  }
  
  // Deep path: Python ast for semantic analysis
  async deepParse(filePath: string): Promise<DeepStructure> {
    const astJson = await this.shellRPC.execute(`
      python -c "
import ast
import json
import sys

with open('${filePath}', 'r') as f:
    tree = ast.parse(f.read())
    
# Extract semantic information
classes = []
functions = []
type_hints = []

class Visitor(ast.NodeVisitor):
    def visit_ClassDef(self, node):
        classes.append({
            'name': node.name,
            'bases': [b.id for b in node.bases if hasattr(b, 'id')],
            'decorators': [d.id for d in node.decorator_list if hasattr(d, 'id')],
            'methods': [m.name for m in node.body if isinstance(m, ast.FunctionDef)],
            'docstring': ast.get_docstring(node)
        })
        self.generic_visit(node)
    
    def visit_FunctionDef(self, node):
        functions.append({
            'name': node.name,
            'args': [a.arg for a in node.args.args],
            'returns': ast.unparse(node.returns) if node.returns else None,
            'decorators': [ast.unparse(d) for d in node.decorator_list],
            'docstring': ast.get_docstring(node),
            'is_async': isinstance(node, ast.AsyncFunctionDef)
        })
        self.generic_visit(node)
    
    def visit_AnnAssign(self, node):
        if hasattr(node.target, 'id'):
            type_hints.append({
                'name': node.target.id,
                'type': ast.unparse(node.annotation)
            })
        self.generic_visit(node)

visitor = Visitor()
visitor.visit(tree)

print(json.dumps({
    'classes': classes,
    'functions': functions,
    'type_hints': type_hints
}))
      "
    `);
    
    return JSON.parse(astJson);
  }
  
  // Combined approach for optimal performance
  async parseFile(filePath: string, content: string): Promise<UnifiedPythonContent> {
    // Quick structure from tree-sitter (10ms)
    const quickStructure = await this.quickParse(content);
    
    // For large files (>50KB), also get deep semantics
    if (content.length > 50_000) {
      const deepStructure = await this.deepParse(filePath);
      return this.mergeStructures(quickStructure, deepStructure);
    }
    
    return quickStructure;
  }
}
```

## Performance Targets

| File Size | tree-sitter | Python ast | Combined | Token Reduction |
|-----------|------------|------------|----------|-----------------|
| 10KB | 2ms | 50ms | 2ms (tree-sitter only) | 90% |
| 50KB | 8ms | 200ms | 8ms (tree-sitter only) | 93% |
| 100KB | 15ms | 400ms | 415ms (both) | 95% |
| 500KB | 40ms | 2000ms | 2040ms (both) | 97% |

## Implementation Tasks for Phase 3

### Week 5: Parser Infrastructure
```bash
BAST-001: Install tree-sitter and tree-sitter-python (0.5 days)
BAST-002: Create PythonASTParser class (1 day)
BAST-003: Implement tree-sitter fast path (1 day)
BAST-004: Implement Python ast deep path via Shell-RPC (1 day)
BAST-005: Create structure merger logic (0.5 days)
```

### Week 6: Integration & Optimization
```bash
BAST-006: Integrate with PythonAdapter (1 day)
BAST-007: Add caching for parsed structures (0.5 days)
BAST-008: Performance benchmarking (0.5 days)
BAST-009: Token reduction validation (0.5 days)
BAST-010: Update tests for AST extraction (1 day)
```

## Python AST Script Template

```python
# bottles/scripts/python_ast_extractor.py
"""
High-performance Python AST extractor for mcp-pkg-local
Uses Python's built-in ast module for 100% accurate parsing
"""
import ast
import json
import sys
from typing import Dict, List, Any

class FastASTExtractor(ast.NodeVisitor):
    """Extract Python structure with minimal overhead"""
    
    def __init__(self):
        self.classes = []
        self.functions = []
        self.imports = []
        self.type_hints = {}
        
    def visit_ClassDef(self, node):
        """Extract class information"""
        class_info = {
            'name': node.name,
            'line': node.lineno,
            'decorators': [ast.unparse(d) for d in node.decorator_list],
            'bases': [ast.unparse(b) for b in node.bases],
            'methods': [],
            'docstring': ast.get_docstring(node)
        }
        
        # Extract method signatures only
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                class_info['methods'].append({
                    'name': item.name,
                    'signature': self.get_signature(item),
                    'is_async': isinstance(item, ast.AsyncFunctionDef)
                })
        
        self.classes.append(class_info)
        self.generic_visit(node)
    
    def visit_FunctionDef(self, node):
        """Extract function information"""
        # Skip methods (already in classes)
        if self.is_method(node):
            return self.generic_visit(node)
            
        func_info = {
            'name': node.name,
            'line': node.lineno,
            'signature': self.get_signature(node),
            'decorators': [ast.unparse(d) for d in node.decorator_list],
            'is_async': isinstance(node, ast.AsyncFunctionDef),
            'docstring': ast.get_docstring(node)
        }
        self.functions.append(func_info)
        self.generic_visit(node)
    
    def visit_Import(self, node):
        """Extract imports"""
        for alias in node.names:
            self.imports.append({
                'module': alias.name,
                'alias': alias.asname,
                'line': node.lineno
            })
        self.generic_visit(node)
    
    def visit_ImportFrom(self, node):
        """Extract from imports"""
        module = node.module or ''
        for alias in node.names:
            self.imports.append({
                'module': f"{module}.{alias.name}" if module else alias.name,
                'alias': alias.asname,
                'from': module,
                'line': node.lineno
            })
        self.generic_visit(node)
    
    def get_signature(self, node):
        """Extract function signature with type hints"""
        args = []
        for arg in node.args.args:
            arg_str = arg.arg
            if arg.annotation:
                arg_str += f": {ast.unparse(arg.annotation)}"
            args.append(arg_str)
        
        signature = f"({', '.join(args)})"
        if node.returns:
            signature += f" -> {ast.unparse(node.returns)}"
        
        return signature
    
    def is_method(self, node):
        """Check if function is a class method"""
        # Simple heuristic: has 'self' or 'cls' as first arg
        if node.args.args:
            first_arg = node.args.args[0].arg
            return first_arg in ('self', 'cls')
        return False

def extract_ast(file_path: str) -> Dict[str, Any]:
    """Main extraction function"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    try:
        tree = ast.parse(content)
        extractor = FastASTExtractor()
        extractor.visit(tree)
        
        return {
            'success': True,
            'classes': extractor.classes,
            'functions': extractor.functions,
            'imports': extractor.imports,
            'type_hints': extractor.type_hints,
            'metrics': {
                'class_count': len(extractor.classes),
                'function_count': len(extractor.functions),
                'import_count': len(extractor.imports)
            }
        }
    except SyntaxError as e:
        return {
            'success': False,
            'error': str(e),
            'line': e.lineno
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No file path provided'}))
        sys.exit(1)
    
    result = extract_ast(sys.argv[1])
    print(json.dumps(result, indent=2))
```

## Dependencies to Add

```json
// package.json additions
{
  "dependencies": {
    "tree-sitter": "^0.20.6",
    "tree-sitter-python": "^0.20.4"
  }
}
```

## Success Metrics

### Performance
- [ ] tree-sitter parses 100KB Python file in <20ms
- [ ] Python ast provides full semantic analysis in <500ms
- [ ] Combined approach achieves 95%+ token reduction
- [ ] No regex used for Python parsing

### Accuracy
- [ ] 100% accurate Python syntax parsing
- [ ] Full type hint extraction
- [ ] Complete decorator analysis
- [ ] Docstring preservation

### Integration
- [ ] Seamless fallback between parsers
- [ ] Cached parsing results
- [ ] Works with all Python versions (3.9+)
- [ ] Cross-platform support (Windows, Linux, macOS)

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| tree-sitter version compatibility | Pin specific versions, test thoroughly |
| Python ast performance on huge files | Set size threshold, use tree-sitter only for >1MB |
| Shell-RPC overhead for Python ast | Cache results, batch operations |
| Different Python versions | Use sys.version_info to adapt parsing |

## Conclusion

The dual-parser approach provides the best of both worlds:
- **Lightning-fast** structure extraction with tree-sitter (10ms)
- **Deep semantic** analysis with Python's ast module when needed
- **No complex regex** - using specialized tools designed for the job
- **Future-proof** - can extend to other languages with tree-sitter

This strategy ensures Python achieves full feature parity with Node.js, providing 95%+ token reduction while maintaining 100% parsing accuracy.