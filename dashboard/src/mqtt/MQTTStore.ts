import { create } from 'zustand'
import type { CommandPublisher } from '../types/CommandPublisher'
import { MQTTEventStream } from './MQTTEventStream'
import { MQTTCommandPublisher } from './MQTTCommandPublisher'
import mqtt from 'mqtt'


// Extend the MQTTStore type to include robots
import type { RobotData } from '../types/RobotData';

type MQTTStore = {
  publisher: CommandPublisher;
  robots: RobotData[];
};

const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:9001'

export const useMQTT = create<MQTTStore>()((set) => {
  const client = mqtt.connect(MQTT_BROKER_URL);
  const eventStream = new MQTTEventStream(client);
  const publisher = new MQTTCommandPublisher(client);

  // Initialize robots as an empty array
  const robots: RobotData[] = [];

  eventStream.subscribe((updatedRobots) => {
    set({ robots: updatedRobots });
  });

  return {
    publisher,
    robots,
  };
});
