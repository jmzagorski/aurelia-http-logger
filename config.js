System.config({
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  map: {
    "aurelia-logging": "npm:aurelia-logging@1.2.0",
    "aurelia-polyfills": "npm:aurelia-polyfills@1.0.0",
    "jasmine-data-provider": "npm:jasmine-data-provider@2.2.0",
    "npm:aurelia-polyfills@1.0.0": {
      "aurelia-pal": "npm:aurelia-pal@1.1.0"
    }
  }
});
