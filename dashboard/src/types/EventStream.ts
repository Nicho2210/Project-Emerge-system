import type { RobotData } from './RobotData';

export interface EventStream {
  subscribe(callback: (robots: RobotData[]) => void): void;
  cleanup(): void;
}
