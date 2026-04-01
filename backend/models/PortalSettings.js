const mongoose = require('mongoose');

const portalSettingsSchema = new mongoose.Schema({
    carouselImages: [{
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: String }
    }],
    logo: {
        type: String,
        default: ''
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure only one document exists
portalSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            maintenanceMode: false,
            logo: '',
            carouselImages: [] // Empty defaults will fallback to default pic1..4 in frontend
        });
    }
    return settings;
};

module.exports = mongoose.model('PortalSettings', portalSettingsSchema);
