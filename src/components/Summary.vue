<template>
  <div class="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
    <h2 class="text-3xl font-black text-orange-600 mb-2">
      結果発表にゃ！
    </h2>
    <p class="text-gray-600 mb-6 font-bold text-lg">
      {{ stage?.title }}
    </p>

    <!-- マップ表示 (正解とピンの位置) -->
    <div
      ref="mapContainer"
      class="w-full h-64 rounded-xl shadow-inner mb-6 border border-gray-200"
    ></div>

    <div class="bg-orange-50 rounded-xl p-4 mb-6 flex justify-around items-center">
      <div>
        <p class="text-xs text-gray-500 font-bold">誤差距離</p>
        <p class="text-2xl font-bold text-orange-800">{{ distanceMeters }} m</p>
      </div>
      <div class="h-8 w-px bg-orange-200"></div>
      <div>
        <p class="text-xs text-gray-500 font-bold">獲得スコア</p>
        <p class="text-3xl font-black text-orange-600">+{{ stageScore }} pts</p>
      </div>
    </div>

    <button
      class="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow transition duration-200 text-lg"
      @click="$emit('next')"
    >
      {{ isLastStage ? '結果を表示するにゃ' : '次のステージへにゃ' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  stage: {
    type: Object,
    required: true,
  },
  userPin: {
    type: Object,
    default: null,
  },
  distanceMeters: {
    type: Number,
    required: true,
  },
  stageScore: {
    type: Number,
    required: true,
  },
  isLastStage: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['next'])

const mapContainer = ref(null)
let summaryMap = null

onMounted(() => {
  nextTick(() => {
    initSummaryMap()
  })
})

onUnmounted(() => {
  if (summaryMap) {
    summaryMap.remove()
    summaryMap = null
  }
})

const initSummaryMap = () => {
  if (summaryMap) {
    summaryMap.remove()
    summaryMap = null
  }

  const stage = props.stage
  const userPin = props.userPin

  const centerLat = userPin ? (userPin.lat + stage.latitude) / 2 : stage.latitude
  const centerLng = userPin ? (userPin.lng + stage.longitude) / 2 : stage.longitude

  summaryMap = L.map(mapContainer.value).setView([centerLat, centerLng], 10)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(summaryMap)

  const answerIcon = L.divIcon({
    className: 'custom-answer-marker',
    html: '<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
  L.marker([stage.latitude, stage.longitude], { icon: answerIcon })
    .addTo(summaryMap)
    .bindPopup('正解の場所')

  if (userPin) {
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: '<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
    L.marker([userPin.lat, userPin.lng], { icon: userIcon })
      .addTo(summaryMap)
      .bindPopup('あなたのピン')

    const latlngs = [
      [userPin.lat, userPin.lng],
      [stage.latitude, stage.longitude],
    ]
    L.polyline(latlngs, { color: '#ef4444', dashArray: '5, 5', weight: 3 }).addTo(summaryMap)

    summaryMap.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] })
  }
}
</script>
