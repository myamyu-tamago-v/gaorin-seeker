import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.resolve(__dirname, '../src/data/stages.json')

function updateStages() {
  if (!fs.existsSync(filePath)) {
    console.error('stages.jsonが見つからないにゃ！')
    return
  }

  const rawData = fs.readFileSync(filePath, 'utf-8')
  let stages = JSON.parse(rawData)

  let updated = false
  stages = stages.map((stage) => {
    if (!stage.id || stage.id.trim() === '') {
      stage.id = crypto.randomUUID().slice(0, 8)
      updated = true
      console.log(`新しいIDを採番したにゃ: ${stage.id} (${stage.title || 'タイトルなし'})`)
    }
    return stage
  })

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(stages, null, 2) + '\n', 'utf-8')
    console.log('stages.jsonを更新したにゃ！')
  } else {
    console.log('未採番のステージはなかったにゃ。')
  }
}

updateStages()
