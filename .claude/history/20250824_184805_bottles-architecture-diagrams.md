# Bottles Architecture Diagrams - Consolidated View

**Status**: Reference Document  
**Updated**: 2025-08-19  
**Purpose**: Central location for all bottles architecture diagrams

## 1. Overall Bottle System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Bottle System Architecture              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐    ┌─────────────┐ │
│  │ Bottle       │────▶│ Shell-RPC    │───▶│ Package     │ │
│  │ Manager      │     │ Engine       │    │ Managers    │ │
│  └──────────────┘     └──────────────┘    └─────────────┘ │
│         │                     │                    │        │
│         ▼                     ▼                    ▼        │
│  ┌──────────────┐     ┌──────────────┐    ┌─────────────┐ │
│  │ Volume       │     │ Process      │    │ pip         │ │
│  │ Controller   │     │ Manager      │    │ poetry      │ │
│  └──────────────┘     └──────────────┘    │ uv          │ │
│         │                     │            │ pipenv      │ │
│         ▼                     ▼            └─────────────┘ │
│  ┌──────────────┐     ┌──────────────┐                    │
│  │ Cache        │     │ Output       │                    │
│  │ Storage      │     │ Stream       │                    │
│  └──────────────┘     └──────────────┘                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                  Scanner Integration                 │  │
│  │  ┌─────────────┐        ┌─────────────┐            │  │
│  │  │ Python      │───────▶│ Bottle      │            │  │
│  │  │ Scanner     │        │ Adapter     │            │  │
│  │  └─────────────┘        └─────────────┘            │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Python AST Dual Parser Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Python AST Processing Flow                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    Python Source File                        │
│                         (100KB)                              │
│                            │                                 │
│               ┌────────────┴────────────┐                   │
│               │                         │                   │
│         Fast Path                 Deep Path                 │
│          (<50KB)                  (>50KB)                   │
│               │                         │                   │
│               ▼                         ▼                   │
│     ┌──────────────────┐      ┌──────────────────┐        │
│     │   tree-sitter    │      │   Python ast     │        │
│     │     (~10ms)      │      │    (~400ms)      │        │
│     │                  │      │                  │        │
│     │ - Functions      │      │ - Type hints     │        │
│     │ - Classes        │      │ - Decorators     │        │
│     │ - Imports        │      │ - Docstrings     │        │
│     │ - Structure      │      │ - Semantics      │        │
│     └──────────────────┘      └──────────────────┘        │
│               │                         │                   │
│               └────────────┬────────────┘                   │
│                            │                                │
│                            ▼                                │
│                 ┌──────────────────┐                       │
│                 │  Merge & Cache   │                       │
│                 │   Structures     │                       │
│                 └──────────────────┘                       │
│                            │                                │
│                            ▼                                │
│                 ┌──────────────────┐                       │
│                 │ Unified Content  │                       │
│                 │  95% Token       │                       │
│                 │  Reduction       │                       │
│                 └──────────────────┘                       │
└──────────────────────────────────────────────────────────────┘
```

## 3. Shell-RPC Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Shell-RPC Engine                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   TypeScript                     Shell Process              │
│   ┌────────────┐               ┌──────────────┐           │
│   │            │   stdin       │              │           │
│   │  Bottle    │──────────────▶│   Python/    │           │
│   │  Manager   │               │   Bash/      │           │
│   │            │◀──────────────│   PowerShell │           │
│   └────────────┘   stdout      └──────────────┘           │
│        │                              │                    │
│        │                              │                    │
│        ▼                              ▼                    │
│   ┌────────────┐               ┌──────────────┐           │
│   │ Command    │               │   Package    │           │
│   │ Queue      │               │   Manager    │           │
│   └────────────┘               │   (pip, uv)  │           │
│                                └──────────────┘           │
│                                                             │
│   Features:                                                 │
│   - Persistent shell sessions                               │
│   - Command timeout handling                                │
│   - Cross-platform support                                  │
│   - Error stream capture                                    │
│   - Environment isolation                                   │
└─────────────────────────────────────────────────────────────┘
```

## 4. Cache Volume Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Cache Volume Management                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   .pkg-local-cache/                                        │
│   ├── bottles/                                             │
│   │   ├── pip/                                             │
│   │   │   ├── cache/          (pip cache directory)        │
│   │   │   ├── site-packages/  (installed packages)         │
│   │   │   └── bottle.lock     (version lock file)          │
│   │   │                                                    │
│   │   ├── poetry/                                          │
│   │   │   ├── cache/          (poetry cache)               │
│   │   │   ├── virtualenvs/    (poetry venvs)               │
│   │   │   └── bottle.lock                                  │
│   │   │                                                    │
│   │   ├── uv/                                              │
│   │   │   ├── cache/          (uv cache - Rust speed!)     │
│   │   │   ├── .venv/          (virtual environment)        │
│   │   │   └── bottle.lock                                  │
│   │   │                                                    │
│   │   └── pipenv/                                          │
│   │       ├── cache/                                       │
│   │       ├── .venv/                                       │
│   │       └── Pipfile.lock                                 │
│   │                                                        │
│   └── metadata.db            (SQLite bottle metadata)      │
│                                                             │
│   CI/CD Integration:                                        │
│   - GitHub Actions cache key: ${{ hashFiles('*.lock') }}   │
│   - 10x performance improvement                             │
│   - 5GB max per bottle type                                │
└─────────────────────────────────────────────────────────────┘
```

## 5. Implementation Phases Timeline

```
Week 1-2: Core Infrastructure
┌────────────────────────────────────────────────────────────┐
│  Shell-RPC  │  Volume     │  Bottle     │                 │
│  Engine     │  Controller │  Manager    │                 │
│  (3 days)   │  (3 days)   │  (4 days)   │                 │
└────────────────────────────────────────────────────────────┘

Week 3-4: Python Package Managers  
┌────────────────────────────────────────────────────────────┐
│    pip      │     uv      │   poetry    │    pipenv      │
│  Adapter    │   Adapter   │   Adapter   │    Adapter     │
│  (2 days)   │  (2 days)   │  (2 days)   │   (2 days)     │
└────────────────────────────────────────────────────────────┘

Week 5-6: Feature Parity & Integration
┌────────────────────────────────────────────────────────────┐
│  Python AST │  Scanner    │    Test     │   Performance  │
│  Parser     │  Integration│  Migration  │   Validation   │
│  (5 days)   │  (3 days)   │  (2 days)   │   (2 days)     │
└────────────────────────────────────────────────────────────┘
```

## 6. Data Flow Sequence

```
User Request → scan-packages
        │
        ▼
┌──────────────┐
│   Scanner    │
│   Factory    │
└──────────────┘
        │
        ▼
┌──────────────┐     ┌──────────────┐
│   Python     │────▶│   Bottle     │
│   Scanner    │     │   Adapter    │
└──────────────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Bottle     │
                    │   Manager    │
                    └──────────────┘
                            │
                     ┌──────┴──────┐
                     ▼             ▼
              ┌──────────┐  ┌──────────┐
              │  Shell-   │  │  Volume  │
              │   RPC     │  │Controller│
              └──────────┘  └──────────┘
                     │             │
                     ▼             ▼
              ┌──────────┐  ┌──────────┐
              │  Package │  │  Cache   │
              │  Manager │  │  Storage │
              └──────────┘  └──────────┘
                     │
                     ▼
              ┌──────────┐
              │  Python  │
              │Packages  │
              │(100+)    │
              └──────────┘
                     │
                     ▼
              ┌──────────┐
              │   AST    │
              │  Parser  │
              └──────────┘
                     │
                     ▼
              Return to User
              (95% tokens reduced)
```

## 7. Component Responsibilities

| Component | Responsibility | Owner |
|-----------|---------------|-------|
| **Bottle Manager** | Lifecycle, configuration | bottles-architect |
| **Shell-RPC Engine** | Process management, I/O | system-developer |
| **Volume Controller** | Cache, persistence | bottles-architect |
| **Package Adapters** | pip, uv, poetry, pipenv | scanner-engineer |
| **Python AST Parser** | Dual parsing strategy | token-optimizer |
| **Scanner Integration** | Bottle-scanner bridge | scanner-engineer |

## Summary

The bottles architecture provides:
1. **Isolated test environments** via Shell-RPC
2. **Native package manager** execution (no reimplementation)
3. **Persistent caching** for 10x CI/CD improvement
4. **Dual AST parsing** for 95% token reduction
5. **Cross-platform support** (Windows, Linux, macOS)

All diagrams show the flow from user request through bottles to AST-optimized output, achieving Python feature parity with Node.js support.