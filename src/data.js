'use strict';

var Datastore = require('nedb'),
  _ = require('lodash'),
  slug = require('slug')


function Data (dbPath) {
  this.db = new Datastore({ filename: dbPath, autoload: true })
}

Data.prototype.find = function(type, callback) {
  var self = this
  this.db.find({ doctype: type }, function (err, docs) {
    self.build(docs, callback)
  });
}

Data.prototype.build = function(docs, callback) {
  var output = {
    site: {
      title: 'cartapacio test',
      subtitle: 'a portfolio bla ...',
      sidebar: {
        menu:[]
      }
    },
    documents:[]
  }
  _.each(docs, function (doc){
    var type = doc.doctype
    var title = doc.title
    var titleSlug = slug(title).toLowerCase()

    //sidebar
    output.site.sidebar.menu.push({
      title: title,
      slug: titleSlug,
      type: type
    })

    //documents
    output.documents.push({
      filename: titleSlug,
      title: title,
      body: {
        description: doc.description,
        date: doc.date,
        links: doc.links,
        images: doc.images,
        videos: doc.videos
      }
    })
  })

  //console.log(JSON.stringify(output, null, 2))
  callback(output)
};


module.exports = Data
