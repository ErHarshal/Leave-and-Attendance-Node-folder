const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let Attendance = new Schema({
    attendate: {
        type: Date,
        required:true
    },
    inTime: {
        type: String,
        required:true
    },
    outTime: {
        type: String,
        required:true
    },
    workingHours: {
        type: Number,
        required:true
    },
    username: {
        type: String,
        required:true
    }
});

module.exports = mongoose.model('Attendance', Attendance);