const mongoose = require('mongoose');
const slug = require('slug');


const ProductSchema = new mongoose.Schema(
  {
    _id :{ type: mongoose.Schema.Types.ObjectId},
    name: { type: String, required: [true, "Name must not be emtpy"] },
    slug: { type: String, lowercase: true, unique: true, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    thumbImage: String,
    images: [{ type: String }],
    brand: { type: String, required: true },
  },
  { timestamps: true }
);



ProductSchema.pre('validate', function (next) {
    if (!this.slug) {
        this.slugify();
    }
    next();
});



ProductSchema.methods.slugify = function () {
    this.slug = slug(this.name) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};


ProductSchema.query.bySlug = function (slug) {
    return this.where({ slug: slug }).select("name price description slug -_id");
};

ProductSchema.virtual('reviews', {
  ref: 'Review', // Reference to the Review model
  localField: '_id', // Field in the Product model that holds the reference
  foreignField: 'product', // Field in the Review model that references the product
});

ProductSchema.set('toObject', { virtuals: true });
ProductSchema.set('toJSON', { virtuals: true });



const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;

