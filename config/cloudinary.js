
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true // Use HTTPS URLs
});

// console.log("Cloud Name:", cloudinary.config().cloud_name);
// console.log("API Key:", cloudinary.config().api_key);
// // Do NOT log your secret, just check if it exists:
// console.log("Is Secret Loaded?:", !!cloudinary.config().api_secret); 


module.exports = cloudinary;