import {LogManager, inject} from 'aurelia-framework';

const configs = [];

function _parseDictionary(dictionary) {
  const messages = [];

  for (let v in dictionary) {
    if (dictionary.hasOwnProperty(v)) {
      messages.push(`(${v}) ${dictionary[v]}`);
    }
  }

  return messages;
}

/**
 * @desc gets the configuration object for the status code
 * @returns @type{IConfiguration} if exists
 */
function _getConfig(statusCode: number): IConfiguration {
  return configs.filter(c => c.statusCodes.indexOf(statusCode) !== -1)[0];
}

/**
* @desc Configuration container to add logging for certain http status codes
*/
interface IConfiguration {
  /**
   * @desc The http status codes asssociated with the configuration
   */
  statusCodes: number[];

  /**
   * @desc A global logging message assocaited with the {@link statusCodes}
   */
  message: string;

  /**
   * @desc An optional string that points to logging messages from the server on
   * the response object. The actual service object can be
   * @type {(string|Array|Dictionary)}
   */
   serverObjectName: string|Array|Dictionary;
}


/**
 * @desc Uses the {@link: ConfigurationManager} to log custom http error
 * messages
 * @implements {Appender} in aurelia-logging
 */
@inject(LogManager)
export class LoggingInterceptor {

  constructor(logManager) {
    this._logger = logManager.getLogger('http-logging');
  }

  static intercept(config: IConfiguration) {
    if (!config) return;

    for (let i = 0; i < configs.length; i++) {
      let codes = config.statusCodes.filter(s => _getConfig(s));

      if (codes.length > 0) {
        throw new Error(`Status codes: ${codes.join()} are already configured`);
      }
    }

    configs.push(config);
  }

  /**
  * @desc removes all configurations
  * @returns void
  */
  static release(config) {
    let index = configs.indexOf(config);
    if (index !== -1) {
      configs.splice(index, 1);
    }
  }

  responseError = response => {
    const config = _getConfig(response.status);
    const contentType = response.headers.get('content-type');
    const inspectData = config && config.serverObjectName && contentType &&
      contentType.indexOf('application/json') !== -1;

    if (inspectData) {
      return response.json().then(data => {
        const errorObj = data[config.serverObjectName];

        if (!errorObj) {
          const errMsg = `No server object ${config.serverObjectName} found`;
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
              this._logger.error(`Unknown server object type ${errorObj.constructor}`);
          }
        }

        throw response;
      });
    } else if (config) {
      this._logger.error(config.message);
    }

    throw response;
  }

}
