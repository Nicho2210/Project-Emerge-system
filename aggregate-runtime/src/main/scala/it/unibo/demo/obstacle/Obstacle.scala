package it.unibo.demo.obstacle

import upickle.default.{macroRW, ReadWriter as RW, *}

case class Obstacle(id: String, x: Double, y: Double, size: Double)

given RW[Obstacle] = macroRW