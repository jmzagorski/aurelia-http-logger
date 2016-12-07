define(["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.addConfiguration = addConfiguration;
  exports.get = get;
  exports.reset = reset;
  var configs = [];

  function addConfiguration(config) {
    if (!config) return;

    for (var i = 0; i < configs.length; i++) {
      var codes = config.statusCodes.filter(function (s) {
        return get(s);
      });

      if (codes.length > 0) {
        throw new Error("Status codes: " + codes.join() + " are already configured");
      }
    }

    configs.push(config);
  }

  function get(statusCode) {
    return configs.filter(function (c) {
      return c.statusCodes.indexOf(statusCode) !== -1;
    })[0];
  }

  function reset() {
    configs = [];
  }
});