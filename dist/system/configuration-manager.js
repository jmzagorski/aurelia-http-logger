"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var configs;
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

  _export("addConfiguration", addConfiguration);

  function get(statusCode) {
    return configs.filter(function (c) {
      return c.statusCodes.indexOf(statusCode) !== -1;
    })[0];
  }

  _export("get", get);

  function reset() {
    configs = [];
  }

  _export("reset", reset);

  return {
    setters: [],
    execute: function () {
      configs = [];
    }
  };
});