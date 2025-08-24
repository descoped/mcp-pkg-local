/**
 * Streaming output types for real-time progress feedback
 */

export type StreamEventType =
  | 'scan_started'
  | 'package_discovered'
  | 'package_processed'
  | 'scan_progress'
  | 'scan_completed'
  | 'error';

export interface StreamEvent {
  type: StreamEventType;
  timestamp: string;
  data: unknown;
}

export type StreamCallback = (event: StreamEvent) => void | Promise<void>;
