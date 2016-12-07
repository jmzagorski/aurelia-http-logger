var _dec, _class;

import * as ConfigurationManager from './configuration-manager';
import { LogManager, inject } from 'aurelia-framework';

function _parseDictionary(dictionary) {
  const messages = [];

  for (let v in dictionary) {
    if (dictionary.hasOwnProperty(v)) {
      messages.push(`${ v } - ${ dictionary[v] }`);
    }
  }

  return messages;
}

export let LoggingInterceptor = (_dec = inject(LogManager), _dec(_class = class LoggingInterceptor {

  constructor(logManager) {
    this.responseError = response => {
      const config = ConfigurationManager.get(response.status);
      const contentType = response.headers.get('content-type');
      const inspectData = config && config.serverObjectName && contentType && contentType.indexOf('application/json') !== -1;

      if (inspectData) {
        return response.json().then(data => {
          const errorObj = data[config.serverObjectName];

          if (!errorObj) {
            const errMsg = `No server object ${ config.serverObjectName } found`;
            this._logger.error(errMsg);
          } else {
            switch (errorObj.constructor) {
              case String:
                this._logger.error(config.message + ': ' + errorObj);
                break;
              case Array:
                this._logger.error(config.message + ': ' + errorObj.map(e => e).join(', '));
                break;
              case Object:
                const messages = _parseDictionary(errorObj);
                this._logger.error(config.message + ': ' + messages.map(e => e).join(', '));
                break;
              default:
                this._logger.error(`Unknown server object type ${ errorObj.constructor }`);
            }
          }

          throw response;
        });
      } else if (config) {
        this._logger.error(config.message);
      }

      throw response;
    };

    this._logger = logManager.getLogger('http-logging');
  }

}) || _class);