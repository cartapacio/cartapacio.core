'use strict';

var fs = require('fs-extra'),
  path = require('path')

function Write (output) {
  this.output = output
}

Write.prototype.clean = function() {
  fs.removeSync(this.output)
}

Write.prototype.create = function(filename, content, callback) {
  var out = path.join(this.output, filename)

  fs.mkdirsSync(this.output)

  fs.writeFile(out, content, function (err){
    if (err){
      callback(err)
    }

    callback(null)
  })
};


module.exports = Write
