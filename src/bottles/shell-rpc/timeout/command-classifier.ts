/**
 * Command Classifier for Intelligent Timeout Configuration
 *
 * This module analyzes commands to determine the most appropriate
 * timeout configuration based on command type, package manager,
 * and operation complexity.
 */
import type { TimeoutConfig } from './types.js';
import {
  createPipInstallTimeout,
  createPipUninstallTimeout,
  createUvTimeout,
  createNpmTimeout,
  createMavenTimeout,
  createQuickCommandTimeout,
  createGenericTimeout,
} from './index.js';

/**
 * Command classification categories
 */
export enum CommandCategory {
  // Package manager operations
  PACKAGE_INSTALL = 'package_install',
  PACKAGE_UNINSTALL = 'package_uninstall',
  PACKAGE_LIST = 'package_list',
  PACKAGE_SYNC = 'package_sync',
  PACKAGE_BUILD = 'package_build',

  // Environment operations
  ENV_CREATE = 'env_create',
  ENV_SET = 'env_set',

  // Quick operations
  VERSION_CHECK = 'version_check',
  NAVIGATION = 'navigation',
  QUICK_COMMAND = 'quick_command',

  // Generic
  UNKNOWN = 'unknown',
}

/**
 * Command pattern definitions
 */
const COMMAND_PATTERNS = {
  // Python - pip
  PIP_INSTALL: /^\s*(pip|pip3|python\s+-m\s+pip)\s+(install|add)/i,
  PIP_UNINSTALL: /^\s*(pip|pip3|python\s+-m\s+pip)\s+(uninstall|remove)/i,
  PIP_LIST: /^\s*(pip|pip3|python\s+-m\s+pip)\s+(list|freeze|show)/i,
  PIP_UPGRADE: /^\s*(pip|pip3|python\s+-m\s+pip)\s+install\s+--upgrade/i,
  PIP_COMPILE: /^\s*pip-compile/i,

  // Python - uv
  UV_ADD: /^\s*uv\s+(add|pip\s+install)/i,
  UV_REMOVE: /^\s*uv\s+(remove|pip\s+uninstall)/i,
  UV_SYNC: /^\s*uv\s+(sync|lock)/i,
  UV_LIST: /^\s*uv\s+(pip\s+)?list/i,
  UV_VENV: /^\s*uv\s+venv/i,

  // Python - poetry
  POETRY_ADD: /^\s*poetry\s+(add|install)/i,
  POETRY_REMOVE: /^\s*poetry\s+remove/i,
  POETRY_LOCK: /^\s*poetry\s+lock/i,

  // Python - pipenv
  PIPENV_INSTALL: /^\s*pipenv\s+install/i,
  PIPENV_UNINSTALL: /^\s*pipenv\s+uninstall/i,
  PIPENV_SYNC: /^\s*pipenv\s+sync/i,

  // Node.js
  NPM_INSTALL: /^\s*npm\s+(install|i|add|ci)/i,
  NPM_UNINSTALL: /^\s*npm\s+(uninstall|remove|rm)/i,
  NPM_LIST: /^\s*npm\s+(list|ls)/i,
  NPM_RUN: /^\s*npm\s+run/i,
  YARN_ADD: /^\s*yarn\s+(add|install)/i,
  YARN_REMOVE: /^\s*yarn\s+remove/i,
  PNPM_ADD: /^\s*pnpm\s+(add|install)/i,
  PNPM_REMOVE: /^\s*pnpm\s+remove/i,

  // Java
  MAVEN: /^\s*(mvn|maven)\s+/i,
  GRADLE: /^\s*(gradle|gradlew)\s+/i,

  // Environment
  EXPORT: /^\s*export\s+/i,
  SET_VAR: /^\s*set\s+/i,
  SOURCE: /^\s*source\s+/i,
  CD: /^\s*cd\s+/i,

  // Version checks
  VERSION: /\s+(--version|-v|version)\s*$/i,
  HELP: /\s+(--help|-h|help)\s*$/i,

  // Quick commands
  ECHO: /^\s*echo\s+/i,
  LS: /^\s*ls\s*/i,
  PWD: /^\s*pwd\s*$/i,
  CAT: /^\s*cat\s+/i,
  WHICH: /^\s*(which|where|type)\s+/i,
  MKDIR: /^\s*mkdir\s+/i,
  RM: /^\s*rm\s+/i,
  CP: /^\s*cp\s+/i,
  MV: /^\s*mv\s+/i,
};

/**
 * Classify a command into a category
 */
export function classifyCommand(command: string): CommandCategory {
  if (!command) return CommandCategory.UNKNOWN;

  const cmd = command.trim();

  // Package installation
  if (
    COMMAND_PATTERNS.PIP_INSTALL.test(cmd) ||
    COMMAND_PATTERNS.PIP_UPGRADE.test(cmd) ||
    COMMAND_PATTERNS.UV_ADD.test(cmd) ||
    COMMAND_PATTERNS.POETRY_ADD.test(cmd) ||
    COMMAND_PATTERNS.PIPENV_INSTALL.test(cmd) ||
    COMMAND_PATTERNS.NPM_INSTALL.test(cmd) ||
    COMMAND_PATTERNS.YARN_ADD.test(cmd) ||
    COMMAND_PATTERNS.PNPM_ADD.test(cmd)
  ) {
    return CommandCategory.PACKAGE_INSTALL;
  }

  // Package uninstallation
  if (
    COMMAND_PATTERNS.PIP_UNINSTALL.test(cmd) ||
    COMMAND_PATTERNS.UV_REMOVE.test(cmd) ||
    COMMAND_PATTERNS.POETRY_REMOVE.test(cmd) ||
    COMMAND_PATTERNS.PIPENV_UNINSTALL.test(cmd) ||
    COMMAND_PATTERNS.NPM_UNINSTALL.test(cmd) ||
    COMMAND_PATTERNS.YARN_REMOVE.test(cmd) ||
    COMMAND_PATTERNS.PNPM_REMOVE.test(cmd)
  ) {
    return CommandCategory.PACKAGE_UNINSTALL;
  }

  // Package listing
  if (
    COMMAND_PATTERNS.PIP_LIST.test(cmd) ||
    COMMAND_PATTERNS.UV_LIST.test(cmd) ||
    COMMAND_PATTERNS.NPM_LIST.test(cmd)
  ) {
    return CommandCategory.PACKAGE_LIST;
  }

  // Package sync/lock
  if (
    COMMAND_PATTERNS.UV_SYNC.test(cmd) ||
    COMMAND_PATTERNS.POETRY_LOCK.test(cmd) ||
    COMMAND_PATTERNS.PIPENV_SYNC.test(cmd) ||
    COMMAND_PATTERNS.PIP_COMPILE.test(cmd)
  ) {
    return CommandCategory.PACKAGE_SYNC;
  }

  // Build operations
  if (
    COMMAND_PATTERNS.MAVEN.test(cmd) ||
    COMMAND_PATTERNS.GRADLE.test(cmd) ||
    COMMAND_PATTERNS.NPM_RUN.test(cmd)
  ) {
    return CommandCategory.PACKAGE_BUILD;
  }

  // Environment creation
  if (COMMAND_PATTERNS.UV_VENV.test(cmd)) {
    return CommandCategory.ENV_CREATE;
  }

  // Environment variables
  if (
    COMMAND_PATTERNS.EXPORT.test(cmd) ||
    COMMAND_PATTERNS.SET_VAR.test(cmd) ||
    COMMAND_PATTERNS.SOURCE.test(cmd)
  ) {
    return CommandCategory.ENV_SET;
  }

  // Navigation
  if (COMMAND_PATTERNS.CD.test(cmd)) {
    return CommandCategory.NAVIGATION;
  }

  // Version checks
  if (COMMAND_PATTERNS.VERSION.test(cmd) || COMMAND_PATTERNS.HELP.test(cmd)) {
    return CommandCategory.VERSION_CHECK;
  }

  // Quick commands
  if (
    COMMAND_PATTERNS.ECHO.test(cmd) ||
    COMMAND_PATTERNS.LS.test(cmd) ||
    COMMAND_PATTERNS.PWD.test(cmd) ||
    COMMAND_PATTERNS.CAT.test(cmd) ||
    COMMAND_PATTERNS.WHICH.test(cmd) ||
    COMMAND_PATTERNS.MKDIR.test(cmd) ||
    COMMAND_PATTERNS.RM.test(cmd) ||
    COMMAND_PATTERNS.CP.test(cmd) ||
    COMMAND_PATTERNS.MV.test(cmd)
  ) {
    return CommandCategory.QUICK_COMMAND;
  }

  return CommandCategory.UNKNOWN;
}

/**
 * Get timeout configuration based on command category
 */
export function getTimeoutForCategory(category: CommandCategory, command: string): TimeoutConfig {
  switch (category) {
    case CommandCategory.PACKAGE_INSTALL: {
      // Detect specific package manager
      if (COMMAND_PATTERNS.PIP_INSTALL.test(command)) {
        return createPipInstallTimeout();
      }
      if (COMMAND_PATTERNS.UV_ADD.test(command)) {
        return createUvTimeout();
      }
      if (COMMAND_PATTERNS.NPM_INSTALL.test(command)) {
        return createNpmTimeout();
      }
      // Default install timeout
      return createPipInstallTimeout();
    }

    case CommandCategory.PACKAGE_UNINSTALL: {
      if (COMMAND_PATTERNS.PIP_UNINSTALL.test(command)) {
        return createPipUninstallTimeout();
      }
      if (COMMAND_PATTERNS.UV_REMOVE.test(command)) {
        return createUvTimeout({ baseTimeout: 10000 });
      }
      // Default uninstall timeout
      return createPipUninstallTimeout();
    }

    case CommandCategory.PACKAGE_LIST:
    case CommandCategory.VERSION_CHECK:
      // These are quick operations
      return createQuickCommandTimeout({
        baseTimeout: 5000,
        graceTimeout: 2000,
        absoluteMaximum: 15000,
      });

    case CommandCategory.PACKAGE_SYNC:
      // Sync operations can take a while
      return createUvTimeout({
        baseTimeout: 45000,
        graceTimeout: 20000,
        absoluteMaximum: 600000,
      });

    case CommandCategory.PACKAGE_BUILD:
      if (COMMAND_PATTERNS.MAVEN.test(command)) {
        return createMavenTimeout();
      }
      if (COMMAND_PATTERNS.NPM_RUN.test(command)) {
        return createNpmTimeout();
      }
      return createGenericTimeout();

    case CommandCategory.ENV_CREATE:
      // Virtual environment creation
      return createGenericTimeout({
        baseTimeout: 15000,
        graceTimeout: 10000,
        absoluteMaximum: 60000,
      });

    case CommandCategory.ENV_SET:
    case CommandCategory.NAVIGATION:
    case CommandCategory.QUICK_COMMAND:
      // Very quick operations
      return createQuickCommandTimeout({
        baseTimeout: 1000,
        graceTimeout: 500,
        absoluteMaximum: 5000,
      });

    case CommandCategory.UNKNOWN:
    default:
      return createGenericTimeout();
  }
}

/**
 * Smart timeout configuration based on comprehensive command analysis
 */
export function smartDetectTimeoutConfig(command: string): TimeoutConfig {
  const category = classifyCommand(command);
  return getTimeoutForCategory(category, command);
}
