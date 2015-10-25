'use strict';
var Command = require('ember-cli/lib/models/command');
var path    = require('path');
var spawn   = require('child_process').spawn;
var exec    = require('child_process').exec;
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

    myself.preBuild = this.preBuild.bind(this);
    myself.postBuild = this.postBuild.bind(this);
    process.on('exit', this.killChildren.bind(this));

    return buildTask.run(commandOptions);
  },

  taskFor: function(options) {
    if (options.watch) {
      return this.tasks.BuildWatch;
    } else {
      return this.tasks.Build;
    }
  },

  sandstormPath: function() {
    return path.join(this.project.root, '/.sandstorm');
  },

  checkForSandstorm: function() {
    try {
      fs.statSync(this.sandstormPath());
    } catch(e) {
      throw("Missing .sandstorm directory; is this a sandstorm project?");
    }
  },

  postBuild: function() {
    console.log("Starting vagrant-spk...");

    var child = this.childProcess = spawn("vagrant-spk", ["dev"], {
      stdio: ['ignore', 'ignore', 'inherit']
    });
  },

  preBuild: function() {
    if(this.childProcess) {
      return this.killChildren();
    }
  },

  killChildren: function() {
    return new Promise(function(resolve, reject) {
      var cmd = "vagrant ssh -c 'while killall -INT spk &> /dev/null;do sleep 0.1;done'";
      exec(cmd, { cwd: this.sandstormPath() }, function(err, stdout, stderr) {
        this.childProcess = null;
        if(err) { console.error(err); }
        resolve();
      }.bind(this));
    }.bind(this));
  }
});
