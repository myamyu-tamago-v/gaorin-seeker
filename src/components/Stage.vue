<template>
  <div class="fixed inset-0 w-full h-full overflow-hidden bg-gray-900">
    <!-- 画面いっぱいの Canvas -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      @mousedown="onCanvasMouseDown"
      @mousemove="onCanvasMouseMove"
      @mouseup="onCanvasMouseUp"
      @mouseleave="onCanvasMouseUp"
      @touchstart="onCanvasTouchStart"
      @touchmove="onCanvasTouchMove"
      @touchend="onCanvasTouchEnd"
    ></canvas>

    <!-- 右上のタイマー＆ステージ情報 -->
    <div class="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 flex flex-col items-end gap-1">
      <div class="text-sm font-bold text-orange-600">
        ステージ {{ currentStageIndex + 1 }} / {{ totalStages }}
      </div>
      <div class="text-3xl font-black text-gray-800 flex items-center gap-1">
        <span>⏱️</span>
        <span :class="{'text-red-500 animate-pulse': timeLeft <= 10}">{{ timeLeft }}s</span>
      </div>
    </div>

    <!-- 右下のマップ（通常または拡大） -->
    <div
      class="absolute bottom-4 right-4 z-10 transition-all duration-300 flex flex-col items-end"
      :class="isMapExpanded ? 'w-[90vw] h-[70vh] md:w-150 md:h-125' : 'w-72 h-72 md:w-80 md:h-80'"
    >
      <!-- マップコントロールバー -->
      <div class="bg-white/90 backdrop-blur px-3 py-1.5 rounded-t-xl shadow flex justify-between items-center w-full">
        <span class="text-xs font-bold text-orange-800">
          {{ selectedPin ? '📍 ピン配置済み' : '🗺️ マップをクリックしてピンを打てにゃ' }}
        </span>
        <button
          class="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded font-bold transition"
          @click="toggleMapExpand"
        >
          {{ isMapExpanded ? '縮小する' : '拡大する' }}
        </button>
      </div>

      <!-- Leaflet マップコンテナ -->
      <div
        ref="mapContainer"
        class="w-full flex-1 rounded-b-xl shadow-lg border-2 border-white/80 bg-white"
      ></div>
    </div>

    <!-- 左下の「これで確定」ボタン -->
    <div class="absolute bottom-4 left-4 z-10">
      <button
        class="py-4 px-8 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-xl transition duration-200 text-lg flex items-center gap-2 border-2 border-white/50"
        @click="confirmPlacement"
      >
        <span>✨</span>
        <span>これで確定にゃ！</span>
      </button>
    </div>
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
  currentStageIndex: {
    type: Number,
    required: true,
  },
  totalStages: {
    type: Number,
    required: true,
  },
  timeLimit: {
    type: Number,
    required: true,
  },
  zoomScale: {
    type: Number,
    required: true,
  },
  loadedImage: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['finish'])

const timeLeft = ref(props.timeLimit)
let timerInterval = null

// Canvas / Crop state
const canvasRef = ref(null)
const cropOffsetX = ref(0)
const cropOffsetY = ref(0)
const isDraggingCanvas = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

// Map state
const mapContainer = ref(null)
let leafletMap = null
let markerLayer = null
const selectedPin = ref(null) // { lat, lng }
const isMapExpanded = ref(false)

let canvasWidth = 0
let canvasHeight = 0

onMounted(() => {
  timeLeft.value = props.timeLimit

  nextTick(() => {
    initCanvas()
    initMap()
  })

  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval)
      finishStage()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})

const initCanvas = () => {
  console.debug("Zoom:", props.zoomScale);
  const canvas = canvasRef.value
  if (!canvas) return
  canvasWidth = canvas.parentElement.clientWidth
  canvasHeight = canvas.parentElement.clientHeight
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  if (props.loadedImage) {
    const img = props.loadedImage
    const visibleW = img.naturalWidth / props.zoomScale
    const visibleH = img.naturalHeight / props.zoomScale

    const maxOffsetX = Math.max(0, img.naturalWidth - visibleW)
    const maxOffsetY = Math.max(0, img.naturalHeight - visibleH)

    cropOffsetX.value = Math.random() * maxOffsetX
    cropOffsetY.value = Math.random() * maxOffsetY

    drawCanvas()
  }
}

const drawCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas || !props.loadedImage) return
  const ctx = canvas.getContext('2d')
  const img = props.loadedImage

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const visibleW = img.naturalWidth / props.zoomScale
  const visibleH = img.naturalHeight / props.zoomScale

  ctx.drawImage(
    img,
    cropOffsetX.value,
    cropOffsetY.value,
    visibleW,
    visibleH,
    0,
    0,
    canvasWidth,
    canvasHeight
  )
}

const onCanvasMouseDown = (e) => {
  isDraggingCanvas.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
}

const onCanvasMouseMove = (e) => {
  if (!isDraggingCanvas.value || !props.loadedImage) return
  const dx = e.clientX - dragStartX.value
  const dy = e.clientY - dragStartY.value
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY

  const img = props.loadedImage
  const visibleW = img.naturalWidth / props.zoomScale
  const visibleH = img.naturalHeight / props.zoomScale

  const scaleX = visibleW / canvasWidth
  const scaleY = visibleH / canvasHeight

  cropOffsetX.value = Math.max(
    0,
    Math.min(img.naturalWidth - visibleW, cropOffsetX.value - dx * scaleX)
  )
  cropOffsetY.value = Math.max(
    0,
    Math.min(img.naturalHeight - visibleH, cropOffsetY.value - dy * scaleY)
  )

  drawCanvas()
}

const onCanvasMouseUp = () => {
  isDraggingCanvas.value = false
}

const onCanvasTouchStart = (e) => {
  if (e.touches.length === 1) {
    isDraggingCanvas.value = true
    dragStartX.value = e.touches[0].clientX
    dragStartY.value = e.touches[0].clientY
  }
}

const onCanvasTouchMove = (e) => {
  if (!isDraggingCanvas.value || !props.loadedImage || e.touches.length !== 1) return
  const dx = e.touches[0].clientX - dragStartX.value
  const dy = e.touches[0].clientY - dragStartY.value
  dragStartX.value = e.touches[0].clientX
  dragStartY.value = e.touches[0].clientY

  const img = props.loadedImage
  const visibleW = img.naturalWidth / props.zoomScale
  const visibleH = img.naturalHeight / props.zoomScale

  const scaleX = visibleW / canvasWidth
  const scaleY = visibleH / canvasHeight

  cropOffsetX.value = Math.max(
    0,
    Math.min(img.naturalWidth - visibleW, cropOffsetX.value - dx * scaleX)
  )
  cropOffsetY.value = Math.max(
    0,
    Math.min(img.naturalHeight - visibleH, cropOffsetY.value - dy * scaleY)
  )

  drawCanvas()
}

const onCanvasTouchEnd = () => {
  isDraggingCanvas.value = false
}

const initMap = () => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }

  leafletMap = L.map(mapContainer.value, {
    zoomControl: false,
  }).setView([35.68, 139.76], 5)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(leafletMap)

  markerLayer = L.layerGroup().addTo(leafletMap)

  leafletMap.on('click', (e) => {
    const { lat, lng } = e.latlng
    selectedPin.value = { lat, lng }
    markerLayer.clearLayers()
    L.marker([lat, lng]).addTo(markerLayer)
  })
}

const toggleMapExpand = () => {
  isMapExpanded.value = !isMapExpanded.value
  nextTick(() => {
    if (leafletMap) {
      leafletMap.invalidateSize()
    }
  })
}

const confirmPlacement = () => {
  if (timerInterval) clearInterval(timerInterval)
  finishStage()
}

const finishStage = () => {
  if (timerInterval) clearInterval(timerInterval)
  emit('finish', { selectedPin: selectedPin.value })
}
</script>
