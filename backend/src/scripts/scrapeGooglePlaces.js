const axios = require('axios');
const Activity = require('../models/Activity');
const connectDB = require('../config/database');

const GOOGLE_API_KEY = 'AIzaSyCQ8qmTDRJ92c_drsyHRir0bC03iGIJlYc';

const MONTPELLIER_LOCATION = {
 lat: 43.610769,
 lng: 3.876716
};

const PLACE_TYPES = [
 'tourist_attraction',
 'park',
 'museum',
 'amusement_park',
 'aquarium',
 'art_gallery',
 'stadium',
 'zoo'
];

const determineType = (types, name) => {
 const typeMap = {
   sports_loisirs: ['stadium', 'gym', 'sports_complex', 'amusement_park', 'tourist_attraction'],
   culture_musees: ['museum', 'art_gallery', 'library', 'church'],
   nature_plein_air: ['park', 'zoo', 'natural_feature', 'campground'],
   activites_aquatiques: ['aquarium', 'swimming_pool', 'water_park']
 };

 const excludedTypes = ['pharmacy', 'travel_agency', 'hair_care', 'lodging', 'store', 'health', 'real_estate_agency', 'general_contractor', 'local_government_office', 'finance', 'food'];

 const nameLower = name.toLowerCase();
 if (nameLower.includes('escape') || nameLower.includes('trampoline') || nameLower.includes('stade')) {
   return 'sports_loisirs';
 }
 if (nameLower.includes('musée') || nameLower.includes('galerie') || nameLower.includes('historique') || nameLower.includes('fabre')) {
   return 'culture_musees';
 }
 if (nameLower.includes('parc') || nameLower.includes('jardin') || nameLower.includes('zoo') || nameLower.includes('réserve') || nameLower.includes('nature')) {
   return 'nature_plein_air';
 }
 if (nameLower.includes('piscine') || nameLower.includes('aquatique') || nameLower.includes('plage') || nameLower.includes('mer')) {
   return 'activites_aquatiques';
 }

 if (types.some(type => excludedTypes.includes(type))) {
   return null;
 }

 for (const [category, keywords] of Object.entries(typeMap)) {
   if (types.some(type => keywords.includes(type))) {
     return category;
   }
 }

 console.log(`Aucune catégorie trouvée pour: ${name} (types: ${types.join(', ')})`);
 return null;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
 const R = 6371;
 const dLat = (lat2 - lat1) * Math.PI / 180;
 const dLon = (lon2 - lon1) * Math.PI / 180;
 const a =
   Math.sin(dLat / 2) * Math.sin(dLat / 2) +
   Math.cos(lat1 * Math.PI / 180) *
     Math.cos(lat2 * Math.PI / 180) *
     Math.sin(dLon / 2) *
     Math.sin(dLon / 2);
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 const d = R * c;
 return Math.round(d);
};

const fetchPlaceDetails = async (placeId) => {
 const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,opening_hours,website,price_level&language=fr&key=${GOOGLE_API_KEY}`;
 try {
   const response = await axios.get(url);
   return response.data.result;
 } catch (error) {
   console.error(`Erreur lors de la récupération des détails pour ${placeId}:`, error.response?.data || error.message);
   return null;
 }
};

const searchPlaces = async () => {
 const activities = [];

 for (const type of PLACE_TYPES) {
   try {
     console.log(`\nRecherche des lieux de type: ${type}`);

     const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${MONTPELLIER_LOCATION.lat},${MONTPELLIER_LOCATION.lng}&radius=10000&type=${type}&language=fr&key=${GOOGLE_API_KEY}`;
     const response = await axios.get(url);

     console.log(`Réponse brute pour ${type}:`, response.data);

     const places = response.data.results || [];

     for (const place of places) {
       try {
         const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,opening_hours,website,price_level&language=fr&key=${GOOGLE_API_KEY}`;
         const detailsResponse = await axios.get(detailsUrl);
         const details = detailsResponse.data.result || {};

         const distance = calculateDistance(
           MONTPELLIER_LOCATION.lat,
           MONTPELLIER_LOCATION.lng,
           place.geometry.location.lat,
           place.geometry.location.lng
         );

         const activityType = determineType(place.types, place.name);

         if (activityType !== null) {
           activities.push({
             title: place.name,
             type: activityType,
             location: place.vicinity,
             distance: `${distance} km`,
             price: place.types.includes('park') ? 'Gratuit' : 
               (details.price_level ? '€'.repeat(details.price_level) : ''),
             rating: place.rating || 0,
             phone: details.formatted_phone_number || 'Non spécifié',
             website: details.website || '',
             openingHours: details.opening_hours?.weekday_text || [],
             coordinates: {
               lat: place.geometry.location.lat,
               lng: place.geometry.location.lng
             }
           });
           console.log(`Ajouté: ${place.name}`);
         }
       } catch (detailError) {
         console.error(
           `Erreur lors de la récupération des détails pour ${place.name}:`,
           detailError.message
         );
       }
     }
   } catch (error) {
     console.error(`Erreur lors de la recherche de type ${type}:`, error.message);
   }
 }

 return activities;
};

const main = async () => {
 try {
   await connectDB();
   console.log('Connexion à la base de données établie');

   const activities = await searchPlaces();
   console.log(`\nNombre total d'activités trouvées: ${activities.length}`);

   if (activities.length > 0) {
     await Activity.deleteMany({});
     await Activity.insertMany(activities);
     console.log(`${activities.length} activités ajoutées avec succès`);
   } else {
     console.log('Aucune activité trouvée');
   }
 } catch (error) {
   console.error('Erreur:', error);
 } finally {
   process.exit();
 }
};

process.on('unhandledRejection', error => {
 console.error('Erreur non gérée:', error);
 process.exit(1);
});

main();
