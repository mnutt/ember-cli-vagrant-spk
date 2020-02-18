'use strict';

var command = require('./lib/command');

module.exports = {
  name: require('./package').name,
  includedCommands: function() {
    return {'spk': command};
  }
};
