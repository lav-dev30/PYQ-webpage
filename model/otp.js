const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email:String,
    otp:String,
    expiresAt:Date,
});

otpSchema.index({expiresAt:1},
    {expireAfterSeconds: 300});


const otp = mongoose.model("OTP", otpSchema);

module.exports = otp;