package it.unibo.demo.scenarios

import it.unibo.demo.robot.Actuation
import it.unibo.demo.robot.Actuation.{Forward, Rotation, NoOp}
import it.unibo.demo.{ID, Position}

class ObstacleAvoidance(private val safetyDistance: Double) extends BaseDemo:

  private val obstaclesSenseName = "obstacles"

  override def main(): Actuation =
    val myPosition = sense[Position](LSNS_POSITION)
    val allObstacles  = sense[Map[ID, (Position, Double)]](obstaclesSenseName)

    if (allObstacles.isEmpty) {
      return Actuation.NoOp
    }

    val nearestObstacle = allObstacles.minBy {
      case (_, (pos, _)) => module((pos._1 - myPosition._1, pos._2 - myPosition._2))
    }
    val (obstaclePos, obstacleSize) = nearestObstacle._2
    val distanceToObstacle = module((obstaclePos._1 - myPosition._1, obstaclePos._2 - myPosition._2))

    val collisionThreshold = safetyDistance + obstacleSize / 2
    val isObstacleNearby = distanceToObstacle < collisionThreshold

    if (isObstacleNearby) {
      val escapeVector = (myPosition._1 - obstaclePos._1, myPosition._2 -obstaclePos._2)
      Rotation(normalize(escapeVector))
    } else {
      Actuation.NoOp
    }