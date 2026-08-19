# ChoiLongGaBot - Choi Long Ga

English | [Tiếng Việt](README_VI.md)

`ChoiLongGaBot` is a Telegram moderation bot for groups and supergroups. It helps block spam, delete unwanted content, lock and unlock chat permissions, ban and unban users, warn users, verify new members, collect support requests from members, and manage settings through a Mini App dashboard.

## Add The Bot To A Group

1. Open Telegram and search for `@ChoiLongGaBot`.
2. Choose **Add to Group** or **Add to Channel**.
3. Select the group or supergroup you want to protect.
4. Grant admin permissions to the bot.
5. In the group, send:

```text
/active
```

After activation, the group will appear in the dashboard if your Telegram account is an admin or creator of that group.

## Recommended Permissions

- Delete messages
- Ban users
- Restrict members
- Invite users if your group workflow needs member-related actions
- Read messages, or disable privacy mode in BotFather if you operate the bot yourself

If the bot is missing delete, restrict, or ban permissions, some commands may be accepted but the Telegram action will fail.

## Dashboard

The dashboard is a Telegram Mini App used to configure each group.

How to open it:

1. Open a private chat with `@ChoiLongGaBot`.
2. Tap **Menu** or the dashboard/setup button if it has been configured in Telegram.
3. Select a group that has already run `/active`.
4. Update settings and save changes.

The dashboard only shows activated groups where your Telegram account is an admin or creator.

### Available Settings

- Reply language: Vietnamese or English
- Auto-delete delay for command replies
- Service message cleanup
- Delete referral links or ban referral link senders
- Delete story messages or ban story senders
- New member verification
- New member verification timeout
- Blocked keywords

Keywords can be entered on multiple lines or separated with commas or semicolons.

## Commands

Send commands directly in the group. You do not need to append the bot username.

| Command | Access | Description |
| --- | --- | --- |
| `/active` | Admin | Activate the group for the bot and dashboard |
| `/deactive` | Admin | Remove the group's settings and data from the bot |
| `/report` | Member | Reply to a spam message to report it |
| `/id username` | Admin | Resolve a Telegram user ID from a username |
| `/clean` | Admin | Delete tracked messages for the replied or specified user |
| `/clean 123456789` | Admin | Delete tracked messages by Telegram user ID |
| `/clean @username` | Admin | Delete tracked messages by username |
| `/status` | Admin | Check whether a user is locked, banned, or pending verification |
| `/status 123456789` | Admin | Check by Telegram user ID |
| `/status @username` | Admin | Check by username |
| `/lock` | Admin | Reply to a user to lock chat permission |
| `/lock 10m` | Admin | Reply to a user to lock for 10 minutes |
| `/lock 2h` | Admin | Reply to a user to lock for 2 hours |
| `/lock 123456789` | Admin | Lock by Telegram user ID |
| `/lock @username 10m` | Admin | Lock by Telegram username for 10 minutes |
| `/lock 123456789 10m` | Admin | Lock a user ID for 10 minutes |
| `/unlock` | Admin | Reply to a user to restore chat permission |
| `/unlock 123456789` | Admin | Restore chat permission by user ID |
| `/unlock @username` | Admin | Restore chat permission by username |
| `/ban` | Admin | Reply to a user to ban |
| `/ban 123456789` | Admin | Ban by user ID |
| `/ban @username` | Admin | Ban by Telegram username |
| `/unban` | Admin | Reply to a user to unban |
| `/unban 123456789` | Admin | Unban by user ID |
| `/unban @username` | Admin | Unban by Telegram username |
| `/warn` | Admin | Reply to a user to warn |
| `/warn 123456789` | Admin | Warn by user ID |
| `/warn @username` | Admin | Warn by Telegram username |
| `/unwarn` | Admin | Reply to a user to clear warnings |
| `/unwarn 123456789` | Admin | Clear warnings by user ID |
| `/unwarn @username` | Admin | Clear warnings by Telegram username |

## Quick Usage

Lock a disruptive user:

```text
/lock
```

Reply with this command to the user's message.

Lock a user for 30 minutes:

```text
/lock 30m
```

Ban a user:

```text
/ban
```

Reply with this command to the user's message.

Delete tracked messages for a user:

```text
/clean
```

Reply with this command to the user's message, or use `/clean @username` / `/clean 123456789`.

Check a user's status:

```text
/status mhqb365
```

The bot will report whether the user is locked, banned, or waiting for verification.

Report spam:

```text
/report
```

Members can reply with `/report` to a spam message so admins can review it.

Resolve a user ID from a username:

```text
/id @username
```

Ask admins for support:

```text
/support
```

Members must send `/support` in a private chat with the bot, not in the group. The bot asks the member to choose a language first (`vi` or `en`), then asks for the group name, then asks for the issue description. If no activated group matches, it asks the member to enter the name again. After a group is matched, the bot saves the request and shows it in the Mini App dashboard with the member profile and any warning or ban history plus the latest reason found for that member. Each member can send up to `2` support requests every `24` hours.

Admins can resolve support requests from the Mini App with `Unlock`, `Unban`, or `Ignore`. The bot notifies the member with the result.

## Anti-Spam Features

The bot can inspect:

- Text messages
- Captions
- Links inside messages
- Hidden Telegram link entities
- Inline keyboard URLs
- Forward sources
- Story messages
- Service messages

When a violation is detected, the bot can delete the message, warn the user, or ban the user depending on dashboard settings.

## New Member Verification

When verification is enabled:

1. A new member joins and is temporarily restricted.
2. The bot sends a verification button.
3. The user taps their own button to restore chat permission.
4. If verification expires or the user fails too many attempts, admins can handle the user manually with `/unlock`, `/lock`, or `/ban`.

## Notes

- The bot does not ban, lock, or warn admins or creators.
- Admin-only commands sent by regular members are deleted, except `/report`.
- `/support` only works in a private chat with the bot.
- `/id username` uses GramJS and requires `ANTI_SPAM_TELEGRAM_API_ID` and `ANTI_SPAM_TELEGRAM_API_HASH`.
- `/lock`, `/unlock`, `/ban`, `/unban`, `/warn`, `/unwarn`, and `/clean` accept Telegram user IDs and `@username`.
- `/lock` only restricts chat permission. It does not ban the user.
- `/ban` uses a Telegram ban. The user cannot rejoin until an admin or the bot runs `/unban`.
- A group must run `/active` before it appears in the dashboard.
