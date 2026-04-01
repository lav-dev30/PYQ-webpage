const { hash } = require('bcrypt');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {type: String,},
    email: {type: String},
    password: {type: String}
})

const admin = mongoose.model("Admins", adminSchema);
module.exports =admin;