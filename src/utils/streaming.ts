/**
 * Streaming utility for real-time progress feedback
 */

import type { StreamEvent, StreamCallback } from '#types/streaming.js';

export class StreamManager {
  private readonly callback?: StreamCallback;
  private lastEmitTime = 0;
  private readonly throttleMs: number;

  constructor(callback?: StreamCallback, throttleMs = 50) {
    this.callback = callback;
    this.throttleMs = throttleMs;
  }

  async emit(event: Omit<StreamEvent, 'timestamp'>): Promise<void> {
    if (!this.callback) {
      return;
    }

    // Throttle high-frequency events
    const now = Date.now();
    if (event.type === 'scan_progress' && now - this.lastEmitTime < this.throttleMs) {
      return;
    }

    const fullEvent: StreamEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.lastEmitTime = now;

    try {
      await this.callback(fullEvent);
    } catch (error) {
      // Don't let streaming errors break the main operation
      console.error('[STREAM] Error in stream callback:', error);
    }
  }

  async scanStarted(data: {
    environment: string;
    packageManager: string;
    estimatedCount?: number;
  }): Promise<void> {
    await this.emit({ type: 'scan_started', data });
  }

  async packageDiscovered(name: string, path: string): Promise<void> {
    await this.emit({ type: 'package_discovered', data: { name, path } });
  }

  async packageProcessed(
    name: string,
    version: string,
    location: string,
    category?: string,
  ): Promise<void> {
    await this.emit({ type: 'package_processed', data: { name, version, location, category } });
  }

  async scanProgress(processed: number, total: number, currentPackage?: string): Promise<void> {
    const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
    await this.emit({
      type: 'scan_progress',
      data: { processed, total, currentPackage, percentage },
    });
  }

  async scanCompleted(
    totalPackages: number,
    duration: number,
    categories?: Record<string, number>,
  ): Promise<void> {
    await this.emit({ type: 'scan_completed', data: { totalPackages, duration, categories } });
  }

  async error(message: string, packageName?: string, error?: string): Promise<void> {
    await this.emit({ type: 'error', data: { message, packageName, error } });
  }
}

/**
 * Default console stream handler for development/debugging
 */
export function createConsoleStream(): StreamCallback {
  return (event: StreamEvent) => {
    switch (event.type) {
      case 'scan_started': {
        const startData = event.data as { environment: string; packageManager: string };
        console.error(
          `[SCAN] Starting ${startData.environment} scan with ${startData.packageManager}`,
        );
        break;
      }
      case 'package_discovered':
        // Don't log individual discoveries to avoid spam
        break;
      case 'package_processed':
        // Don't log individual processing to avoid spam
        break;
      case 'scan_progress': {
        const progressData = event.data as { processed: number; total: number; percentage: number };
        if (progressData.processed % 50 === 0 || progressData.processed === progressData.total) {
          console.error(
            `[SCAN] Progress: ${progressData.processed}/${progressData.total} packages (${progressData.percentage}%)`,
          );
        }
        break;
      }
      case 'scan_completed': {
        const completedData = event.data as { totalPackages: number; duration: number };
        console.error(
          `[SCAN] Completed: ${completedData.totalPackages} packages in ${completedData.duration}ms`,
        );
        break;
      }
      case 'error': {
        const errorData = event.data as { message: string; packageName?: string };
        console.error(
          `[SCAN] Error${errorData.packageName ? ` in ${errorData.packageName}` : ''}: ${errorData.message}`,
        );
        break;
      }
    }
  };
}
