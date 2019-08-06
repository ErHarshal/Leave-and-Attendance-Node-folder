const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

let UserLogin = new Schema({
    empId: {
        type: Number,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required:true
    },
    firstName: {
        type: String,
        required:true
    },
    LastName: {
        type: String,
        required:true
    },
    username: {
        type: String,
        required:true,
        unique:true
    },
    Gender: {
        type: String,
        required:true
    },
    EarnedLeave: {
        type: Number,
        default:0
    },
    CasualLeave:{
        type:Number,
        default:5
    },
    MarrigeLeave:{
        type:Number,
        default:1
    },
    tokens: [
        {
          token: {
            type: String,
            required: true
          }
        }
      ]
});


UserLogin.methods.generateAuthToken = async function() {
      const emp = this;
      const token = jwt.sign({ _id: emp._id.toString() }, 'thisismynewcourse');
    
      emp.tokens = emp.tokens.concat({ token });
      await emp.save();
    
      return token;
    };

module.exports = mongoose.model('UserLogin', UserLogin);