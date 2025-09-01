package it.unibo.demo.robot

import it.unibo.core.{Environment, EnvironmentUpdate}
import it.unibo.demo.robot.Actuation.{Forward, NoOp, Rotation, Stop}
import it.unibo.demo.{ID, Info, Position}
import it.unibo.mqtt.MqttContext

import scala.concurrent.{ExecutionContext, Future}

enum Actuation:
  case Rotation(rotationVector: (Double, Double))
  case Forward(vector: (Double, Double))
  case NoOp
  case Stop

class RobotUpdateMqtt(threshold: Double)(using ExecutionContext, MqttContext)
    extends EnvironmentUpdate[ID, Position, Actuation, Info, Environment[ID, Position, Info]]:

  // Small angular tolerance to avoid oscillations when almost aligned (in radians)
  private val angleTolerance = 10.0 * math.Pi / 180.0 // 5 degrees

  private def normalizeAngle(a: Double): Double =
    var x = a
    while x <= -math.Pi do x += 2 * math.Pi
    while x > math.Pi do x -= 2 * math.Pi
    x

  override def update(world: Environment[ID, Position, Info], id: ID, actuation: Actuation): Future[Unit] =
    actuation match
      case _ if !world.nodes.contains(id) => Future(RobotMqttProtocol.nop(id))
      case NoOp => Future(RobotMqttProtocol.nop(id))
      case Stop => Future(RobotMqttProtocol.stop(id))
      case Rotation(actuation) =>
        Future:
          val orientation = world.sensing(id)("orientation").asInstanceOf[Double] // current heading angle (robot frame)
          val currentVector = (-Math.sin(orientation), Math.cos(orientation))
          val targetVector = (actuation._1, actuation._2)
          val rotationEuclideanDistance = Math.sqrt(
            Math.pow(targetVector._1 - currentVector._1, 2) +
              Math.pow(targetVector._2 - currentVector._2, 2)
          )
          val currentAngle = math.atan2(currentVector._2, currentVector._1)
          val targetAngle = math.atan2(targetVector._2, targetVector._1)
          val deltaAngle = normalizeAngle(targetAngle - currentAngle)
          if rotationEuclideanDistance < threshold || math.abs(deltaAngle) < angleTolerance then
            RobotMqttProtocol.stop(id)
          else if deltaAngle > 0 then RobotMqttProtocol.spinRight(id) else RobotMqttProtocol.spinLeft(id)

      case Forward(desired) =>
        Future:
          // Current heading (transform from stored angle to unit vector)
          val orientation = world.sensing(id)("orientation").asInstanceOf[java.lang.Double]
          val headingVector = (-Math.sin(orientation), Math.cos(orientation))
          val currentAngle = math.atan2(headingVector._2, headingVector._1)
          // Desired translation vector (could imply moving backward if opposite to heading)
          val desiredVector = (desired._1, desired._2)
          // Decide whether to move forward or backward based on dot product
          val dot = headingVector._1 * desiredVector._1 + headingVector._2 * desiredVector._2
          val moveForward = dot >= 0
          // Angle of desired motion
          val desiredAngleRaw = math.atan2(desiredVector._2, desiredVector._1)
          // If we plan to move backward, add pi to desired angle (i.e., face opposite orientation)
          val effectiveDesiredAngle = if moveForward then desiredAngleRaw else normalizeAngle(desiredAngleRaw + math.Pi)
          val deltaAngle = normalizeAngle(effectiveDesiredAngle - currentAngle)
          // If almost aligned, move; else rotate with orientation given by sign of delta
          if math.abs(deltaAngle) < angleTolerance then
            if moveForward then RobotMqttProtocol.forward(id) else RobotMqttProtocol.backward(id)
          else if deltaAngle > 0 then RobotMqttProtocol.spinRight(id) else RobotMqttProtocol.spinLeft(id)

