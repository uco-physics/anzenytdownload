// 言語データを管理するモジュール
// 将来的に新しい言語を追加する場合は、このオブジェクトに追記
const translations = {
  en: {
    placeholder: 'Enter YouTube URL',
    download: 'Download',
    stop: 'Stop',
    settings: 'Settings',
    apply: 'Apply',
    customTitle: 'Custom Title (Optional)',
    progress: 'Processing...',
    error: 'Invalid URL. Please check and try again.',
    modalMessage: 'Previous process is incomplete. Resume?',
    resume: 'Resume',
    discard: 'Discard',
  },
  ja: {
    placeholder: 'YouTubeのURLを入力',
    download: 'ダウンロード',
    stop: 'ストップ',
    settings: '詳細設定',
    apply: '適用',
    customTitle: 'カスタムタイトル（任意）',
    progress: '処理中...',
    error: '無効なURLです。確認して再試行してください。',
    modalMessage: '前回の処理が未完了です。続行しますか？',
    resume: '続行',
    discard: '破棄',
  },
  zh: {
    placeholder: '输入YouTube链接',
    download: '下载',
    stop: '停止',
    settings: '详细设置',
    apply: '应用',
    customTitle: '自定义标题（可选）',
    progress: '处理中...',
    error: '无效的URL，请检查后重试。',
    modalMessage: '上一次处理未完成。继续吗？',
    resume: '继续',
    discard: '放弃',
  },
};

// 言語を切り替える関数
// @param {string} lang - 言語コード（例: 'en', 'ja', 'zh'）
function setLanguage(lang) {
  document.querySelector('#url-input').placeholder = translations[lang].placeholder;
  document.querySelector('#download-btn').textContent = translations[lang].download;
  document.querySelector('#stop-btn').textContent = translations[lang].stop;
  document.querySelector('#settings-toggle').setAttribute('aria-label', translations[lang].settings);
  document.querySelector('#apply-cdn').textContent = translations[lang].apply;
  document.querySelector('#title-input').placeholder = translations[lang].customTitle;
  // デバッグログに言語切り替えを記録
  logDebug(`言語を${lang}に切り替えました`);
}

// 初期化時にlocalStorageから言語を復元
// 拡張ポイント: 将来的にサーバー側で言語設定を管理する場合、API呼び出しに置き換え可能
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('language') || 'ja';
  document.querySelector('#language').value = savedLang;
  setLanguage(savedLang);
});
