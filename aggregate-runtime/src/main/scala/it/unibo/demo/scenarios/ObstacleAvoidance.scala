package it.unibo.demo.scenarios

import it.unibo.core.aggregate.AggregateIncarnation.*
import it.unibo.demo.robot.Actuation
import it.unibo.demo.robot.Actuation.{Forward, Rotation, NoOp}
import it.unibo.demo.{ID, Position}

class ObstacleAvoidance extends BaseDemo {

  private val obstaclesSenseName = "obstacles"
  private val safetyDistance = 0.1

  override def main(): Actuation =
    val myPosition = sense[Position](LSNS_POSITION)
    val allObstacle = sense[Map[ID, (Position, Double)]](obstaclesSenseName)

    val nearestObstacle = allObstacle.minBy {
      case (_, (pos, _)) => module((pos._1 - myPosition._1, pos._2 - myPosition._2))
    }
    val (obstaclePos, obstacleSize) = nearestObstacle._2
    val distanceToObstacle = module((obstaclePos._1 - myPosition._1, obstaclePos._2 - myPosition._2))

    val isObstacleNearby = distanceToObstacle < safetyDistance + obstacleSize / 2

    if (isObstacleNearby) {
      val escapeVector = (myPosition._1 - obstaclePos._1, myPosition._2 -obstaclePos._2)
      Rotation(normalize(escapeVector))
    } else {
      Actuation.NoOp
    }
}
