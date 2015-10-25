'use strict';
var Command = require('ember-cli/lib/models/command');
var path    = require('path');
var spawn   = require('child_process').spawn;
var fs      = require('fs');

module.exports = Command.extend({
  name: 'spk',
  description: 'build ember app and expose to sandstorm with vagrant-spk',

  childProcess: null,  // set to the vagrant-spk child process when it is started
  restarting: false,   // in the process of restarting vagrant-spk?

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'output-path', type: path, default: 'dist/', aliases: ['o'] },
    { name: 'watch', type: Boolean, default: true, aliases: ['w'] },
    { name: 'watcher', type: String }
  ],

  run: function(commandOptions) {
    var BuildTask = this.taskFor(commandOptions);
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    this.checkForSandstorm();

    var myself = this.project.addons.filter(function(a) {
      return a.name === 'ember-cli-vagrant-spk';
    })[0];

    myself.preBuild = this.preBuild;
    myself.postBuild = this.postBuild;

    return buildTask.run(commandOptions);
  },

  taskFor: function(options) {
    if (options.watch) {
      return this.tasks.BuildWatch;
    } else {
      return this.tasks.Build;
    }
  },

  checkForSandstorm: function() {
    try {
      fs.statSync(path.join(this.project.root, '/.sandstorm'));
    } catch(e) {
      throw("Missing .sandstorm directory; is this a sandstorm project?");
    }
  },

  postBuild: function() {
    console.log("Starting vagrant-spk...");

    var child = this.childProcess = spawn("vagrant-spk", ["dev"], {
      stdio: ['ignore', 'ignore', 'inherit']
    });

    child.on('exit', function(code) {
      if(this.restarting || this.childProcess) {
        console.log("vagrant-spk stopped.");
      } else {
        console.log("vagrant-spk died.");
      }
      this.restarting = false;
    }.bind(this));
  },

  preBuild: function() {
    if(this.childProcess) {
      console.log("Stopping existing vagrant-spk...");
      this.restarting = true;
      this.childProcess.kill('SIGTERM');
      this.childProcess = null;
    }
  }
});
