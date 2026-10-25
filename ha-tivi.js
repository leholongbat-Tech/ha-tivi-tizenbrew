// ha-tivi.js — TizenBrew chèn file này vào mọi trang của module "HA Tivi" trước khi trang tải
// (evaluateScriptOnDocumentStart). Viết ES5: trình duyệt Tizen 6.0 (tivi 2021) không hiểu cú pháp mới.
// Bản gốc: repo IOT_BATAI, Server/config/tivi/tizenbrew-module/; runbook Server/docs/runbooks/tivi-hien-thi-ha.md.
(function () {
    if (location.hostname !== 'dashboard.bat-ai.com') return;
    var batDau = Date.now();

    // Ẩn thanh bên trái, giao diện tiếng Việt (HA đọc các khoá này trong localStorage khi khởi động, giá trị dạng JSON)
    try {
        localStorage.setItem('dockedSidebar', '"always_hidden"');
        localStorage.setItem('selectedLanguage', '"vi"');
    } catch (e) { /* localStorage hỏng thì vẫn hiện dashboard, chỉ còn thanh bên */ }

    // Chế độ kiosk có sẵn của HA 2026 (src/state/sidebar-mixin.ts nghe sự kiện "hass-kiosk-mode"): ẩn thanh bên,
    // nút menu, nút tìm kiếm/Assist/sửa. HA chỉ nghe sau khi khung ứng dụng dựng xong, nên gửi lặp lại (không hại).
    function batKiosk() {
        var ev = new CustomEvent('hass-kiosk-mode', { detail: { enable: true } });
        window.dispatchEvent(ev);
    }
    var lan = 0;
    var dem = setInterval(function () {
        batKiosk();
        if (++lan >= 30) { clearInterval(dem); setInterval(batKiosk, 60 * 1000); }
    }, 2000);

    // Tắt màn hình chờ của tivi khi trang HA đứng yên lâu (chỉ có tác dụng nếu webapis chạy được trong trang)
    function tatManHinhCho() {
        try {
            webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
        } catch (e) { /* không có webapis: tắt tay trong cài đặt tivi (runbook bước 4) */ }
    }
    if (window.webapis) {
        tatManHinhCho();
    } else if (/Tizen/.test(navigator.userAgent)) {
        document.addEventListener('DOMContentLoaded', function () {
            var s = document.createElement('script');
            s.src = '$WEBAPIS/webapis/webapis.js';
            s.onload = tatManHinhCho;
            document.head.appendChild(s);
        });
    }

    // Nút đỏ trên remote: tải lại trang
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 403) location.reload();
    });

    // Mỗi ngày tải lại 1 lần lúc 4 giờ sáng để trình duyệt cũ không phình bộ nhớ
    setInterval(function () {
        if (new Date().getHours() === 4 && Date.now() - batDau > 2 * 3600 * 1000) location.reload();
    }, 10 * 60 * 1000);
})();
