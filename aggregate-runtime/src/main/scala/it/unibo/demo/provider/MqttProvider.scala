package it.unibo.demo.provider

import it.unibo.core.{Environment, EnvironmentProvider}
import it.unibo.demo.environment.MqttEnvironment
import it.unibo.demo.provider.MqttProtocol.{Leader, Neighborhood, Programs, RobotPosition, Emulation}
import it.unibo.demo.{ID, Info, Position}
import it.unibo.mqtt.MqttContext
import org.eclipse.paho.client.mqttv3.*
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence
import upickle.default.{macroRW, ReadWriter as RW, *}

import java.util.concurrent.{ConcurrentHashMap, ConcurrentMap}
import scala.concurrent.{ExecutionContext, Future}
import scala.jdk.CollectionConverters.MapHasAsScala

object MqttProtocol:
  case class RobotPosition(robot_id: String, x: Double, y: Double, orientation: Double)
  object RobotPosition:
    val topic: String = "robot/+/position"

  object Neighborhood:
    val topic: String = "robot/+/neighbors"

  object Emulation:
    val topic: String = "robot/+/emulation"

  object Programs:
    val topic: String = "program"

  object Leader:
    val topic: String = "leader"

  given RW[RobotPosition] = macroRW

class MqttProvider(var initialConfiguration: Map[String, Any])(using ExecutionContext, MqttContext) extends EnvironmentProvider[ID, Position, Info, Environment[ID, Position, Info]]:
  private val worldMap: ConcurrentMap[ID, (Position, Info)] = ConcurrentHashMap()
  private val neighborhood: ConcurrentMap[ID, Set[ID]] = ConcurrentHashMap()
  private val emulatedRobots: ConcurrentMap[ID, Boolean] = ConcurrentHashMap()
  override def provide(): Future[Environment[ID, Position, Info]] = Future:
    val currentWorld = MqttEnvironment(worldMap.asScala.toMap, neighborhood.asScala.toMap, emulatedRobots.asScala.toMap)
    worldMap.clear()
    //neighborhood.clear()
    currentWorld
  def start(): Unit =
    val client = summon[MqttContext].client
    client.connect()
    client.subscribeWithResponse(RobotPosition.topic, (topic: String, message: MqttMessage) => {
      val robot = read[MqttProtocol.RobotPosition](message.getPayload)
      worldMap.put(robot.robot_id.toInt, ((robot.x, robot.y), initialConfiguration ++ Map("orientation" -> robot.orientation)))
      ()
    })
    client.subscribeWithResponse(Programs.topic, (topic: String, message: MqttMessage) => {
      val program = message.toString.filter(_ != '"').toString
      initialConfiguration = initialConfiguration.updated("program", program)
      ()
    })
    client.subscribeWithResponse(Leader.topic, (topic: String, message: MqttMessage) => {
      val leader = message.toString
      println(leader)
      initialConfiguration = initialConfiguration.updated("leader", leader.toInt)
      ()
    })
    client.subscribeWithResponse(Neighborhood.topic, (topic: String, message: MqttMessage) => {
      val extractId = topic.split("/")(1).toInt
      val robotNeighborhood = read[List[String]](message.getPayload).map(_.toInt).toSet + extractId
      neighborhood.put(extractId, read[List[String]](message.getPayload).map(_.toInt).toSet)
      ()
    })
    client.subscribeWithResponse(Emulation.topic, (topic: String, message: MqttMessage) => {
      val extractId = topic.split("/")(1).toInt
      emulatedRobots.put(extractId, true)
      ()
    })
