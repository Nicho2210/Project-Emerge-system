import mqtt from 'mqtt';
import type { RobotData } from '../types/RobotData'; // Adjust the import path as necessary
import type { ObstacleData } from '../types/ObstacleData';
import type { EventStream } from '../types/EventStream';

export class MQTTEventStream implements EventStream {
  private client: mqtt.MqttClient;
  private robots: { [key: string]: RobotData } = {};
  private obstacles: { [key: string]: ObstacleData } = {};
  // set the default timeout for removing a robot to 2 seconds
  private robotTimers: { [key: number]: NodeJS.Timeout } = {};
  private DEFAULT_TIMEOUT = 2000; // milliseconds

  private fps = 60;
  private interval: NodeJS.Timeout | null = null;

  constructor(client: mqtt.MqttClient) {
    this.client = client;

    this.client.subscribe(`robots/+/position`);
    this.client.subscribe(`robots/+/neighbors`);
    this.client.subscribe(`robots/+/emulated`);
    this.client.subscribe(`obstacles/+/position`);
    this.client.subscribe(`leader`);

    this.client.on('message', (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        const id = topic.split('/')[1];
        if(topic === 'leader') {
          Object.values(this.robots).forEach(element => {
            element.isLeader = false;
          });
          if(this.robots[data]) {
            this.robots[data] = {
              ...this.robots[data],
              isLeader: true,
            };
          }
        } else if (topic.startsWith('robots/')) {
          if (topic.endsWith('/position')) {
            // reset the timer for each robot position update
            if (this.robotTimers[parseInt(id, 10)]) {
              clearTimeout(this.robotTimers[parseInt(id, 10)]);
            }
            // remove robot if no position update after 2 seconds
            this.robotTimers[parseInt(id, 10)] = setTimeout(() => {
              delete this.robots[id];
              delete this.robotTimers[parseInt(id, 10)];
            }, this.DEFAULT_TIMEOUT);
            this.updateRobotPosition(id, data);
          } else if (topic.endsWith('/neighbors')) {
            if (this.robots[id]) {
              this.robots[id] = {
                ...this.robots[id],
                neighbors: data,
              };
            }
          } else if (topic.endsWith('/emulated')) {
            if(this.robots[id]) {
              this.robots[id] = {
                ...this.robots[id],
                isEmulated: true,
              };
            }
          }
        } else if (topic.startsWith('obstacles/')) {
          if (topic.endsWith('/position')) {
            this.obstacles[id] = {
              id: parseInt(id, 10),
              position: { x: data.x, y: data.y },
              size: data.size
            };
          }
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

  subscribe(callback: (robots: RobotData[], obstacles: ObstacleData[]) => void): void {
    this.interval = setInterval(() => {
      callback(Object.values(this.robots) as RobotData[], Object.values(this.obstacles) as ObstacleData[]);
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
