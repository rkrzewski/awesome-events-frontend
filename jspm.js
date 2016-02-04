System.config({
  baseURL: ".",
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "github:*": "jspm_modules/github/*",
    "npm:*": "jspm_modules/npm/*"
  },

  map: {
    "angular": "npm:angular@1.4.8",
    "angular-route": "github:angular/bower-angular-route@1.4.9",
    "bootstrap-sass": "github:twbs/bootstrap-sass@3.3.6",
    "html": "github:jamespamplin/plugin-ng-template@0.1.1",
    "ng-facebook": "github:GoDisco/ngFacebook@0.1.6",
    "roboto-fontface": "github:choffmeister/roboto-fontface-bower@0.4.3",
    "github:angular/bower-angular-route@1.4.9": {
      "angular": "github:angular/bower-angular@1.4.9"
    },
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:angular@1.4.8": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});
