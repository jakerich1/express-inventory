var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BrandSchema = new Schema(
  {
    name: {type: String, required: true, maxLength: 100},
    web_url: {type: String, required: true, maxLength: 100},
    img_path: {type: String, required: false, minlength: 1},
    summary: {type: String, required: true, minlength: 1},
  }
);

// Virtual for author's URL
BrandSchema
.virtual('url')
.get(function () {
  return '/catalog/brand/' + this._id;
});

//Export model
module.exports = mongoose.model('Brand', BrandSchema);