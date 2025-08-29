import type { MoveCommand } from './MoveCommand';

export interface CommandPublisher {
  publishMoveCommand(robotId: number, command: MoveCommand): void;
  publishLeaderCommand(robotId: number): void;
  publishProgramCommand(formation: string): void;
}
