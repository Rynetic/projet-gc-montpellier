const Activity = require('../models/Activity');
const connectDB = require('../config/database');

const checkActivities = async () => {
  try {
    await connectDB();
    console.log('Connexion à la base de données établie');

    const activities = await Activity.find().limit(5);

    console.log('\nExemple des 5 premières activités :');
    activities.forEach((activity, index) => {
      console.log(`\n--- Activité ${index + 1} ---`);
      console.log(`Titre: ${activity.title}`);
      console.log(`Type: ${activity.type}`);
      console.log(`Localisation: ${activity.location}`);
      console.log(`Distance: ${activity.distance}`);
      console.log(`Prix: ${activity.price}`);
      console.log(`Coordonnées: ${JSON.stringify(activity.coordinates)}`);
      console.log('------------------------');
    });

    const typeStats = await Activity.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nRépartition par type d\'activité :');
    typeStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} activités`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit();
  }
};

checkActivities();
