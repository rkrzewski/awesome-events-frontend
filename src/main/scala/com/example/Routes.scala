package com.example

import akka.http.scaladsl.model.HttpRequest
import akka.http.scaladsl.model.HttpResponse
import akka.http.scaladsl.model.ws._
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.stream.Materializer
import akka.stream.scaladsl.Flow
import akka.stream.scaladsl.Sink

trait Routes {

  implicit def materializer: Materializer

  val echo = Flow[Message]
    .mapConcat {
      case tm: TextMessage ⇒ TextMessage(tm.textStream) :: Nil
      case bm: BinaryMessage ⇒
        // ignore binary messages but drain content to avoid the stream being clogged
        bm.dataStream.runWith(Sink.ignore)
        Nil
    }

  private def echoHandler: HttpRequest ⇒ HttpResponse = {
    case req: HttpRequest ⇒ req.header[UpgradeToWebsocket] match {
      case Some(upgrade) ⇒
        upgrade.handleMessages(echo)
      case None ⇒ HttpResponse(400, entity = "Missing Upgrade header")
    }
  }

  def routes: Route = pathPrefix("api") {
    path("health") {
      get {
        complete {
          "OK"
        }
      }
    } ~ path("echo") {
      handleWith(echoHandler)
    }
  } ~ pathSingleSlash {
    getFromResource("index.html")
  } ~ path(RestPath) { p ⇒
    getFromResource(p.toString + ".gz") ~ getFromResource(p.toString)
  }

}
