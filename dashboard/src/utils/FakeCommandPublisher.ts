import type { CommandPublisher } from './CommandPublisherInterface';
import type { Vector2D } from '../types/Vector2D';

export class FakeCommandPublisher implements CommandPublisher {
  publishProgramCommand(program: string): void {
    console.warn(`Fake program command:`, program);
  }

  publishMoveCommand(robotId: number, command: Vector2D): void {
    console.warn(`Fake move command for robot ${robotId}:`, command);
  }

  publishLeaderCommand(robotId: number): void {
    console.warn(`Fake leader command for robot ${robotId}`);
  }
}
