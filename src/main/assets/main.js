var angular = require("angular");
require("angular-route");
require("ng-facebook");

var app = angular.module("app", ["ngFacebook", "ngRoute"]);

app.config(function($facebookProvider) {
  $facebookProvider.setAppId('1688025888105221');
  $facebookProvider.setPermissions("public_profile, email");
}).run(function() {
  (function() {
    if (document.getElementById('facebook-jssdk')) {
      return;
    }
    var firstScriptElement = document.getElementsByTagName('script')[0];
    var facebookJS = document.createElement('script');
    facebookJS.id = 'facebook-jssdk';
    facebookJS.src = '//connect.facebook.net/en_US/all.js';
    firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
  }());
});

app.controller("Main", ["$scope", "$facebook", "$location", function($scope, $facebook, $location) {
  this.login = function() {
    $facebook.login();
  };

  this.logout = function() {
    $facebook.logout();
  };

  $scope.$on('fb.auth.authResponseChange', function() {
    $scope.loggedIn = $facebook.isConnected();
    $scope.authResponse = $facebook.getAuthResponse();
    if ($scope.loggedIn) {
      $facebook.api('/me', {
        "fields": "first_name"
      }).then(function(user) {
        $scope.user = user;
      });
      $location.path("selection");
    }
  });
}]);

require("./selection/index");
require("./events/index");
