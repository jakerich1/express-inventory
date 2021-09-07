var express = require('express');
var router = express.Router();

// Require controller modules.
var brand_Controller = require('../controllers/brandController');
var product_Controller = require('../controllers/productController');
var category_Controller = require('../controllers/categoryController');

// GET catalog home page.
router.get('/', brand_Controller.index);

// Brand Routes //

// GET request for creating a brand. NOTE This must come before routes that display brand (uses id).
router.get('/brand/create', brand_Controller.brand_create_get);

// POST request for creating brand.
router.post('/brand/create', brand_Controller.brand_create_post);

// GET request to delete brand.
router.get('/brand/:id/delete', brand_Controller.brand_delete_get);

// POST request to delete brand.
router.post('/brand/:id/delete', brand_Controller.brand_delete_post);

// GET request to update brand.
router.get('/brand/:id/update', brand_Controller.brand_update_get);

// POST request to update brand.
router.post('/brand/:id/update', brand_Controller.brand_update_post);

// GET request for one brand.
router.get('/brand/:id', brand_Controller.brand_detail);

// GET request for list of all brand items.
router.get('/brands', brand_Controller.brand_list);

// Product Routes //

// GET request for creating a product. NOTE This must come before routes that display product (uses id).
router.get('/product/create', product_Controller.products_create_get);

// POST request for creating product.
router.post('/product/create', product_Controller.products_create_post);

// GET request to delete product.
router.get('/product/:id/delete', product_Controller.products_delete_get);

// POST request to delete product.
router.post('/product/:id/delete', product_Controller.products_delete_post);

// GET request to update product.
router.get('/product/:id/update', product_Controller.products_update_get);

// POST request to update product.
router.post('/product/:id/update', product_Controller.products_update_post);

// GET request for one product.
router.get('/product/:id', product_Controller.products_detail);

// GET request for list of all product items.
router.get('/products', product_Controller.products_list);

// category Routes //

// GET request for creating a category. NOTE This must come before routes that display category (uses id).
router.get('/category/create', category_Controller.category_create_get);

// POST request for creating category.
router.post('/category/create', category_Controller.category_create_post);

// GET request to delete category.
router.get('/category/:id/delete', category_Controller.category_delete_get);

// POST request to delete category.
router.post('/category/:id/delete', category_Controller.category_delete_post);

// GET request to update category.
router.get('/category/:id/update', category_Controller.category_update_get);

// POST request to update category.
router.post('/category/:id/update', category_Controller.category_update_post);

// GET request for one category.
router.get('/category/:id', category_Controller.category_detail);

// GET request for list of all category items.
router.get('/categories', category_Controller.category_list);

module.exports = router;
