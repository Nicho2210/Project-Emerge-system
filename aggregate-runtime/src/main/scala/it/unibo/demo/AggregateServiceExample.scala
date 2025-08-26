package it.unibo.demo

import it.unibo.core.aggregate.AggregateIncarnation.*
import it.unibo.core.aggregate.AggregateOrchestrator
import it.unibo.core.{Boundary, Environment, UpdateLoop}
import it.unibo.demo.provider.MqttProvider
import it.unibo.demo.robot.RobotUpdateMqtt
import it.unibo.demo.scenarios.{BaseDemo, CircleFormation, LineFormation}
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
  val provider = MqttProvider()
  provider.start()
  val update = RobotUpdateMqtt(0.6)
  val aggregateOrchestrator =
    AggregateOrchestrator[Position, Info, Actuation]((0 to 12).toSet, demoToLaunch)

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

object LineFormationDemo extends BaseAggregateServiceExample(LineFormation(5, 5, 1, 4.5))

object CircleFormationDemo extends BaseAggregateServiceExample(CircleFormation(1, 5, 0.1, 0.05))

object HeadlessFormation extends App:
  println("Starting headless formation demo...")
