'use strict';

var async = require('async'),
  path = require('path'),
  _ = require('lodash'),
  Template = require('cartapacio.core.template'),
  Writer = require('cartapacio.core.writer'),
  Amass = require('cartapacio.core.amass')

// /*
//   params:
//     tplPath: rootFile for templates
//     output: output dir
// */

function Cartapacio (database, tplPath, output, toBuild) {

  this.templatesRoot = tplPath
  this.outputFolder = output
  this.dbPath = database
  this.toBuild = toBuild

}

Cartapacio.prototype.init = function(callbackInit) {
  this.database = new Amass(this.dbPath)
  this.templates = new Template(this.templatesRoot)
  this.writer = new Writer(this.outputFolder)

  this.templates.load(function (err){
    if(err){
      throw new Error(err)
      callbackInit(err)
    }
    callbackInit(null)
  })

};

Cartapacio.prototype.buildWebsite = function() {
  var self = this

  async.waterfall([
    function (next){
      self.init(function (err){
        if(!err){
          next(null)
        }
      })
    },
    function (next){
      async.eachSeries(self.toBuild, function (item, itemDone){
        console.info('building ', item)

        async.waterfall([
            function (_next){
              self.getData(item.detail, function (docs){
                console.info('get data ', item.detail)
                _next(null, docs)
              })
            },
            function (docs, _next){
              if(item.list){
                var itemList = self.makeList(docs, 'default', item.list)
                self.render(itemList, function (err){
                  _next(null, docs)
                })
              }
            },
            function (docs, _next){
              console.info('render ', item.detail);
              self.render(docs, function (err){
                _next(err)
              })
            }
          ],
          function (err){
            if(err){
              console.error(err);
            }
            console.info('done ', item.detail);
            itemDone(null)
          }
        )
      }, function (err){
        if(err){
          throw new Error('building array: ', err)
        }
        console.info('build tasks done');
        next(null)
      })

    }
    ],
    function (err){
      if(err){
        throw new Error('build website: ', err)
      }
      console.log('all done');
    }
  )
};

Cartapacio.prototype.getData = function(doctype, callback) {
  this.database.documents(doctype, function (err, docs){
    if(err){
      throw new Error(err)
    }
    callback(docs)
  })
};

Cartapacio.prototype.render = function(docs, renderDone) {
  var self = this
  async.each(docs, function (doc, nextDoc){
    self.templates.render(doc, function (err, html){
      var _path = self.makePath(doc)
      self.writer.write(_path, html, function (err){
        nextDoc(err)
      })
    })
  }, function (err){
    if(err){
      console.error(err)
    }
    renderDone(null)
  })
};

Cartapacio.prototype.makeList = function(docs, layout, page) {
  var doc = [{
    layout: layout,
    page: page,
    document: docs
  }]

  return doc
};

Cartapacio.prototype.makePath = function(doc) {
  if(doc.slug){
    return doc.page+'/'+doc.slug+'/index.html'
  } else {
    return doc.page+'/index.html'
  }
};

module.exports = Cartapacio
