# Aurelia Http Logger Plugin

#### Table of Contents
* [Summary](#summary)
* [Download](#download)
* [Example](#example)

## Summary
A very simple http logging package that intercepts status codes setup on the static configuration method, sending those messages to Aurelia's LogManager. I created this because I was intercepting certain status codes the same way and displaying a custom message to the user.

## Download
`npm install aurelia-http-logger`

## Example
 HttpClient
```
import {HttpClient} from "aurelia-fetch-client";
import {inject} from "aurelia-framework";
import {LoggingInterceptor} from "aurelia-http-logger";

// global configuration
LoggingInterceptor.intercept({
  statusCodes: [400],
  message: "Bad Request",
  serverObjectName: "validationErrors"
});
LoggingInterceptor.intercept({
  statusCodes: [403],
  message: "Not Allowed! Please request access."
});
LoggingInterceptor.intercept({
  statusCodes: [500],
  message: "You found a bug! Please contact support so we can fix it."
});

// add the logging class to the interceptors
// and that's it
@inject(HttpClient, LoggingInterceptor)
export default class {

  constructor(http, loggingInterceptor) {
    this._http = http;
    this._loggingInterceptor = loggingInterceptor;
  }

  configure() {
    this._http.configure(config => {
      config
        .withDefaults({
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          }
        })
        .useStandardConfiguration()
        .withBaseUrl("./api/")
        .withInterceptor(this._loggingInterceptor);
    });
  }
}
```