'use strict';

var async = require('async'),
  path = require('path'),
  _ = require('lodash'),
  Template = require('./src/template'),
  Loader = require('./src/load'),
  Writer = require('./src/write')

/*
  params:
    tplPath: rootFile for templates
    output: output dir
*/

function Cartapacio (tplPath, output, callback) {
  this.paths = {
    templatesRoot: tplPath,
    partials: path.join(tplPath, 'src', 'templates', 'partials'),
    layouts:  path.join(tplPath, 'src', 'templates', 'layouts'),
    output: output
  }

  this.callback = callback

  this.init()
}

Cartapacio.prototype.init = function() {
  this.templates = new Template()

  this.partials = new Loader(this.paths.partials)
  this.layouts = new Loader(this.paths.layouts)

  this.writer = new Writer(this.paths.output)

  this.loadNcompile()
};

Cartapacio.prototype.loadNcompile = function() {
  var self = this

  async.waterfall(
    [
      function (next){
        self.partials.read(function (err, data){
          if (err) {
            return next('Reading partials:' + err, null)
          }

          _.each(data, function (file){
            self.templates.registerPartial(file.name, file.content)
          })

          next(null)
        })
      },

      function (next){
        self.layouts.read(function (err, data){
          if (err) {
            return next('Reading layouts: ' + err, null)
          }

          next(null, data)
        })
      },

      function (files, next){
        self.templates.compile(files[0].content, function (err, tpl){
          if (err){
            return next('Compiling template: ' + err, null)
          }

          next(null, tpl)
        })
      }
    ],
    function (err, tpl){
      if (err){
        self.callback(err)
      }

      self.template = tpl
      self.callback(null)
    }
  )
}

Cartapacio.prototype.write = function(input, callback) {
  var self = this

  async.waterfall([
    function (next){
      self.templates.render(self.template, input, function (err, data){
        if (err) {
          return next('Rendering: ' + err, null)
        }
        next(null, data)
      })
    },
    function (data, next){
      self.writer.create(input.site.filename, data, function(err){
        if (err) {
          next(err, null)
        }
        next(null, 'File: ' + input.site.filename + ' written')
      })
      }
    ],
    function (err, result){
      if (err){
        callback(err, null)
      }
      callback(null, result)
    }
  )
};


module.exports = Cartapacio
