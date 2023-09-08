const response = require("../util/response");
const doesNotExist = require("../util/doesNotEsist");
const Product = require("../model/Product");
const asyncHandler = require("express-async-handler");
const success = require("../helpers/success");
const failure = require("../helpers/failed");
const Order = require("../model/Order");
const Cart = require("../model/Cart");

class ProductController {
  

async index(req, res) {
  try {
    let data;
    const query = {};

    /////////////////////////////////// filtering

    if (req.query.hasOwnProperty('price')) {
      const price = parseFloat(req.query.price);
      if (!isNaN(price)) {
        if (req.query.hasOwnProperty('priceRange')) {
          if (req.query.priceRange === 'gt') {
            query.price = { $gt: price };
          } else if (req.query.priceRange === 'lt') {
            query.price = { $lt: price };
          }
        } else {
          // If 'priceRange' is not specified, default to '$gt'
          query.price = { $gt: price };
        }
      }
    }

    if (req.query.hasOwnProperty('stock')) {
      const stock = parseFloat(req.query.stock);
      if (!isNaN(stock)) {
        if (req.query.hasOwnProperty('stockRange')) {
          if (req.query.stockRange === 'gt') {
            query.stock = { $gt: stock };
          } else if (req.query.stockRange === 'lt') {
            query.stock = { $lt: stock };
          }
        } else {
          query.stock = { $gt: stock };
        }
      }
    }

    if (req.query.hasOwnProperty('search')) {
      const searchRegex = new RegExp(req.query.search, 'i'); // Case-insensitive regex search
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    if (req.query.hasOwnProperty('brand')) {
      const brandValues = req.query.brand.split(',').map((value) => value.trim());
      query.brand = { $in: brandValues };
    }

    // Validate page and page_size as numbers
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 5;
    const validatedPageSize = pageSize > 30 ? 5 : pageSize;
    const skipCount = (page - 1) * validatedPageSize;

    // Create a Mongoose query with sorting based on both price and stock
    const mongooseQuery = Product.find(query, "-tags -comments -categories -images -slug -__v -createdAt -updatedAt")
      .skip(skipCount)
      .limit(validatedPageSize);


    /////////////////////// sorting part

    if (req.query.hasOwnProperty('priceSort')) {
      const priceSortDirection = req.query.priceSort === 'asc' ? 1 : req.query.priceSort === 'dsc' ? -1 : 0;
      if (priceSortDirection !== 0) {
        mongooseQuery.sort({ price: priceSortDirection });
      }
    }


    if (req.query.hasOwnProperty('stockSort')) {
      const stockSortDirection = req.query.stockSort === 'asc' ? 1 : req.query.stockSort === 'dsc' ? -1 : 0;
      if (stockSortDirection !== 0) {
        mongooseQuery.sort({ stock: stockSortDirection });
      }
    }

    if (req.query.hasOwnProperty('brandSort')) {
      const brandSortDirection = req.query.brandSort === 'asc' ? 1 : req.query.brandSort === 'dsc' ? -1 : 0;
      if (brandSortDirection !== 0) {
        mongooseQuery.sort({ brand: brandSortDirection });
      }
    }

    // Execute the query
    data = await mongooseQuery.exec();

    const totalCount = await Product.countDocuments(query);
    const currentPageCount = data.length; // Count of products on the current page

    const response = {
      totalProducts: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / validatedPageSize),
      pageSize: validatedPageSize,
      currentPageCount: currentPageCount, // Count of products on the current page
      products: data,
    };

    if (data.length > 0) {
      return res.status(200).json(success("Data Has Found", response));
    } else {
      return res.status(404).json(failure("Data Does not found"));
    }
  } catch (error) {
    return res.status(500).json(failure("Internal Server Error"));
  }
}


  async show(req, res) {
    try {
      const { id } = req.params;
      const data = await Product.findById(id).select(
        "-_id"
      );
      if (data) {
        return res.status(200).json(success("Data Has Found", data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async store(req, res) {
    try {
      const{name,price,description,stock,brand} = req.body;
      const { thumbImage, images } = req.files;
      
      let imagesPathArray = [];
      let thumbImagePathArray = [];
      if (images) {
        imagesPathArray = images.map((image) => image.path.replace(/\\/g, "/"));
      }
      if (thumbImage) {
        thumbImagePathArray = thumbImage.map((image) =>
          image.path.replace(/\\/g, "/")
        );
      }
    

      const product = await new Product();
      product.name = name;
      product.price = price;
      product.description = description;
      product.stock = stock;
      product.brand = brand;

      if (thumbImagePathArray.length>0){
        product.thumbImage = thumbImagePathArray[0];
      } 
      if (imagesPathArray.length > 0){
        product.images = imagesPathArray;
      } 

      const savedProduct = await product.save();
      
      res.status(200).json(success("product save successfully",savedProduct));
    } catch (err) {
      res.status(500).json(failure("Internal server error"));
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;


      const { name, price, description, stock } = req.body;
      const { thumbImage, images } = req.files;
      const updatedData = {
        name,
        price,
        description,
        stock,
        images: [],
        thumbImage:"",
      };

      let imagesPathArray = [];
      let thumbImagePathArray = [];
      if (images) {
        imagesPathArray = images.map((image) => image.path.replace(/\\/g, "/"));
        updatedData.images = imagesPathArray;
      }
      if (thumbImage) {
        thumbImagePathArray = thumbImage.map((image) =>
          image.path.replace(/\\/g, "/")
        );
        updatedData.thumbImage = thumbImagePathArray[0];
      }

      console.log(updatedData);

      const data = await Product.findOneAndUpdate({ _id: id }, updatedData, {
        new: true,
      });

      console.log(data);

      if(data){
        return res.status(200).json(success("Data Has been Updated successfully", data));
      }else{
        return res
          .status(404)
          .json(failure("Data Has Not Found"));
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(failure("Internal Server Error"));
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      
      const data = await Product.findOneAndDelete({ _id:id });
      console.log(data)
      if (data) {
        res.status(200).json(success("Data has been deleted"));
      } else {
        res.status(404).json(failure("No data found to delete"));
      }
    } catch (err) {
      res.status(500).json(failure("Internal Server Error"));
    }
  }

  show_order = asyncHandler(async (req, res) => {
    try {
      console.log("give me the order");
      const data = await Order.find().findPopulatedData();
      const filteredData = data.filter((order) => {
        return order.orderItems.product !== null;
      });

      if (data.length > 0) {
        res.status(200).json(
          success("Data Has been Found", {
            data: filteredData,
          })
        );
      } else {
        res.status(400).json(error("No data found"));
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json(error("Internal Server Error"));
    }
  });


  async checkout(req,res){
    try {

      const user = req.id;
      const cart = await Cart.findOne({ user: req.id, checkout:false }).populate('orderItems.productId');
      let eArr = [];
      

      if(cart){
       
        
          for (const element of cart.orderItems) {
            let product = await Product.findOne({ _id: element.productId._id });
    
            if (product.stock >= element.quantity) {
              product.stock -= element.quantity;

              // updating product stock by deducting them
              await Product.findByIdAndUpdate(product._id, { $set: { stock: product.stock } });
            } else {
              
              /// if stock is less then push it into error array
              eArr.push(`${product.name} stock is less`);
            }
          }


        //// check out all product to order collection
        if (eArr.length === 0) {

          // Create a new checkout Order document
          const newOrder = new Order({
            user: cart.user,
            orderItems: cart.orderItems,
            total_bill: cart.total_bill,
          });
        
          // Save the new order
          await newOrder.save();
        
          // Update the cart to mark it as checked out
          cart.checkout = true;
          await Cart.findByIdAndUpdate(cart._id, { $set: { checkout: true } });
        
          return res.status(200).json(success("Order placed successfully", newOrder));
        } else {
          // Handle cases where there are errors in eArr
          return res.status(400).json(failure("Insufficient stock for some products", eArr));
        }

      }else{
        return res.status(404).json(failure("Data Doesnot Found"));
      }


    } catch (error) {
      return res.status(500).json(failure("Internal server Error"));
    }
  }


  async cart(req, res){
    try {

      const user = req.id;
      const { itemId, quantity } = req.body;

      

      ///checking cart and product
      const cart = await Cart.findOne({ user: req.id , checkout:false });
      const item = await Product.findOne({ _id: itemId });

      console.log("Item Found",item);
  
      if (!item) {
        return res.status(404).json(failure("No Product Found"));
      }

      const price = item.price;

      //If cart already exists for user,
      if (cart) {


        /// find if item is already exist or not
        const itemIndex = cart.orderItems.findIndex((items) => items.productId == itemId);
        
        //if exist
        if (itemIndex > -1) {

          
          /// product exist and get the product
          let product = cart.orderItems[itemIndex];


          /// checking the stock part
          if(item.stock < (product.quantity + quantity)){
            return res.status(404).json(failure("Stock exceed"));
          }
        

          /// add quantity
          product.quantity += quantity;

  
          /// total bill
          cart.total_bill += (item.price*quantity)

          
          /// add updated item in cart
          cart.orderItems[itemIndex] = product;


          /// save data
          await cart.save();
          return res.status(201).json(success("product added to cart",cart));
        } else {

          //// if no data exist in cart the push the new one

          cart.orderItems.push({ productId:itemId, quantity });
          cart.total_bill += (item.price*quantity) 

          await cart.save();
          return res.status(201).json(success("product added to cart",cart));
        }
      } else {

        // No cart exists, create one
        const newCart = await Cart.create({
          user,
          orderItems: [{ productId:itemId, quantity}],
          total_bill: quantity * price,
        });
        return res.status(201).json(success("product added to cart",newCart));
        
      }
    } catch (error) {
      return res.status(500).json(failure("Internal server Error"));
    }
  }


  async cart_remove(req,res){
    
    try {

      const user = req.id;
      
      const { itemId, quantity } = req.body;

      /// check the quantity
      if(quantity <= 0 ){
        return res.status(404).json(failure("Quantity should be valid"));
      }


      /// check cart and item
      const cart = await Cart.findOne({ user: req.id ,checkout:false });
      const item = await Product.findOne({ _id: itemId });

  
      if (!item) {
        return res.status(404).json(failure("No Product Found"));
      }

      // const price = item.price;
     

      //If cart already exists for user,
      if (cart) {


        const itemIndex = cart.orderItems.findIndex((items) => items.productId == itemId);
        
        //check if product exists or not
  
        if (itemIndex > -1) {

          
          /// product exist and get the product
          let product = cart.orderItems[itemIndex];



          /// check the quantity
          if(product.quantity < quantity){
            return res.status(404).json(failure("Quantity exceed"));
          }

        
          /// add quantity
          product.quantity -= quantity;


  
          /// deducted bill
          cart.total_bill -= (item.price*quantity)


          /// add updated item in orderItems
          if (product.quantity === 0) {
            cart.orderItems.splice(itemIndex, 1);
          } else {
            // Otherwise, update the item in orderItems
            cart.orderItems[itemIndex] = product;
          }
          


          // Check if cart.orderItems is empty
        if (cart.orderItems.length === 0) {
          // If it's empty, delete the cart
          await Cart.findByIdAndDelete(cart._id);
          return res.status(200).json(success("Cart is empty and has been deleted."));
        } else {
          // Save data
          await cart.save();
          return res.status(201).json(success("Product removed from cart", cart));
        }
          
        } else {

          return res.status(404).json(failure("No Item exist"));
        }
      } else {
        //no cart exists,
        return res.status(404).json(failure("No cart Exist"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal server Error"));
    }
  }


  
}

module.exports = new ProductController();


// check the stock
        // if(item.stock < quantity){
        //   return res.status(404).json(failure("Stock exceed"));
        // }