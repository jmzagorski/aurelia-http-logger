let configs = [];

export function addConfiguration(config) {
  if (!config) return;

  for (let i = 0; i < configs.length; i++) {
    let codes = config.statusCodes.filter(s => get(s));

    if (codes.length > 0) {
      throw new Error(`Status codes: ${ codes.join() } are already configured`);
    }
  }

  configs.push(config);
}

export function get(statusCode) {
  return configs.filter(c => c.statusCodes.indexOf(statusCode) !== -1)[0];
}

export function reset() {
  configs = [];
}