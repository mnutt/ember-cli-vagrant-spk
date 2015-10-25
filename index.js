/* jshint node: true */
'use strict';

var command = require('./lib/command');

module.exports = {
  name: 'ember-cli-vagrant-spk',
  includedCommands: function() {
    return {'spk': command};
  }
};
