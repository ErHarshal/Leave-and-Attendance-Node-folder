const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Register = new Schema({
    first_name: {
        type: String,
        required:true
    },
    last_name: {
        type: String,
        //required:true
    },
    empid: {
        type: String,
        //required:true
    },
    email: {
        type:String,
        //required:true
    },
    password:{
        type:String,
        //required:true
    },
    gender:{
        type:String,
        //required:true
    }
});

module.exports = mongoose.model('Register', Register);