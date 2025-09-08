# Neighborhood Server
A simple Python webserver that computes robot neighborhoods using MQTT.

## Features
- HTTP endpoint to post neighborhood type
- Connects to MQTT broker
- Reads topics: robot/<id>/position
- Computes neighbors for each robot
- Publishes neighbors to: robot/<id>/neighbors

## Requirements
- Python 3.8+
- Flask
- paho-mqtt

## Setup
```bash
pip install -r requirements.txt
```

## Run
```bash
python main.py
```

