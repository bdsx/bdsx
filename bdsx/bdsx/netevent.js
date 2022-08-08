//@ts-check
/**
 * @deprecated
 */
"use strict";

const { events } = require('./event');
const { readLoginPacket } = require('./legacy');
const { nethook } = require('./nethook');

exports.readLoginPacket = readLoginPacket;

function raw(id) {
    return events.packetRaw(id);
}
exports.raw = raw;
function before(id) {
    return events.packetBefore(id);
}
exports.before = before;
function after(id) {
    return events.packetAfter(id);
}
exports.after = after;
function send(id) {
    return events.packetSend(id);
}
exports.send = send;
function sendRaw(id) {
    return events.packetSendRaw(id);
}
exports.sendRaw = sendRaw;
exports.close = events.networkDisconnected;
function watchAll(exceptions) {
    return nethook.watchAll(exceptions);
}
exports.watchAll = watchAll;
