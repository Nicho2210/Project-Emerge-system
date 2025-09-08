import threading
import json
import os
from flask import Flask, request, jsonify
import paho.mqtt.client as mqtt

app = Flask(__name__)


# Global state
neighborhood_type = 'FULL'  # Default type "FULL" or "RADIUS"
radius_value = 1.0            # Default radius
robot_positions = {}
last_neighbors_sent = {}
update_counter = {}

# Read MQTT broker URL and port from environment variables
MQTT_BROKER = os.environ.get('MQTT_BROKER', 'localhost')
MQTT_PORT = int(os.environ.get('MQTT_PORT', '1883'))
POSITION_TOPIC = 'robot/+/position'
NEIGHBORS_TOPIC = 'robot/{}/neighbors'

# --- MQTT Logic ---
def on_connect(client, userdata, flags, rc):
    print('Connected to MQTT broker')
    client.subscribe(POSITION_TOPIC)

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()
    # Extract robot id from topic
    try:
        robot_id = topic.split('/')[1]
        position = json.loads(payload)
        robot_positions[robot_id] = position
        # Track update count
        update_counter[robot_id] = update_counter.get(robot_id, 0) + 1
        compute_and_publish_neighbors(client, robot_id)
    except Exception as e:
        print(f'Error processing message: {e}')

def compute_and_publish_neighbors(client, robot_id):
    global neighborhood_type, radius_value
    pos1 = robot_positions.get(robot_id)
    if pos1 is None:
        return
    neighbors = []
    if neighborhood_type == 'FULL':
        neighbors = [int(id2) for id2 in robot_positions if id2 != robot_id]
    elif neighborhood_type == 'RADIUS':
        for id2, pos2 in robot_positions.items():
            if robot_id == id2:
                continue
            dist = ((pos1['x']-pos2['x'])**2 + (pos1['y']-pos2['y'])**2)**0.5
            if dist <= radius_value:
                neighbors.append(int(id2))
    # Only publish if changed or after 10 updates
    neighbors_sorted = sorted(neighbors)
    last_sent = last_neighbors_sent.get(robot_id)
    count = update_counter.get(robot_id, 0)
    if neighbors_sorted != last_sent or count >= 10:
        topic = NEIGHBORS_TOPIC.format(robot_id)
        client.publish(topic, json.dumps(neighbors_sorted))
        last_neighbors_sent[robot_id] = neighbors_sorted
        update_counter[robot_id] = 0

mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

def mqtt_thread():
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_forever()

# --- Flask HTTP Endpoint ---

# Set neighborhood type and radius via HTTP
@app.route('/neighborhood', methods=['POST'])
def set_neighborhood():
    global neighborhood_type, radius_value
    data = request.get_json()
    if not data or 'type' not in data:
        return jsonify({'error': 'Missing type'}), 400
    neighborhood_type = data['type']
    if 'radius' in data:
        try:
            radius_value = float(data['radius'])
        except Exception:
            return jsonify({'error': 'Invalid radius value'}), 400
    return jsonify({'status': 'ok', 'type': neighborhood_type, 'radius': radius_value})


# Default page: show current neighborhood type and radius
@app.route('/', methods=['GET'])
def index():
    global neighborhood_type, radius_value
    return f"<h2>Neighborhood System</h2><p>Type: <b>{neighborhood_type}</b></p><p>Radius: <b>{radius_value}</b></p>", 200

if __name__ == '__main__':
    threading.Thread(target=mqtt_thread, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)
