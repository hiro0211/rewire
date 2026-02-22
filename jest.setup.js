// React 19 + react-test-renderer の cleanup 時に
// window.dispatchEvent が存在しない環境でクラッシュするのを防ぐ
if (typeof window !== 'undefined' && typeof window.dispatchEvent !== 'function') {
  window.dispatchEvent = () => true;
}
