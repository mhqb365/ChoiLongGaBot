# Anti Spam Telegram Bot

Bot Telegram chống spam cho group/supergroup, chạy bằng Node.js, MongoDB, webhook Telegram và dashboard Telegram Mini App.

## Yêu Cầu

- Node.js `>=20`
- pnpm
- MongoDB hoặc MongoDB Atlas
- Bot Telegram đã được thêm vào group/supergroup với quyền admin
- Public HTTPS URL cho dashboard Mini App, ví dụ Cloudflare Tunnel hoặc reverse proxy HTTPS

Bot xử lý moderation trong chat loại `group` và `supergroup`; riêng `/support` chỉ nhận từ private chat để member bị lock/ban vẫn liên hệ admin.

## Tính Năng

- Blocklist keyword, so khớp text/caption/forward source/link trong message.
- Bộ đếm cảnh báo theo user; quá ngưỡng sẽ ban.
- Dọn service message.
- Dọn link referral hoặc ban người gửi link referral.
- Dọn story hoặc ban người gửi story.
- Xác minh thành viên mới bằng nút inline.
- Khóa/mở quyền chat thủ công bằng `/lock` và `/unlock`.
- Ban/unban, warn/unwarn thủ công.
- Thành viên báo cáo spam bằng `/report`.
- Thành viên gửi yêu cầu hỗ trợ cho admin bằng `/support` trong chat riêng với bot.
- Ngôn ngữ theo từng group: Tiếng Việt hoặc English.
- Dashboard Telegram Mini App cho admin group.

## Commands

Gọi lệnh trực tiếp trong group, không kèm username bot. Ví dụ `/active`, không dùng `/active@YourBot`.

| Lệnh                | Ai dùng được | Tác dụng                                |
| ------------------- | ------------ | --------------------------------------- |
| `/active`           | Admin        | Kích hoạt group để hiện trong dashboard |
| `/deactive`         | Admin        | Xóa cấu hình/dữ liệu group khỏi bot     |
| `/report`           | Mọi người    | Reply tin spam để báo admin             |
| `/id <username>`    | Admin        | Lấy Telegram user ID từ username        |
| `/lock`             | Admin        | Reply user để khóa quyền chat           |
| `/lock <user_id>`   | Admin        | Khóa quyền chat bằng Telegram user ID   |
| `/unlock`           | Admin        | Reply user để mở quyền chat             |
| `/unlock <user_id>` | Admin        | Mở quyền chat bằng Telegram user ID     |
| `/ban`              | Admin        | Reply user để ban                       |
| `/ban <user_id>`    | Admin        | Ban bằng Telegram user ID               |
| `/unban`            | Admin        | Reply user để gỡ ban                    |
| `/unban <user_id>`  | Admin        | Gỡ ban bằng Telegram user ID            |
| `/warn`             | Admin        | Reply user để cảnh báo                  |
| `/warn <user_id>`   | Admin        | Cảnh báo bằng Telegram user ID          |
| `/unwarn`           | Admin        | Reply user để xóa cảnh báo              |
| `/unwarn <user_id>` | Admin        | Xóa cảnh báo bằng Telegram user ID      |

Ghi chú:

- `/lock` chỉ gọi `restrictChatMember` để chặn quyền chat, giống trạng thái member mới chưa xác minh. Lệnh này không ban và không ghi ban log.
- `/id <username>` dùng GramJS, cần `CHOILONGGABOT_TELEGRAM_API_ID` và `CHOILONGGABOT_TELEGRAM_API_HASH`; lệnh này cũng dùng được trong chat riêng với bot.
- Các lệnh `/lock`, `/unlock`, `/ban`, `/unban`, `/warn`, `/unwarn` nhận cả Telegram user ID và `@username`.
- `/support` chỉ dùng trong chat riêng với bot. Bot sẽ hỏi ngôn ngữ trước (`vi` hoặc `en`), sau đó hỏi tên nhóm; nếu không tìm thấy group phù hợp thì yêu cầu nhập lại chính xác hơn. Sau khi match group, bot mới hỏi mô tả vấn đề và hiển thị request trong dashboard, kèm warning/ban history và lý do gần nhất nếu có để admin xem xét. Mỗi member gửi tối đa `2` request trong `24` giờ.
- `/unlock` mở lại quyền chat theo quyền mặc định hiện tại của group.
- Nếu user đang chờ xác minh, `/lock` và `/unlock` đều xóa pending verification và dọn message verify/join cũ nếu còn.
- Bot không lock/ban/warn admin hoặc creator.
- Command của non-admin, trừ `/report`, sẽ bị xóa nếu bot có quyền xóa tin nhắn.

## Dashboard Mini App

Dashboard được serve từ `public/dashboard` trên `CHOILONGGABOT_DASHBOARD_PORT`.

Luồng setup:

1. Thêm bot vào group với quyền admin.
2. Chạy `/active` trong group.
3. Trỏ menu/setup của bot trong Telegram tới public HTTPS dashboard URL.
4. Mở Mini App để cấu hình group.

Dashboard hiện tại:

- Chỉ hiển thị group đã `/active` mà user hiện tại là admin/creator.
- Xác thực Telegram Mini App `initData` cho mỗi API request.
- Kiểm tra quyền admin Telegram trước khi đọc/ghi cấu hình group.
- Hỗ trợ giao diện Tiếng Việt và English.
- Tự lưu language theo group; reply của bot và label trong Mini App đổi theo setting.
- Hiển thị danh sách request `/support` được match với group đang chọn.
- Admin có thể xử lý request `/support` bằng `Unlock`, `Unban` hoặc `Bỏ qua`; bot sẽ nhắn riêng member kết quả xử lý.

Cấu hình trong dashboard:

- Ngôn ngữ: `vi` hoặc `en`.
- Tự xóa phản hồi lệnh sau `1-60` giây.
- Dọn service message.
- Dọn link referral hoặc ban người gửi link referral.
- Dọn story hoặc ban người gửi story.
- Bật xác minh người mới.
- Thời gian xác minh người mới `1-60` phút.
- Blocklist keywords.

Ô blocklist nhận nhiều từ/cụm từ, phân tách bằng dấu phẩy, dấu chấm phẩy hoặc xuống dòng.

## Luồng Xử Lý

Với mỗi message trong group/supergroup, bot xử lý theo thứ tự chính:

1. Member mới join: nếu bật verification, bot restrict user, gửi nút xác minh và lưu pending verification.
2. Tin nhắn của user đang pending verification: nếu đúng answer thì unlock, nếu sai quá số lần thì ban.
3. Chặn command admin nếu người gọi không phải admin.
4. Track message gần đây.
5. Xử lý command: `/report`, `/active`, `/deactive`, `/lock`, `/unlock`, `/ban`, `/unban`, `/warn`, `/unwarn`.
6. Xử lý story message.
7. Xử lý service message cleanup.
8. Kiểm tra blocklist keyword và link referral.

Callback nút xác minh được xử lý qua update `callback_query`.

## Verification

Khi bật xác minh người mới:

- Bot restrict quyền chat của member mới.
- Bot gửi message có nút inline để user bấm xác minh.
- User bấm đúng nút của mình thì bot mở quyền chat và xóa pending verification.
- Người khác bấm nút sẽ nhận cảnh báo “không dành cho bạn”.
- Nếu pending hết hạn, bot xóa pending record và dọn message verify/join cũ nếu còn. User vẫn bị hạn chế quyền chat cho tới khi admin `/unlock`.
- Nếu user gửi text sai trong lúc pending, bot cảnh báo; sai 3 lần thì ban và dọn các message liên quan.

Admin có thể xử lý thủ công:

```text
/lock 123456789
/unlock 123456789
```

Hoặc reply tin nhắn của user bằng `/lock` hoặc `/unlock`.

## Moderation Rules

Blocklist:

- Không phân biệt hoa/thường.
- Có phân biệt dấu tiếng Việt.
- Khớp từ/cụm từ độc lập, không bắt một phần trong từ dài hơn.
- Nội dung so khớp gồm text, caption, forward source, inline keyboard text và link.

Link referral:

- Bot nhận diện link từ text, caption, entity `url`, entity `text_link` và inline keyboard URL.
- Dạng bị chặn gồm link bot Telegram có `start=...` và các biến thể ref/invite/aff phổ biến.

Cảnh báo:

- Warning limit hiện tại là `2`.
- Lần 1-2: xóa message và cảnh báo user.
- Lần tiếp theo: ban user, xóa message và ghi ban log.
- `/warn` dùng chung bộ đếm cảnh báo với blocklist.
- Warning tự hết hạn sau 30 ngày không cập nhật.

Ban:

- Bot gọi `banChatMember` với `revoke_messages: true`.
- User bị ban không tự join lại được cho tới khi admin hoặc bot `/unban`.
- Bot không ban admin/creator.

## Storage

Bot không lưu toàn bộ lịch sử chat.

Các collection chính:

- `chatsettings`: cấu hình cleanup, verification, language và thời gian tự xóa reply theo group.
- `keywords`: blocklist keyword, unique theo `chatId + keyword`.
- `userwarnings`: bộ đếm cảnh báo theo `chatId + userId`, TTL 30 ngày.
- `trackedmessages`: message gần đây theo user, TTL 30 ngày.
- `pendingverifications`: user đang chờ xác minh.
- `banlogs`: log các lần bot ban user, dùng cho audit và dashboard stats.
- `supportrequests`: yêu cầu hỗ trợ do member gửi riêng cho bot, TTL 30 ngày.

Dashboard stats hiện đếm số keyword và số user từng bị bot ban từ `banlogs`.

## Quyền Telegram Cần Cấp

Bot nên là admin với quyền:

- Ban users
- Restrict members
- Delete messages
- Read messages

Nếu muốn bot đọc toàn bộ tin nhắn group, hãy tắt privacy mode trong BotFather. Nếu privacy mode bật, Telegram chỉ gửi một phần message cho bot nên chống spam sẽ không đầy đủ.

## Cấu Hình

Cài dependency và tạo `.env`:

```bash
pnpm install
copy .env.example .env
```

Biến môi trường:

```env
CHOILONGGABOT_BOT_TOKEN=your_bot_token
CHOILONGGABOT_MONGODB_URI=mongodb://127.0.0.1:27017
CHOILONGGABOT_MONGODB_DB=choilonggabot
CHOILONGGABOT_DASHBOARD_PORT=8004
CHOILONGGABOT_WEBHOOK_URL=https://choilonggabot.mhqb365.com/telegram/webhook
CHOILONGGABOT_WEBHOOK_SECRET=replace_with_random_secret
CHOILONGGABOT_ADMIN_USERNAME=admin
CHOILONGGABOT_ADMIN_PASSWORD=replace_with_strong_password
CHOILONGGABOT_TELEGRAM_API_ID=123456
CHOILONGGABOT_TELEGRAM_API_HASH=your_api_hash
CHOILONGGABOT_TELEGRAM_STRING_SESSION=
```

Ghi chú:

- `CHOILONGGABOT_BOT_TOKEN` là bắt buộc.
- `CHOILONGGABOT_MONGODB_URI` mặc định là `mongodb://127.0.0.1:27017`.
- `CHOILONGGABOT_MONGODB_DB` mặc định là `choilonggabot`.
- `CHOILONGGABOT_DASHBOARD_PORT` mặc định là `3000`; trên VPS hiện tại dùng `8004` nếu Cloudflare Tunnel trỏ về `localhost:8004`.
- `CHOILONGGABOT_WEBHOOK_URL` cần khi dùng webhook.
- `CHOILONGGABOT_WEBHOOK_SECRET` nên đặt chuỗi random dài để Telegram webhook được xác thực.
- `CHOILONGGABOT_ADMIN_USERNAME` và `CHOILONGGABOT_ADMIN_PASSWORD` bật login fallback khi mở dashboard bằng browser ngoài Telegram.
- `CHOILONGGABOT_TELEGRAM_API_ID` và `CHOILONGGABOT_TELEGRAM_API_HASH` lấy từ `https://my.telegram.org/apps`; cần cho `/id <username>` và các lệnh moderation dùng `@username`.
- `CHOILONGGABOT_TELEGRAM_STRING_SESSION` có thể để trống khi dùng bot token. Chỉ cần đặt khi bạn chạy GramJS bằng session tài khoản Telegram riêng.
- Các timeout/retry Telegram vẫn có default trong code; chỉ thêm vào `.env` khi cần tuning riêng.

## Chạy Bot

Production:

```bash
pnpm start
```

Development với nodemon:

```bash
pnpm dev
```

PM2:

```bash
pm2 start ecosystem.config.js
```

PM2 dùng app name `anti-spam-bot`.

## Kiểm Tra Code

Lint Node source:

```bash
pnpm lint
```

Check format:

```bash
pnpm format:check
```

Format toàn project:

```bash
pnpm format
```
