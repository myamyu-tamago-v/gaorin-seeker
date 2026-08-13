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

    <div class="space-y-2 mb-8 max-h-48 overflow-y-auto text-left">
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
defineProps({
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
</script>
