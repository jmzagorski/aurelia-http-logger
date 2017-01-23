'use strict';

System.register(['aurelia-logging'], function (_export, _context) {
  "use strict";

  var getLogger, configs, logger;


  function _parseDictionary(dictionary) {
    var messages = [];

    for (var v in dictionary) {
      if (dictionary.hasOwnProperty(v)) {
        messages.push('(' + v + ') ' + dictionary[v]);
      }
    }

    return messages;
  }

  function _getConfig(statusCode) {
    return configs.filter(function (c) {
      return c.statusCodes.indexOf(statusCode) !== -1;
    })[0];
  }

  function intercept(config) {
    if (!config) return;
    if (!logger) logger = getLogger('http-logging');

    for (var i = 0; i < configs.length; i++) {
      var codes = config.statusCodes.filter(function (s) {
        return _getConfig(s);
      });

      if (codes.length > 0) {
        throw new Error('Status codes: ' + codes.join() + ' are already configured');
      }
    }

    configs.push(config);
  }

  _export('intercept', intercept);

  function release(config) {
    var index = configs.indexOf(config);
    if (index !== -1) {
      configs.splice(index, 1);
    }
  }

  _export('release', release);

  function responseError(response) {
    var config = _getConfig(response.status);

    var justMsg = response.message;
    var contentType = response.headers ? response.headers.get('content-type') : '';
    var inspectData = config && config.serverObjectName && contentType && contentType.indexOf('application/json') !== -1;

    if (inspectData) {
      return response.json().then(function (data) {
        var errorObj = data[config.serverObjectName];

        if (!errorObj) {
          var errMsg = 'No server object "' + config.serverObjectName + '" found';
          logger.error(errMsg);
        } else {
          switch (errorObj.constructor) {
            case String:
              logger.error(config.message + ': ' + errorObj);
              break;
            case Array:
              logger.error(config.message + ': ' + errorObj.map(function (e) {
                return e;
              }).join(', '));
              break;
            case Object:
              var messages = _parseDictionary(errorObj);
              logger.error(config.message + ': ' + messages.map(function (e) {
                return e;
              }).join(', '));
              break;
            default:
              logger.error('Unknown server object type ' + errorObj.constructor);
          }
        }

        throw response;
      });
    } else if (config) {
      logger.error(config.message);
    } else if (justMsg) {
      logger.error(justMsg);
    }

    throw response;
  }

  _export('responseError', responseError);

  return {
    setters: [function (_aureliaLogging) {
      getLogger = _aureliaLogging.getLogger;
    }],
    execute: function () {
      configs = [];
      logger = null;
    }
  };
});