const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchActivities = async (req, res) => {
  try {
    const { query, type } = req.query;
    let searchQuery = { type: { $ne: null } };

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ];
    }

    if (type && type !== 'tout') {
      const validTypes = [
        'sports_loisirs',
        'culture_musees',
        'nature_plein_air',
        'activites_aquatiques'
      ];
      
      if (validTypes.includes(type)) {
        searchQuery.type = type;
      } else {
        return res.status(400).json({ message: "Type d'activité invalide." });
      }
    }

    const activities = await Activity.find(searchQuery);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (activity) {
      res.json(activity);
    } else {
      res.status(404).json({ message: 'Activité non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createActivity = async (req, res) => {
  const activity = new Activity(req.body);
  try {
    const newActivity = await activity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
