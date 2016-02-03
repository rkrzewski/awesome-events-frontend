scalaVersion := "2.11.7"
val akkaVersion = "2.4.1"
val akkaStreamsVersion = "2.0.1"
libraryDependencies ++= Seq(
    "com.typesafe.akka" %% "akka-actor" % akkaVersion,
    "com.typesafe.akka" %% "akka-http-experimental" % akkaStreamsVersion,
    "com.typesafe.akka" %% "akka-http-spray-json-experimental" % akkaStreamsVersion
)

enablePlugins(NodeJsPlugin)
NodeKeys.nodeProjectDir in Npm := file(".")
NodeKeys.nodeEnv in Npm := "prod"
NodeKeys.buildScripts in Npm := Seq("jspm-install", "gulp-build")

mappings in (Compile, packageBin) ++= {
  (NodeKeys.build in Npm).value
  Path.allSubpaths(file("target/assets-prod")).toSeq
}

unmanagedClasspath in Runtime += Attributed.blank(file("target/assets-prod"))
