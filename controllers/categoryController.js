var Category = require('../models/category');
var Product = require('../models/product');
var async = require('async');
const { body,validationResult } = require('express-validator');


// Display list of all categories.
exports.category_list = function(req, res) {
    
    Category.find()
    .exec(function (err, list_categories) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('category-list', { title: 'All Categories', categories: list_categories });
    });

};

// Display detail page for a specific category.
exports.category_detail = function(req, res, next) {
    
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },
        products: function(callback) {
            Product.find({ 'category': req.params.id })
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
       
        // Successful, so render.
        res.render('category-detail', { title: results.category.name, category: results.category, products: results.products } );
    })

};

// Display category create form on GET.
exports.category_create_get = function(req, res, next) {
    res.render('category-form', { title: 'Create Category'});
};

// Handle category create on POST.
exports.category_create_post = [
    
    // Validate and sanitize fields
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
    
    // Process request after validation
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a new category object 
        var category = new Category(
            {
                name: req.body.name
            }
        )
        
        // Render form with errors if present
        if(!errors.isEmpty()) {
            res.render('category-form', { title: 'Create new Category', category: category, errors: errors.array() });
            return;
        }else{
            // Data is valid
            // Check if brand already exists
            Category.findOne({ 'name': req.body.name })
            .exec( function(err, found_category) {
                if (err) { return next(err); }

                if (found_category) {
                    res.redirect(found_category.url);
                }
                else{
                    category.save(function (err) {
                        if (err) { return next(err); }
                        res.redirect(category.url);
                    });
                }
            })
        }

    }

]

// Display category delete form on GET.
exports.category_delete_get = function(req, res, next) {
    
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        products: function(callback) {
            Product.find({ 'category': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            res.redirect('/catalog/categories');
        }
        // Successful, so render.
        res.render('category-delete', { title: 'Delete Category', category: results.category, products: results.products } );
    });

};

// Handle category delete on POST.
exports.category_delete_post = function(req, res, next) {
    
    async.parallel({
        category: function(callback) {
          Category.findById(req.body.categoryid).exec(callback)
        },
        products: function(callback) {
          Product.find({ 'brand': req.body.categoryid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.products.length > 0) {
            // Category has products. Render in same way as for GET route.
            res.render('category-delete', { title: 'Delete Category', category: results.category, products: results.products } );
            return;
        }
        else {
            // Category has no products. Delete object and redirect to the list of categories.
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err); }
                // Success - go to brand list
                res.redirect('/catalog/categories')
            })
        }
    });

};

// Display category update form on GET.
exports.category_update_get = function(req, res, next) {

    Category.findById(req.params.id)
    .exec(function (err, category) {
      if (err) { return next(err); }
      if (category==null) { // No results.
          var err = new Error('Category not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('category-form', { title: 'Update Category: '+category.name, category: category});
    })

};

// Handle category update on POST.
exports.category_update_post = [

    // Validate and sanitize fields
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
    
    // Process request after validation
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a new category object 
        var category = new Category(
            {
                name: req.body.name,
                _id: req.params.id
            }
        )

        // Check validation results
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('category-form', { title: 'Update Category:', category: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the category.
            Category.findByIdAndUpdate(req.params.id, category, {}, function (err, thecategory) {
                if (err) { return next(err); }
                // Successful - redirect to category detail page.
                res.redirect(thecategory.url);
            });
        }    
    }

]