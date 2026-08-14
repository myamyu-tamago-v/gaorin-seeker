<template>
  <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
    <h2 class="text-2xl font-bold text-orange-600 mb-6 text-center">
      ゲーム設定にゃ
    </h2>

    <div class="mb-6">
      <label class="block text-orange-900 font-bold mb-2">
        ステージ数にゃ:
        <span class="text-orange-600">{{ modelValue.stagesCount }}</span>
      </label>
      <input
        v-model.number="modelValue.stagesCount"
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
        <span class="text-orange-600">{{ modelValue.timeLimit }}</span> 秒
      </label>
      <input
        v-model.number="modelValue.timeLimit"
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
        @click="$emit('back')"
      >
        もどるにゃ
      </button>
      <button
        class="w-1/2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow transition duration-200"
        @click="$emit('start')"
      >
        ゲーム開始にゃ
      </button>
    </div>
  </div>
</template>

<script setup>
const modelValue = defineModel({ type: Object, required: true });
defineEmits(['back', 'start'])
</script>
