/* =========================================================
   LƯU TRỮ: dữ liệu chế độ "Bồi bàn" (đã gỡ khỏi game ngày 2026-11-08)
   File này KHÔNG được game nạp. Giữ lại để có thể tái sử dụng sau này.
   Chế độ Bồi bàn không có file ảnh/âm thanh riêng (chỉ dùng emoji),
   nên thư mục này chỉ chứa dữ liệu.
   Logic cũ (chọn món khách gọi "target", tính chất "adj", tình huống
   "wrongFood"/"wrongAdj") xem trong lịch sử git: commit 168ff62, file index.html.
   ========================================================= */
const ARCHIVED_WAITER_DATA = {
  // Từ chỉ dùng ở vai Bồi bàn (thẻ in cũ có các từ này sẽ không mở được nữa – game bỏ qua, không lỗi)
  words: {
    'here-is': { text: 'Here is', cat: 'action',   card: '🍽️' },
    'your':    { text: 'your',    cat: 'modifier', card: '👉' },
    'hot':     { text: 'hot',     cat: 'modifier', emoji: '🔥' },
    'yummy':   { text: 'yummy',   cat: 'modifier', emoji: '😋' },
  },
  // Khách máy (chọn ngẫu nhiên mỗi ca)
  customers: [
    { emoji: '👵', pitch: 1.15 }, { emoji: '👴', pitch: 0.85 },
    { emoji: '👩', pitch: 1.2 },  { emoji: '🧔', pitch: 0.9 },
  ],
  turns: {
    w1: {
      role: 'waiter', needsTarget: true,
      npcSay: 'Can I have a {target}, please?',
      slots: [
        { cat: 'action',   ok: ['here-is'] },
        { cat: 'modifier', ok: ['your'] },
        { cat: 'thing',    ok: 'target' },
      ],
      tray: ['i', 'here-is', 'want', 'a', 'two', 'your'], foods: 3, silly: 1,
      model: 'Here is your {target}.',
      success: 'Thank you! Yummy!',
      serves: true,
    },
    w2: {
      role: 'waiter', needsTarget: true, adjs: ['hot', 'yummy'],
      npcSay: 'Can I have a {adj} {target}, please?',
      slots: [
        { cat: 'action',   ok: ['here-is'] },
        { cat: 'modifier', ok: ['your'] },
        { cat: 'modifier', ok: 'adj' },
        { cat: 'thing',    ok: 'target' },
      ],
      tray: ['here-is', 'want', 'your', 'a', 'hot', 'yummy'], foods: 3, silly: 1,
      model: 'Here is your {adj} {target}.',
      success: 'Thank you! Mmm, so {adj}!',
      serves: true,
    },
  },
  reactions: {
    shoeWaiter: [['npc', 'Oh! That is a shoe, not a {target}! Can I have a {target}, please?']],
    hatWaiter:  [['npc', 'A hat? I can not eat a hat! Can I have a {target}, please?']],
    wrongFood:  { anim: 'wrongFood', lines: [['npc', 'Hmm, that is a {got}. Can I have a {target}, please?']] },
    wrongAdj:   { anim: 'think',     lines: [['npc', 'I want a {adj} {target}, please!']] },
  },
  session: ['w1', 'w2', 'w2'],
  coplay: 'Ba/mẹ đóng vai khách:',
  homeButton: '🤵🍕 ▶ (aria-label "Chơi vai Bồi bàn")',
};
