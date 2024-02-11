import Debug from 'debug'

// Initialize debug logging module
export const log = Debug("northwinddb-api");
log.log = console.log.bind(console)
