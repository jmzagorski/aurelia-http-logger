import * as TheLogManager from 'aurelia-logging';
import * as HttpLogger from '../src/aurelia-http-logger';
import using from 'jasmine-data-provider';

class HttpResponseStub {
  constructor() {
    this.itemStub = { error: '' };
    this.contentType = 'application/json';
    this.status = 200;
    this.headers = {
      get: str => this.contentType
    };
  }

  json() {
    let response = this.itemStub;
    return new Promise((resolve) => {
      resolve(response);
    });
  }
}

class LoggerStub {
  error(msg) { }
}

describe('the http logger', () => {
  let config;
  let response;
  let loggingError;

  // this is here because the logger is only created once on the first
  // interception call
  beforeAll(() =>  {
    let logger = new LoggerStub();
    loggingError = spyOn(logger, 'error');
    spyOn(TheLogManager, 'getLogger').and.returnValue(logger);
  });

  beforeEach(() => {
    config = {
      statusCodes: [400],
      message: 'test',
      serverObjectName: null
    };

    response = new HttpResponseStub();
    response.status = 400;

    HttpLogger.intercept(config);
  });

  afterEach(() => HttpLogger.release(config));

  it('does not throw when the configuration is missing', () => {
    expect(() => HttpLogger.release()).not.toThrow();
  });

  it('prevents duplicate status code configurations', () => {
    let dupeConfig = {
      statusCodes: [400],
      message: '',
      serverObjectName: null
    };

    expect(() => HttpLogger.intercept(dupeConfig))
      .toThrow(new Error('Status codes: 400 are already configured'));
  });

  it('does nothing with no config object', () => {
    HttpLogger.release(config);

    expect(() => HttpLogger.responseError(response)).toThrow(response);
    expect(loggingError).not.toHaveBeenCalled();
  });

  it('only logs config message when content type is not json', () => {
    response.contentType = '';

    expect(() => HttpLogger.responseError(response)).toThrow(response);
    expect(loggingError).toHaveBeenCalledWith(config.message);
  });

  it('does not inspect the response data without a serverObjectName', () => {
    config.serverObjectName = null;

    expect(() => HttpLogger.responseError(response)).toThrow(response);
    expect(loggingError).toHaveBeenCalledWith(config.message);
  });

  it('logs when the response data does not contain the expected data', (done) => {
    response.itemStub = {
      data: { }
    };
    config.serverObjectName = 'daata';

    HttpLogger.responseError(response).catch(actualResponse => {
      expect(actualResponse).toBe(response);
      expect(loggingError).toHaveBeenCalledWith('No server object "daata" found');
      done();
    });
  });

  it('logs when object is not expected', (done) => {
    let expectedCall = 'Unknown server object type function Number() { [native code] }';
    response.itemStub = {
      data: 32
    };
    config.serverObjectName = 'data';

    HttpLogger.responseError(response).catch(actualResponse => {
      expect(actualResponse).toBe(response);
      expect(loggingError).toHaveBeenCalledWith(expectedCall);
      done();
    });
  });

  using([
    { data: 'string called', expectMsg: 'string called' },
    { data: ['msg1', 'msg2'], expectMsg: 'msg1, msg2' },
    { data: { msg1: 'message1', msg2: 'message2' }, expectMsg: '(msg1) message1, (msg2) message2' }
  ], data => {
    it('logs an error for a known server object', (done) => {
      response.itemStub = { data: data.data };
      config.serverObjectName = 'data';

      HttpLogger.responseError(response).catch(actualResponse => {
        expect(actualResponse).toBe(response);
        expect(loggingError).toHaveBeenCalledWith('test: ' + data.expectMsg);
        done();
      });
    });
  });

  it('logs response message if exists without headers', () => {
    response.headers = null;
    response.message = 'testing';
    response.status = null;

    expect(() => HttpLogger.responseError(response)).toThrow(response);
    expect(loggingError).toHaveBeenCalledWith('testing');
  });

  it('logs the config message before the response msg', () => {
    response.message = config.message + 'testing';

    expect(() => HttpLogger.responseError(response)).toThrow(response);
    expect(loggingError).toHaveBeenCalledWith(config.message);
  });
});
