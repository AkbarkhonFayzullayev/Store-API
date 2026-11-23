const { createCustomError } = require("../errors/custom-error");
const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ price: { $gt: 30 } })
    .sort("price")
    .select("name price");

  return res.status(200).json({ nbHits: products.length, products });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`,
    );
    const options = ["price", "rating"];
    filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        if (!queryObject[field]) {
          queryObject[field] = {};
        }
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  let result = Product.find(queryObject);
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("-createdAt");
  }

  if (fields) {
    const fieldList = fields.split(",").join(" ");
    result = result.select(fieldList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const products = await result;
  return res.status(200).json({ nbHits: products.length, products });
};

const getProduct = async (req, res) => {
  const { id: productID } = req.params;
  const product = await Product.findById(productID);

  if (!product) {
    throw createCustomError(`no product with id: ${productID}`, 404);
  }
  return res.status(200).json({ product });
};

const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  return res.status(201).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productID } = req.params;
  const product = await Product.findByIdAndUpdate(productID, req.body, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!product) {
    throw createCustomError(`no product with id: ${productID}`, 404);
  }
  return res.status(200).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productID } = req.params;
  const product = await Product.findByIdAndDelete(productID);
  if (!product) {
    throw createCustomError(`no product with id: ${productID}`, 404);
  }
  return res.status(200).json({ product });
};

module.exports = {
  getAllProductsStatic,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
