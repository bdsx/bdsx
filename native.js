
// avoid webpack virtual 'process'
module.exports = new Function('return process')()._linkedBinding('bdsx_native');
