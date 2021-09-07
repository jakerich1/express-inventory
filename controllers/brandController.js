var Brand = require('../models/brand');
var Product = require('../models/product');
var async = require('async');
const { body,validationResult } = require('express-validator');
const brand = require('../models/brand');
const {decode} = require('html-entities');

exports.index = function(req, res) {
    res.render('index', { title: 'Express Inventory'});
};

// Display list of all brands.
exports.brand_list = function(req, res) {
    
    Brand.find()
    .exec(function (err, list_brand) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('brand-list', { title: 'All Brands', brands: list_brand });
    });

};

// Display detail page for a specific brand.
exports.brand_detail = function(req, res) {

    async.parallel({
        brand: function(callback) {
            Brand.findById(req.params.id)
              .exec(callback);
        },
        products: function(callback) {
            Product.find({ 'brand': req.params.id })
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.brand==null) { // No results.
            var err = new Error('Brand not found');
            err.status = 404;
            return next(err);
        }
       
        results.brand.decoded_url = decode(results.brand.web_url)
        // Successful, so render.
        res.render('brand-detail', { title: results.brand.name, brand: results.brand, products: results.products } );
    })

}

// Display brand create form on GET.
exports.brand_create_get = function(req, res, next) {
    res.render('brand-form', {title: 'Create new Brand'});
};

// Handle brand create on POST.
exports.brand_create_post = [
    
    // Validate and sanitize fields
    body('name', 'Brand name required').trim().isLength({ min: 1 }).escape(),
    body('weburl', 'Brand name required').trim().isLength({ min: 1 }).escape(),
    body('imgpath').trim().escape(),
    body('summary', 'Brand name required').trim().isLength({ min: 1 }).escape(),
    
    // Process request after validation
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a new brand object 
        var brand = new Brand(
            {
                name: req.body.name,
                web_url: req.body.weburl,
                img_path: req.body.imgpath,
                summary: req.body.summary
            }
        )
        
        // Render form with errors if present
        if(!errors.isEmpty()) {
            res.render('brand-form', { title: 'Create new Brand', brand: brand, errors: errors.array() });
            return;
        }else{
            // Data is valid
            // Check if brand already exists
            Brand.findOne({ 'name': req.body.name })
            .exec( function(err, found_brand) {
                if (err) { return next(err); }

                if (found_brand) {
                    res.redirect(found_brand.url);
                }
                else{
                    brand.save(function (err) {
                        if (err) { return next(err); }
                        res.redirect(brand.url);
                    });
                }
            })
        }

    }

]

// Display brand delete form on GET.
exports.brand_delete_get = function(req, res, next) {
    
    async.parallel({
        brand: function(callback) {
            Brand.findById(req.params.id).exec(callback)
        },
        products: function(callback) {
            Product.find({ 'brand': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.brand==null) { // No results.
            res.redirect('/catalog/brands');
        }
        // Successful, so render.
        res.render('brand-delete', { title: 'Delete Brand', brand: results.brand, products: results.products } );
    });

};

// Handle brand delete on POST.
exports.brand_delete_post = function(req, res, next) {
    
    async.parallel({
        brand: function(callback) {
          Brand.findById(req.body.brandid).exec(callback)
        },
        products: function(callback) {
          Product.find({ 'brand': req.body.brandid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.products.length > 0) {
            // Brand has products. Render in same way as for GET route.
            res.render('brand-delete', { title: 'Delete Brand', brand: results.brand, products: results.products } );
            return;
        }
        else {
            // Brand has no products. Delete object and redirect to the list of brands.
            Brand.findByIdAndRemove(req.body.brandid, function deleteBrand(err) {
                if (err) { return next(err); }
                // Success - go to brand list
                res.redirect('/catalog/brands')
            })
        }
    });

};

// Display brand update form on GET.
exports.brand_update_get = function(req, res, next) {
    
    Brand.findById(req.params.id)
    .exec(function (err, brand) {
      if (err) { return next(err); }
      if (brand==null) { // No results.
          var err = new Error('Brand not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      brand.decoded_url = decode(brand.web_url)
      res.render('brand-form', { title: 'Update Brand: '+brand.name, brand: brand});
    })

};

// Handle brand update on POST.
exports.brand_update_post = [

    // Validate and sanitize fields
    body('name', 'Brand name required').trim().isLength({ min: 1 }).escape(),
    body('weburl', 'Brand name required').trim().isLength({ min: 1 }).escape(),
    body('imgpath').trim().escape(),
    body('summary', 'Brand name required').trim().isLength({ min: 1 }).escape(),
    
    // Process request after validation
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a new brand object 
        var brand = new Brand(
            {
                name: req.body.name,
                web_url: req.body.weburl,
                img_path: req.body.imgpath,
                summary: req.body.summary,
                _id: req.params.id
            }
        )
        
        // Render form with errors if present
        if(!errors.isEmpty()) {
            res.render('brand-form', { title: 'Update Brand', brand: brand, errors: errors.array() });
            return;
        }else{
            // Data from form is valid. Update the brand.
            Brand.findByIdAndUpdate(req.params.id, brand, {}, function (err, thebrand) {
                if (err) { return next(err); }
                // Successful - redirect to category detail page.
                res.redirect(thebrand.url);
            });
        }
    }

]