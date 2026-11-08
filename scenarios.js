/* =========================================================
   TINY TOWN – DỮ LIỆU TÌNH HUỐNG "ĐI MUA SẮM" 🛒 & "TRÒ CHUYỆN" 💬
   ---------------------------------------------------------
   File này chỉ chứa DỮ LIỆU. Muốn thêm tình huống mới: chép một tình huống có sẵn
   trong mảng SCENARIOS ở cuối file, đổi id (không trùng), sửa lời thoại. Không cần sửa index.html.
   Hướng dẫn chi tiết: xem CHANGES_SHOPPING_TALK.md.

   Dùng <script src> (không dùng fetch JSON) để game chạy được cả khi mở file trực tiếp (file://).
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Hàm viết tắt để dữ liệu gọn, dễ đọc ----------
     G = lựa chọn TỐT (great) · O = tạm được (ok) · T = thử lại (try_again, không có "next": bé chọn lại)
     G/O(emoji, câu bé nói, nhân vật đáp lại, lời khen/gợi ý của Rồng, nút tiếp theo, cảm xúc nhân vật)
     T  (emoji, câu bé nói, nhân vật đáp lại, gợi ý nhẹ nhàng của Rồng, cảm xúc nhân vật)            */
  const G = (emoji, text, react, feedback, next, mood) => ({ emoji, text, quality: 'great', npcReaction: { text: react || '', mood: mood || 'happy' }, feedback, next });
  const O = (emoji, text, react, feedback, next, mood) => ({ emoji, text, quality: 'ok', npcReaction: { text: react || '', mood: mood || 'neutral' }, feedback, next });
  const T = (emoji, text, react, feedback, mood) => ({ emoji, text, quality: 'try_again', npcReaction: { text: react || '', mood: mood || 'confused' }, feedback });
  // Nút hội thoại
  const talk = (npc, text, mood, choices) => ({ type: 'talk', npc, text, mood, choices });
  const feel = (npc, text, answer, options, next, praise) => ({ type: 'feeling', npc, text, answer, options, next, praise });
  const end = (npc, text, mood) => ({ type: 'end', npc, text, mood: mood || 'happy' });

  /* ---------- Chế độ ---------- */
  const modes = {
    shopping: { emoji: '🛒', title: 'Đi mua sắm' },
    talk:     { emoji: '💬', title: 'Trò chuyện hằng ngày' },
  };

  /* ---------- Kỹ năng (Sổ tiến bộ) ---------- */
  const skills = {
    greet:    { emoji: '👋', name: 'Chào hỏi' },
    thanks:   { emoji: '🙏', name: 'Cảm ơn – Xin lỗi' },
    ask:      { emoji: '🙋', name: 'Hỏi – Nhờ giúp đỡ' },
    money:    { emoji: '💰', name: 'Tính tiền' },
    list:     { emoji: '🧾', name: 'Mua đúng danh sách' },
    patience: { emoji: '🧍', name: 'Kiên nhẫn – Xếp hàng' },
    feelings: { emoji: '💗', name: 'Nhận biết cảm xúc' },
    safety:   { emoji: '🛡️', name: 'An toàn với người lạ' },
    refuse:   { emoji: '✋', name: 'Biết từ chối' },
    share:    { emoji: '🤝', name: 'Chơi cùng – Chia sẻ' },
    kind:     { emoji: '🤗', name: 'Quan tâm – Giúp đỡ' },
  };

  /* ---------- Cảm xúc (khuôn mặt vẽ trong index.html, hàm faceSVG) ---------- */
  const emotions = {
    happy:     { emoji: '😊', label: 'Vui' },
    neutral:   { emoji: '🙂', label: 'Bình thường' },
    confused:  { emoji: '😕', label: 'Bối rối' },
    sad:       { emoji: '😢', label: 'Buồn' },
    angry:     { emoji: '😠', label: 'Giận' },
    scared:    { emoji: '😨', label: 'Sợ' },
    surprised: { emoji: '😮', label: 'Ngạc nhiên' },
    worried:   { emoji: '😟', label: 'Lo lắng' },
  };

  /* ---------- Ngoại hình nhân vật (vẽ bằng SVG, không dùng ảnh) ----------
     style: short | long | pigtails | bun | bald · hat: police | cap · tag: bảng tên nhân viên */
  const looks = {
    woman:    { hair: '#3b2a1a', style: 'long', shirt: '#f472b6' },
    mom:      { hair: '#3b2a1a', style: 'long', shirt: '#ef4444' },            // mẹ mặc áo đỏ
    man:      { hair: '#1f2937', style: 'short', shirt: '#3b82f6' },
    grandma:  { hair: '#d1d5db', style: 'bun', shirt: '#a78bfa', glasses: true, skin: '#f3c9a8' },
    grandpa:  { hair: '#e5e7eb', style: 'bald', shirt: '#92400e', glasses: true, skin: '#f3c9a8' },
    girl:     { hair: '#1f2937', style: 'pigtails', shirt: '#fb923c' },
    girl2:    { hair: '#78350f', style: 'long', shirt: '#facc15' },
    boy:      { hair: '#1f2937', style: 'short', shirt: '#22c55e' },
    boy2:     { hair: '#78350f', style: 'short', shirt: '#06b6d4', skin: '#e8b48f' },
    me:       { hair: '#1f2937', style: 'short', shirt: '#8b5cf6' },           // chính bé
    teacher:  { hair: '#1f2937', style: 'long', shirt: '#0ea5e9', glasses: true },
    police:   { hair: '#1f2937', style: 'short', shirt: '#15803d', hat: 'police' },
    guard:    { hair: '#1f2937', style: 'short', shirt: '#1e40af', hat: 'cap', hatColor: '#1e3a8a', tag: true },
    staff:    { hair: '#3b2a1a', style: 'short', shirt: '#16a34a', hat: 'cap', hatColor: '#15803d', tag: true }, // đồng phục + bảng tên
    cashier:  { hair: '#3b2a1a', style: 'long', shirt: '#16a34a', tag: true },
    baker:    { hair: '#3b2a1a', style: 'bun', shirt: '#fde68a', hat: 'cap', hatColor: '#ffffff' },
    seller:   { hair: '#3b2a1a', style: 'bun', shirt: '#f97316' },
    stranger: { hair: '#374151', style: 'short', shirt: '#6b7280', hat: 'cap', hatColor: '#4b5563' }, // người lạ trông bình thường
  };

  /* ---------- Địa điểm (màu nền + đồ trang trí emoji) ---------- */
  const locations = {
    bakery:   { name: 'Tiệm bánh',     bg: ['#fef3c7', '#fde68a'], decor: '🥐 🍞 🎂' },
    grocery:  { name: 'Tiệm tạp hóa',  bg: ['#ecfccb', '#bef264'], decor: '🧺 🍚 🥫' },
    minimart: { name: 'Siêu thị mini', bg: ['#e0f2fe', '#a5f3fc'], decor: '🛒 🏷️ 🧃' },
    school:   { name: 'Trường học',    bg: ['#fef9c3', '#fde047'], decor: '🏫 📚 ✏️' },
    home:     { name: 'Ở nhà',         bg: ['#fce7f3', '#fbcfe8'], decor: '🏠 🛋️ 🕰️' },
    street:   { name: 'Ngoài đường',   bg: ['#e0e7ff', '#c7d2fe'], decor: '🚦 🌳 🏙️' },
    bus:      { name: 'Xe buýt',       bg: ['#ffedd5', '#fed7aa'], decor: '🚌 🪟 🎒' },
    park:     { name: 'Công viên',     bg: ['#dcfce7', '#86efac'], decor: '🌳 🎈 🌼' },
    phone:    { name: 'Gọi điện',      bg: ['#f3e8ff', '#e9d5ff'], decor: '☎️ 💕' },
  };

  /* ---------- Khu trên kệ hàng ---------- */
  const zones = {
    veg:    { emoji: '🥬', name: 'Rau củ' },
    fruit:  { emoji: '🍎', name: 'Trái cây' },
    dairy:  { emoji: '🥛', name: 'Sữa – Trứng' },
    pantry: { emoji: '🍚', name: 'Đồ khô' },
    snack:  { emoji: '🍪', name: 'Bánh kẹo' },
    bakery: { emoji: '🥐', name: 'Quầy bánh' },
    school: { emoji: '✏️', name: 'Đồ dùng học tập' },
    home:   { emoji: '🧼', name: 'Đồ dùng gia đình' },
  };

  /* ---------- Hàng hóa (giá đơn giản, đơn vị đồng) ---------- */
  const items = {
    'rau-muong':  { zone: 'veg',    emoji: '🥬', name: 'Rau muống',  price: 10000 },
    'ca-chua':    { zone: 'veg',    emoji: '🍅', name: 'Cà chua',    price: 15000 },
    'ca-rot':     { zone: 'veg',    emoji: '🥕', name: 'Cà rốt',     price: 8000 },
    'khoai-tay':  { zone: 'veg',    emoji: '🥔', name: 'Khoai tây',  price: 12000 },
    'bi-do':      { zone: 'veg',    emoji: '🎃', name: 'Bí đỏ',      price: 20000 },
    'hanh':       { zone: 'veg',    emoji: '🧅', name: 'Hành',       price: 5000 },
    'chuoi':      { zone: 'fruit',  emoji: '🍌', name: 'Chuối',      price: 20000 },
    'tao':        { zone: 'fruit',  emoji: '🍎', name: 'Táo',        price: 30000 },
    'cam':        { zone: 'fruit',  emoji: '🍊', name: 'Cam',        price: 25000 },
    'dua-hau':    { zone: 'fruit',  emoji: '🍉', name: 'Dưa hấu',    price: 40000 },
    'nho':        { zone: 'fruit',  emoji: '🍇', name: 'Nho',        price: 50000 },
    'sua-tuoi':   { zone: 'dairy',  emoji: '🥛', name: 'Sữa tươi',   price: 10000 },
    'sua-dau':    { zone: 'dairy',  emoji: '🧃', name: 'Sữa dâu',    price: 12000 },
    'trung':      { zone: 'dairy',  emoji: '🥚', name: 'Hộp trứng',  price: 30000 },
    'pho-mai':    { zone: 'dairy',  emoji: '🧀', name: 'Phô mai',    price: 25000 },
    'gao':        { zone: 'pantry', emoji: '🍚', name: 'Gạo',        price: 25000 },
    'mi-goi':     { zone: 'pantry', emoji: '🍜', name: 'Mì gói',     price: 5000 },
    'dau-an':     { zone: 'pantry', emoji: '🧴', name: 'Dầu ăn',     price: 45000 },
    'muoi':       { zone: 'pantry', emoji: '🧂', name: 'Muối',       price: 5000 },
    'banh-quy':   { zone: 'snack',  emoji: '🍪', name: 'Bánh quy',   price: 20000 },
    'keo':        { zone: 'snack',  emoji: '🍬', name: 'Kẹo',        price: 5000 },
    'socola':     { zone: 'snack',  emoji: '🍫', name: 'Sô-cô-la',   price: 18000 },
    'bong-ngo':   { zone: 'snack',  emoji: '🍿', name: 'Bỏng ngô',   price: 15000 },
    'banh-mi':    { zone: 'bakery', emoji: '🥖', name: 'Bánh mì',    price: 10000 },
    'sung-bo':    { zone: 'bakery', emoji: '🥐', name: 'Bánh sừng bò', price: 15000 },
    'banh-kem':   { zone: 'bakery', emoji: '🎂', name: 'Bánh kem',   price: 80000 },
    'cupcake':    { zone: 'bakery', emoji: '🧁', name: 'Bánh nướng nhỏ', price: 10000 },
    'donut':      { zone: 'bakery', emoji: '🍩', name: 'Bánh vòng',  price: 12000 },
    'nen':        { zone: 'bakery', emoji: '🕯️', name: 'Nến',        price: 2000 },
    'but-chi':    { zone: 'school', emoji: '✏️', name: 'Bút chì',    price: 5000 },
    'vo':         { zone: 'school', emoji: '📒', name: 'Vở',         price: 12000 },
    'thuoc':      { zone: 'school', emoji: '📏', name: 'Thước kẻ',   price: 7000 },
    'sap-mau':    { zone: 'school', emoji: '🖍️', name: 'Bút sáp màu', price: 25000 },
    'keo-cat':    { zone: 'school', emoji: '✂️', name: 'Kéo',        price: 15000 },
    'xa-phong':   { zone: 'home',   emoji: '🧼', name: 'Xà phòng',   price: 15000 },
    'giay':       { zone: 'home',   emoji: '🧻', name: 'Giấy vệ sinh', price: 30000 },
    'mut-rua':    { zone: 'home',   emoji: '🧽', name: 'Miếng rửa chén', price: 8000 },
  };

  /* ---------- Tiền Việt Nam (vẽ đơn giản, phân biệt bằng màu + số to) ---------- */
  const money = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

  /* ---------- Nhóm tình huống Trò chuyện ---------- */
  const talkGroups = [
    { id: 'family',   emoji: '🏠', title: 'Gia đình & hàng xóm' },
    { id: 'school',   emoji: '🏫', title: 'Trường học & bạn bè' },
    { id: 'street',   emoji: '🚦', title: 'Ngoài đường' },
    { id: 'safety',   emoji: '🛡️', title: 'Biết từ chối & an toàn' },
    { id: 'feelings', emoji: '💗', title: 'Cảm xúc của mình' },
  ];

  /* ---------- Lời của Rồng khi tình huống không ghi feedback riêng ---------- */
  const defaultFeedback = {
    great:     'Tuyệt vời! Con nói rất hay!',
    ok:        'Được rồi! Con còn có thể nói lễ phép hơn nữa đó.',
    try_again: 'Mình thử cách khác nhé! Con bấm 💡 nếu cần gợi ý.',
  };

  /* ---------- Lựa chọn mẫu cho bước kiểm tra tiền thối ---------- */
  const changeChoices = {
    correct: [
      G('🙏', 'Dạ con cảm ơn cô ạ!', 'Không có gì con.', 'Con đã kiểm tra tiền thối và cảm ơn cô. Rất cẩn thận!'),
      T('🤔', 'Cô ơi, cô thối thiếu ạ.', 'Cô đếm lại rồi, đủ rồi con ạ.', 'Con tính lại nhé: tiền con đưa trừ tiền hàng. Bấm 💡 để xem cách tính.'),
    ],
    short: [
      G('🙋', 'Dạ cô ơi, hình như cô thối thiếu ạ.', 'Ôi, cô đếm nhầm! Cô xin lỗi con, cô đưa thêm nè.', 'Con kiểm tra tiền thối và nói rất lễ phép. Giỏi quá!', null, 'surprised'),
      T('🙏', 'Dạ con cảm ơn cô ạ! (đi về luôn)', '', 'Khoan đã! Con đếm lại tiền thối nhé. Hình như còn thiếu đó.', 'happy'),
      T('😠', 'Cô ăn gian!', 'Ơ… cô chỉ đếm nhầm thôi mà.', 'Có thể cô đếm nhầm thôi. Mình nói nhẹ nhàng: “Dạ cô ơi, hình như cô thối thiếu ạ.”', 'sad'),
    ],
  };

  /* =========================================================
     CÁC TÌNH HUỐNG
     Trường bắt buộc: id, mode (shopping|talk), title, level (1–3), skills, location, npcs, nodes.
     Mua sắm thêm: list (danh sách mẹ dặn, need:'low' = món ít cần, có thể bỏ), wallet (các tờ tiền),
                   soldOut { món hết: món thay thế } (cần lựa chọn có flag:'sub').
     Trò chuyện thêm: group (xem talkGroups).
     Nút bắt đầu là "start". Lựa chọn T không có next → bé được chọn lại.
     ========================================================= */
  const SCENARIOS = [

  ];

  window.TT_DATA = {
    modes, skills, emotions, looks, locations, zones, items, money, talkGroups,
    defaultFeedback, changeChoices,
    unlockNeed: 2,          // số tình huống cấp trước cần hoàn thành để mở cấp tiếp theo
    scenarios: SCENARIOS,
  };
})();
