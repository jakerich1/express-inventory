var Brand = require('../models/brand');
var Category = require('../models/category');
var Product = require('../models/product');

var async = require('async');
const { body,validationResult } = require('express-validator');


// Display list of all products.
exports.products_list = function(req, res) {
    Product.find()
    .populate('brand')
    .exec(function (err, list_products) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('product-list', { title: 'All Products', products: list_products });
    });
};

// Display detail page for a specific products.
exports.products_detail = function(req, res) {
    
    Product.findById(req.params.id)
    .populate('brand')
    .populate('category')
    .exec(function (err, product_result) {
      if (err) { return next(err); }
      if (product_result==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('product-detail', { title: product_result.name, product: product_result});
    })

};

// Display products create form on GET.
exports.products_create_get = function(req, res, next) {
    
    // Get all brands and categories, which we can use for adding to product.
    async.parallel({
        brands: function(callback) {
            Brand.find(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('product-form', { title: 'Create Product', categories: results.categories, brands: results.brands });
    });

};

// Handle products create on POST.
exports.products_create_post = [

    // Validation 
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('brand', 'You must select a brand.').trim().isLength({ min: 1 }).escape(),
    body('category', 'You must select a category.').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var product = new Product(
            { 
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                brand: req.body.brand,
                category: req.body.category,
                img_path: req.body.imgurl
            }
        );

        if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors and genres for form.
        async.parallel({
            brands: function(callback) {
                Brand.find(callback);
            },
            categories: function(callback) {
                Category.find(callback);
            },
        }, function(err, results) {
                if (err) { return next(err); }
                res.render('product-form', { title: 'Create Product', brands: results.brands, categories: results.categories, product: product, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save product.
            product.save(function (err) {
                if (err) { return next(err); }
                    //successful - redirect to new product record.
                    res.redirect(product.url);
                });
            }
        }

]

// Display products delete form on GET.
exports.products_delete_get = function(req, res, next) {

    Product.findById(req.params.id)
    .populate('brand')
    .populate('category')
    .exec(function (err, productinstance) {
      if (err) { return next(err); }
      if (productinstance==null) { // No results.
          var err = new Error('Product not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('product-delete', { title: 'Delete product: '+productinstance.name, product:  productinstance});
    })

};

// Handle products delete on POST.
exports.products_delete_post = function(req, res, next) {
    
    Product.findByIdAndRemove(req.body.productid, function deleteproduct(err) {
        if (err) { return next(err); }
        // Success - go to author list
        res.redirect('/catalog/products')
    })

};

// Display products update form on GET.
exports.products_update_get = function(req, res, next) {
    
    async.parallel({
        product: function(callback) {
            Product.findById(req.params.id).populate('brand').populate('category').exec(callback);
        },
        brands: function(callback) {
            Brand.find(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.product==null) { // No results.
                var err = new Error('Product not found');
                err.status = 404;
                return next(err);
            }

            res.render('product-form', { title: 'Update Product', product: results.product, brands: results.brands, categories: results.categories });
        });

};

// Handle products update on POST.
exports.products_update_post = [

    // Validation 
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('brand', 'You must select a brand.').trim().isLength({ min: 1 }).escape(),
    body('category', 'You must select a category.').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var product = new Product(
            { 
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                brand: req.body.brand,
                category: req.body.category,
                img_path: req.body.imgurl,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {

            async.parallel({
                brands: function(callback) {
                    Brand.find(callback);
                },
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                    if (err) { return next(err); }
                    res.render('product-form', { title: 'Update Product', brands: results.brands, categories: results.categories, product: product, errors: errors.array() });
                });
            return;

        }
        else{
            // Data from form is valid. Update the product.
            Product.findByIdAndUpdate(req.params.id, product, {}, function (err, theproduct) {
                if (err) { return next(err); }
                // Successful - redirect to category detail page.
                res.redirect(theproduct.url);
            });
        }
    
    }

]