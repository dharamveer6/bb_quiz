const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dailyUpdatesSchema = new Schema({
    banner_image: {
        type: String,
    },
    scheduled_time: {
        type: Number,
    },
    headline: {
        type: String,
    },
    details: {
        type: String,
    }
});

const DailyUpdates = mongoose.model('DailyUpdates', dailyUpdatesSchema);

module.exports = {DailyUpdates};
