var app = require("angular").module("app");

app.controller("Greeting", require("./greeting-controller"));
app.directive("greeting", require("./greeting-directive"));
app.service("echo", require("./echo-service"));
