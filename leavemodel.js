const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let Leave = new Schema({
    toDate: {
        type: Date,
        required:true
    },
    fromDate: {
        type: Date,
        required:true
    },
    typeOfLeave: {
        type: String,
        required:true
    },
    reason: {
        type: String,
        required:true
    },
    username: {
        type: String,
        required:true
    },
    leavestatus: {
        type: String,
        default:"pending"
    }
});

module.exports = mongoose.model('Leave', Leave);