const WebSocket = require('ws')
const fs = require('fs')

module.exports = app => {
    app.once('server', server => {
        app.ws = new WebSocket.Server({server})
    })
}