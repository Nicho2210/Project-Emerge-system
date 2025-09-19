import type { RobotData } from './RobotData';
import type { ObstacleData } from './ObstacleData';

export interface EventStream {
  subscribe(callback: (robots: RobotData[], obstacles: ObstacleData[]) => void): void;
  cleanup(): void;
}
