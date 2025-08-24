/**
 * Platform detection and shell configuration
 */
import { platform } from 'node:os';
import { existsSync } from 'node:fs';
import type { ShellPlatform } from './types.js';

/**
 * Detect the current platform
 */
export function detectPlatform(): ShellPlatform {
  const p = platform();
  switch (p) {
    case 'win32':
      return 'win32';
    case 'darwin':
      return 'darwin';
    case 'linux':
      return 'linux';
    default:
      // Fallback to linux for unknown platforms
      return 'linux';
  }
}

/**
 * Get the default shell for the platform
 */
export function getDefaultShell(plat: ShellPlatform = detectPlatform()): string {
  switch (plat) {
    case 'win32':
      // Try PowerShell Core first, then Windows PowerShell, then cmd
      if (existsSync('C:\\Program Files\\PowerShell\\7\\pwsh.exe')) {
        return 'C:\\Program Files\\PowerShell\\7\\pwsh.exe';
      }
      if (existsSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe')) {
        return 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
      }
      return 'cmd.exe';

    case 'darwin':
      // Use bash for better compatibility with command execution
      if (existsSync('/bin/bash')) {
        return '/bin/bash';
      }
      if (existsSync('/bin/zsh')) {
        return '/bin/zsh';
      }
      return '/bin/sh';

    case 'linux':
      // Try bash first, then sh
      if (existsSync('/bin/bash')) {
        return '/bin/bash';
      }
      return '/bin/sh';

    default:
      return '/bin/sh';
  }
}

/**
 * Get shell-specific command completion markers
 */
export function getCommandMarkers(shell: string): {
  start: string;
  end: string;
  separator: string;
} {
  const isWindows = shell.includes('cmd') || shell.includes('powershell') || shell.includes('pwsh');

  if (isWindows) {
    return {
      start: '___CMD_START___',
      end: '___CMD_END___',
      separator: '&',
    };
  }

  return {
    start: '___CMD_START___',
    end: '___CMD_END___',
    separator: '&&',
  };
}
