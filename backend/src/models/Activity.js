const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: false,
    enum: ['sports_loisirs', 'culture_musees', 'nature_plein_air', 'activites_aquatiques']
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  distance: String,
  price: String,
  rating: {
    type: Number,
    default: 0
  },
  phone: String,
  website: String,
  openingHours: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', ActivitySchema);
