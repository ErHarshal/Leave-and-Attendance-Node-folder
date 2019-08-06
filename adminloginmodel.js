const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let AdminLogin = new Schema({
    empid: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    }
});

module.exports = mongoose.model('AdminLogin', AdminLogin);