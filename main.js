// メインスクリプト: UIとダウンロード処理を統合
// 依存: download.js, translations.js

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  // 要素の取得
  const urlInput = document.querySelector('#url-input');
  const downloadBtn = document.querySelector('#download-btn');
  const cancelBtn = document.querySelector('#cancel-btn');
  const settingsToggle = document.querySelector('#settings-toggle');
  const settingsPanel = document.querySelector('#settings-panel');
  const cdnInput = document.querySelector('#cdn-input');
  const applyCdn = document.querySelector('#apply-cdn');
  const languageSelect = document.querySelector('#language');
  const debugToggle = document.querySelector('#debug-toggle');
  const debugPanel = document.querySelector('#debug-panel');
  const modal = document.querySelector('#warning-modal');
  const modalMessage = document.querySelector('#modal-message');
  const modalResume = document.querySelector('#modal-resume');
  const modalDiscard = document.querySelector('#modal-discard');

  // 状態管理
  let state = {
    url: '',
    resolution: '720p',
    format: 'mp4',
    customTitle: '',
    isProcessing: false,
  };

  // localStorageから状態を復元
  const savedState = localStorage.getItem('downloadState');
  if (savedState) {
    state = JSON.parse(savedState);
    urlInput.value = state.url;
    document.querySelector('#resolution').value = state.resolution;
    document.querySelector('#format').value = state.format;
    document.querySelector('#title-input').value = state.customTitle;
    if (state.isProcessing) {
      modalMessage.textContent = translations[localStorage.getItem('language') || 'ja'].modalMessage;
      modal.style.display = 'flex';
    }
  }

  // CDNのカスタム設定
  const defaultCdn = 'https://cdn.jsdelivr.net/npm/@warren-bank/browser-ytdl-core@latest/dist/ytdl-core.js';
  cdnInput.value = localStorage.getItem('cdnUrl') || defaultCdn;
  applyCdn.onclick = () => {
    const newCdn = cdnInput.value || defaultCdn;
    localStorage.setItem('cdnUrl', newCdn);
    const script = document.createElement('script');
    script.src = newCdn;
    script.onload = () => logDebug('カスタムCDNをロードしました');
    script.onerror = (error) => logDebug('カスタムCDNのロードに失敗しました', error);
    document.head.appendChild(script);
  };

  // ダウンロードボタン
  downloadBtn.onclick = async () => {
    state.url = urlInput.value;
    state.resolution = document.querySelector('#resolution').value;
    state.format = document.querySelector('#format').value;
    state.customTitle = document.querySelector('#title-input').value;
    state.isProcessing = true;
    localStorage.setItem('downloadState', JSON.stringify(state));
    downloadBtn.style.display = 'none';
    cancelBtn.style.display = 'block';
    try {
      await downloadVideo(state.url, state.resolution, state.format, state.customTitle);
      state.isProcessing = false;
      localStorage.setItem('downloadState', JSON.stringify(state));
      downloadBtn.style.display = 'block';
      cancelBtn.style.display = 'none';
    } catch (error) {
      state.isProcessing = false;
      localStorage.setItem('downloadState', JSON.stringify(state));
      downloadBtn.style.display = 'block';
      cancelBtn.style.display = 'none';
    }
  };

  // キャンセルボタン
  cancelBtn.onclick = () => {
    stopDownload();
    state.isProcessing = false;
    localStorage.setItem('downloadState', JSON.stringify(state));
    downloadBtn.style.display = 'block';
    cancelBtn.style.display = 'none';
  };

  // 詳細設定トグル
  settingsToggle.onclick = () => {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  };

  // 言語切り替え
  languageSelect.onchange = () => {
    const lang = languageSelect.value;
    localStorage.setItem('language', lang);
    setLanguage(lang);
  };

  // デバッグトグル
  debugToggle.onclick = () => {
    const isOn = debugToggle.getAttribute('data-state') === 'on';
    debugToggle.setAttribute('data-state', isOn ? 'off' : 'on');
    debugToggle.textContent = isOn ? 'デバッグ：オフ' : 'デバッグ：オン';
    debugPanel.style.display = isOn ? 'none' : 'block';
    logDebug(`デバッグモードを${isOn ? 'オフ' : 'オン'}にしました`);
  };

  // モーダル操作
  modalResume.onclick = () => {
    modal.style.display = 'none';
    downloadBtn.click();
  };
  modalDiscard.onclick = () => {
    state.isProcessing = false;
    localStorage.removeItem('downloadState');
    modal.style.display = 'none';
    document.querySelector('#progress-area').style.display = 'none';
    document.querySelector('#result-area').style.display = 'none';
    downloadBtn.style.display = 'block';
    cancelBtn.style.display = 'none';
  };

  // タブ更新/閉じる時の警告
  window.onbeforeunload = () => {
    if (state.isProcessing) {
      return '処理中です。ページを離れると中断されます。';
    }
  };

  // 拡張ポイント: Googleアカウントログインはauth.jsに分離可能
});
