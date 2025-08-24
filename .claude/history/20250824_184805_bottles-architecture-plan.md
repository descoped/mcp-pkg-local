# Bottles Architecture Plan: Self-Contained Testing Environments

**Status**: 📝 PLANNING  
**Date**: 2025-08-16  
**Priority**: High - Critical for autonomous development and authly test decommissioning  

## Executive Summary

Replace external authly dependency with self-contained "bottles" - minimal, realistic project examples that simulate real-world package environments. This enables autonomous testing, development, and validation of mcp-pkg-local across diverse language/framework combinations without external dependencies.

## The Problem: Authly Dependency

### Current State
- **authly test**: Provides real Python venv with 50+ packages for integration testing
- **Critical value**: Validates Python scanner, adapter, and MCP tool functionality
- **Dependency risk**: External project, not under our control, breaks autonomous development
- **Limitation**: Only covers Python OAuth/FastAPI stack

### Target State
- **Self-contained bottles**: Multiple minimal projects covering diverse scenarios
- **Autonomous testing**: No external dependencies for comprehensive validation
- **Comprehensive coverage**: Python, Node.js, and future language support
- **Real-world accuracy**: Authentic package environments and dependency patterns

## Bottles Concept Design

### What is a Bottle?
A **bottle** is a minimal, self-contained project that:
- **Simulates real-world scenarios** with authentic package dependencies
- **Provides controlled environment** for testing scanners and adapters
- **Maintains realistic complexity** without unnecessary bloat
- **Covers specific use cases** (web frameworks, CLI tools, data science, etc.)

### Bottle Architecture
```
bottles/
├── python-web/           # FastAPI/Django web application
├── python-data/          # Data science stack (pandas, numpy, jupyter)
├── python-cli/           # CLI tool with rich dependencies
├── node-web/             # Express/React web application  
├── node-cli/             # Node.js CLI tool with TypeScript
├── node-fullstack/       # Full-stack with frontend and backend
└── template/             # Template for new bottles
```

## Phase 1: Python Bottles (Immediate - Replace Authly)

### Bottle 1: python-web
**Purpose**: Replace authly test with FastAPI web application
**Key packages**: FastAPI, Pydantic, SQLAlchemy, pytest, uvicorn
**Scenario**: OAuth-like web service (simplified from authly)
```
bottles/python-web/
├── pyproject.toml        # Poetry/uv configuration
├── requirements.txt      # pip fallback
├── src/
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── models.py         # Pydantic models
│   └── auth.py           # Simple auth logic
├── tests/
│   ├── test_auth.py
│   └── test_models.py
└── .venv/                # Virtual environment (gitignored, created by setup)
```

### Bottle 2: python-data
**Purpose**: Data science workflow simulation
**Key packages**: pandas, numpy, matplotlib, jupyter, scikit-learn
**Scenario**: Data analysis pipeline
```
bottles/python-data/
├── pyproject.toml
├── notebooks/
│   └── analysis.ipynb
├── src/
│   ├── data_loader.py
│   └── analyzer.py
└── requirements.txt
```

### Bottle 3: python-cli
**Purpose**: Command-line tool with rich dependencies
**Key packages**: click, rich, typer, requests, PyYAML
**Scenario**: DevOps automation tool
```
bottles/python-cli/
├── pyproject.toml
├── src/
│   ├── cli.py
│   └── commands/
└── requirements.txt
```

## Phase 2: Node.js Bottles (High Priority)

### Bottle 4: node-web
**Purpose**: Modern web application
**Key packages**: Express, TypeScript, Zod, Prisma, React
**Scenario**: Full-stack web application
```
bottles/node-web/
├── package.json
├── src/
│   ├── server/
│   └── client/
├── prisma/
└── node_modules/         # npm/pnpm/yarn installation
```

### Bottle 5: node-cli
**Purpose**: TypeScript CLI tool
**Key packages**: Commander.js, Inquirer, Chalk, Axios
**Scenario**: Build/deployment tool
```
bottles/node-cli/
├── package.json
├── src/
│   ├── index.ts
│   └── commands/
└── tsconfig.json
```

### Bottle 6: node-fullstack
**Purpose**: Complex dependency graph
**Key packages**: Next.js, Prisma, tRPC, TailwindCSS, Jest
**Scenario**: Modern full-stack application
```
bottles/node-fullstack/
├── package.json
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Express API
├── packages/
│   └── shared/           # Shared utilities
└── turbo.json            # Monorepo configuration
```

## Phase 3: Bottle Management System

### Bottle Lifecycle
1. **Setup**: `npm run bottles:setup` - Initialize all bottle environments
2. **Update**: `npm run bottles:update` - Update package versions
3. **Clean**: `npm run bottles:clean` - Remove all bottle environments
4. **Validate**: `npm run bottles:validate` - Test all bottles work correctly

### Bottle Scripts
```typescript
// scripts/bottles.ts
interface Bottle {
  name: string;
  language: 'python' | 'javascript';
  packageManager: 'pip' | 'poetry' | 'uv' | 'npm' | 'pnpm' | 'yarn';
  setupCommand: string;
  validateCommand: string;
}

const bottles: Bottle[] = [
  {
    name: 'python-web',
    language: 'python',
    packageManager: 'uv',
    setupCommand: 'uv venv && uv pip install -r requirements.txt',
    validateCommand: 'python -m pytest tests/'
  },
  // ... other bottles
];
```

## Phase 4: Test Integration

### Replace Authly Test
```typescript
// tests/integration/bottles.test.ts
describe('Bottle Integration Tests', () => {
  test('python-web bottle scan-packages', async () => {
    const result = await scanPackages('bottles/python-web');
    expect(result.packages['fastapi']).toBeDefined();
    expect(result.packages['pydantic']).toBeDefined();
    expect(result.environment.type).toBe('venv');
  });

  test('python-web bottle read-package', async () => {
    const result = await readPackage('fastapi', 'bottles/python-web');
    expect(result.success).toBe(true);
    expect(result.content).toContain('FastAPI');
  });
});
```

### Comprehensive Coverage
- **All package managers**: pip, poetry, uv, npm, pnpm, yarn, bun
- **All project structures**: Simple, monorepo, workspace, virtual env
- **All scenarios**: Web, CLI, data science, full-stack, mobile
- **All complexities**: Simple (5 packages) to complex (100+ packages)

## Implementation Strategy

### Step 1: Create Python-Web Bottle (Week 1)
1. Create `bottles/python-web/` with FastAPI setup
2. Mirror authly's key dependencies without OAuth complexity
3. Add setup scripts for environment creation
4. Write integration tests targeting this bottle

### Step 2: Migrate Authly Tests (Week 1)
1. Update `tests/integration/authly.test.ts` to use python-web bottle
2. Ensure all existing test scenarios still pass
3. Remove authly dependency from test configuration
4. Validate Python scanner works identically

### Step 3: Add Node.js Bottles (Week 2)
1. Create node-web and node-cli bottles
2. Test Node.js scanner and adapter with bottles
3. Validate TypeScript parsing and content extraction
4. Ensure parity with Python capabilities

### Step 4: Bottle Management (Week 2)
1. Implement bottle setup/cleanup scripts
2. Add CI/CD integration for bottle validation
3. Document bottle creation guidelines
4. Create bottle template for future additions

## Expected Benefits

### Autonomous Development
- **No external dependencies** for comprehensive testing
- **Controlled environments** that we fully manage
- **Reproducible testing** across different machines/CI
- **Version control** of test environments

### Comprehensive Coverage
- **Multiple languages** and package managers covered
- **Diverse scenarios** from simple CLI to complex full-stack
- **Real-world patterns** without external project coupling
- **Edge case testing** with controlled package combinations

### Development Velocity
- **Fast iteration** on scanner and adapter improvements
- **Immediate validation** of changes across scenarios
- **Clear regression detection** when changes break bottles
- **Easy scenario addition** for new language support

## Success Metrics

### Short-term (Replace Authly)
- ✅ Python-web bottle provides same test coverage as authly
- ✅ All existing authly tests pass with python-web bottle
- ✅ Python scanner extracts packages correctly from bottle
- ✅ Python adapter generates proper summaries from bottle

### Medium-term (Full Coverage)
- ✅ 6 bottles covering Python and Node.js scenarios
- ✅ 100% test coverage replacement (no external dependencies)
- ✅ All package managers supported and tested
- ✅ CI/CD runs all bottle validations automatically

### Long-term (Extensibility)
- ✅ New languages added through bottle pattern
- ✅ Complex scenarios (monorepos, workspaces) supported
- ✅ Real-world dependency patterns accurately simulated
- ✅ Community contributions through bottle templates

## Decommissioning Authly Test

### Migration Checklist
- [ ] Create python-web bottle with equivalent packages
- [ ] Migrate all authly test scenarios to python-web
- [ ] Validate identical behavior and coverage
- [ ] Remove authly references from codebase
- [ ] Update documentation to reference bottles
- [ ] Archive authly integration as reference

### Risk Mitigation
- **Gradual migration**: Keep authly tests until bottles proven equivalent
- **Feature parity**: Ensure bottles provide same or better coverage
- **Performance validation**: Verify bottles don't slow down testing
- **Documentation**: Clear migration guide for future developers

## Conclusion

The bottles architecture transforms mcp-pkg-local from a project dependent on external test environments into a fully autonomous, comprehensive testing framework. This strategic move enables:

1. **Independence**: No external project dependencies
2. **Completeness**: Coverage of all major language/framework combinations
3. **Control**: Full management of test scenarios and environments
4. **Scalability**: Easy addition of new languages and scenarios
5. **Reliability**: Consistent, reproducible testing across all environments

This foundation positions mcp-pkg-local for long-term success as a comprehensive, language-agnostic package analysis tool.