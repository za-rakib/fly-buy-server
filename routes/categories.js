const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

// data get
router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({
      success: false,
    });
  }
  // console.log("categoryList", categoryList);
  res.status(200).send(categoryList);
});

//  get by id
router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res
      .status(500)
      .json({ message: " The category with the given id is not found" });
  }
  res.status(200).send(category);
});

// data updated
router.put(`/:id`, async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );
  if(!category) {
      res.status(400).json({ message: "The category cannot be updated"})
  }
  res.status(200).send(category);
});

//   data post
router.post(`/`, async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) return res.status(404).send("The category can not be created");
  res.send(category);
});

// data delete
router.delete(`/:id`, async (req, res) => {
  //async await method
  // let deleteCategory = await Category.findByIdAndRemove(req.params.id);
  // res.send(deleteCategory);

  //then method
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "the category is delete" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "category is not find" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ success: false, error: error });
    });
});

module.exports = router;
