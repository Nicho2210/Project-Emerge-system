package it.unibo.demo

import it.unibo.core.aggregate.AggregateIncarnation.*
import it.unibo.core.aggregate.AggregateOrchestrator
import it.unibo.core.{Boundary, Environment, UpdateLoop}
import it.unibo.demo.provider.MqttProvider
import it.unibo.demo.robot.Actuation.Rotation
import it.unibo.demo.robot.{Actuation, RobotUpdateMqtt}
import it.unibo.demo.scenarios.{BaseDemo, CircleFormation, LineFormation, PointTheLeader, SquareFormation, Stop, VFormation, VerticalLineFormation}
import it.unibo.mqtt.MqttContext
import it.unibo.utils.Position.given

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

private val BROKER_URL = System.getenv().getOrDefault("MQTT_URL", "tcp://localhost:1883")

class BaseAggregateServiceExample(demoToLaunch: BaseDemo) extends App:
  given MqttContext(BROKER_URL)
  private val agentsNeighborhoodRadius = 500
  private val nodeGuiSize = 10
  val agents = 12
  val provider = MqttProvider(
    Map(
      "program" -> "vShape",
      "leader" -> 5
    )
  )
  provider.start()
  val update = RobotUpdateMqtt(0.2)
  val aggregateOrchestrator =
    AggregateOrchestrator[Position, Actuation](demoToLaunch)

  val render = new Boundary[ID, Position, Info]:
    override def output(environment: Environment[ID, Position, Info]): Future[Unit] =
      Future.successful(())

  UpdateLoop.loop(33)(
    provider,
    aggregateOrchestrator,
    update,
    render
  )

private def randomAgents(howMany: Int, maxPosition: Int): Map[ID, (Double, Double)] =
  val random = new scala.util.Random
  (1 to howMany).map { i =>
    i -> (random.nextDouble() * maxPosition, random.nextDouble() * maxPosition)
  }.toMap

class AllDemoToLoad(demos: (String, BaseDemo)*) extends BaseDemo {
  private val demosToMap: Map[String, BaseDemo] = demos.toMap

  override def main(): EXPORT = {
    val ctx = vm.context
    val currentProgram = sense[String]("program")
    align(currentProgram){
      programToLaunch => demosToMap(currentProgram)(ctx)
    }
  }
}

object ResearchNightDemos extends BaseAggregateServiceExample(
  AllDemoToLoad(
    "pointToLeader" -> PointTheLeader(),
    "vShape" -> VFormation(1, - Math.PI / 4, 0.1, 0.6),
    "squareShape" -> SquareFormation(1, 0.1, 0.6),
    "circleShape" -> CircleFormation(1, 0.1, 0.6),
    "lineShape" -> LineFormation(0.6, 0.1, 0.6),
    "verticalLineShape" -> VerticalLineFormation(0.8, 0.1, 0.6),
    "stop" -> Stop()
  )
)
