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

    /* ================= TRÒ CHUYỆN 💬 ================= */

    // ----- Gia đình & hàng xóm -----
    { id: 'talk-chaoba', mode: 'talk', group: 'family', level: 1, emoji: '👵', sticker: '🙇',
      title: 'Chào ông bà hàng xóm', location: 'street', skills: ['greet'],
      npcs: { ba: { name: 'Bà Tư', look: 'grandma' }, ong: { name: 'Ông Tư', look: 'grandpa' } },
      nodes: {
        start: talk('ba', 'Ồ, cháu đi học về đấy à?', 'happy', [
          G('🙇', 'Dạ cháu chào bà Tư ạ!', 'Ừ, ngoan quá!', 'Con khoanh tay chào bà thật lễ phép!', 'school'),
          O('👋', 'Chào bà.', 'Ừ, chào cháu.', 'Thêm “Dạ… ạ” sẽ lễ phép hơn nhé: “Dạ cháu chào bà ạ”.', 'school'),
          T('🚶', '(Đi thẳng vào nhà)', 'Ơ, cháu không thấy bà à?', 'Gặp người lớn, mình chào nhé: “Dạ cháu chào bà ạ”.', 'sad'),
        ]),
        school: talk('ba', 'Hôm nay đi học có vui không cháu?', 'happy', [
          G('🎨', 'Dạ vui lắm ạ! Hôm nay cháu được vẽ tranh.', 'Ôi, giỏi quá! Hôm nào cho bà xem nhé.', 'Con trả lời và kể thêm một chuyện vui. Tuyệt!', 'ong'),
          O('🙂', 'Dạ vui.', 'Ừ, thế là tốt rồi.', 'Con có thể kể thêm một chuyện vui cho bà nghe đó.', 'ong'),
          T('😒', 'Bà hỏi làm gì ạ!', 'Ơ… bà chỉ hỏi thăm thôi mà.', 'Bà hỏi thăm vì bà quý con. Mình trả lời nhẹ nhàng nhé.', 'sad'),
        ]),
        ong: talk('ong', 'Ông cũng ở đây nè cháu!', 'happy', [
          G('🙇', 'Dạ cháu chào ông ạ!', 'Cháu ngoan lắm!', 'Con chào cả ông nữa. Rất chu đáo!', 'bye'),
          T('🏃', '(Vẫy tay rồi chạy đi)', 'Ơ kìa…', 'Mình dừng lại, khoanh tay chào ông nhé.', 'confused'),
        ]),
        bye: end('ba', 'Cháu lễ phép quá! Bà cho cháu quả ổi nè.'),
      } },

    { id: 'talk-donban', mode: 'talk', group: 'family', level: 1, emoji: '🍽️', sticker: '🧽',
      title: 'Giúp mẹ dọn bàn', location: 'home', skills: ['kind', 'thanks'],
      npcs: { mom: { name: 'Mẹ', look: 'mom' } },
      nodes: {
        start: talk('mom', 'Cả nhà ăn xong rồi. Ai giúp mẹ dọn bàn nào?', 'happy', [
          G('🙋', 'Dạ để con giúp mẹ ạ!', 'Ôi, con ngoan quá!', 'Con xung phong giúp mẹ. Thật đáng yêu!', 'carry'),
          O('⏰', 'Lát nữa con làm ạ.', 'Ừ, nhưng đừng quên nhé.', 'Giúp mẹ ngay sẽ làm mẹ vui hơn đó.', 'carry'),
          T('🙅', 'Con không thích!', 'Mẹ hơi buồn đó…', 'Mẹ làm việc nhà cả ngày rồi. Mình giúp mẹ một chút nhé.', 'sad'),
        ]),
        carry: talk('mom', 'Con mang bát đũa xuống bếp giúp mẹ nhé. Cẩn thận kẻo rơi.', 'neutral', [
          G('🥣', 'Dạ con bê từng ít một cho khỏi rơi ạ.', 'Đúng rồi, cẩn thận như vậy là giỏi!', 'Con làm cẩn thận, từng ít một. Rất khéo!', 'thanks'),
          T('🏃', 'Con chồng hết lên rồi chạy thật nhanh!', 'Ối, cẩn thận con!', 'Bê nhiều quá và chạy dễ làm rơi vỡ. Mình mang từng ít một nhé.', 'scared'),
        ]),
        thanks: talk('mom', 'Bàn sạch bong rồi! Cảm ơn con nhé.', 'happy', [
          G('💗', 'Dạ không có gì ạ! Lần sau con lại giúp mẹ.', 'Mẹ yêu con!', 'Con nói lời đáp thật dễ thương!', 'bye'),
          O('🙂', 'Dạ.', 'Ừ.', 'Khi được cảm ơn, mình có thể nói “Dạ không có gì ạ”.', 'bye'),
        ]),
        bye: end('mom', 'Hôm nay con là người giúp việc nhà giỏi nhất!'),
      } },

    { id: 'talk-goidienba', mode: 'talk', group: 'family', level: 2, emoji: '☎️', sticker: '💌',
      title: 'Gọi điện hỏi thăm bà', location: 'phone', skills: ['greet', 'kind', 'feelings'],
      npcs: { ba: { name: 'Bà ngoại', look: 'grandma' } },
      nodes: {
        start: talk('ba', 'A lô, bà nghe đây!', 'neutral', [
          G('📞', 'A lô, con chào bà ạ! Con là cháu của bà đây ạ.', 'Ôi, cháu yêu của bà!', 'Con chào và nói mình là ai. Rất hay!', 'health'),
          O('🙂', 'A lô.', 'A lô? Ai đấy?', 'Con nói thêm “Con chào bà ạ, con là cháu của bà” nhé.', 'health', 'confused'),
          T('🤐', '(Im lặng, không nói)', 'A lô? A lô? Ai đấy?', 'Gọi điện thì mình chào và nói tên mình trước nhé.'),
        ]),
        health: talk('ba', 'Cháu bà có khỏe không?', 'happy', [
          G('💗', 'Dạ cháu khỏe ạ. Bà có khỏe không ạ?', 'Bà cũng khỏe, chỉ hơi đau chân thôi cháu ạ.', 'Con hỏi thăm lại bà. Thật chu đáo!', 'feel', 'sad'),
          O('👍', 'Dạ khỏe.', 'Ừ. Bà thì hơi đau chân…', 'Hỏi lại “Bà có khỏe không ạ?” để bà vui hơn nhé.', 'feel', 'sad'),
          T('📺', 'Con đang xem ti vi, con cúp máy đây.', 'Ơ… bà còn muốn nói chuyện với cháu…', 'Bà mong nói chuyện với con lắm. Mình hỏi thăm bà nhé.', 'sad'),
        ]),
        feel: feel('ba', 'Dạo này bà đau chân, đi lại chậm lắm…', 'sad', ['sad', 'happy', 'angry', 'surprised'], 'care'),
        care: talk('ba', 'Bà đau chân nên không sang chơi với cháu được.', 'sad', [
          G('🤗', 'Bà nhớ giữ gìn sức khỏe nhé. Cuối tuần con sang thăm bà ạ!', 'Ôi, bà vui quá! Bà chờ cháu nhé.', 'Con quan tâm và hứa sang thăm. Bà vui lắm đó!', 'bye'),
          O('🙂', 'Dạ.', 'Ừ…', 'Con có thể nói một câu hỏi thăm để bà vui hơn.', 'bye'),
          T('🐢', 'Hihi, bà đi chậm như rùa!', 'Ơ… bà hơi buồn đó cháu.', 'Trêu khi bà đau sẽ làm bà buồn. Mình nói lời hỏi thăm nhé.', 'sad'),
        ]),
        bye: talk('ba', 'Bà vui lắm vì cháu gọi. Thôi cháu đi chơi nhé!', 'happy', [
          G('👋', 'Dạ con chào bà ạ! Con yêu bà!', 'Bà cũng yêu cháu!', 'Con chào tạm biệt thật ấm áp!', 'fin'),
          T('📴', '(Cúp máy luôn)', 'A lô? … Ơ, mất rồi.', 'Trước khi cúp máy, mình chào tạm biệt nhé.'),
        ]),
        fin: end('ba', 'Cuộc gọi của cháu làm bà vui cả ngày!'),
      } },

    // ----- Trường học & bạn bè -----
    { id: 'talk-banmoi', mode: 'talk', group: 'school', level: 1, emoji: '👋', sticker: '🤝',
      title: 'Làm quen bạn mới', location: 'school', skills: ['greet', 'feelings', 'kind'],
      npcs: { mai: { name: 'Bạn Mai', look: 'girl' } },
      nodes: {
        start: feel('mai', '(Bạn mới đứng một mình ở góc lớp)', 'worried', ['worried', 'happy', 'angry', 'surprised'], 'hello',
          'Đúng rồi! Bạn mới đang lo lắng vì chưa quen ai.'),
        hello: talk('mai', 'Chào… bạn.', 'worried', [
          G('👋', 'Chào bạn! Mình học lớp này. Bạn tên là gì?', 'Mình tên là Mai. Mình mới chuyển đến.', 'Con chào và hỏi tên bạn. Bạn mới vui hơn rồi!', 'alone'),
          O('😃', 'Ê, bạn mới hả?', 'Ừ…', 'Con chào bạn và hỏi tên bạn sẽ hay hơn nhé.', 'alone'),
          T('🤭', '(Chỉ trỏ, cười với bạn khác)', '…', 'Bạn mới có thể thấy buồn nếu bị chỉ trỏ. Mình tới chào bạn nhé.', 'sad'),
        ]),
        alone: talk('mai', 'Mình chưa quen ai ở đây cả.', 'worried', [
          G('🤗', 'Bạn chơi với nhóm mình nhé! Mình giới thiệu bạn với mọi người.', 'Thật hả? Cảm ơn bạn!', 'Con rủ bạn mới vào nhóm. Thật tốt bụng!', 'bye'),
          O('🙂', 'Rồi bạn sẽ quen thôi.', 'Ừ… mong là vậy.', 'Con có thể rủ bạn chơi cùng nữa đó!', 'bye'),
          T('🙄', 'Kệ bạn!', 'Mình buồn quá…', 'Bạn mới đang lo lắng. Mình nói một câu thân thiện nhé.', 'sad'),
        ]),
        bye: end('mai', 'Mình vui lắm! Từ nay mình là bạn nhé!'),
      } },

    { id: 'talk-rubanchoi', mode: 'talk', group: 'school', level: 1, emoji: '🧱', sticker: '🏰',
      title: 'Rủ bạn chơi cùng', location: 'school', skills: ['share', 'patience'],
      npcs: { tuan: { name: 'Bạn Tuấn', look: 'boy' } },
      nodes: {
        start: talk('tuan', 'Mình đang xếp hình một mình.', 'neutral', [
          G('🙋', 'Mình chơi cùng bạn được không?', 'Được chứ! Vui quá!', 'Con hỏi “… được không?” rất lịch sự!', 'build'),
          O('😃', 'Cho mình chơi với!', 'Ừ, được.', 'Con hỏi “Mình chơi cùng được không?” sẽ lịch sự hơn.', 'build'),
          T('✊', '(Giành lấy đồ chơi)', 'Ơ! Của mình mà!', 'Giành đồ chơi làm bạn giận. Mình hỏi “Mình chơi cùng được không?” nhé.', 'angry'),
        ]),
        build: talk('tuan', 'Bạn muốn xây gì nào?', 'happy', [
          G('🏰', 'Mình cùng xây lâu đài nhé! Bạn xây tháp, mình xây cổng.', 'Ý hay quá!', 'Con rủ bạn cùng làm và chia việc. Tuyệt vời!', 'turn'),
          O('🤷', 'Gì cũng được.', 'Ừm… vậy xây nhà nhé.', 'Con có thể góp ý một ý tưởng nữa đó.', 'turn'),
          T('😤', 'Bạn phải làm theo ý mình!', 'Mình cũng muốn góp ý mà…', 'Chơi cùng thì mình lắng nghe ý bạn nữa nhé.', 'sad'),
        ]),
        turn: talk('tuan', 'Đến lượt mình đặt khối nhé!', 'happy', [
          G('🖐️', 'Ừ, bạn đặt đi, rồi đến lượt mình.', 'Cảm ơn bạn! Lâu đài cao quá!', 'Con biết chờ đến lượt. Rất kiên nhẫn!', 'bye'),
          T('🙅', 'Không, mình đặt hết!', 'Vậy mình không được chơi à?', 'Chơi cùng thì mỗi người một lượt nhé.', 'sad'),
        ]),
        bye: end('tuan', 'Chơi với bạn vui quá! Mai mình chơi tiếp nhé!'),
      } },

    { id: 'talk-muonbut', mode: 'talk', group: 'school', level: 1, emoji: '✏️', sticker: '✏️',
      title: 'Mượn bút của bạn', location: 'school', skills: ['ask', 'thanks'],
      npcs: { hoa: { name: 'Bạn Hoa', look: 'girl2' } },
      nodes: {
        start: talk('hoa', 'Ơ, bạn quên mang bút chì à?', 'surprised', [
          G('🙋', 'Hoa ơi, cho mình mượn bút chì được không?', 'Được chứ, bạn cầm đi!', 'Con hỏi mượn rất lịch sự!', 'give'),
          O('✏️', 'Cho mình mượn bút.', 'Ừ, nè.', 'Thêm “… được không?” sẽ lịch sự hơn nhé.', 'give'),
          T('🫳', '(Lấy bút của bạn không hỏi)', 'Ơ, bút của mình!', 'Muốn mượn đồ, mình hỏi bạn trước nhé.', 'angry'),
        ]),
        give: talk('hoa', 'Bút đây nè.', 'happy', [
          G('🙏', 'Cảm ơn Hoa nhé! Lát mình trả bạn.', 'Không có gì!', 'Con cảm ơn và hứa trả lại. Rất tốt!', 'back'),
          T('😶', '(Cầm lấy, không nói gì)', 'Ơ…', 'Được bạn giúp thì mình nói “Cảm ơn bạn” nhé.', 'confused'),
        ]),
        back: talk('hoa', 'Hết giờ học rồi!', 'neutral', [
          G('↩️', 'Mình trả bút nè. Cảm ơn bạn nhiều!', 'Lần sau cần thì bạn cứ mượn nhé!', 'Con nhớ trả lại đồ đã mượn. Thật đáng tin!', 'bye'),
          T('🎒', '(Bỏ bút vào cặp mang về)', 'Ơ, bút của mình đâu rồi?', 'Mượn đồ thì nhớ trả lại cho bạn nhé.', 'sad'),
        ]),
        bye: end('hoa', 'Bạn thật đáng tin. Mình thích chơi với bạn!'),
      } },

    { id: 'talk-xinloi', mode: 'talk', group: 'school', level: 2, emoji: '💧', sticker: '🩹',
      title: 'Lỡ làm đổ nước lên vở bạn', location: 'school', skills: ['thanks', 'feelings', 'kind'],
      npcs: { nam: { name: 'Bạn Nam', look: 'boy2' } },
      nodes: {
        start: feel('nam', 'Ôi! Vở của mình ướt hết rồi!', 'sad', ['sad', 'happy', 'surprised', 'scared'], 'sorry',
          'Đúng rồi, bạn Nam đang buồn vì vở bị ướt.'),
        sorry: talk('nam', 'Vở của mình…', 'sad', [
          G('🙇', 'Mình xin lỗi Nam, mình lỡ tay làm đổ. Để mình lau giúp bạn nhé!', 'Ừ… cảm ơn bạn đã xin lỗi.', 'Con nhận lỗi và giúp bạn. Rất dũng cảm!', 'fix', 'neutral'),
          O('😔', 'Mình xin lỗi.', 'Ừ…', 'Xin lỗi rồi, con có thể giúp bạn lau vở nữa.', 'fix'),
          T('🙅', 'Đâu phải tại mình!', 'Rõ ràng bạn làm đổ mà!', 'Khi lỡ làm sai, mình nhận lỗi và nói “Mình xin lỗi” nhé.', 'angry'),
          T('🙈', '(Lén đi chỗ khác)', 'Bạn đi đâu vậy…', 'Đi chỗ khác làm bạn buồn hơn. Mình quay lại xin lỗi bạn nhé.', 'sad'),
        ]),
        fix: talk('nam', 'Vở ướt rồi, mình phải làm sao đây?', 'worried', [
          G('☀️', 'Mình phơi vở cho khô, rồi cùng nói với cô giáo nhé.', 'Ý hay đó! Mình cùng đi nhé.', 'Con nghĩ ra cách sửa lỗi. Thật giỏi!', 'bye'),
          O('🤷', 'Bạn tự lau đi.', 'Ừm… được.', 'Mình là người làm đổ, mình giúp bạn sửa nhé.', 'bye'),
        ]),
        bye: end('nam', 'Cảm ơn bạn. Mình hết buồn rồi!'),
      } },

    { id: 'talk-anui', mode: 'talk', group: 'school', level: 2, emoji: '🤗', sticker: '🌈',
      title: 'An ủi bạn bị điểm kém', location: 'school', skills: ['feelings', 'kind'],
      npcs: { linh: { name: 'Bạn Linh', look: 'girl' } },
      nodes: {
        start: feel('linh', 'Hu hu… mình bị điểm kém.', 'sad', ['sad', 'happy', 'angry', 'surprised'], 'comfort'),
        comfort: talk('linh', 'Mình học mãi mà vẫn sai…', 'sad', [
          G('🤗', 'Bạn đừng buồn nhé. Lần sau mình cùng ôn bài với bạn!', 'Thật hả? Cảm ơn bạn!', 'Con an ủi và rủ bạn cùng học. Thật tốt bụng!', 'doubt', 'neutral'),
          O('🙂', 'Thôi đừng khóc.', 'Ừ…', 'Con có thể nói thêm một lời động viên bạn.', 'doubt', 'sad'),
          T('🤭', 'Haha, bạn bị điểm kém!', 'Hu hu… bạn cười mình…', 'Cười khi bạn buồn sẽ làm bạn đau lòng hơn. Mình nói lời an ủi nhé.', 'sad'),
        ]),
        doubt: talk('linh', 'Bạn có nghĩ mình học dốt không?', 'worried', [
          G('🌟', 'Không đâu! Ai cũng có lúc sai. Bạn vẽ đẹp lắm mà.', 'Bạn nói vậy mình thấy vui hơn!', 'Con nhắc bạn về điều bạn giỏi. Thật tuyệt!', 'bye'),
          T('😐', 'Ừ, chắc vậy.', 'Hu hu…', 'Câu đó làm bạn buồn hơn. Mình nói một điều tốt về bạn nhé.', 'sad'),
        ]),
        bye: end('linh', 'Cảm ơn bạn. Mình sẽ cố gắng hơn!'),
      } },

    { id: 'talk-sinhnhat', mode: 'talk', group: 'school', level: 1, emoji: '🎈', sticker: '🎁',
      title: 'Chúc mừng sinh nhật bạn', location: 'school', skills: ['greet', 'thanks', 'share'],
      npcs: { minh: { name: 'Bạn Minh', look: 'boy' } },
      nodes: {
        start: talk('minh', 'Hôm nay là sinh nhật mình đó!', 'happy', [
          G('🎉', 'Chúc mừng sinh nhật Minh! Chúc bạn luôn vui vẻ!', 'Cảm ơn bạn nhiều!', 'Con chúc mừng bạn thật ấm áp!', 'cake'),
          O('🙂', 'Ồ, vậy hả.', 'Ừ…', 'Con nói “Chúc mừng sinh nhật bạn!” để bạn vui hơn nhé.', 'cake'),
          T('😏', 'Sinh nhật mình còn vui hơn!', 'Ơ…', 'Hôm nay là ngày của bạn Minh. Mình chúc mừng bạn nhé.', 'sad'),
        ]),
        cake: talk('minh', 'Mình mời bạn ăn bánh kem nè!', 'happy', [
          G('🍰', 'Cảm ơn Minh! Bánh ngon quá!', 'Hihi, bạn ăn thêm nhé!', 'Con cảm ơn và khen bánh. Bạn Minh vui lắm!', 'bye'),
          T('🤲', 'Mình muốn miếng to nhất!', 'Ơ… còn các bạn khác nữa mà.', 'Mình nhận phần của mình và để phần cho các bạn nhé.', 'confused'),
        ]),
        bye: end('minh', 'Có bạn đến chơi, sinh nhật mình vui hơn nhiều!'),
      } },

    // ----- Ngoài đường -----
    { id: 'talk-camon', mode: 'talk', group: 'street', level: 1, emoji: '🧢', sticker: '🙏',
      title: 'Cảm ơn khi được giúp', location: 'street', skills: ['thanks', 'greet'],
      npcs: { co: { name: 'Cô đi đường', look: 'woman' } },
      nodes: {
        start: talk('co', 'Cháu ơi, cháu đánh rơi mũ này!', 'happy', [
          G('🙏', 'Dạ cháu cảm ơn cô ạ!', 'Không có gì cháu!', 'Con cảm ơn ngay khi được giúp. Rất lễ phép!', 'bye'),
          O('🙂', '(Cầm mũ, gật đầu)', 'Ừ…', 'Mình nói thành lời: “Dạ cháu cảm ơn cô ạ” nhé.', 'bye'),
          T('🫳', '(Giật lấy mũ rồi chạy)', 'Ơ kìa…', 'Cô vừa giúp con. Mình nói “Dạ cháu cảm ơn cô ạ” nhé.', 'confused'),
        ]),
        bye: talk('co', 'Cháu đi cẩn thận nhé!', 'happy', [
          G('👋', 'Dạ, cháu chào cô ạ!', 'Chào cháu ngoan!', 'Con chào tạm biệt thật lễ phép!', 'fin'),
          O('🙂', 'Dạ.', 'Ừ.', 'Thêm “cháu chào cô ạ” sẽ hay hơn nhé.', 'fin'),
        ]),
        fin: end('co', 'Cháu thật lễ phép!'),
      } },

    { id: 'talk-hoiduong', mode: 'talk', group: 'street', level: 2, emoji: '👮', sticker: '🗺️',
      title: 'Hỏi đường chú công an', location: 'street', skills: ['ask', 'greet', 'safety'],
      npcs: { ca: { name: 'Chú công an', look: 'police' } },
      nodes: {
        start: talk('ca', 'Chào cháu! Cháu cần chú giúp gì không?', 'happy', [
          G('🙋', 'Dạ cháu chào chú ạ. Chú cho cháu hỏi thư viện ở đâu ạ?', 'Cháu hỏi lễ phép quá!', 'Con chào và hỏi đường rất rõ ràng!', 'who'),
          O('🗺️', 'Thư viện ở đâu?', 'À, để chú chỉ nhé.', 'Con nhớ chào chú và nói “Dạ… ạ” nhé.', 'who'),
          T('🫳', '(Kéo áo chú, không nói gì)', 'Cháu muốn gì nào?', 'Mình nói thành lời: “Dạ chú ơi, cho cháu hỏi…” nhé.'),
        ]),
        who: talk('ca', 'Cháu đi thẳng, đến ngã tư thì rẽ phải. Cháu đi cùng ai thế?', 'neutral', [
          G('👨', 'Dạ cháu đi cùng bố, bố đứng ngay kia ạ.', 'Tốt lắm! Đi cùng người lớn là an toàn.', 'Đúng rồi! Trẻ nhỏ luôn đi cùng người lớn.', 'thanks'),
          T('🚶', 'Cháu đi một mình ạ.', 'Cháu còn nhỏ, phải đi cùng người lớn nhé.', 'Ra đường, con luôn đi cùng bố mẹ hoặc người lớn trong nhà nhé.', 'worried'),
        ]),
        thanks: talk('ca', 'Nhớ đi trên vỉa hè nhé!', 'happy', [
          G('🙏', 'Dạ cháu cảm ơn chú ạ!', 'Không có gì cháu!', 'Con cảm ơn chú thật lễ phép!', 'bye'),
          O('🙂', 'Dạ.', 'Ừ.', 'Được chỉ đường thì mình nói “Dạ cháu cảm ơn chú ạ” nhé.', 'bye'),
        ]),
        bye: end('ca', 'Khi cần giúp, cháu có thể hỏi chú công an hoặc chú bảo vệ nhé!'),
      } },

    { id: 'talk-nhuongcho', mode: 'talk', group: 'street', level: 2, emoji: '🚌', sticker: '💺',
      title: 'Nhường chỗ trên xe buýt', location: 'bus', skills: ['kind', 'feelings'],
      npcs: { ong: { name: 'Ông cụ', look: 'grandpa' } },
      nodes: {
        start: feel('ong', '(Một ông cụ chống gậy bước lên xe. Không còn ghế trống.) Ôi, mỏi chân quá…', 'worried', ['worried', 'happy', 'angry', 'surprised'], 'seat',
          'Đúng rồi, ông đang lo vì không có chỗ ngồi.'),
        seat: talk('ong', 'Xe đông quá, không còn ghế…', 'worried', [
          G('💺', 'Ông ơi, ông ngồi chỗ cháu đi ạ!', 'Cảm ơn cháu ngoan!', 'Con nhường chỗ cho người già. Thật tốt bụng!', 'ask'),
          O('🧍', '(Đứng dậy nhưng không nói gì)', 'Ồ, cháu nhường ông à? Cảm ơn cháu.', 'Con đã nhường chỗ! Mời ông bằng lời sẽ còn hay hơn nữa.', 'ask', 'happy'),
          T('😴', '(Giả vờ ngủ)', 'Ôi, mỏi chân quá…', 'Người già đứng lâu sẽ mệt. Mình nhường chỗ cho ông nhé.', 'worried'),
        ]),
        ask: talk('ong', 'Cháu đứng có mệt không?', 'happy', [
          G('✊', 'Dạ không sao ạ, cháu vịn tay cầm chắc rồi ạ.', 'Cháu thật chu đáo!', 'Con trả lời lễ phép và đứng vịn chắc. An toàn lắm!', 'bye'),
          T('😩', 'Mệt lắm, ông trả ghế cho cháu!', 'Ơ…', 'Mình đã nhường thì để ông ngồi nhé. Con vịn tay cầm cho chắc.', 'confused'),
        ]),
        bye: end('ong', 'Cháu thật tốt bụng! Ông cảm ơn cháu.'),
      } },

    // ----- Biết từ chối & an toàn -----
    { id: 'talk-nguoila', mode: 'talk', group: 'safety', level: 2, emoji: '🍬', sticker: '🛡️',
      title: 'Người lạ cho kẹo', location: 'park', skills: ['safety', 'refuse'],
      npcs: { la: { name: 'Người lạ', look: 'stranger' }, mom: { name: 'Mẹ', look: 'mom' } },
      nodes: {
        start: talk('la', 'Bé ơi, chú có nhiều kẹo lắm. Đi với chú ra kia lấy nhé!', 'happy', [
          G('✋', 'Không! Con không đi với người lạ.', 'Ơ…', 'Con nói “Không!” rất to và rõ. Giỏi lắm!', 'again', 'surprised'),
          T('🍬', 'Dạ, con đi ạ!', '', 'Khoan đã! Không bao giờ đi theo hay nhận quà của người lạ. Con nói thật to: “Không!” nhé.', 'happy'),
          T('🤲', '(Đứng lại, cầm kẹo ăn)', '', 'Mình không nhận đồ ăn của người lạ nhé. Con nói “Không!” và tránh xa.', 'happy'),
        ]),
        again: talk('la', 'Chú quen bố mẹ cháu mà, đi đi!', 'happy', [
          G('🏃', 'Không! (Chạy về phía mẹ đang ngồi ở ghế đá)', '', 'Đúng rồi! Nói Không, rồi chạy đến chỗ người lớn tin cậy.', 'tell', 'neutral'),
          T('🤔', 'Vậy thì con đi ạ.', '', 'Người lạ có thể nói dối là quen bố mẹ. Mình vẫn nói “Không!” và chạy về chỗ mẹ nhé.', 'happy'),
        ]),
        tell: talk('mom', 'Có chuyện gì vậy con?', 'worried', [
          G('🗣️', 'Mẹ ơi, có chú lạ rủ con đi và cho kẹo ạ.', 'Con làm đúng lắm! Cảm ơn con đã kể cho mẹ.', 'Kể ngay với người lớn tin cậy. Con thật dũng cảm!', 'bye', 'happy'),
          T('🤐', 'Không có gì ạ.', 'Con kể cho mẹ nghe nhé, mẹ luôn lắng nghe con.', 'Gặp chuyện lạ, mình luôn kể với bố mẹ hoặc thầy cô nhé.', 'worried'),
        ]),
        bye: end('mom', 'Con nhớ nhé: Nói KHÔNG – Chạy đi – Kể với người lớn!'),
      } },

    { id: 'talk-tuchoi', mode: 'talk', group: 'safety', level: 3, emoji: '🙅', sticker: '✋',
      title: 'Biết từ chối việc sai', location: 'school', skills: ['refuse', 'feelings'],
      npcs: { khoa: { name: 'Bạn Khoa', look: 'boy2' } },
      nodes: {
        start: talk('khoa', 'Này, mình giấu bút màu của bạn Lan đi cho vui đi!', 'happy', [
          G('🙅', 'Không, làm vậy bạn Lan sẽ buồn. Mình không làm đâu.', 'Ờ… cũng đúng.', 'Con từ chối và nói rõ lý do. Rất giỏi!', 'push', 'neutral'),
          O('✋', 'Mình không muốn.', 'Sao vậy?', 'Con đã từ chối! Nói thêm lý do: “bạn Lan sẽ buồn” nhé.', 'push'),
          T('😈', 'Ừ, giấu đi!', 'Hihi…', 'Giấu đồ của bạn làm bạn buồn. Mình có thể nói “Không!” nhé.', 'happy'),
        ]),
        push: talk('khoa', 'Bạn nhát thế! Làm đi mà!', 'angry', [
          G('⚽', 'Mình không làm. Mình chơi trò khác nhé!', 'Ừ… thôi, chơi đá cầu vậy.', 'Bị rủ nhiều lần, con vẫn nói Không và rủ trò khác. Tuyệt!', 'bye', 'neutral'),
          G('👩‍🏫', 'Không. Nếu bạn làm, mình sẽ nói với cô giáo.', 'Thôi được rồi, mình không giấu nữa.', 'Con kiên quyết và biết tìm người lớn giúp. Giỏi lắm!', 'bye', 'neutral'),
          T('😔', 'Thôi được rồi…', 'Hihi, đi nào!', 'Bạn ép mình cũng không sao, mình vẫn có quyền nói “Không”.', 'happy'),
        ]),
        bye: end('khoa', 'Bạn nói đúng. Mình không nên trêu bạn Lan.', 'neutral'),
      } },

    { id: 'talk-bitreu', mode: 'talk', group: 'safety', level: 3, emoji: '😣', sticker: '💪',
      title: 'Khi bị bạn trêu', location: 'school', skills: ['feelings', 'refuse', 'ask'],
      npcs: { bao: { name: 'Bạn Bảo', look: 'boy' }, me: { name: 'Con', look: 'me' }, co: { name: 'Cô giáo', look: 'teacher' } },
      nodes: {
        start: talk('bao', 'Haha, nhìn cái cặp của bạn kìa, xấu quá!', 'happy', [
          G('💬', '(Hít thở thật sâu trước khi nói)', '', 'Hít thở giúp mình bình tĩnh. Rất tốt!', 'feel', 'happy'),
          O('😶', '(Đứng im)', '', 'Được rồi. Mình nghĩ xem mình đang thấy thế nào nhé.', 'feel', 'happy'),
          T('🤜', '(Đẩy bạn ngã)', 'Ui da!', 'Đánh, đẩy bạn có thể làm bạn đau. Mình hít thở và nói bằng lời nhé.', 'scared'),
        ]),
        feel: talk('me', 'Khi bị trêu, con cảm thấy thế nào?', 'sad', [
          G('😢', 'Con thấy buồn.', '', 'Con nói rõ được cảm xúc của mình. Giỏi lắm!', 'say', 'sad'),
          G('😠', 'Con thấy giận.', '', 'Giận là bình thường. Mình nói ra bằng lời, không đánh bạn.', 'say', 'angry'),
          T('😊', 'Con thấy vui.', '', 'Bị trêu thường làm mình buồn hoặc giận. Không sao, con nói thật cảm xúc nhé.', 'sad'),
        ]),
        say: talk('bao', 'Cặp xấu! Cặp xấu!', 'happy', [
          G('🗣️', 'Bạn nói vậy làm mình buồn. Bạn dừng lại nhé!', 'Ơ… mình chỉ đùa thôi.', 'Con nói rõ cảm xúc và bảo bạn dừng lại. Rất dũng cảm!', 'still', 'surprised'),
          T('😝', 'Cặp bạn còn xấu hơn!', 'Hứ! Xấu hơn!', 'Trêu lại sẽ làm mọi chuyện tệ hơn. Mình nói “Bạn dừng lại nhé!”', 'angry'),
        ]),
        still: talk('bao', 'Đùa tí mà, cặp xấu hoắc!', 'happy', [
          G('👩‍🏫', 'Mình sẽ nói với cô giáo.', '', 'Bạn vẫn trêu thì mình tìm thầy cô giúp. Đúng rồi!', 'teacher', 'surprised'),
          O('🚶', '(Đi chỗ khác chơi)', '', 'Tránh xa cũng được. Con nên kể với thầy cô nữa nhé.', 'teacher'),
        ]),
        teacher: talk('co', 'Có chuyện gì vậy con?', 'neutral', [
          G('🙋', 'Thưa cô, bạn Bảo cứ trêu cặp của con, con buồn lắm ạ.', 'Cảm ơn con đã kể với cô. Cô sẽ nói chuyện với bạn.', 'Con kể rõ chuyện gì xảy ra và con cảm thấy thế nào. Tuyệt vời!', 'bye'),
          T('🤐', 'Dạ không có gì ạ.', 'Trông con buồn quá. Con kể cô nghe nhé?', 'Kể với thầy cô không phải là mách lẻo. Đó là cách nhờ người lớn giúp đỡ.', 'worried'),
        ]),
        bye: end('bao', 'Mình xin lỗi bạn. Mình không trêu nữa.', 'sad'),
      } },

    // ----- Cảm xúc của mình -----
    { id: 'talk-noivoime', mode: 'talk', group: 'feelings', level: 2, emoji: '💗', sticker: '🫶',
      title: 'Nói với mẹ khi buồn, lo', location: 'home', skills: ['feelings', 'ask'],
      npcs: { mom: { name: 'Mẹ', look: 'mom' }, me: { name: 'Con', look: 'me' } },
      nodes: {
        start: talk('mom', 'Con sao thế? Trông con không vui.', 'worried', [
          G('🗣️', 'Mẹ ơi, con đang lo vì mai con phải hát trước lớp ạ.', 'Cảm ơn con đã kể cho mẹ. Lo lắng là bình thường mà.', 'Con nói rõ mình đang lo chuyện gì. Rất dũng cảm!', 'face', 'neutral'),
          O('🙂', 'Con không sao.', 'Mẹ thấy con hơi buồn. Con kể mẹ nghe được không?', 'Con có thể kể cho mẹ biết con đang thấy thế nào.', 'face', 'worried'),
          T('🚪', '(Đóng cửa, khóc một mình)', 'Con ơi, mẹ ở đây nè…', 'Buồn hay lo, mình kể với bố mẹ nhé. Bố mẹ luôn muốn lắng nghe con.', 'sad'),
        ]),
        face: feel('me', 'Khi lo lắng, khuôn mặt của con trông thế nào?', 'worried', ['worried', 'happy', 'angry', 'surprised'], 'practice',
          'Đúng rồi! Lông mày nhíu lại, miệng méo méo – đó là lo lắng.'),
        practice: talk('mom', 'Mình cùng tập hát ở nhà nhé. Con muốn tập không?', 'happy', [
          G('🎤', 'Dạ con muốn ạ! Mẹ nghe con hát nhé.', 'Con hát hay lắm!', 'Con dám thử. Thật dũng cảm!', 'after'),
          O('😕', 'Dạ… con hơi ngại.', 'Không sao, mình hát nhỏ thôi nhé.', 'Ngại cũng không sao. Mình tập từng chút một.', 'after'),
        ]),
        after: talk('mom', 'Con thấy thế nào rồi?', 'happy', [
          G('😊', 'Con thấy đỡ lo hơn rồi. Con cảm ơn mẹ ạ!', 'Mẹ luôn ở bên con!', 'Kể với mẹ giúp con nhẹ lòng hơn. Tuyệt vời!', 'bye'),
          O('🙂', 'Con vẫn hơi lo.', 'Không sao, mai mẹ sẽ cổ vũ con.', 'Nói thật cảm xúc là rất tốt!', 'bye'),
        ]),
        bye: end('mom', 'Khi buồn hay lo, con cứ kể với bố mẹ nhé. Bố mẹ luôn lắng nghe con!'),
      } },
  ];

  window.TT_DATA = {
    modes, skills, emotions, looks, locations, zones, items, money, talkGroups,
    defaultFeedback, changeChoices,
    unlockNeed: 2,          // số tình huống cấp trước cần hoàn thành để mở cấp tiếp theo
    scenarios: SCENARIOS,
  };
})();
