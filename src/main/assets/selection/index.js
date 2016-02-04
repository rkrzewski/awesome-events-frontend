var app = require("angular").module("app");

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider.when("/selection", {
    templateUrl: require("./selection.html!").templateUrl,
    controller: 'SelectionCtrl as ctrl'
  });
}]);

app.controller("SelectionCtrl", require("./selection-controller"));
