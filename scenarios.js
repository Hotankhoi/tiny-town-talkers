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

    /* ================= ĐI MUA SẮM 🛒 ================= */

    { id: 'shop-banhmi', mode: 'shopping', level: 1, emoji: '🥖', sticker: '🥖',
      title: 'Mua bánh mì buổi sáng', location: 'bakery', skills: ['greet', 'thanks', 'money', 'list'],
      npcs: { seller: { name: 'Cô bán bánh', look: 'baker' } },
      list: [{ item: 'banh-mi', qty: 2 }], wallet: [50000, 20000],
      nodes: {
        start: talk('seller', 'Chào con! Con muốn mua gì nào?', 'happy', [
          G('👋', 'Dạ con chào cô ạ! Con muốn mua bánh mì ạ.', 'Ôi, con lễ phép quá! Bánh mì ở trên kệ nhé.', 'Con chào cô trước rồi mới nói cần mua gì. Rất lễ phép!', 'shop'),
          T('👉', 'Bánh mì!', 'Ơ… con chưa chào cô mà.', 'Mình chào cô trước nhé: “Dạ con chào cô ạ”.'),
          T('🙈', '(Im lặng, chỉ tay)', 'Con cần gì nè? Con nói cho cô nghe nhé.', 'Con nói thành lời để cô hiểu nhé. Nhớ chào cô trước!'),
        ]),
        shop: { type: 'shop', text: 'Con tìm 2 ổ bánh mì 🥖 trên kệ và cho vào giỏ nhé!', decoys: ['sung-bo', 'donut', 'cupcake'], next: 'pay' },
        pay: { type: 'pay', npc: 'seller', text: 'Hai ổ bánh mì là {total} nhé con.', next: 'thanks' },
        thanks: talk('seller', 'Cô gửi con bánh mì và tiền thối nè.', 'happy', [
          G('🙏', 'Dạ con cảm ơn cô ạ! Con chào cô.', 'Không có gì con. Chào con nhé!', 'Con cảm ơn và chào tạm biệt. Thật lễ phép!', 'bye'),
          O('🙂', 'Cảm ơn.', 'Ừ, không có gì.', 'Con đã cảm ơn. Thêm “Dạ… ạ” sẽ lễ phép hơn nữa!', 'bye'),
          T('🏃', '(Cầm bánh chạy đi luôn)', 'Ơ, con ơi…', 'Khi nhận đồ, mình nói “Dạ con cảm ơn cô ạ” nhé!'),
        ]),
        bye: end('seller', 'Con ngoan lắm. Mang bánh về cho cả nhà nhé!'),
      } },

    { id: 'shop-traicay', mode: 'shopping', level: 1, emoji: '🍌', sticker: '🧺',
      title: 'Mua trái cây biếu bà', location: 'grocery', skills: ['greet', 'ask', 'thanks', 'list'],
      npcs: { seller: { name: 'Cô Ba tạp hóa', look: 'seller' } },
      list: [{ item: 'chuoi', qty: 1 }, { item: 'tao', qty: 1 }], wallet: [100000],
      nodes: {
        start: talk('seller', 'A, chào con! Hôm nay con đi mua gì đó?', 'happy', [
          G('🙇', 'Dạ con chào cô Ba ạ! Con mua trái cây biếu bà ạ.', 'Con thương bà quá! Cô giúp con nhé.', 'Con chào hỏi và nói rõ mình cần gì. Tuyệt vời!', 'ask'),
          O('👋', 'Chào cô. Con mua trái cây.', 'Ừ, con cứ xem nhé.', 'Con chào rồi đó! Thêm “Dạ… ạ” sẽ lễ phép hơn.', 'ask'),
          T('😶', '(Đi thẳng vào lục kệ)', 'Ơ, con tìm gì vậy?', 'Vào cửa hàng, mình chào cô bán hàng trước nhé.'),
        ]),
        ask: talk('seller', 'Con cần cô giúp gì không?', 'neutral', [
          G('🙋', 'Dạ cô ơi, trái cây để ở đâu ạ?', 'Ở kệ bên tay phải, có chuối và táo đó con.', 'Con hỏi đường rất lễ phép. Giỏi quá!', 'shop'),
          O('🤷', 'Trái cây đâu?', 'Ở kệ bên phải đó con.', 'Con hỏi được rồi! Nói “Dạ cô ơi… ạ” sẽ hay hơn nữa.', 'shop'),
          T('😭', '(Khóc vì không tìm thấy)', 'Không sao đâu con, con hỏi cô nhé.', 'Không tìm thấy thì mình hỏi người bán hàng: “Dạ cô ơi, … ở đâu ạ?”', 'worried'),
        ]),
        shop: { type: 'shop', text: 'Mẹ dặn mua 1 nải chuối 🍌 và 1 túi táo 🍎. Con tìm trên kệ nhé!', decoys: ['cam', 'nho', 'ca-chua', 'keo'], next: 'pay' },
        pay: { type: 'pay', npc: 'seller', text: 'Chuối với táo là {total} nhé con.', next: 'thanks' },
        thanks: talk('seller', 'Cô thối con {change} nè. Cho bà ăn ngon miệng nhé!', 'happy', [
          G('🙏', 'Dạ con cảm ơn cô ạ! Con chào cô.', 'Chào con, lần sau lại ghé nhé!', 'Con cảm ơn và chào cô. Rất ngoan!', 'bye'),
          T('🙄', '(Quay lưng đi không nói gì)', 'Ơ…', 'Mình nói “Dạ con cảm ơn cô ạ” trước khi về nhé.', 'sad'),
        ]),
        bye: end('seller', 'Bà sẽ vui lắm khi nhận trái cây của con đó!'),
      } },

    { id: 'shop-sua', mode: 'shopping', level: 1, emoji: '🥛', sticker: '🥛',
      title: 'Mua sữa và xếp hàng', location: 'minimart', skills: ['list', 'patience', 'thanks'],
      npcs: { staff: { name: 'Anh nhân viên', look: 'staff' }, auntie: { name: 'Bác xếp hàng', look: 'grandma' }, cashier: { name: 'Cô thu ngân', look: 'cashier' } },
      list: [{ item: 'sua-tuoi', qty: 2 }], wallet: [50000],
      nodes: {
        start: { type: 'shop', npc: 'staff', say: 'Chào mừng em đến siêu thị mini!', text: 'Con lấy 2 hộp sữa tươi 🥛 cho vào giỏ nhé!', decoys: ['sua-dau', 'pho-mai', 'banh-quy', 'socola'], next: 'queue' },
        queue: talk('auntie', 'Mọi người đang xếp hàng chờ tính tiền.', 'neutral', [
          G('🧍', 'Con đứng xếp hàng sau bác ạ.', 'Cháu ngoan quá, biết xếp hàng!', 'Con kiên nhẫn chờ đến lượt. Giỏi lắm!', 'pay'),
          T('🏃', '(Chen lên đứng trước bác)', 'Ơ cháu ơi, bác đến trước mà.', 'Mọi người đều đang chờ. Mình xếp hàng phía sau và đợi đến lượt nhé.', 'sad'),
          T('😤', 'Nhanh lên đi!', 'Ai cũng phải chờ mà cháu.', 'Chờ hơi lâu nhưng mình kiên nhẫn nhé. Con thử đếm 1, 2, 3… trong đầu.'),
        ]),
        pay: { type: 'pay', npc: 'cashier', text: 'Đến lượt con rồi! Hai hộp sữa là {total}.', next: 'thanks' },
        thanks: talk('cashier', 'Cô gửi con sữa và {change} tiền thối nhé.', 'happy', [
          G('🙏', 'Dạ con cảm ơn cô ạ!', 'Chúc con một ngày vui!', 'Con chờ đến lượt và cảm ơn cô. Tuyệt vời!', 'bye'),
          O('👍', 'Ok cô.', 'Ừ, chào con.', 'Con nói “Dạ con cảm ơn cô ạ” sẽ lễ phép hơn nhé.', 'bye'),
        ]),
        bye: end('cashier', 'Xếp hàng ngoan như con thì ai cũng quý!'),
      } },

    { id: 'shop-canh', mode: 'shopping', level: 2, emoji: '🎃', sticker: '🍲',
      title: 'Đi chợ nấu canh', location: 'grocery', skills: ['greet', 'ask', 'money', 'list'],
      npcs: { seller: { name: 'Cô bán rau', look: 'seller' } },
      list: [{ item: 'bi-do', qty: 1 }, { item: 'ca-rot', qty: 1 }, { item: 'hanh', qty: 1 }], wallet: [20000, 10000, 5000],
      nodes: {
        start: talk('seller', 'Chào con! Con đi chợ giúp mẹ à?', 'happy', [
          G('🙇', 'Dạ con chào cô ạ! Mẹ nhờ con mua đồ nấu canh ạ.', 'Giỏi quá! Con cần gì cô lấy cho.', 'Con chào hỏi lễ phép. Tuyệt vời!', 'ask'),
          O('👋', 'Dạ vâng.', 'Ừ, con cần gì nào?', 'Con nhớ chào cô trước nhé: “Dạ con chào cô ạ”.', 'ask'),
          T('🙈', '(Không trả lời)', 'Con có nghe cô hỏi không?', 'Người lớn hỏi thì mình trả lời nhé.'),
        ]),
        ask: talk('seller', 'Con tìm gì thế?', 'neutral', [
          G('🙋', 'Dạ cô ơi, rau củ để ở đâu ạ?', 'Ở góc bên trái nhé con, có bí đỏ, cà rốt, hành đó.', 'Con hỏi chỗ để đồ rất lễ phép!', 'shop'),
          O('🤷', 'Rau đâu ạ?', 'Ở góc bên trái đó con.', 'Hỏi được rồi! Thêm “Dạ cô ơi…” nữa là tuyệt.', 'shop'),
          T('🌪️', '(Tự lục tung các kệ)', 'Ôi, đồ rơi hết rồi con ơi!', 'Không biết đồ ở đâu, mình hỏi cô bán hàng nhé.', 'surprised'),
        ]),
        shop: { type: 'shop', text: 'Mẹ dặn: 1 quả bí đỏ 🎃, 1 củ cà rốt 🥕, 1 bó hành 🧅. Có nhiều đồ giống nhau, con nhìn kỹ nhé!', decoys: ['khoai-tay', 'ca-chua', 'rau-muong', 'chuoi', 'muoi'], next: 'pay' },
        pay: { type: 'pay', npc: 'seller', text: 'Tất cả là {total} nhé con.', next: 'change' },
        change: { type: 'change', npc: 'seller', next: 'thanks' },
        thanks: talk('seller', 'Về nấu canh ngon nhé con!', 'happy', [
          G('👋', 'Dạ con chào cô ạ!', 'Chào con nhé!', 'Con chào tạm biệt rất lễ phép.', 'bye'),
          T('🏃', '(Chạy về luôn)', 'Ơ, con ơi…', 'Trước khi về, mình chào cô nhé.'),
        ]),
        bye: end('seller', 'Cô khen con: biết hỏi, biết tính tiền, biết chào hỏi!'),
      } },

    { id: 'shop-hoctap', mode: 'shopping', level: 2, emoji: '✏️', sticker: '📒',
      title: 'Mua đồ dùng học tập', location: 'minimart', skills: ['ask', 'money', 'patience', 'list'],
      npcs: { staff: { name: 'Chú nhân viên', look: 'staff' }, kid: { name: 'Bạn nhỏ', look: 'boy2' }, cashier: { name: 'Cô thu ngân', look: 'cashier' } },
      list: [{ item: 'but-chi', qty: 2 }, { item: 'vo', qty: 2 }, { item: 'thuoc', qty: 1 }], wallet: [20000, 10000, 10000, 5000],
      nodes: {
        start: talk('staff', 'Chào cháu! Cháu cần tìm gì?', 'happy', [
          G('🙋', 'Dạ chú ơi, đồ dùng học tập ở đâu ạ?', 'Ở kệ cuối, gần cửa sổ nhé cháu.', 'Con hỏi rất rõ ràng và lễ phép!', 'price'),
          O('📏', 'Bút với vở.', 'À, ở kệ cuối đó cháu.', 'Con nói thêm “Dạ chú ơi… ở đâu ạ?” sẽ hay hơn nhé.', 'price'),
          T('🙈', '(Bỏ đi không trả lời)', 'Ơ, chú hỏi cháu mà…', 'Chú hỏi thì mình trả lời và nhờ chú chỉ chỗ nhé.'),
        ]),
        price: talk('staff', 'Cháu muốn hỏi gì nữa không?', 'neutral', [
          G('💬', 'Dạ chú ơi, cuốn vở này giá bao nhiêu ạ?', 'Mỗi cuốn 12.000 đồng cháu ạ. Giá có ghi trên kệ đó.', 'Con biết hỏi giá trước khi mua. Rất khôn ngoan!', 'shop'),
          O('👍', 'Dạ không ạ.', 'Ừ, cháu cứ chọn nhé.', 'Được rồi! Con nhìn giá ghi trên kệ nhé.', 'shop'),
        ]),
        shop: { type: 'shop', text: 'Danh sách: 2 bút chì ✏️, 2 cuốn vở 📒, 1 thước kẻ 📏. Nhìn số lượng kỹ nhé!', decoys: ['sap-mau', 'keo-cat', 'banh-quy', 'xa-phong'], next: 'queue' },
        queue: talk('kid', 'Mình đang xếp hàng ở đây nè.', 'neutral', [
          G('🧍', 'Mình xếp sau bạn nhé.', 'Ừ! Sắp đến lượt mình rồi.', 'Con xếp hàng ngay ngắn. Tuyệt!', 'pay'),
          T('🏃', '(Chen lên trước bạn)', 'Bạn ơi, mình đến trước mà!', 'Chen hàng làm bạn buồn. Mình đứng sau bạn và chờ nhé.', 'sad'),
        ]),
        pay: { type: 'pay', npc: 'cashier', text: 'Tất cả là {total}. Con trả tiền nhé.', next: 'change' },
        change: { type: 'change', npc: 'cashier', next: 'bye' },
        bye: end('cashier', 'Chúc con học thật giỏi nhé!'),
      } },

    { id: 'shop-sinhnhat', mode: 'shopping', level: 2, emoji: '🎂', sticker: '🎉',
      title: 'Mua bánh sinh nhật cho em', location: 'bakery', skills: ['greet', 'money', 'thanks', 'list'],
      npcs: { baker: { name: 'Chú làm bánh', look: 'baker' } },
      list: [{ item: 'banh-kem', qty: 1 }, { item: 'nen', qty: 3 }], wallet: [50000, 20000, 20000],
      nodes: {
        start: talk('baker', 'Chào cháu! Hôm nay có dịp gì vui thế?', 'happy', [
          G('🎂', 'Dạ cháu chào chú ạ! Hôm nay sinh nhật em cháu ạ.', 'Ồ, chúc mừng em cháu nhé! Chú có nhiều bánh kem lắm.', 'Con chào và kể chuyện rất tự nhiên. Tuyệt!', 'shop'),
          O('🙂', 'Sinh nhật ạ.', 'À, chúc mừng nhé!', 'Con nhớ chào chú trước khi nói nhé.', 'shop'),
          T('😠', 'Chú hỏi làm gì!', 'Ơ… chú chỉ muốn giúp cháu thôi.', 'Người bán hàng hỏi thăm thì mình trả lời lễ phép nhé.', 'sad'),
        ]),
        shop: { type: 'shop', text: 'Em 3 tuổi! Mẹ dặn: 1 bánh kem 🎂 và 3 cây nến 🕯️.', decoys: ['cupcake', 'donut', 'sung-bo', 'banh-mi'], next: 'pay' },
        pay: { type: 'pay', npc: 'baker', text: 'Bánh kem và 3 cây nến là {total} nhé.', next: 'change' },
        change: { type: 'change', npc: 'baker', next: 'thanks' },
        thanks: talk('baker', 'Chú gói bánh cẩn thận rồi nè.', 'happy', [
          G('🙏', 'Dạ cháu cảm ơn chú ạ! Chúc chú một ngày vui!', 'Cảm ơn cháu! Cháu dễ thương quá.', 'Con cảm ơn và còn chúc chú nữa. Thật đáng yêu!', 'bye'),
          O('👍', 'Dạ cảm ơn.', 'Không có gì nhé.', 'Con đã cảm ơn! Nói thêm “ạ” sẽ lễ phép hơn.', 'bye'),
          T('🎂', '(Giật hộp bánh rồi chạy)', 'Cẩn thận kẻo rơi bánh cháu ơi!', 'Cầm bánh cẩn thận, và nhớ cảm ơn chú nhé.', 'scared'),
        ]),
        bye: end('baker', 'Chúc em cháu sinh nhật thật vui!'),
      } },

    { id: 'shop-hetsua', mode: 'shopping', level: 3, emoji: '🧃', sticker: '🔎',
      title: 'Hết sữa dâu rồi!', location: 'minimart', skills: ['ask', 'money', 'list', 'thanks'],
      npcs: { staff: { name: 'Cô nhân viên', look: 'staff' }, cashier: { name: 'Cô thu ngân', look: 'cashier' } },
      list: [{ item: 'sua-dau', qty: 2 }, { item: 'banh-quy', qty: 1 }, { item: 'trung', qty: 1 }],
      soldOut: { 'sua-dau': 'sua-tuoi' }, wallet: [50000, 50000],
      nodes: {
        start: talk('staff', 'Chào con! Con cần cô giúp gì không?', 'happy', [
          G('🙋', 'Dạ cô ơi, sữa dâu để ở đâu ạ?', 'Ôi, sữa dâu hết hàng rồi con ạ.', 'Con hỏi rất lễ phép!', 'soldout', 'worried'),
          O('🧃', 'Sữa dâu đâu?', 'Sữa dâu hết hàng rồi con ạ.', 'Con nhớ nói “Dạ cô ơi… ạ” nhé.', 'soldout', 'worried'),
        ]),
        soldout: talk('staff', 'Hết sữa dâu rồi. Con có muốn lấy loại khác không?', 'worried', [
          { ...G('🥛', 'Dạ vậy con lấy sữa tươi thay được không ạ?', 'Được chứ! Sữa tươi ở ngay bên cạnh.', 'Hết hàng thì mình hỏi món thay thế. Rất thông minh!', 'shop'), flag: 'sub' },
          { ...G('📞', 'Dạ con hỏi mẹ đã ạ.', 'Ừ, hỏi mẹ là đúng rồi. Mẹ bảo lấy sữa tươi nhé!', 'Hỏi ý mẹ trước khi đổi món. Rất chu đáo!', 'shop'), flag: 'sub' },
          T('😤', 'Không có thì thôi, con về!', 'Ơ… con chưa mua gì mà.', 'Mình có thể hỏi cô xem có loại nào thay được không nhé.', 'confused'),
        ]),
        shop: { type: 'shop', text: 'Lấy 2 hộp sữa tươi 🥛 thay cho sữa dâu, 1 gói bánh quy 🍪, 1 hộp trứng 🥚.', decoys: ['pho-mai', 'socola', 'bong-ngo', 'mi-goi'], next: 'pay' },
        pay: { type: 'pay', npc: 'cashier', text: 'Tất cả là {total} nhé con. Con tự cộng tiền nhé!', next: 'change' },
        change: { type: 'change', npc: 'cashier', shortBy: 10000, next: 'bye' },
        bye: end('cashier', 'Cảm ơn con đã nhắc cô. Con cẩn thận lắm!'),
      } },

    { id: 'shop-khongdutien', mode: 'shopping', level: 3, emoji: '👛', sticker: '🧮',
      title: 'Không đủ tiền thì sao?', location: 'grocery', skills: ['money', 'thanks', 'list'],
      npcs: { seller: { name: 'Cô Ba tạp hóa', look: 'seller' } },
      list: [{ item: 'gao', qty: 1 }, { item: 'trung', qty: 1 }, { item: 'dau-an', qty: 1 }, { item: 'keo', qty: 1, need: 'low' }],
      wallet: [50000, 20000, 20000, 10000],
      nodes: {
        start: { type: 'shop', npc: 'seller', say: 'Chào con! Con cứ chọn đồ nhé.', text: 'Mẹ dặn: gạo 🍚, trứng 🥚, dầu ăn 🧴. Mẹ cho mua thêm 1 cái kẹo 🍬 nếu đủ tiền.', decoys: ['muoi', 'mi-goi', 'socola', 'sua-tuoi'], next: 'drop' },
        drop: talk('seller', 'Ối! Hộp trứng rơi xuống đất rồi!', 'surprised', [
          G('🙇', 'Dạ con xin lỗi cô, con lỡ làm rơi ạ.', 'Không sao con, cô đổi hộp trứng khác cho con. Con có đau không?', 'Lỡ làm rơi đồ thì nói xin lỗi và báo người bán. Con thật trung thực!', 'pay', 'neutral'),
          T('🙈', '(Đi chỗ khác, coi như không biết)', 'Ơ… ai làm rơi hộp trứng vậy nhỉ?', 'Lỡ làm rơi đồ thì không sao cả. Mình nói xin lỗi và báo cô nhé.'),
          T('🖐️', '(Tự nhặt vỏ trứng vỡ)', 'Đừng nhặt con, kẻo bẩn tay!', 'Đồ vỡ có thể làm bẩn hoặc đau tay. Con báo người lớn nhé.', 'scared'),
        ]),
        pay: { type: 'pay', npc: 'seller', allowRemove: true, text: 'Tất cả là {total} nhé con.',
          removeText: 'Ôi! Ví của con không đủ tiền. Món nào ít cần nhất thì mình để lại nhé?', next: 'change' },
        change: { type: 'change', npc: 'seller', next: 'thanks' },
        thanks: talk('seller', 'Con xếp đồ vào túi rồi nè.', 'happy', [
          G('🙏', 'Dạ con cảm ơn cô ạ! Con chào cô.', 'Chào con! Con giỏi tính toán lắm.', 'Con cảm ơn và chào cô. Rất ngoan!', 'bye'),
          T('😢', 'Con không có kẹo, con không vui!', 'Lần sau con mua kẹo nhé.', 'Không có kẹo hơi tiếc, nhưng con đã mua đủ đồ cần thiết rồi. Mình cảm ơn cô nhé.', 'sad'),
        ]),
        bye: end('seller', 'Biết bỏ bớt món không cần là rất giỏi đó!'),
      } },

    { id: 'shop-lacme', mode: 'shopping', level: 3, emoji: '🧸', sticker: '🛡️',
      title: 'Lạc mẹ trong siêu thị', location: 'minimart', skills: ['safety', 'ask', 'feelings'],
      npcs: { me: { name: 'Con', look: 'me' }, stranger: { name: 'Chú lạ', look: 'stranger' }, staff: { name: 'Cô nhân viên', look: 'staff' }, mom: { name: 'Mẹ', look: 'mom' } },
      nodes: {
        start: talk('me', 'Ôi! Con quay lại không thấy mẹ đâu nữa…', 'worried', [
          G('🧍', 'Đứng yên tại chỗ, hít thở thật sâu', 'Mình bình tĩnh nào. Mẹ sẽ quay lại tìm mình.', 'Đúng rồi! Khi lạc, việc đầu tiên là đứng yên và bình tĩnh.', 'stranger', 'neutral'),
          T('🏃', 'Chạy đi khắp nơi tìm mẹ', 'Chạy lung tung, mình càng lạc xa hơn…', 'Chạy lung tung dễ lạc xa hơn. Mình đứng yên tại chỗ trước nhé.', 'scared'),
          T('🚪', 'Chạy ra ngoài cửa siêu thị', 'Ngoài kia có nhiều xe lắm…', 'Ra ngoài một mình rất nguy hiểm. Mình ở lại trong siêu thị nhé.', 'scared'),
        ]),
        stranger: talk('stranger', 'Bé ơi, lạc mẹ à? Đi theo chú, chú dẫn đi tìm mẹ, chú cho kẹo nữa!', 'happy', [
          G('✋', 'Dạ không! Con không đi theo người lạ.', 'Ờ… thôi được.', 'Con nói “Không” rất rõ ràng. Không bao giờ đi theo người lạ, kể cả khi họ cho quà!', 'help', 'neutral'),
          T('🍬', 'Dạ, con đi theo chú.', '', 'Khoan đã! Mình KHÔNG đi theo người lạ, dù họ trông tốt bụng hay cho kẹo. Con nói “Không!” nhé.', 'happy'),
          T('🤲', '(Nhận kẹo nhưng đứng yên)', '', 'Mình không nhận quà của người lạ nhé. Con nói “Không, cảm ơn!” rồi tránh xa.', 'happy'),
        ]),
        help: talk('me', 'Ai có thể giúp con an toàn nhất?', 'worried', [
          G('🪪', 'Cô nhân viên mặc đồng phục, đeo bảng tên', 'Kia rồi! Cô mặc áo xanh của siêu thị.', 'Đúng rồi! Người mặc đồng phục, đeo bảng tên của siêu thị có thể giúp con.', 'staff', 'neutral'),
          G('🛎️', 'Đến quầy thu ngân hoặc quầy thông tin', 'Quầy thu ngân ở ngay kia!', 'Rất giỏi! Quầy thu ngân, quầy thông tin luôn có nhân viên giúp con.', 'staff', 'neutral'),
          T('🧔', 'Một chú lạ đang đứng gần đó', '', 'Mình tìm người mặc đồng phục siêu thị, có bảng tên, hoặc đến quầy thu ngân nhé.', 'worried'),
        ]),
        staff: talk('staff', 'Con ơi, con bị lạc mẹ à? Cô giúp con nhé. Mẹ con mặc áo màu gì?', 'neutral', [
          G('🗣️', 'Dạ con bị lạc mẹ. Mẹ con mặc áo đỏ ạ.', 'Cô sẽ đọc loa gọi mẹ con. Con đứng đây với cô nhé.', 'Con nói rõ mình bị lạc và tả mẹ. Rất giỏi!', 'bye', 'happy'),
          T('😭', '(Khóc mãi, không nói)', 'Không sao đâu, có cô ở đây rồi. Con nói cho cô biết nhé?', 'Buồn và sợ là bình thường. Con hít thở, rồi nói với cô: “Con bị lạc mẹ” nhé.', 'worried'),
        ]),
        bye: end('mom', 'Con ơi, mẹ đây rồi! Con giỏi lắm: đứng yên, nói Không với người lạ và tìm cô nhân viên.'),
      } },

  ];

  window.TT_DATA = {
    modes, skills, emotions, looks, locations, zones, items, money, talkGroups,
    defaultFeedback, changeChoices,
    unlockNeed: 2,          // số tình huống cấp trước cần hoàn thành để mở cấp tiếp theo
    scenarios: SCENARIOS,
  };
})();
