# ChoiLongGaBot - Chổi Lông Gà

[English](README_EN.md) | Tiếng Việt

`ChoiLongGaBot` là bot Telegram hỗ trợ quản trị group/supergroup: chặn spam, xóa nội dung rác, khóa chat, ban/unban, cảnh báo user, xác minh thành viên mới và cấu hình qua dashboard.

Tài liệu này dành cho admin nhóm muốn thêm bot vào group và sử dụng các tính năng chính.

## Thêm Bot Vào Nhóm

1. Mở Telegram và tìm bot `@ChoiLongGaBot`.
2. Bấm vào hồ sơ bot, chọn **Add to Group** hoặc **Add to Channel**.
3. Chọn group/supergroup cần bảo vệ.
4. Cấp quyền admin cho bot.
5. Trong group, gửi lệnh:

```text
/active
```

Sau khi kích hoạt, group sẽ xuất hiện trong dashboard của bot nếu bạn là admin/creator của group đó.

## Quyền Nên Cấp Cho Bot

Để bot hoạt động đầy đủ, hãy cấp các quyền sau:

- Delete messages
- Ban users
- Restrict members
- Invite users nếu nhóm cần bot hỗ trợ thao tác liên quan thành viên
- Read messages hoặc tắt privacy mode trong BotFather nếu bạn tự vận hành bot

Nếu bot thiếu quyền xóa tin nhắn, restrict hoặc ban user, một số lệnh vẫn nhận nhưng thao tác Telegram sẽ thất bại.

## Mở Dashboard

Dashboard là Telegram Mini App dùng để cấu hình bot cho từng group.

Cách mở:

1. Mở chat riêng với `@ChoiLongGaBot`.
2. Bấm nút **Menu** hoặc nút dashboard/setup nếu đã được cấu hình trong Telegram.
3. Chọn group đã chạy `/active`.
4. Cập nhật cấu hình và lưu thay đổi.

Dashboard chỉ hiển thị những group đã kích hoạt và nơi tài khoản Telegram hiện tại là admin hoặc creator.

Các mục có thể cấu hình:

- Ngôn ngữ phản hồi: Tiếng Việt hoặc English
- Thời gian tự xóa phản hồi lệnh
- Dọn service message
- Dọn hoặc ban người gửi link referral
- Dọn hoặc ban người gửi story
- Bật/tắt xác minh thành viên mới
- Thời gian xác minh thành viên mới
- Danh sách keyword bị chặn

Keyword có thể nhập nhiều dòng hoặc phân tách bằng dấu phẩy/dấu chấm phẩy.

## Lệnh Cơ Bản

Gõ lệnh trực tiếp trong group, không cần thêm username bot.

| Lệnh                  | Ai dùng được | Tác dụng                               |
| --------------------- | ------------ | -------------------------------------- |
| `/active`             | Admin        | Kích hoạt group trong bot và dashboard |
| `/deactive`           | Admin        | Xóa cấu hình/dữ liệu group khỏi bot    |
| `/report`             | Member       | Reply tin nhắn spam để báo cáo         |
| `/lock`               | Admin        | Reply user để khóa quyền chat          |
| `/lock 10m`           | Admin        | Reply user để khóa 10 phút             |
| `/lock 2h`            | Admin        | Reply user để khóa 2 giờ               |
| `/lock 123456789`     | Admin        | Khóa user bằng Telegram user ID        |
| `/lock 123456789 10m` | Admin        | Khóa user ID trong 10 phút             |
| `/unlock`             | Admin        | Reply user để mở quyền chat            |
| `/unlock 123456789`   | Admin        | Mở quyền chat bằng user ID             |
| `/ban`                | Admin        | Reply user để ban                      |
| `/ban 123456789`      | Admin        | Ban bằng user ID                       |
| `/unban`              | Admin        | Reply user để gỡ ban                   |
| `/unban 123456789`    | Admin        | Gỡ ban bằng user ID                    |
| `/warn`               | Admin        | Reply user để cảnh báo                 |
| `/warn 123456789`     | Admin        | Cảnh báo bằng user ID                  |
| `/unwarn`             | Admin        | Reply user để xóa cảnh báo             |
| `/unwarn 123456789`   | Admin        | Xóa cảnh báo bằng user ID              |

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

Khóa user trong 2 giờ:

```text
/lock 2h
```

Ban user:

```text
/ban
```

Reply lệnh này vào tin nhắn của user cần ban.

Báo cáo spam:

```text
/report
```

Member reply `/report` vào tin spam để báo cho admin.

## Tính Năng Chống Spam

Bot có thể kiểm tra:

- Text message
- Caption
- Link trong message
- Link ẩn trong entity Telegram
- Inline keyboard URL
- Forward source
- Story message
- Service message

Khi phát hiện vi phạm, bot có thể xóa tin nhắn, cảnh báo user, hoặc ban user tùy theo cấu hình dashboard.

## Xác Minh Thành Viên Mới

Khi bật verification:

1. Thành viên mới vào group sẽ bị hạn chế quyền chat tạm thời.
2. Bot gửi nút xác minh.
3. User bấm đúng nút của mình để được mở chat.
4. Nếu hết hạn hoặc trả lời sai quá số lần cho phép, admin có thể xử lý thủ công bằng `/unlock`, `/lock` hoặc `/ban`.

## Lưu Ý

- Bot không ban/lock/warn admin hoặc creator.
- Lệnh admin do member thường gửi sẽ bị xóa, trừ `/report`.
- `/lock` chỉ khóa quyền chat, không ban user.
- `/ban` dùng Telegram ban, user không thể tự join lại cho đến khi được `/unban`.
- Group cần chạy `/active` trước khi xuất hiện trong dashboard.
