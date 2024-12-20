<template>
  <div class="h-96 w-full rounded-lg overflow-hidden">
    <client-only>
      <div v-if="error"
           class="h-full w-full flex items-center justify-center bg-red-50 text-red-500 p-4">
        {{ error }}
      </div>
      <div v-else-if="!mapLoaded"
           class="h-full w-full flex items-center justify-center bg-gray-50">
        Chargement de la carte...
      </div>
      <div v-else ref="mapContainer" id="map" class="h-full w-full"></div>
    </client-only>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedActivity: {
    type: Object,
    default: null
  }
})

const mapContainer = ref(null)
const error = ref(null)
const mapLoaded = ref(false)
let map = null
let markers = []

onMounted(async () => {
  console.log("onMounted called");
  try {
    await loadLeaflet();
    console.log("Leaflet loaded");
    mapLoaded.value = true;
  } catch (e) {
    console.error('Erreur lors du chargement ou de l\'initialisation de la carte:', e);
    error.value = `Erreur: ${e.message}`;
  }
});

const loadLeaflet = async () => {
  console.log("loadLeaflet called")
  return new Promise((resolve, reject) => {
    if (window.L) {
      console.log("Leaflet already loaded");
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      console.log("Leaflet loaded successfully");
      resolve();
    };
    script.onerror = () => {
      console.error("Error loading Leaflet");
      reject(new Error('Erreur lors du chargement de Leaflet'));
    };
    document.head.appendChild(script);
  });
};

const initMap = () => {
  console.log("initMap called")

  // Attendre que l'élément mapContainer soit disponible
  if (!mapContainer.value) {
    console.error("mapContainer.value is null");
    error.value = "Erreur: mapContainer.value est null";
    return;
  }

  // Vérifier si Leaflet est chargé
  if (typeof window === 'undefined' || !window.L) {
    console.error('Leaflet n\'est pas chargé');
    error.value = 'Leaflet n\'est pas chargé';
    return;
  }

  try {
    // Si la carte existe déjà, la supprimer
    if (map) {
      markers.forEach(marker => marker.remove());
      map.remove();
      markers = [];
    }

    // Initialiser la carte
    map = window.L.map('map').setView([43.610769, 3.876716], 13);

    // Ajouter le layer OpenStreetMap
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Ajouter les marqueurs
    addMarkers();

  } catch (e) {
    console.error('Erreur lors de l\'initialisation de la carte:', e);
    error.value = `Erreur lors de l'initialisation de la carte: ${e.message}`;
  }
};

const addMarkers = () => {
  console.log("addMarkers called", props.selectedActivity);
  if (!map) {
    console.error("map is null in addMarkers");
    return;
  }

  // Supprimer les marqueurs existants
  markers.forEach(marker => marker.remove());
  markers = [];

  // Créer un groupe de couches pour les marqueurs
  const markerGroup = window.L.layerGroup();

  // Filtrer les activités si une est sélectionnée
  const activitiesToShow = props.selectedActivity
    ? [props.selectedActivity]
    : props.activities;

  activitiesToShow.forEach(activity => {
    if (
      activity.coordinates &&
      typeof activity.coordinates.lat === "number" &&
      typeof activity.coordinates.lng === "number"
    ) {
      const latLng = window.L.latLng(
        activity.coordinates.lat,
        activity.coordinates.lng
      );
      const marker = window.L.marker(latLng).bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${activity.title}</h3>
            <p class="text-gray-600">${activity.location}</p>
            <p>Prix: ${activity.price}</p>
            <p>Distance: ${activity.distance}</p>
          </div>
        `);

      // Ajouter le marqueur au groupe de couches
      markerGroup.addLayer(marker);
      markers.push(marker);
      console.log("Marker added for:", activity.title);

      // Si c'est l'activité sélectionnée, centrer la carte sur elle
      if (props.selectedActivity === activity) {
        map.setView([activity.coordinates.lat, activity.coordinates.lng], 15);
      }
    } else {
      console.error("Invalid coordinates for activity:", activity);
    }
  });

  // Ajouter le groupe de couches à la carte
  map.addLayer(markerGroup);

  // Si aucune activité n'est sélectionnée, ajuster la vue pour montrer tous les marqueurs
  if (!props.selectedActivity && markers.length > 0) {
    const group = new window.L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
};

onBeforeUnmount(() => {
  if (map) {
    markers.forEach(marker => marker.remove());
    map.off();
    map.remove();
  }
});

watch(
  () => [props.activities, mapLoaded],
  ([newActivities, newMapLoaded]) => {
    console.log(
      "props.activities or mapLoaded changed",
      newActivities.length,
      newMapLoaded
    );
    if (newMapLoaded && newActivities.length > 0) {
      initMap();
    }
  },
  { deep: true }
);

watch(
  () => props.selectedActivity,
  () => {
    console.log("props.selectedActivity changed");
    addMarkers();
  },
  { deep: true }
);
</script>

<style>
@import 'leaflet/dist/leaflet.css';

#map {
  z-index: 1;
}

.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>
