var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        price: {type: Number, required: true, maxLength: 100},
        img_path: {type: String, required: false, minlength: 1},
        description: {type: String, required: true, minlength: 1},
        brand: {type: Schema.Types.ObjectId, ref: 'Brand', required: true},
        category: {type: Schema.Types.ObjectId, ref: 'Category'}
    }
);

// Virtual for author's URL
ProductSchema
.virtual('url')
.get(function () {
  return '/catalog/product/' + this._id;
});

//Export model
module.exports = mongoose.model('Product', ProductSchema);