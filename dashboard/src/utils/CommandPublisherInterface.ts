import type { Vector2D } from '../types/Vector2D';

export interface CommandPublisher {
  publishMoveCommand(robotId: number, command: Vector2D): void;
  publishLeaderCommand(robotId: number): void;
  publishProgramCommand(formation: string): void;
}
