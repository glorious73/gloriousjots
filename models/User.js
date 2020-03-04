/*----- This file is for the User schema in MongoDB -----*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema for user
const UserSchema = new Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
// create a model for the user's schema
mongoose.model('users', UserSchema);
