/**
 * @fileoverview ステージデータ検証・自動採番スクリプト
 * stages.jsonの各項目を確認し、不足しているIDや緯度経度を補完するにゃ。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.resolve(__dirname, '../src/data/stages.json')

/**
 * stages.jsonファイルを読み込み、IDや緯度経度が欠けているステージを自動補完して保存するにゃ。
 */
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
      // titleがあるものだけを採番
      if (stage.title) {
        stage.id = crypto.randomUUID().slice(0, 8)
        updated = true
        console.log(`新しいIDを採番したにゃ: ${stage.id} (${stage.title || 'タイトルなし'})`)
      }
    }

    if (!stage.latitude || !stage.longitude) {
      if (stage.latlon && typeof stage.latlon === 'string') {
        const parts = stage.latlon.split(',').map(s => s.trim())
        if (parts.length === 2) {
          const lat = parseFloat(parts[0])
          const lon = parseFloat(parts[1])
          if (!isNaN(lat) && !isNaN(lon)) {
            stage.latitude = lat
            stage.longitude = lon
            updated = true
            console.log(`latlonから緯度経度を割り当てたにゃ: ${lat}, ${lon} (${stage.title || stage.id})`)
          }
        }
      }
    }

    return stage
  })

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(stages, null, 2) + '\n', 'utf-8')
    console.log('stages.jsonを更新したにゃ！')
  } else {
    console.log('なにも更新してないにゃ！')
  }
}

updateStages()
