<template>
  <div class="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
    <!-- スタート画面 -->
    <div
      v-if="gameState === 'start'"
      class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
    >
      <h1 class="text-4xl font-extrabold text-orange-600 mb-2">
        Gaorin Seeker
      </h1>
      <p class="text-orange-800 mb-8">
        写真の場所を地図から探す座標当てクイズにゃ！
      </p>
      <button
        class="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow transition duration-200 text-lg"
        @click="goToSettings"
      >
        スタートにゃ
      </button>
    </div>

    <!-- 設定コンポーネント -->
    <Settings
      v-else-if="gameState === 'settings'"
      v-model="settings"
      @back="gameState = 'start'"
      @start="startGame"
    />

    <!-- ステージコンポーネント (ローディング、開始ボタン、プレイ中を内包) -->
    <Stage
      v-else-if="gameState === 'loading' || gameState === 'ready' || gameState === 'playing'"
      :stage="currentStage"
      :current-stage-index="currentStageIndex"
      :total-stages="settings.stagesCount"
      :time-limit="settings.timeLimit"
      :zoom-scale="zoomScale"
      :loaded-image="currentImage"
      :game-state="gameState"
      @loaded="gameState = 'ready'"
      @start-timer="gameState = 'playing'"
      @finish="finishStage"
    />

    <!-- スコア集計コンポーネント -->
    <Summary
      v-else-if="gameState === 'summary'"
      :stage="currentStage"
      :user-pin="lastSelectedPin"
      :distance-meters="distanceMeters"
      :stage-score="stageScore"
      :is-last-stage="isLastStage"
      @next="nextStage"
    />

    <!-- 最終結果コンポーネント -->
    <Result
      v-else-if="gameState === 'result'"
      :total-score="totalScore"
      :results-history="resultsHistory"
      @restart="gameState = 'start'"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import stagesData from './data/stages.json'
import Settings from './components/Settings.vue'
import Stage from './components/Stage.vue'
import Summary from './components/Summary.vue'
import Result from './components/Result.vue'

const gameState = ref('start') // 'start' | 'settings' | 'loading' | 'ready' | 'playing' | 'summary' | 'result'

const settings = reactive({
  stagesCount: 5,
  timeLimit: 60,
})

const gameStages = ref([])
const currentStageIndex = ref(0)
const currentImage = ref(null)
const zoomScale = ref(10)

// Summary state
const stageScore = ref(0)
const distanceMeters = ref(0)
const totalScore = ref(0)
const resultsHistory = ref([])
const lastSelectedPin = ref(null)

const currentStage = computed(() => {
  return gameStages.value[currentStageIndex.value] || null
})

const isLastStage = computed(() => {
  return currentStageIndex.value >= gameStages.value.length - 1
})

const goToSettings = () => {
  gameState.value = 'settings'
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

const calculateScore = (distance) => {
  const maxDistance = 50000
  if (distance >= maxDistance) return 0
  const score = Math.round(1000 * (1 - distance / maxDistance))
  return Math.max(0, score)
}

const startGame = async () => {
  const count = settings.stagesCount
  let pool = [...stagesData]
  let selected = []

  if (pool.length >= count) {
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * pool.length)
      selected.push(pool.splice(index, 1)[0])
    }
  } else {
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * pool.length)
      selected.push({ ...pool[index] })
    }
  }

  gameStages.value = selected
  currentStageIndex.value = 0
  totalScore.value = 0
  resultsHistory.value = []

  await loadCurrentStage()
}

const loadCurrentStage = async () => {
  gameState.value = 'loading'
  lastSelectedPin.value = null

  const stage = currentStage.value
  if (!stage || !stage.hintImages || stage.hintImages.length === 0) {
    gameState.value = 'playing'
    return
  }

  const randomImgUrl = stage.hintImages[Math.floor(Math.random() * stage.hintImages.length)]
  zoomScale.value = 5 + Math.random() * 3

  try {
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        currentImage.value = img
        resolve()
      }
      img.onerror = reject
      img.src = randomImgUrl
    })
  } catch (e) {
    console.error('Failed to load image:', e)
  }
}

const finishStage = ({ selectedPin }) => {
  lastSelectedPin.value = selectedPin

  const stage = currentStage.value
  const dist = selectedPin ? calculateDistance(
    selectedPin.lat,
    selectedPin.lng,
    stage.latitude,
    stage.longitude
  ) : 1000000;
  distanceMeters.value = Math.round(dist)
  stageScore.value = calculateScore(dist)
  totalScore.value += stageScore.value

  resultsHistory.value.push({
    title: stage.title,
    score: stageScore.value,
    distance: distanceMeters.value,
  })

  gameState.value = 'summary'
}

const nextStage = async () => {
  if (isLastStage.value) {
    gameState.value = 'result'
  } else {
    currentStageIndex.value++
    await loadCurrentStage()
  }
}
</script>
