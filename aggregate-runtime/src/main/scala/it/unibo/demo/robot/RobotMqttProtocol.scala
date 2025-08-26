package it.unibo.demo.robot

import it.unibo.mqtt.MqttContext
import org.eclipse.paho.client.mqttv3.*
import upickle.default.{macroRW, ReadWriter as RW, *}

object RobotMqttProtocol:

  case class RobotMovement(left: Double, right: Double)
  given RW[RobotMovement] = macroRW

  def spinRight(robot: Int)(using mqttContext: MqttContext) =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(0.2, -0.2)).getBytes, 0, false)

  def spinLeft(robot: Int)(using mqttContext: MqttContext): Unit =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(-0.2, 0.2)).getBytes, 0, false)

  def nop(robot: Int)(using mqttContext: MqttContext): Unit =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(0, 0)).getBytes, 0, false)

  def forward(robot: Int)(using mqttContext: MqttContext): Unit =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(0.9, 0.9)).getBytes, 0, false)

  def backward(robot: Int)(using mqttContext: MqttContext): Unit =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(-0.9, -0.9)).getBytes, 0, false)


