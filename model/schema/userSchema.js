const Mongoose = require("mongoose")
const UserSchema = new Mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    index:true,
  },
  email:{
    type:String,
    unique:true,
    required:true,
    index:true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  }
});
const User = Mongoose.model("userSchema", UserSchema)
module.exports = User; 