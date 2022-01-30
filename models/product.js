const mongoose = require("mongoose");
// require("./category");
const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
      default: "",
    },
  ],
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: String,
    default: "",
  },
  category:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 250,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReview: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: new Date(),
  },
});

productSchema.virtual('id').get(function(){
    return this._id.toHexString();
})

productSchema.set('toJSON', {
    virtuals: true,
})
exports.Product = mongoose.model("product", productSchema);
