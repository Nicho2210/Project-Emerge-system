import mqtt from 'mqtt';
import type { RobotData } from '../types/RobotData'; // Adjust the import path as necessary
import type { EventStream } from '../types/EventStream';

export class MQTTEventStream implements EventStream {
  private client: mqtt.MqttClient;
  private robots: { [key: string]: RobotData } = {};

  private fps = 60;
  private interval: NodeJS.Timeout | null = null;

  constructor(client: mqtt.MqttClient) {
    this.client = client;

    this.client.subscribe(`robot/+/position`);
    this.client.subscribe(`robot/+/neighbors`);
    this.client.subscribe(`leader`);

    this.client.on('message', (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        if(topic == 'leader') {
          Object.values(this.robots).forEach(element => {
            element.isLeader = false;
          });
          this.robots[data] = {
            ...this.robots[data],
            isLeader: true,
          };
        }
        const id = topic.split('/')[1];
        if (topic.endsWith('/position')) {
          this.updateRobotPosition(id, data);
        } else if (topic.endsWith('/neighbors')) {
          this.robots[id] = {
            ...this.robots[id],
            neighbors: data,
          };
        } 
      } catch (e) {
        console.error('Error processing MQTT message:', e);
      }
    });
    
  }
  cleanup(): void {
    if(this.interval){
      clearInterval(this.interval);
    }
  }

  subscribe(callback: (robots: RobotData[]) => void): void {
    this.interval = setInterval(() => {
      callback(Object.values(this.robots) as RobotData[]);
    }, 1000 / this.fps);
  }

  private updateRobotPosition(id: string, data: { x: number; y: number; orientation: number }): void {
    this.robots[id] = {
      ...this.robots[id],
      id: parseInt(id, 10),
      position: { x: data.x, y: data.y },
      orientation: data.orientation,
    };
  }
}
