const BASE_URL = 'http://localhost:3001/api';

export const useApi = () => {
  const fetchActivities = async (query = '', filter = 'Tout') => {
    try {
      let url = `${BASE_URL}/activities`;
      
      if (query || filter.toLowerCase() !== 'tout') {
        const typeMapping = {
          'Culture & Musées': 'culture_musees',
          'Sports & Loisirs': 'sports_loisirs',
          'Nature & Plein air': 'nature_plein_air',
          'Activités Aquatiques': 'activites_aquatiques'
        };

        const backendType = typeMapping[filter] || filter.toLowerCase();
        url = `${BASE_URL}/activities/search?query=${query}&type=${backendType}`;
      }
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      return [];
    }
  };

  return {
    fetchActivities
  };
};

export default useApi;
