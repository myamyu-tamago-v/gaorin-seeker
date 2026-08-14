/**
 * @fileoverview ステージデータとゲーム設定のJSDoc型定義
 */

/**
 * @typedef {Object} StageData
 * @property {string} id - ID
 * @property {string} title - タイトル
 * @property {string} [xPostUrl] - 参考Xポスト（URL）
 * @property {string[]} hintImages - ヒント画像（URL配列）
 * @property {number} latitude - 正解座標（緯度）
 * @property {number} longitude - 正解座標（経度）
 */

/**
 * @typedef {Object} GameConfig
 * @property {number} totalStages - 1ゲームあたりのステージ数
 * @property {number} timeLimit - 1ステージあたりの制限時間（秒）
 */

/** @type {GameConfig} */
export const GAME_CONFIG = {
  totalStages: 3,
  timeLimit: 60,
}

export {}
