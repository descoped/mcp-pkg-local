# Shell-RPC Implementation Guide

## Overview

Shell-RPC (Remote Procedure Call via Shell) is a robust system for managing persistent shell processes, enabling stateful command execution with proper error handling, timeouts, and cross-platform support.

## Architecture

### Core Components

```
┌──────────────────────────────────────────────┐
│                 ShellRPC                      │
│                                                │
│  ┌──────────────┐  ┌────────────────────┐    │
│  │   Command    │  │    Process         │    │
│  │    Queue     │  │    Manager         │    │
│  └──────┬───────┘  └──────┬─────────────┘    │
│         │                  │                   │
│  ┌──────▼──────────────────▼─────────────┐   │
│  │         Shell Process (pty/spawn)      │   │
│  │    ┌─────────────────────────────┐     │   │
│  │    │  bash/zsh/powershell/cmd   │     │   │
│  │    └─────────────────────────────┘     │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### Key Classes

#### ShellRPC (`src/bottles/shell-rpc/index.ts`)

Main class managing the shell lifecycle:

```typescript
export class ShellRPC {
  private readonly id: string;
  private shell: ShellProcess | null = null;
  private outputBuffer = '';
  private commandQueue: CommandQueue;
  private processManager: ProcessManager;
  
  constructor(options: ShellOptions = {}) {
    this.id = options.id ?? randomUUID();
    this.commandQueue = new CommandQueue();
    this.processManager = new ProcessManager();
  }
  
  async initialize(): Promise<void>;
  async execute(command: string, timeout?: number): Promise<CommandResult>;
  async sendSignal(signal: SupportedSignal): Promise<SignalResult>;
  async cleanup(): Promise<void>;
}
```

#### ProcessManager (`src/bottles/shell-rpc/process-manager.ts`)

Handles process creation with fallback mechanisms:

```typescript
export class ProcessManager {
  async createShell(options: ShellOptions): Promise<ShellProcess> {
    // Try node-pty first (better terminal emulation)
    if (options.preferPty !== false) {
      try {
        return await this.createPtyProcess(options);
      } catch (error) {
        // Fall back to child_process
      }
    }
    
    // Use child_process spawn
    return this.createSpawnProcess(options);
  }
}
```

#### CommandQueue (`src/bottles/shell-rpc/command-queue.ts`)

Ensures sequential command execution:

```typescript
export class CommandQueue {
  private queue: QueuedCommand[] = [];
  private processing = false;
  
  async add(command: Command): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ command, resolve, reject });
      this.processNext();
    });
  }
}
```

## Implementation Details

### Command Execution Flow

1. **Command Submission**
   ```typescript
   const result = await shellRPC.execute('pip install requests');
   ```

2. **Queue Processing**
   - Command added to queue
   - If not processing, start processing
   - Commands execute sequentially

3. **Marker Injection**
   ```typescript
   // Markers help identify command boundaries
   const START_MARKER = `___CMD_START___`;
   const END_MARKER = `___CMD_END_${timestamp}___`;
   
   const wrappedCommand = `echo "${START_MARKER}" && ${command} && echo "${END_MARKER}"`;
   ```

4. **Output Collection**
   ```typescript
   shell.on('data', (data: string) => {
     outputBuffer += data;
     
     // Check for completion markers
     if (outputBuffer.includes(END_MARKER)) {
       // Command complete, extract output
       const output = extractBetweenMarkers(outputBuffer);
       resolve({ stdout: output, stderr: '', exitCode: 0 });
     }
   });
   ```

5. **Enhanced Timeout Integration**
   ```typescript
   // Uses EnhancedTimeoutIntegration for resilient timeout
   const timeoutIntegration = new EnhancedTimeoutIntegration();
   timeoutIntegration.start(command);
   
   // Process output through timeout system
   timeoutIntegration.processOutput(data);
   
   // Handle timeout events
   timeoutIntegration.on('timeout', (reason) => {
     shell.write('\x03');  // Send SIGINT
     reject(new ShellRPCError('Command timed out', 'TIMEOUT'));
   });
   ```

### Platform Support

#### Unix-like Systems (macOS, Linux)

```typescript
// Default shell selection
const shells = ['/bin/bash', '/usr/bin/bash', '/bin/zsh', '/bin/sh'];
const defaultShell = shells.find(existsSync) || '/bin/sh';

// Environment setup
const env = {
  ...process.env,
  TERM: 'xterm-256color',
  NO_COLOR: '1',       // Optional: disable colors
  DEBIAN_FRONTEND: 'noninteractive',  // Non-interactive apt
};
```

#### Windows

```typescript
// PowerShell preferred over cmd
const shells = [
  'powershell.exe',      // PowerShell Core
  'pwsh.exe',            // PowerShell 7+
  'cmd.exe',             // Fallback
];

// Windows-specific handling
if (platform === 'win32') {
  // Use different line endings
  const EOL = '\r\n';
  // Different signal handling (no SIGINT)
  const interrupt = '\x03';  // Ctrl+C
}
```

### Environment Management

#### Inherited Environment (Default)

```typescript
const shellRPC = new ShellRPC({
  env: {
    ...process.env,
    CUSTOM_VAR: 'value',
  },
});
```

#### Clean Environment Mode

```typescript
const shellRPC = new ShellRPC({
  cleanEnv: true,
  preservePaths: [],  // Minimal PATH auto-created
});

// Results in minimal environment with intelligent PATH construction
```

### Error Handling

#### Error Types

```typescript
export class ShellRPCError extends Error {
  constructor(
    message: string,
    public readonly code: ShellRPCErrorCode,
    public readonly details?: string,
  ) {
    super(message);
    this.name = 'ShellRPCError';
  }
}

type ShellRPCErrorCode = 
  | 'INIT_FAILED'      // Shell initialization failed
  | 'TIMEOUT'          // Command timed out
  | 'SHELL_DIED'       // Shell process died unexpectedly
  | 'SIGNAL_FAILED'    // Failed to send signal
  | 'NOT_INITIALIZED'; // Shell not initialized
```

#### Recovery Mechanisms

```typescript
// Automatic shell restart on death
shell.on('exit', (code) => {
  if (this.isAlive && !this.isCleaningUp) {
    console.error(`Shell died unexpectedly with code ${code}`);
    // Cleanup and notify
    this.cleanup();
  }
});

// Command retry with backoff (use test utilities)
import { retryWithBackoff } from '#bottles/integration/common/test-utils';

const result = await retryWithBackoff(
  () => shell.execute(command),
  3,     // max retries (5 in CI)
  1000   // base delay (2000ms in CI)
);
```

### Signal Support

#### Supported Signals

```typescript
type SupportedSignal = 'SIGINT' | 'SIGTERM' | 'SIGKILL';

async sendSignal(signal: SupportedSignal): Promise<SignalResult> {
  switch (signal) {
    case 'SIGINT':
      // Interrupt current command
      this.shell.write('\x03');  // Ctrl+C
      break;
      
    case 'SIGTERM':
      // Graceful termination
      this.shell.kill('SIGTERM');
      break;
      
    case 'SIGKILL':
      // Force kill
      this.shell.kill('SIGKILL');
      break;
  }
}
```

## Usage Patterns

### Basic Usage

```typescript
import { ShellRPC } from '#bottles/shell-rpc';

const shell = new ShellRPC({
  cwd: '/project/dir',
  defaultTimeout: 30000,
});

await shell.initialize();

try {
  const result = await shell.execute('npm install');
  console.log(result.stdout);
} finally {
  await shell.cleanup();
}
```

### Long-Running Commands

```typescript
// Execute with custom timeout
const result = await shell.execute(
  'npm run build',
  60000  // 60 second timeout
);

// Or handle timeout explicitly
try {
  const result = await shell.execute('long-command', 5000);
} catch (error) {
  if (error.code === 'TIMEOUT') {
    // Handle timeout
    await shell.sendSignal('SIGINT');
  }
}
```

### Virtual Environment Activation

```typescript
// Python virtual environment
await shell.execute('python -m venv .venv');
await shell.execute('source .venv/bin/activate');  // Unix
// or
await shell.execute('.venv\\Scripts\\activate');   // Windows

// Now pip commands use the virtual environment
await shell.execute('pip install requests');
```

### Shell Pool for Concurrent Operations

```typescript
import { ShellRPCPool } from '#bottles/shell-rpc/pool';

const pool = ShellRPCPool.getInstance();

// Acquire shells for parallel operations
const shell1 = await pool.acquire('task1');
const shell2 = await pool.acquire('task2');

// Use shells concurrently
await Promise.all([
  shell1.execute('command1'),
  shell2.execute('command2'),
]);

// Release back to pool
pool.release('task1');
pool.release('task2');
```

## Performance Optimization

### Shell Reuse

```typescript
// ❌ Inefficient: New shell for each command
for (const pkg of packages) {
  const shell = new ShellRPC();
  await shell.initialize();
  await shell.execute(`pip install ${pkg}`);
  await shell.cleanup();
}

// ✅ Efficient: Reuse shell
const shell = new ShellRPC();
await shell.initialize();
for (const pkg of packages) {
  await shell.execute(`pip install ${pkg}`);
}
await shell.cleanup();
```

### Command Batching

```typescript
// ❌ Multiple round trips
await shell.execute('cd project');
await shell.execute('npm install');
await shell.execute('npm run build');

// ✅ Single command
await shell.execute('cd project && npm install && npm run build');
```

## Testing

### Integration Testing

```typescript
import { ShellRPC } from '#bottles/shell-rpc';
import { createTestEnvironment } from '#bottles/integration/common/test-utils';

describe('Shell-RPC Integration', () => {
  let env: TestEnvironment;
  
  beforeEach(async () => {
    env = await createTestEnvironment('shell-test');
  });
  
  afterEach(async () => {
    await env.cleanup();
  });
  
  it('should execute commands', async () => {
    const result = await env.shellRPC.execute('echo "test"');
    expect(result.stdout).toContain('test');
  });
});
```

## Debugging

### Debug Environment Variables

```bash
# Enable debug logging
DEBUG_SHELL_RPC=1 npm test

# Debug timeouts specifically
DEBUG_TIMEOUT=1 npm test

# Debug bottles operations
DEBUG_BOTTLES=1 npm test
```

### Common Issues and Solutions

#### Issue: Commands Hang

**Cause**: Interactive prompt waiting for input

**Solution**: Disable interactive mode
```typescript
// Add non-interactive flags
await shell.execute('apt-get install -y package');  // -y flag
await shell.execute('npm install --yes');           // --yes flag
```

#### Issue: Shell Dies Unexpectedly

**Cause**: Out of memory or killed by system

**Solution**: Monitor shell health
```typescript
const shell = new ShellRPC();
await shell.initialize();

// Check if shell is still alive before commands
if (!shell.isAlive) {
  await shell.initialize();
}
```

#### Issue: Markers in Output

**Cause**: Command output contains marker strings

**Solution**: Use unique markers with timestamps
```typescript
const marker = `___CMD_END_${Date.now()}_${randomUUID()}___`;
```

## Security Considerations

### Command Injection Prevention

```typescript
// ❌ Vulnerable to injection
const pkg = getUserInput();
await shell.execute(`pip install ${pkg}`);

// ✅ Safe with validation
const pkg = getUserInput();
// Basic sanitization (prefer whitelisting)
const safe = pkg.replace(/[^a-zA-Z0-9._-]/g, '');
await shell.execute(`pip install ${safe}`);
```

### Environment Variable Sanitization

```typescript
// Remove sensitive variables
const cleanEnv = Object.entries(process.env)
  .filter(([key]) => !key.match(/SECRET|TOKEN|PASSWORD|KEY/i))
  .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

const shell = new ShellRPC({ env: cleanEnv });
```

## Advanced Features

### Enhanced Timeout System

The Shell-RPC integrates with a sophisticated two-stage timeout system:

```typescript
// Automatic timeout configuration based on command
const config = autoDetectTimeoutConfig(command);

// Custom timeout configuration
const customConfig: TimeoutConfig = {
  baseTimeout: 30000,
  activityExtension: 5000,
  graceTimeout: 10000,
  absoluteMaximum: 300000,
  progressPatterns: [/Downloading/, /Installing/],
  errorPatterns: [/ERROR:/, /FATAL:/],
};
```

### Command Classification

Commands are automatically classified for appropriate timeout handling:

```typescript
// Package installation - longer timeout with progress tracking
if (command.includes('install')) {
  config.baseTimeout = 60000;
  config.progressPatterns.push(/Installing .+/);
}

// Quick queries - shorter timeout
if (command.includes('--version')) {
  config.baseTimeout = 5000;
}
```

## Performance Benchmarks

### Startup Time

```
Shell spawn (first time):     150-200ms
Shell spawn (cached):          50-100ms
node-pty initialization:       100-150ms
child_process spawn:           50-80ms
```

### Command Execution

```
Simple echo command:           5-10ms
Package manager command:       100-500ms
Build command:                 1-30s
```

### Memory Usage

```
Idle shell process:            5-10MB
Active command:                10-50MB
Large output buffer:           50-200MB
```

## Conclusion

Shell-RPC provides a robust, performant foundation for executing shell commands in a controlled, persistent environment. Its cross-platform support, enhanced timeout system, and comprehensive error handling make it suitable for production use in package management and build automation scenarios.