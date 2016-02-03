package com.example

import scala.util.Failure
import scala.util.Success

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import akka.stream.Materializer

object Main extends App with Routes {

  implicit val actorSystem = ActorSystem("Main")

  implicit val executionContext = actorSystem.dispatcher

  implicit val materializer: Materializer = ActorMaterializer()

  val log = actorSystem.log

  Http().bindAndHandle(routes, "0.0.0.0", 9000).onComplete {
    case Success(b) ⇒ log.info("Started HTTP server at {}", b.localAddress)
    case Failure(t) ⇒ log.error(t, "Failed to start HTTP server")
  }

}
