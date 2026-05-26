/**
 * partials-loader.js
 *
 * Tìm tất cả phần tử có thuộc tính `data-include="path/to/file.html"` trong
 * tài liệu, fetch từng file và thay thế phần tử bằng nội dung HTML đó.
 *
 * Khi tất cả partial đã được nạp xong, một custom event `partials:loaded`
 * được phát trên `document` — dùng cho code khác cần chờ DOM hoàn chỉnh.
 *
 * LƯU Ý: vì script này dùng `fetch`, mở file Portfolio.html trực tiếp bằng
 * giao thức `file://` sẽ KHÔNG hoạt động (CORS chặn). Phải chạy qua local
 * server, ví dụ:
 *   - VS Code: extension "Live Server"
 *   - Node:    npx serve .
 *   - Python:  python -m http.server 8080
 */
(async () => {
  const nodes = Array.from(document.querySelectorAll('[data-include]'));

  await Promise.all(nodes.map(async (el) => {
    const url = el.getAttribute('data-include');
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const html = await res.text();
      const tpl = document.createElement('template');
      tpl.innerHTML = html.trim();
      el.replaceWith(tpl.content.cloneNode(true));
    } catch (err) {
      console.error(`[partials-loader] failed to load ${url}:`, err);
      el.innerHTML = `<!-- partials-loader: failed to load ${url} -->`;
    }
  }));

  document.dispatchEvent(new CustomEvent('partials:loaded'));
})();
