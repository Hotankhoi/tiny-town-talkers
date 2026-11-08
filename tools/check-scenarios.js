// Kiểm tra dữ liệu tình huống: chạy  node tools/check-scenarios.js
// Bắt lỗi: id trùng, nút "next" trỏ tới nút không tồn tại, món hàng / nhân vật / cảm xúc không có,
// tình huống không có đường đi tới kết thúc, ví không đủ tiền (khi không cho bỏ bớt món).
global.window = {};
require('../scenarios.js');
const D = window.TT_DATA, errs = [], warn = [];
const ids = new Set();
const sum = a => a.reduce((x, y) => x + y, 0);
D.scenarios.forEach(s => {
  const P = s.id + ': ';
  if (ids.has(s.id)) errs.push(P + 'id trùng'); ids.add(s.id);
  ['mode', 'title', 'level', 'skills', 'location', 'npcs', 'nodes'].forEach(k => { if (s[k] == null) errs.push(P + 'thiếu ' + k); });
  if (!D.modes[s.mode]) errs.push(P + 'mode lạ ' + s.mode);
  if (!(s.level >= 1 && s.level <= 3)) errs.push(P + 'level phải 1–3');
  if (!D.locations[s.location]) errs.push(P + 'location lạ ' + s.location);
  s.skills.forEach(k => { if (!D.skills[k]) errs.push(P + 'skill lạ ' + k); });
  if (s.mode === 'talk' && !D.talkGroups.some(g => g.id === s.group)) errs.push(P + 'group lạ ' + s.group);
  Object.values(s.npcs).forEach(n => { if (!D.looks[n.look]) errs.push(P + 'look lạ ' + n.look); });
  const N = s.nodes, start = s.start || 'start';
  if (!N[start]) errs.push(P + 'không có nút start');
  const chk = (from, next, allowEmpty) => { if (next == null) { if (!allowEmpty) errs.push(P + from + ' thiếu next'); return; } if (!N[next]) errs.push(P + from + ' → "' + next + '" không tồn tại'); };
  const mood = (m, where) => { if (m && !D.emotions[m]) errs.push(P + where + ' cảm xúc lạ ' + m); };
  let hasEnd = false;
  Object.entries(N).forEach(([k, n]) => {
    const t = n.type || 'talk';
    if (n.npc && !s.npcs[n.npc]) errs.push(P + k + ' npc lạ ' + n.npc);
    mood(n.mood, k);
    if (t === 'talk' || (t === 'change' && n.choices)) {
      if (!n.choices || n.choices.length < 2) errs.push(P + k + ' cần ≥ 2 lựa chọn');
      if (!n.choices.some(c => c.quality === 'great')) errs.push(P + k + ' không có lựa chọn great');
      n.choices.forEach((c, i) => {
        if (!['great', 'ok', 'try_again'].includes(c.quality)) errs.push(P + k + '#' + i + ' quality lạ');
        if (c.npcReaction) mood(c.npcReaction.mood, k + '#' + i);
        if (c.quality !== 'try_again') chk(k + '#' + i, c.next || n.next, t === 'change');
        if (c.quality === 'try_again' && c.next) warn.push(P + k + '#' + i + ' try_again có next (bị bỏ qua)');
      });
    } else if (t === 'feeling') {
      mood(n.answer, k);
      (n.options || []).forEach(o => mood(o, k));
      if (n.options && !n.options.includes(n.answer)) errs.push(P + k + ' options thiếu đáp án');
      chk(k, n.next);
    } else if (t === 'shop') {
      if (!s.list) errs.push(P + 'nút shop nhưng thiếu list');
      (n.decoys || []).forEach(d => { if (!D.items[d]) errs.push(P + 'decoy lạ ' + d); });
      chk(k, n.next);
    } else if (t === 'pay' || t === 'change') chk(k, n.next);
    else if (t === 'end') hasEnd = true;
    else errs.push(P + k + ' type lạ ' + t);
  });
  if (!hasEnd) warn.push(P + 'không có nút end');
  if (s.list) {
    s.list.forEach(e => { if (!D.items[e.item]) errs.push(P + 'item lạ ' + e.item); });
    Object.entries(s.soldOut || {}).forEach(([a, b]) => { if (!D.items[b]) errs.push(P + 'món thay lạ ' + b); });
    const price = id => D.items[(s.soldOut || {})[id] || id].price;
    const total = sum(s.list.map(e => price(e.item) * e.qty));
    const must = sum(s.list.filter(e => e.need !== 'low').map(e => price(e.item) * e.qty));
    const w = sum(s.wallet || []);
    (s.wallet || []).forEach(v => { if (!D.money.includes(v)) errs.push(P + 'tờ tiền lạ ' + v); });
    const allowRemove = Object.values(N).some(n => n.type === 'pay' && n.allowRemove);
    if (w < (allowRemove ? must : total)) errs.push(P + `ví ${w} không đủ trả ${allowRemove ? must : total}`);
    if (allowRemove && w >= total) warn.push(P + 'allowRemove nhưng ví vẫn đủ tiền');
    console.log(`  ${s.id.padEnd(18)} L${s.level} tổng ${total} ví ${w}`);
  }
  // Có đường đi tới end (đi theo lựa chọn không phải try_again)
  const seen = new Set(), stack = [start]; let reach = false;
  while (stack.length) { const k = stack.pop(); if (seen.has(k) || !N[k]) continue; seen.add(k); const n = N[k];
    if ((n.type || 'talk') === 'end') reach = true;
    if (n.choices) n.choices.filter(c => c.quality !== 'try_again').forEach(c => stack.push(c.next || n.next)); else stack.push(n.next); }
  if (!reach) errs.push(P + 'không có đường tới kết thúc');
  Object.keys(N).forEach(k => { if (!seen.has(k)) warn.push(P + 'nút "' + k + '" không bao giờ tới được'); });
});
const by = m => D.scenarios.filter(s => s.mode === m);
console.log(`Mua sắm: ${by('shopping').length} · Trò chuyện: ${by('talk').length}`);
warn.forEach(w => console.log('⚠️  ' + w));
errs.forEach(e => console.log('❌ ' + e));
console.log(errs.length ? `${errs.length} LỖI` : '✅ Dữ liệu hợp lệ');
process.exit(errs.length ? 1 : 0);
