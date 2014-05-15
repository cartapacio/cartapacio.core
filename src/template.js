'use strict';

var handlebars = require('handlebars'),
  helpers = require('handlebars-helpers').register(handlebars, {}),
  chalk = require('chalk')

function Template () {
  // this.layouts = layouts
  // this.pages = pages
  // this.partial = partials
}

Template.prototype.compile = function(template, callback) {
  var tpl

  try {
    tpl = handlebars.compile(template)
  } catch (ex){
    callback(ex, null)
  }

  callback(null, tpl)
}

Template.prototype.render = function(template, data, callback) {
  var output

  try {
    output = template(data)
  } catch (ex){
    callback(ex, null)
  }

  callback(null, output)
}

Template.prototype.registerPartial = function(name, content) {
  try {
    handlebars.registerPartial(name, content)
  } catch (ex){
    console.log( chalk.red(ex) )
  }

}

module.exports = Template
