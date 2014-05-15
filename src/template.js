'use strict';

var handlebars = require('handlebars'),
  helpers = require('handlebars-helpers')

function Template (layouts, pages, partials) {
  this.layouts = layouts
  this.pages = pages
  this.partial = partials
}



module.exports = Template
