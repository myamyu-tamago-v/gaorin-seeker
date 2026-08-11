<template>
  <div
    class="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4"
  >
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

    <!-- 設定画面 -->
    <div
      v-else-if="gameState === 'settings'"
      class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
    >
      <h2 class="text-2xl font-bold text-orange-600 mb-6 text-center">
        ゲーム設定にゃ
      </h2>

      <div class="mb-6">
        <label class="block text-orange-900 font-bold mb-2">
          ステージ数:
          <span class="text-orange-600">{{ settings.stagesCount }}</span>
        </label>
        <input
          v-model.number="settings.stagesCount"
          type="range"
          min="1"
          max="10"
          class="w-full accent-orange-500"
        />
        <div class="flex justify-between text-xs text-orange-400 mt-1">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      <div class="mb-8">
        <label class="block text-orange-900 font-bold mb-2">
          制限時間 (秒):
          <span class="text-orange-600">{{ settings.timeLimit }}</span> 秒
        </label>
        <input
          v-model.number="settings.timeLimit"
          type="range"
          min="30"
          max="180"
          step="10"
          class="w-full accent-orange-500"
        />
        <div class="flex justify-between text-xs text-orange-400 mt-1">
          <span>30秒</span>
          <span>180秒</span>
        </div>
      </div>

      <div class="flex gap-4">
        <button
          class="w-1/2 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition duration-200"
          @click="gameState = 'start'"
        >
          もどるにゃ
        </button>
        <button
          class="w-1/2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow transition duration-200"
          @click="startGame"
        >
          ゲーム開始にゃ
        </button>
      </div>
    </div>

    <!-- ゲームプレイ画面 (空のコンポーネント) -->
    <div
      v-else-if="gameState === 'playing'"
      class="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full text-center"
    >
      <h2 class="text-2xl font-bold text-orange-600 mb-4">
        ゲーム画面（準備中）にゃ
      </h2>
      <p class="text-orange-800 mb-6">
        ステージ数: {{ settings.stagesCount }} / 制限時間:
        {{ settings.timeLimit }}秒
      </p>
      <div
        class="p-8 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/50 mb-6"
      >
        <p class="text-orange-600 font-medium">
          ここが最初のステージの空コンポーネントになるにゃ！
        </p>
      </div>
      <button
        class="py-2 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition duration-200"
        @click="gameState = 'start'"
      >
        タイトルに戻るにゃ
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const gameState = ref('start') // 'start' | 'settings' | 'playing'

const settings = reactive({
  stagesCount: 5,
  timeLimit: 60,
})

const goToSettings = () => {
  gameState.value = 'settings'
}

const startGame = () => {
  gameState.value = 'playing'
}
</script>
