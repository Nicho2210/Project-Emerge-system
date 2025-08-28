import type { CommandPublisher } from './CommandPublisherInterface';
import type { Vector2D } from '../types/Vector2D';
import mqtt from 'mqtt';

export class MQTTCommandPublisher implements CommandPublisher {
  private client: mqtt.MqttClient;

  constructor(brokerUrl: string) {
    this.client = mqtt.connect(brokerUrl);
  }
  publishProgramCommand(program: string): void {
    this.client.publish(`program`, JSON.stringify(program));
  }

  publishMoveCommand(robotId: number, command: Vector2D): void {
    this.client.publish(`robots/${robotId}/move`, JSON.stringify({left: command.x, right: command.y}));
  }

  publishLeaderCommand(robotId: number): void {
   this.client.publish(`leader`, JSON.stringify(robotId));
  }
}
