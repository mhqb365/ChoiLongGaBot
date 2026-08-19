# ChoiLongGaBot - Choi Long Ga

[English](README_EN.md) | Tiếng Việt

`ChoiLongGaBot` là bot Telegram moderation cho group và supergroup. Bot hỗ trợ chống spam, xóa nội dung rác, khóa/mở chat, ban/unban, cảnh báo user, xác minh thành viên mới, nhận yêu cầu hỗ trợ từ member, và cấu hình qua dashboard Mini App.

## Thêm Bot Vào Nhóm

1. Mở Telegram và tìm bot `@ChoiLongGaBot`.
2. Chọn **Add to Group** hoặc **Add to Channel**.
3. Chọn group/supergroup cần bảo vệ.
4. Cấp quyền admin cho bot.
5. Trong group, gửi:

```text
/active
```

Sau khi kích hoạt, group sẽ xuất hiện trong dashboard nếu tài khoản Telegram của bạn là admin hoặc creator của group đó.

## Quyền Nên Cấp Cho Bot

- Delete messages
- Ban users
- Restrict members
- Invite users nếu group cần thao tác liên quan thành viên
- Read messages, hoặc tắt privacy mode trong BotFather nếu bạn tự vận hành bot

Nếu bot thiếu quyền xóa tin nhắn, restrict hoặc ban user, một số lệnh vẫn nhận nhưng thao tác Telegram sẽ thất bại.

## Dashboard

Dashboard là Telegram Mini App dùng để cấu hình từng group.

Mở dashboard:

1. Mở chat riêng với `@ChoiLongGaBot`.
2. Bấm **Menu** hoặc nút dashboard/setup nếu Telegram đã cấu hình sẵn.
3. Chọn group đã chạy `/active`.
4. Cập nhật cấu hình và lưu lại.

Dashboard chỉ hiển thị các group đã kích hoạt mà tài khoản Telegram hiện tại có quyền admin hoặc creator.

### Tùy Chỉnh Được

- Ngôn ngữ phản hồi: Tiếng Việt hoặc English
- Thời gian tự xóa phản hồi lệnh
- Dọn service message
- Dọn link ref hoặc ban người gửi link ref
- Dọn story hoặc ban người gửi story
- Bật/tắt xác minh thành viên mới
- Thời gian xác minh thành viên mới
- Danh sách keyword bị chặn

Keyword có thể nhập nhiều dòng hoặc phân tách bằng dấu phẩy/dấu chấm phẩy.

## Lệnh Trong Group

Gõ lệnh trực tiếp trong group, không cần thêm username bot.

| Lệnh | Ai dùng được | Tác dụng |
| --- | --- | --- |
| `/active` | Admin | Kích hoạt group trong bot và dashboard |
| `/deactive` | Admin | Xóa cấu hình và dữ liệu của group khỏi bot |
| `/report` | Member | Reply tin spam để báo cáo cho admin |
| `/id username` | Admin | Lấy Telegram user ID từ username |
| `/clean` | Admin | Xóa các tin đã track của user được reply hoặc chỉ định |
| `/clean 123456789` | Admin | Xóa theo Telegram user ID |
| `/clean @username` | Admin | Xóa theo username |
| `/status` | Admin | Kiểm tra lock, ban và trạng thái xác minh của user |
| `/status 123456789` | Admin | Kiểm tra theo Telegram user ID |
| `/status @username` | Admin | Kiểm tra theo username |
| `/lock` | Admin | Reply user để khóa quyền chat |
| `/lock 10m` | Admin | Reply user để khóa trong 10 phút |
| `/lock 2h` | Admin | Reply user để khóa trong 2 giờ |
| `/lock 123456789` | Admin | Khóa theo Telegram user ID |
| `/lock @username 10m` | Admin | Khóa username trong 10 phút |
| `/lock 123456789 10m` | Admin | Khóa user ID trong 10 phút |
| `/unlock` | Admin | Reply user để mở quyền chat |
| `/unlock 123456789` | Admin | Mở quyền chat theo user ID |
| `/unlock @username` | Admin | Mở quyền chat theo username |
| `/ban` | Admin | Reply user để ban |
| `/ban 123456789` | Admin | Ban theo user ID |
| `/ban @username` | Admin | Ban theo username |
| `/unban` | Admin | Reply user để gỡ ban |
| `/unban 123456789` | Admin | Gỡ ban theo user ID |
| `/unban @username` | Admin | Gỡ ban theo username |
| `/warn` | Admin | Reply user để cảnh báo |
| `/warn 123456789` | Admin | Cảnh báo theo user ID |
| `/warn @username` | Admin | Cảnh báo theo username |
| `/unwarn` | Admin | Reply user để xóa cảnh báo |
| `/unwarn 123456789` | Admin | Xóa cảnh báo theo user ID |
| `/unwarn @username` | Admin | Xóa cảnh báo theo username |

## Cách Dùng Nhanh

Khóa user đang gây rối:

```text
/lock
```

Reply lệnh này vào tin nhắn của user cần khóa.

Khóa user trong 30 phút:

```text
/lock 30m
```

Ban user:

```text
/ban
```

Reply lệnh này vào tin nhắn của user cần ban.

Xóa tin nhắn đã track của user:

```text
/clean
```

Reply lệnh này vào tin nhắn của user cần dọn, hoặc dùng `/clean @username` / `/clean 123456789`.

Kiểm tra trạng thái user:

```text
/status mhqb365
```

Bot sẽ trả về user đó đang bị lock hay ban, và có đang chờ xác minh hay không.

Báo cáo spam:

```text
/report
```

Member reply `/report` vào tin spam để báo cho admin.

Lấy user ID từ username:

```text
/id @username
```

Gửi yêu cầu hỗ trợ cho admin:

```text
/support
```

Member phải gửi `/support` trong chat riêng với bot. Bot sẽ hỏi ngôn ngữ trước (`vi` hoặc `en`), sau đó hỏi tên group, rồi hỏi mô tả vấn đề. Nếu không tìm thấy group đã kích hoạt phù hợp, bot sẽ yêu cầu nhập lại chính xác hơn. Mỗi member có thể gửi tối đa `2` yêu cầu trong `24` giờ.

Admin có thể xử lý yêu cầu hỗ trợ trong Mini App bằng `Unlock`, `Unban` hoặc `Ignore`. Bot sẽ nhắn riêng member kết quả xử lý.

## Chống Spam

Bot có thể kiểm tra:

- Text message
- Caption
- Link trong message
- Link ẩn trong entity Telegram
- Inline keyboard URL
- Forward source
- Story message
- Service message

Khi phát hiện vi phạm, bot có thể xóa tin nhắn, cảnh báo user hoặc ban user tùy theo cấu hình dashboard.

## Xác Minh Thành Viên Mới

Khi bật verification:

1. Thành viên mới vào group sẽ bị hạn chế quyền chat tạm thời.
2. Bot gửi nút xác minh.
3. User bấm đúng nút của mình để được mở chat.
4. Nếu hết hạn hoặc trả lời sai quá số lần cho phép, admin có thể xử lý thủ công bằng `/unlock`, `/lock` hoặc `/ban`.

## Lưu Ý

- Bot không ban, lock hoặc warn admin/creator.
- Lệnh admin do member thường gửi sẽ bị xóa, trừ `/report`.
- `/support` chỉ dùng trong chat riêng với bot.
- `/id username` dùng GramJS, cần `ANTI_SPAM_TELEGRAM_API_ID` và `ANTI_SPAM_TELEGRAM_API_HASH`.
- `/lock`, `/unlock`, `/ban`, `/unban`, `/warn`, `/unwarn` nhận cả Telegram user ID và `@username`.
- `/lock` chỉ khóa quyền chat, không ban user.
- `/ban` dùng Telegram ban, user không thể tự join lại cho đến khi được `/unban`.
- Group cần chạy `/active` trước khi xuất hiện trong dashboard.
