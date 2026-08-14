<template>
  <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
    <h2 class="text-3xl font-black text-orange-600 mb-2">
      全ステージクリアにゃ！🎉
    </h2>
    <p class="text-gray-600 mb-6">
      お疲れ様にゃ！最終スコアはこちらにゃ！
    </p>

    <div class="bg-orange-50 rounded-2xl p-6 mb-6">
      <p class="text-sm text-gray-500 font-bold mb-1">合計スコア</p>
      <p class="text-5xl font-black text-orange-600">{{ totalScore }} <span class="text-xl">pts</span></p>
    </div>

    <!-- マップ表示 (すべての正解スポットを表示) -->
    <div
      ref="mapContainer"
      class="w-full h-48 rounded-xl shadow-inner mb-4 border border-gray-200"
    ></div>

    <div class="space-y-2 mb-6 max-h-40 overflow-y-auto text-left">
      <div
        v-for="(res, idx) in resultsHistory"
        :key="idx"
        class="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm"
      >
        <div>
          <span class="font-bold text-gray-700">#{{ idx + 1 }} {{ res.title }}</span>
          <span class="block text-xs text-gray-400">誤差: {{ res.distance }}m</span>
        </div>
        <span class="font-bold text-orange-600">+{{ res.score }}pt</span>
      </div>
    </div>

    <button
      class="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow transition duration-200 text-lg"
      @click="$emit('restart')"
    >
      タイトルに戻るにゃ
    </button>
  </div>
</template>

<script setup>
/**
 * @fileoverview 最終結果コンポーネント
 * 全ステージ終了時の合計スコアと各ステージの成績履歴、正解スポットすべてをプロットした地図を表示するにゃ。
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  totalScore: {
    type: Number,
    required: true,
  },
  resultsHistory: {
    type: Array,
    required: true,
  },
})

defineEmits(['restart'])

const mapContainer = ref(null)
let resultMap = null

onMounted(() => {
  nextTick(() => {
    initResultMap()
  })
})

onUnmounted(() => {
  if (resultMap) {
    resultMap.remove()
    resultMap = null
  }
})

/**
 * すべての正解スポットをプロットした最終結果マップを初期化するにゃ。
 */
const initResultMap = () => {
  if (resultMap) {
    resultMap.remove()
    resultMap = null
  }

  const history = props.resultsHistory
  if (!history || history.length === 0) return

  resultMap = L.map(mapContainer.value).setView([34.2257, 135.1675], 10)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(resultMap)

  const bounds = []

  history.forEach((res, idx) => {
    if (res.latitude && res.longitude) {
      const answerIcon = L.divIcon({
        className: 'custom-answer-marker',
        html: `<div style="background-color: #f97316; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${idx + 1}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })
      
      L.marker([res.latitude, res.longitude], { icon: answerIcon })
        .addTo(resultMap)
        .bindPopup(`#${idx + 1} ${res.title}`)

      bounds.push([res.latitude, res.longitude])
    }
  })

  if (bounds.length > 0) {
    resultMap.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 14 })
  }
}
</script>
