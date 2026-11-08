# Tiny Town: thay "Bồi bàn" bằng "Đi mua sắm" 🛒 và "Trò chuyện hằng ngày" 💬

Nhánh: `feature/shopping-and-talk-modes`. **Chưa gộp vào `main`, nên trang GitHub Pages đang chạy vẫn là bản cũ.**

## 1. Tóm tắt

### Đã gỡ
- **Chế độ Bồi bàn.** Đã gỡ nút vai Bồi bàn ở trang chủ, các lượt `w1`/`w2`, phiên chơi và các tình huống `wrongFood`/`wrongAdj`. Cũng gỡ logic món khách gọi (`target`/`adj`), các từ `Here is`, `your`, `hot`, `yummy`, danh sách khách máy và dòng "Ba/mẹ đóng vai khách".
- **Dữ liệu cũ** được chuyển sang `_archive/waiter/waiter-data.js`. Game không nạp file này. Chế độ Bồi bàn không có file ảnh hay âm thanh riêng, chỉ dùng emoji, nên trong thư mục lưu trữ chỉ có dữ liệu.
- **Bản lưu cũ** được chuyển đổi khi mở game (hàm `migrateOldSave`):
  - từ của Bồi bàn bị xóa khỏi thống kê;
  - trường `role` cũ bị bỏ;
  - các trường mới được thêm vào.
  - Đã thử với một bản lưu có từ Bồi bàn: game không lỗi và sao vẫn còn.
- **Thẻ QR in cũ** có từ của Bồi bàn được bỏ qua, không gây lỗi.

### Đã thêm
- **Scenario Engine dùng chung**, chạy theo dữ liệu. Có 6 loại nút:
  - `talk`: nói chuyện, chọn câu trả lời;
  - `feeling`: "Bạn ấy đang cảm thấy thế nào?";
  - `shop`: tìm đồ trên kệ;
  - `pay`: trả tiền, có thể phải bỏ bớt món khi không đủ tiền;
  - `change`: kiểm tra tiền thối;
  - `end`: kết thúc.
- **Đi mua sắm**: 9 tình huống ở 3 địa điểm (Tiệm bánh, Tiệm tạp hóa, Siêu thị mini).
  - Cấp 1 (3 tình huống): 1–2 món, tiền dư dả, giá tròn. Món cần mua và tờ tiền nên đưa luôn được làm sáng.
  - Cấp 2 (3 tình huống): 3–5 món, ví chỉ vừa đủ. Có ô "Con đang đưa" để cộng giúp, có bước kiểm tra tiền thối và xếp hàng.
  - Cấp 3 (3 tình huống):
    - hết sữa dâu nên hỏi món thay thế;
    - cô thu ngân thối thiếu, bé nói "Dạ cô ơi, hình như cô thối thiếu ạ";
    - không đủ tiền nên bỏ món ít cần, kèm làm rơi hộp trứng thì xin lỗi và báo cô;
    - lạc mẹ: đứng yên, nói "Không" với người lạ, tìm nhân viên mặc đồng phục hoặc quầy thu ngân.
- **Trò chuyện hằng ngày**: 16 tình huống, mỗi tình huống 3–6 lượt thoại (tính cả câu kết), chia 5 nhóm.
  - **Gia đình & hàng xóm:** Chào ông bà hàng xóm, Giúp mẹ dọn bàn, Gọi điện hỏi thăm bà.
  - **Trường học & bạn bè:** Làm quen bạn mới, Rủ bạn chơi cùng, Mượn bút của bạn, Lỡ làm đổ nước lên vở bạn, An ủi bạn bị điểm kém, Chúc mừng sinh nhật bạn.
  - **Ngoài đường:** Cảm ơn khi được giúp, Hỏi đường chú công an, Nhường chỗ trên xe buýt.
  - **Biết từ chối & an toàn:** Người lạ cho kẹo, Biết từ chối việc sai, Khi bị bạn trêu.
  - **Cảm xúc của mình:** Nói với mẹ khi buồn, lo.
  - 6 tình huống có bước "Bạn ấy đang cảm thấy thế nào?". Riêng "Khi bị bạn trêu" có bước bé tự nói ra cảm xúc của mình.
- **Phản hồi:**
  - Không bao giờ hiện chữ "SAI" và không có âm thanh chê.
  - Khi chọn chưa tốt, nhân vật phản ứng tự nhiên, Rồng 🐉 gợi ý nhẹ nhàng, rồi hiện nút "🔄 Thử lại nhé". Lựa chọn đã thử được làm mờ.
  - Nút 💡 nhấp nháy khi bé cần và làm sáng lựa chọn phù hợp.
  - Không có đồng hồ đếm giờ.
- **Phần thưởng:**
  - Mỗi tình huống có một sticker và 1–3 sao. Sao tính theo tỉ lệ lựa chọn tốt nhất ở **lần đầu**: ≥ 85% được 3 sao, ≥ 50% được 2 sao, còn lại 1 sao.
  - Hoàn thành một tình huống thì Rồng con được cho ăn, giống như xong một ca chơi.
- **Sổ tiến bộ** có 11 kỹ năng: Chào hỏi, Cảm ơn – Xin lỗi, Hỏi – Nhờ giúp đỡ, Tính tiền, Mua đúng danh sách, Kiên nhẫn – Xếp hàng, Nhận biết cảm xúc, An toàn với người lạ, Biết từ chối, Chơi cùng – Chia sẻ, Quan tâm – Giúp đỡ. Tất cả chỉ lưu trên máy (localStorage).
- **Khu phụ huynh** có thêm: bật/tắt đọc to, tốc độ đọc (Chậm/Vừa/Nhanh), chế độ giáo viên (mở khóa tất cả), Sổ tiến bộ và danh sách tình huống đã xong. Nút "Xóa toàn bộ tiến độ" xóa cả Sổ tiến bộ nhưng giữ các cài đặt.

### File chính
| File | Thay đổi |
|---|---|
| `index.html` | Gỡ Bồi bàn. Thêm 2 ô chế độ, 3 màn mới (danh sách tình huống, màn chơi, màn hoàn thành), CSS, Scenario Engine (phần **AA**), giọng đọc tiếng Việt, cài đặt và Sổ tiến bộ ở khu phụ huynh |
| `scenarios.js` | **Mới**: toàn bộ dữ liệu (kỹ năng, cảm xúc, nhân vật, địa điểm, hàng hóa, tiền, 25 tình huống) |
| `tools/check-scenarios.js` | **Mới**: công cụ kiểm tra dữ liệu tình huống |
| `_archive/waiter/waiter-data.js` | **Mới**: dữ liệu Bồi bàn đã lưu trữ |

## 2. Các quyết định khi đề bài chưa rõ
1. **Giữ chế độ "Gọi món tiếng Anh" (vai Khách).** Đề bài chỉ yêu cầu gỡ Bồi bàn. Trang chủ giờ có 3 ô, mỗi ô có nhãn chữ nhỏ.
2. **Game không có bản đồ**, nên không có địa điểm nào phải chuyển đổi.
3. **Dữ liệu nằm trong `scenarios.js`, không phải file JSON.** Game được mở cả bằng `file://`, mà ở đó trình duyệt chặn `fetch` file JSON. File `.js` sửa giống hệt JSON, chỉ thêm vài hàm viết tắt.
4. **Mở khóa:** cấp 2 mở khi xong ít nhất 2 tình huống cấp 1 của cùng chế độ; cấp 3 cũng vậy. Bật "Chế độ giáo viên" thì mở tất cả.
5. **Xếp cấp cho nhóm an toàn:** "Người lạ cho kẹo" để ở **cấp 2** cho trẻ gặp sớm. "Từ chối việc sai" và "Khi bị trêu" ở cấp 3. "Lạc mẹ" ở cấp 3 của Mua sắm, đúng như đề bài.
6. **Đồng hồ:** đề bài chỉ cấm ở cấp 1–2. Tôi quyết định **không có đồng hồ ở mọi cấp** cho phù hợp tuổi 5–7. Cấp 3 khó hơn ở chỗ khác: không hiện tổng phụ trợ và không làm sáng tờ tiền nên đưa.
7. **Dùng gợi ý 💡 trước khi chọn** thì lựa chọn đó không còn tính là "great" khi tính sao. Bé vẫn qua màn bình thường.
8. **Chọn "ok"** vẫn cho đi tiếp, kèm lời góp ý cách nói hay hơn. Chỉ "try_again" mới bắt chọn lại. Vì vậy mọi tình huống luôn đi được tới kết thúc.
9. **Trả tiền:**
   - Đưa thiếu thì được nhắc "còn thiếu …đ" để đưa thêm.
   - Đưa thừa tờ không cần thì vẫn được nhận ("ok"), kèm lời nhắc chỉ cần đưa vừa đủ.
   - Hệ thống tự tìm cách đưa ít tiền nhất để làm gợi ý.
10. **Tiền Việt Nam:** chỉ vẽ tờ tiền đơn giản (màu + số to), **không mô phỏng tờ tiền thật**.
11. **Người hướng dẫn là Rồng con 🐉**, nhân vật sẵn có của game, nên không thêm nhân vật mới.
12. **Giới hạn thời gian chơi mỗi ngày** áp dụng cho cả 2 chế độ mới. Hết giờ thì hiện màn khóa như cũ.
13. **Đọc to:**
    - Dùng giọng `vi-VN` nếu máy có. Nếu không có, các nút 🔊 bị ẩn, khu phụ huynh hiện ghi chú và game vẫn chơi bình thường, không lỗi.
    - Chế độ tiếng Anh vẫn dùng giọng `en-US`.
14. **"Người lạ" được vẽ như một người bình thường, đang cười.** Mục đích là dạy trẻ rằng người lạ có thể trông rất thân thiện.
15. **Không thu thập dữ liệu:** không hỏi tên bé, không ghi âm, không gửi gì ra ngoài. Ở các tình huống lạc mẹ hay hỏi đường, bé chọn câu có sẵn chứ không nhập thông tin thật.
16. **Không gộp vào `main` và không đẩy lên GitHub**, vì trang đang chạy được triển khai từ `main`. Phụ huynh nên thử bản này trước khi gộp.

## 3. Cách thêm một tình huống mới
1. Mở `scenarios.js` và tìm mảng `SCENARIOS`.
2. Chép một tình huống có sẵn, đổi `id` thành tên không trùng, rồi sửa nội dung.
3. Chạy lệnh kiểm tra bên dưới. Nếu thấy ✅ thì mở game, bật Chế độ giáo viên và thử chơi.

```bash
node tools/check-scenarios.js
```

Ví dụ ngắn:

```js
{ id: 'talk-chaoco', mode: 'talk', group: 'school', level: 1, emoji: '👩‍🏫', sticker: '🌞',
  title: 'Chào cô giáo buổi sáng', location: 'school', skills: ['greet'],
  npcs: { co: { name: 'Cô giáo', look: 'teacher' } },
  nodes: {
    start: talk('co', 'Chào con! Hôm nay con đến sớm thế?', 'happy', [
      G('🙇', 'Dạ con chào cô ạ!', 'Ngoan quá!', 'Con chào cô thật lễ phép!', 'bye'),
      O('👋', 'Chào cô.', 'Chào con.', 'Thêm “Dạ… ạ” sẽ lễ phép hơn nhé.', 'bye'),
      T('🏃', '(Chạy thẳng vào lớp)', 'Ơ…', 'Gặp cô, mình dừng lại chào cô nhé.', 'confused'),
    ]),
    bye: end('co', 'Chúc con một ngày học vui!'),
  } },
```

- `G` là lựa chọn tốt, `O` là tạm được, `T` là cần thử lại.
- `G` và `O` có tham số theo thứ tự: emoji, câu bé nói, nhân vật đáp lại, lời Rồng, nút tiếp theo, cảm xúc nhân vật.
- `T` có tham số theo thứ tự: emoji, câu bé nói, nhân vật đáp lại, lời gợi ý, cảm xúc. `T` không có nút tiếp theo vì bé phải chọn lại.
- Cảm xúc có thể là: `happy`, `neutral`, `confused`, `sad`, `angry`, `scared`, `surprised`, `worried`.
- Tình huống **mua sắm** cần thêm:
  - `list: [{ item: 'chuoi', qty: 1 }]` lấy từ bảng `items`; thêm `need: 'low'` cho món có thể bỏ;
  - `wallet: [50000, 20000]`;
  - các nút `{ type:'shop', … }`, `{ type:'pay', … }` và (nếu muốn) `{ type:'change', shortBy: 0 }`.
  - Món hết hàng: `soldOut: { 'sua-dau': 'sua-tuoi' }`, và một lựa chọn phải có `flag: 'sub'`.
- Muốn thêm món hàng mới thì thêm một dòng vào `items`. Muốn thêm ngoại hình nhân vật thì thêm vào `looks`.

## 4. Tài sản tạm cần thay bằng hình thật (nếu muốn)
- **Khuôn mặt nhân vật:** vẽ bằng SVG trong code (hàm `faceSVG`), 18 kiểu ngoại hình × 8 cảm xúc. Dùng được, nhưng một họa sĩ có thể vẽ đẹp và đa dạng hơn.
- **Hàng hóa, địa điểm, sticker:** đều là emoji. Mỗi hệ điều hành vẽ emoji một kiểu. Vài emoji như 🕯️ và 🖍️ có thể hiện thành ô vuông trên máy rất cũ.
- **Tờ tiền:** là các khối màu có số. Màu được chọn gần với tờ thật để trẻ quen dần, nhưng cố ý không giống tờ thật.
- **Nền địa điểm:** chỉ là dải màu với 3 emoji trang trí.
- **Âm thanh:** chưa có hiệu ứng âm thanh riêng cho 2 chế độ mới (chỉ có giọng đọc). Có thể thêm tiếng "ting" vui khi chọn tốt; tuyệt đối không thêm âm thanh chê.

## 5. Chưa làm và gợi ý
- **Chưa gộp vào `main` và chưa triển khai.** Khi muốn đưa lên mạng: gộp nhánh vào `main` rồi đẩy lên; GitHub Pages sẽ tự cập nhật.
- **Đọc to tiếng Việt** phụ thuộc vào máy: Windows, Android và iOS thường có giọng vi-VN, nhưng một số trình duyệt hoặc máy thì không. Có thể ghi âm sẵn giọng người thật để thay.
- **Mua sắm** mới chỉ có 3 địa điểm. Có thể thêm hiệu thuốc, chợ, nhà sách bằng cách thêm vào `locations` và `items`.
- **Sổ tiến bộ** chỉ xem được trên máy. Nếu giáo viên cần tổng hợp nhiều bé, nên thêm nút "In / Xuất PDF" thay vì gửi dữ liệu lên mạng.
- Có thể thêm **thẻ QR** để mở thẳng một tình huống, như thẻ từ của chế độ tiếng Anh.
- **Trên điện thoại dọc**, khi kệ hàng dài, khung chat khá thấp. Bé vẫn cuộn được, nhưng có thể tách kệ hàng thành từng khu bấm mở.

## 6. Kết quả kiểm thử
Dự án không có bước build hay bộ test sẵn, nên tôi tự kiểm tra như sau:
- `node tools/check-scenarios.js` → **✅ Dữ liệu hợp lệ**: 9 tình huống mua sắm, 16 tình huống trò chuyện. Công cụ kiểm tra:
  - mọi `next` đều tồn tại và luôn có đường tới kết thúc;
  - nhân vật, cảm xúc, món hàng và tờ tiền đều hợp lệ;
  - ví đủ tiền (hoặc cho phép bỏ bớt món);
  - mỗi nút có ít nhất một lựa chọn tốt.
- `node --check` cho `scenarios.js` và cho phần JavaScript trong `index.html`: không lỗi cú pháp.
- **Chơi tự động trong trình duyệt** (Chrome, máy chủ cục bộ), toàn bộ 25 tình huống:
  - luôn chọn tốt: cả 25 đều tới màn hoàn thành, mỗi tình huống 3 sao;
  - lần đầu chọn chưa tốt, sau đó thử lại: cả 25 vẫn tới màn hoàn thành, sao giảm còn 1–2;
  - không có lỗi JavaScript nào trên trang.
- **Kiểm tra tay:**
  - vào và ra từng chế độ: trang chủ → danh sách → tình huống → ← về danh sách → 🏠 về trang chủ;
  - mở khóa dần: ban đầu 6/9 tình huống mua sắm bị khóa, xong 2 tình huống cấp 1 thì còn 3; chế độ giáo viên thì 0;
  - hết giờ chơi thì hiện màn khóa; nút 💡 làm sáng đúng lựa chọn;
  - hết hàng: món thay thế được tính đúng; bỏ bớt món khi không đủ tiền chạy đúng;
  - Sổ tiến bộ và nút xóa tiến độ (giữ cài đặt) chạy đúng;
  - chế độ tiếng Anh vẫn chạy.
- **Bố cục:** máy tính 1280×800, điện thoại dọc 375×812, điện thoại ngang 812×375.
  - Đã sửa: tiêu đề dài làm trang rộng hơn màn hình điện thoại.
  - Đã sửa: khung chat bị ép quá thấp khi điện thoại xoay ngang.
- **Máy thử không có giọng vi-VN**, nên đã kiểm tra được trường hợp ẩn nút 🔊 và hiện ghi chú. Trường hợp **có** giọng vi-VN chưa nghe thử thực tế.
