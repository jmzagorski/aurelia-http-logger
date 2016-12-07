'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoggingInterceptor = undefined;

var _dec, _class;

var _aureliaFramework = require('aurelia-framework');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var configs = [];

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

var LoggingInterceptor = exports.LoggingInterceptor = (_dec = (0, _aureliaFramework.inject)(_aureliaFramework.LogManager), _dec(_class = function () {
  function LoggingInterceptor(logManager) {
    var _this = this;

    _classCallCheck(this, LoggingInterceptor);

    this.responseError = function (response) {
      var config = _getConfig(response.status);
      var contentType = response.headers.get('content-type');
      var inspectData = config && config.serverObjectName && contentType && contentType.indexOf('application/json') !== -1;

      if (inspectData) {
        return response.json().then(function (data) {
          var errorObj = data[config.serverObjectName];

          if (!errorObj) {
            var errMsg = 'No server object "' + config.serverObjectName + '" found';
            _this._logger.error(errMsg);
          } else {
            switch (errorObj.constructor) {
              case String:
                _this._logger.error(config.message + ': ' + errorObj);
                break;
              case Array:
                _this._logger.error(config.message + ': ' + errorObj.map(function (e) {
                  return e;
                }).join(', '));
                break;
              case Object:
                var messages = _parseDictionary(errorObj);
                _this._logger.error(config.message + ': ' + messages.map(function (e) {
                  return e;
                }).join(', '));
                break;
              default:
                _this._logger.error('Unknown server object type ' + errorObj.constructor);
            }
          }

          throw response;
        });
      } else if (config) {
        _this._logger.error(config.message);
      }

      throw response;
    };

    this._logger = logManager.getLogger('http-logging');
  }

  LoggingInterceptor.intercept = function intercept(config) {
    if (!config) return;

    for (var i = 0; i < configs.length; i++) {
      var codes = config.statusCodes.filter(function (s) {
        return _getConfig(s);
      });

      if (codes.length > 0) {
        throw new Error('Status codes: ' + codes.join() + ' are already configured');
      }
    }

    configs.push(config);
  };

  LoggingInterceptor.release = function release(config) {
    var index = configs.indexOf(config);
    if (index !== -1) {
      configs.splice(index, 1);
    }
  };

  return LoggingInterceptor;
}()) || _class);