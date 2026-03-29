const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Portfolio = require('./models/Portfolio');
    const User = require('./models/User');
    
    const latest = await Portfolio.findOne().sort({ createdAt: -1 });
    console.log("Latest Profile Title:", latest.title);
    console.log("Image count:", latest.images.length);
    if(latest.images.length > 0) {
       console.log("Image 0 sample:", latest.images[0].substring(0, 50));
    }
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
