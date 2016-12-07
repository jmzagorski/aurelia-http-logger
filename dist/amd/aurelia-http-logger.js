define(['exports', './configuration-manager', 'aurelia-framework'], function (exports, _configurationManager, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LoggingInterceptor = undefined;

  var ConfigurationManager = _interopRequireWildcard(_configurationManager);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  function _parseDictionary(dictionary) {
    var messages = [];

    for (var v in dictionary) {
      if (dictionary.hasOwnProperty(v)) {
        messages.push(v + ' - ' + dictionary[v]);
      }
    }

    return messages;
  }

  var LoggingInterceptor = exports.LoggingInterceptor = (_dec = (0, _aureliaFramework.inject)(_aureliaFramework.LogManager), _dec(_class = function LoggingInterceptor(logManager) {
    var _this = this;

    _classCallCheck(this, LoggingInterceptor);

    this.responseError = function (response) {
      var config = ConfigurationManager.get(response.status);
      var contentType = response.headers.get('content-type');
      var inspectData = config && config.serverObjectName && contentType && contentType.indexOf('application/json') !== -1;

      if (inspectData) {
        return response.json().then(function (data) {
          var errorObj = data[config.serverObjectName];

          if (!errorObj) {
            var errMsg = 'No server object ' + config.serverObjectName + ' found';
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
  }) || _class);
});