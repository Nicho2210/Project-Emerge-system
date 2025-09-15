package it.unibo.demo.robot

import it.unibo.mqtt.MqttContext
import upickle.default.{macroRW, ReadWriter as RW, *}

object RobotMqttProtocol:

  case class RobotMovement(left: Double, right: Double)
  given RW[RobotMovement] = macroRW
  private val rotationSpeed = 0.6
  private val forwardSpeed = 1.0
  def spinRight(robot: Int)(using mqttContext: MqttContext) =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(rotationSpeed, -rotationSpeed)).getBytes, 0, false)

  def spinLeft(robot: Int)(using mqttContext: MqttContext): Unit =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(-rotationSpeed, rotationSpeed)).getBytes, 0, false)

  def nop(robot: Int)(using mqttContext: MqttContext): Unit = ()
  def stop(robot: Int)(using mqttContext: MqttContext): Unit =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(0, 0)).getBytes, 0, false)
  def forward(robot: Int)(using mqttContext: MqttContext): Unit =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(forwardSpeed, forwardSpeed)).getBytes, 0, false)

  def backward(robot: Int)(using mqttContext: MqttContext): Unit =
    mqttContext.client.publish(s"robots/${robot}/move", write(RobotMovement(-forwardSpeed, -forwardSpeed)).getBytes, 0, false)


