var app = require("angular").module("app");

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider.when("/events", {
    templateUrl: require("./events.html!").templateUrl,
    controller: 'EventsCtrl as ctrl'
  });
}]);

app.controller("EventsCtrl", require("./events-controller"));
