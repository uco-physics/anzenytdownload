// YouTube動画のダウンロード処理を管理するモジュール
// 依存: @warren-bank/browser-ytdl-core（CDN経由）
// 拡張ポイント: 別のライブラリ（例: youtube-dl.js）に切り替える場合、このモジュールを修正

// グローバルなAbortControllerで処理のキャンセルを管理
let abortController = null;

// デバッグログを記録
// @param {string} message - ログメッセージ
// @param {Object} [error] - エラーオブジェクト（オプション）
function logDebug(message, error = null) {
  const debugLog = document.querySelector('#debug-log');
  let logMessage = `[${new Date().toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })}] ${message}`;
  if (error) {
    // 詳細なエラー情報をJSON形式で整形
    const errorDetails = {
      message: error.message,
      stack: error.stack || 'なし',
      name: error.name || '不明',
      code: error.code || 'なし',
      timestamp: new Date().toISOString(),
    };
    logMessage += `\n詳細: ${JSON.stringify(errorDetails, null, 2)}`;
  }
  debugLog.textContent += `${logMessage}\n`;
  debugLog.scrollTop = debugLog.scrollHeight;
}

// CDNロードエラーをハンドリング
// 拡張ポイント: フォールバックCDNやローカルファイルを試す場合、ここにロジック追加
function handleCdnError() {
  const error = new Error('ytdl-coreのCDNロードに失敗しました');
  logDebug('CDNロードエラー', error);
  // フォールバックCDNを試す
  const fallbackCdn = 'https://unpkg.com/@warren-bank/browser-ytdl-core@latest/dist/ytdl-core.js';
  const script = document.createElement('script');
  script.src = fallbackCdn;
  script.onload = () => logDebug('フォールバックCDNをロードしました: ' + fallbackCdn);
  script.onerror = () => logDebug('フォールバックCDNも失敗しました: ' + fallbackCdn);
  document.head.appendChild(script);
}

// 進捗を更新
// @param {string} text - 進捗メッセージ
// @param {string} code - 表示するコードスニペット
function updateProgress(text, code = '') {
  document.querySelector('#progress-text').textContent = text;
  document.querySelector('#progress-code').textContent = code;
  document.querySelector('#progress-area').style.display = 'block';
}

// 動画メタデータを取得
// @param {string} url - YouTube URL
// @returns {Promise<Object>} メタデータ
async function getVideoMetadata(url) {
  try {
    if (typeof ytdl === 'undefined') throw new Error('ytdl-coreがロードされていません');
    updateProgress('URLを解析中...', 'ytdl.getInfo(url)');
    const info = await ytdl.getInfo(url, { signal: abortController.signal });
    logDebug('メタデータ取得成功');
    return info;
  } catch (error) {
    logDebug('メタデータ取得エラー', error);
    throw error;
  }
}

// ダウンロードリンクを生成
// @param {Object} info - 動画メタデータ
// @param {string} resolution - 選択された解像度（例: '720p'）
// @param {string} format - 選択された形式（例: 'mp4'）
async function generateDownloadLink(info, resolution, format) {
  try {
    updateProgress('ダウンロードURLを生成中...', `info.formats.find(f => f.qualityLabel === '${resolution}' && f.container === '${format}')`);
    const selectedFormat = info.formats.find(f => 
      f.qualityLabel === resolution && f.container === format
    ) || info.formats.find(f => f.container === format); // フォールバック
    if (!selectedFormat) throw new Error('選択された形式が見つかりません');
    return selectedFormat.url;
  } catch (error) {
    logDebug('ダウンロードURL生成エラー', error);
    throw error;
  }
}

// ダウンロード処理
// @param {string} url - YouTube URL
// @param {string} resolution - 解像度
// @param {string} format - 形式
// @param {string} customTitle - カスタムタイトル（任意）
async function downloadVideo(url, resolution, format, customTitle) {
  try {
    abortController = new AbortController();
    const info = await getVideoMetadata(url);
    const downloadUrl = await generateDownloadLink(info, resolution, format);
    
    // 動画プレビューとダウンロードリンクを設定
    const video = document.querySelector('#video-preview');
    video.src = downloadUrl;
    document.querySelector('#download-video').onclick = () => {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = customTitle || info.videoDetails.title;
      link.click();
    };
    
    // メタデータJSONを設定
    const metadata = {
      title: info.videoDetails.title,
      url,
      resolution,
      format,
      timestamp: new Date().toISOString(),
    };
    document.querySelector('#metadata-json').textContent = JSON.stringify(metadata, null, 2);
    document.querySelector('#download-json').onclick = () => {
      const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customTitle || info.videoDetails.title}.json`;
      link.click();
      URL.revokeObjectURL(url);
    };
    
    updateProgress('処理完了！', '');
    document.querySelector('#result-area').style.display = 'block';
    logDebug('ダウンロード処理完了');
  } catch (error) {
    document.querySelector('#url-input').classList.add('downloader__input--error');
    document.querySelector('#progress-text').textContent = translations[localStorage.getItem('language') || 'ja'].error;
    throw error;
  }
}

// 処理をキャンセル
function stopDownload() {
  if (abortController) {
    abortController.abort();
    abortController = null;
    updateProgress('', '');
    document.querySelector('#progress-area').style.display = 'none';
    document.querySelector('#result-area').style.display = 'none';
    document.querySelector('#url-input').classList.remove('downloader__input--error');
    logDebug('処理をキャンセルしました');
  }
}

// 拡張ポイント: Web Workerやキャッシュを使った高速化はここに追加可能
