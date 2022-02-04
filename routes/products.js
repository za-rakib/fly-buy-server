const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

//image type
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
//upload image using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("image upload error");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("_");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });

// get all product
// router.get(`/`, async (req, res) => {
//   const productList = await Product.find();
//   if (!productList) {
//     res.status(500).json({
//       success: false,
//     });
//   }
//   res.send(productList);
// });

// get product
router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

// get some item
router.get(`/`, async (req, res) => {
  const productList = await Product.find().select("name price -_id");
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

//product post
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) res.status(400).send("The category is not found");
  const file = req.file;
  console.log("file", file);
  if (!file) res.status(400).send("There is no image");
  const fileName = req.file.filename;
  //http://localhost:5000/public/uploads/imageNme.jpg
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReview: req.body.numReview,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
  });
  product = await product.save();
  if (!product) {
    return res.status(500).send("Product not found");
  }
  res.send(product);
});

// product update
// router.put(`/:id`, async (req, res) => {
//   if (!mongoose.isValidObjectId(req.params.id)) {
//     res.status(404).send("Invalid product id");
//   }
//   const category = await Category.findById(req.body.category);
//   if (!category) res.status(400).send("The category is not found");

//   const product = await Product.findByIdAndUpdate(
//     req.params.id,
//     {
//       name: req.body.name,
//       description: req.body.description,
//       richDescription: req.body.richDescription,
//       image: req.body.image,
//       images: req.body.images,
//       brand: req.body.brand,
//       price: req.body.price,
//       category: req.body.category,
//       countInStock: req.body.countInStock,
//       rating: req.body.rating,
//       numReview: req.body.numReview,
//       isFeatured: req.body.isFeatured,
//       dateCreated: req.body.dateCreated,
//     },
//     { new: true }
//   );
//   if (!product) {
//     return res.status(400).send("The category cannot be updated");
//   }
//   res.status(200).send(product);
// });

router.put(`/:id`, (req, res) => {
  const category = Category.findById(req.body.category);
  if (!category) res.status(400).send("The category is not found");
  Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReview: req.body.numReview,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    },
    { new: true }
  )
    .then((updatedProduct) => {
      if (updatedProduct) {
        return res.status(200).send(updatedProduct);
      } else {
        return res
          .status(400)
          .json({ success: false, message: " product is not find" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ success: false, error: error });
    });
});

//delete product
router.delete(`/:id`, (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the  product is delete" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: " product is not find" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ success: false, error: error });
    });
});

// get total product number
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments({});
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

// get feature product
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const productCount = await Product.find({ isFeatured: true }).limit(+count);
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

module.exports = router;
