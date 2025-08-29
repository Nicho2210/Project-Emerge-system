import { create } from 'zustand'
import type { EventStream } from '../types/EventStream'
import type { CommandPublisher } from '../types/CommandPublisher'
import { MQTTEventStream } from './MQTTEventStream'
import { MQTTCommandPublisher } from './MQTTCommandPublisher'
import mqtt from 'mqtt'

type MQTTStore = {
  eventStream : EventStream
  publisher: CommandPublisher
}

const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:9001'

export const useMQTT = create<MQTTStore>()(() => {
    const client = mqtt.connect(MQTT_BROKER_URL)

    return {
        eventStream: new MQTTEventStream(client),
        publisher: new MQTTCommandPublisher(client),
    }
})
