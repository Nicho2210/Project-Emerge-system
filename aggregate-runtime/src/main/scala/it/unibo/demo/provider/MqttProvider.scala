package it.unibo.demo.provider

import it.unibo.core.{Environment, EnvironmentProvider}
import it.unibo.demo.environment.MqttEnvironment
import it.unibo.demo.provider.MqttProtocol.{Leader, Neighborhood, Programs, RobotPosition}
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
    val topic: String = "robots/+/position"

  object Neighborhood:
    val topic: String = "robots/+/neighbors"

  object Programs:
    val topic: String = "sensing"

  object Leader:
    val topic: String = "leader"

  given RW[RobotPosition] = macroRW

class MqttProvider(var initialConfiguration: Map[String, Any])(using ExecutionContext, MqttContext) extends EnvironmentProvider[ID, Position, Info, Environment[ID, Position, Info]]:
  private val worldMap: ConcurrentMap[ID, (Position, Info)] = ConcurrentHashMap()
  private val neighborhood: ConcurrentMap[ID, Set[ID]] = ConcurrentHashMap()
  override def provide(): Future[Environment[ID, Position, Info]] = Future:
    val newNeighborhood = neighborhood.asScala.toMap
    val newWorldMap = worldMap.asScala.toMap
    newNeighborhood.map:
      case (id, neigh) => neigh.intersect(newWorldMap.keySet)
    val currentWorld = MqttEnvironment(newWorldMap, newNeighborhood)
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
      import ujson.*
      val program = ujson.read(message.getPayload)
      val newConfiguration = program.obj.toMap.view.mapValues{
        value => value.numOpt.getOrElse(value.str)
      }
      initialConfiguration = initialConfiguration ++ newConfiguration
      ()
    })
    client.subscribeWithResponse(Leader.topic, (topic: String, message: MqttMessage) => {
      val leader = message.toString
      initialConfiguration = initialConfiguration.updated("leader", leader.toInt)
      ()
    })
    client.subscribeWithResponse(Neighborhood.topic, (topic: String, message: MqttMessage) => {
      val extractId = topic.split("/")(1).toInt
      val robotNeighborhood = read[List[String]](message.getPayload).map(_.toInt).toSet + extractId
      neighborhood.put(extractId, read[List[String]](message.getPayload).map(_.toInt).toSet)
      ()
    })
