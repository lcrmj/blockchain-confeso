const ioClient = require('socket.io-client')('http://localhost:3000')

const chain = '[{"data":{"genesis":"block"},"timestamp":"2020-11-26","hash":"43c4e7fb571882df264c70e18638323c06c562a4ff0f023d5bdef9df107f02e9"},{"data":{"genesis":"block"},"timestamp":"2020-11-26","hash":"33c4e7fb571882df264c70e18638323c06c562a4ff0f023d5bdef9df107f02e9"}]'

// ioClient.on('connect', () => {
//     ioClient.send(chain);
// })