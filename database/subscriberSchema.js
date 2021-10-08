const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    }
});

const Subscriber = mongoose.model('subscribers',SubscriberSchema);

module.exports = Subscriber;