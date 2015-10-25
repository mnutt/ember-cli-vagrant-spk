# ember-cli-vagrant-spk

Sandstorm.io is an open source platform for building isolated web applications.

Sandstorm apps are often developed using a tool called `vagrant-spk`. Running the
`vagrant-spk dev` command will expose a development version of your application within
the Sandstorm platform. However, this makes rapid development with Ember.js somewhat
tedious, because changes you make from the host system are not populated into your
app running inside of Sandstorm. This addon starts `vagrant-spk dev`, and restarts it
any time changes are detected in your app.

## Requirements
* Get vagrant-spk:
```
git clone git://github.com/sandstorm-io/vagrant-spk.git
cp vagrant-spk /usr/local/bin/vagrant-spk               # or somewhere in your path
```
* Set up your project according to the docs at https://github.com/sandstorm-io/vagrant-spk


## Installation

`ember install ember-cli-vagrant-spk`

## Running

* `ember spk`
* Visit your app at http://local.sandstorm.io:6080/
