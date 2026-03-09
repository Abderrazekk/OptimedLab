// fixProductImages.js
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const products = await Product.find({ images: { $exists: true, $ne: [] } });
  let updated = 0;
  for (let product of products) {
    if (product.images && product.images.length > 0) {
      const newImages = product.images.map(img => {
        // Extract filename from absolute path
        const parts = img.split(/[\\/]/);
        const filename = parts[parts.length - 1];
        return 'uploads/products/' + filename;
      });
      product.images = newImages;
      await product.save();
      updated++;
      console.log(`Updated product: ${product.name}`);
    }
  }
  console.log(`Updated ${updated} products.`);
  mongoose.disconnect();
}).catch(err => console.error(err));