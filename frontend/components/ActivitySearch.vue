<template>
  <div class="w-full p-2">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">Mtp Explore</h1>
      <p class="text-gray-600">Découvrez les meilleures activités près de Montpellier</p>
    </div>

    <div class="flex gap-4">
      <div class="w-1/2 space-y-4">
        <div class="relative">
          <input
            type="text"
            class="w-full p-4 pl-12 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            placeholder="Rechercher une activité..."
            v-model="searchQuery"
          />
          <Icon
            :name="isLoading ? 'lucide:loader' : 'lucide:search'"
            class="absolute left-4 top-4 text-gray-400"
            :class="{ 'animate-spin': isLoading }"
          />
        </div>

        <div class="h-[calc(100vh-250px)]">
          <ActivityMap :activities="activities" :selectedActivity="selectedActivity" />
        </div>
      </div>

      <div class="w-1/2 flex flex-col space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in filters"
            :key="filter"
            class="px-4 py-2 rounded-full"
            :class="[
              selectedFilter === filter
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedFilter = filter"
          >
            {{ filter }}
          </button>
        </div>

        <div class="overflow-y-auto" style="height: calc(100vh - 220px)">
          <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {{ error }}
          </div>

          <div class="space-y-4">
            <div
              v-for="activity in activities"
              :key="activity._id"
              class="overflow-hidden hover:shadow-lg transition-shadow border rounded-lg bg-white cursor-pointer"
              :class="{ 'ring-2 ring-blue-500': selectedActivity === activity }"
              @click="toggleActivity(activity)"
            >
              <div class="p-4">
                <div class="mb-2">
                  <h3 class="text-xl font-semibold mb-1">{{ activity.title }}</h3>
                  <div class="flex items-center text-gray-600 mb-2">
                    <Icon name="lucide:map-pin" class="w-4 h-4 mr-1" />
                    <span class="text-sm">{{ activity.location }} • {{ activity.distance }}</span>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2 mt-2">
                  <span v-if="activity.rating > 0" class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                    <Icon name="lucide:star" class="w-4 h-4 mr-1" />
                    {{ activity.rating.toFixed(1) }}/5
                  </span>
                  <span v-if="activity.price" class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {{ activity.price }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activities.length === 0 && !isLoading" class="text-center text-gray-500 mt-8">
            Aucune activité ne correspond à votre recherche
          </div>

          <div v-if="isLoading" class="text-center text-gray-500 mt-8">
            Chargement des activités...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import ActivityMap from './ActivityMap.vue'

const searchQuery = ref('')
const selectedFilter = ref('Tout')
const isLoading = ref(false)
const activities = ref([])
const error = ref(null)
const selectedActivity = ref(null)

const filters = [
  'Tout',
  'Culture & Musées',
  'Sports & Loisirs',
  'Nature & Plein air',
  'Activités Aquatiques'
];
const api = useApi()

const getLocationType = (activity) => {
  const interieur = ['museum', 'art_gallery', 'aquarium', 'sports_complex'];
  const type = activity.type;
  return interieur.includes(type) ? 'Intérieur' : 'Extérieur';
}

const getPrice = (activity) => {
  if (activity.type === 'nature_plein_air' && activity.title.toLowerCase().includes('parc')) {
    return 'Gratuit';
  }
  return activity.price || 'Prix non spécifié';
}

const fetchActivities = async () => {
  try {
    isLoading.value = true
    error.value = null
    const fetchedActivities = await api.fetchActivities(
      searchQuery.value,
      selectedFilter.value
    )
    console.log('Activités récupérées:', fetchedActivities)
    activities.value = fetchedActivities
  } catch (err) {
    error.value = "Erreur lors du chargement des activités"
    console.error('Error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchActivities()
})

let searchTimeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchActivities()
  }, 300)
})

watch(selectedFilter, () => {
  fetchActivities()
})

const toggleActivity = activity => {
  selectedActivity.value = selectedActivity.value === activity ? null : activity;
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-leave-active {
  position: absolute;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
