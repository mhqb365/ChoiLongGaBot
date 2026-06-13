# ChoiLongGaBot - Choi Long Ga

English | [Tiếng Việt](README.md)

`ChoiLongGaBot` is a Telegram moderation bot for groups and supergroups. It helps admins fight spam, delete unwanted content, lock chat permissions, ban/unban users, warn users, verify new members, collect member support requests, and manage settings from a dashboard.

This guide is for group admins who want to add the bot and use its main features.

## Add The Bot To A Group

1. Open Telegram and search for `@ChoiLongGaBot`.
2. Open the bot profile and choose **Add to Group** or **Add to Channel**.
3. Select the group/supergroup you want to protect.
4. Grant admin permissions to the bot.
5. In the group, send:

```text
/active
```

After activation, the group will appear in the dashboard if your Telegram account is an admin or creator of that group.

## Recommended Permissions

For full functionality, grant the bot these permissions:

- Delete messages
- Ban users
- Restrict members
- Invite users if your group workflow needs member-related actions
- Read messages, or disable privacy mode in BotFather if you operate the bot yourself

If the bot is missing delete, restrict, or ban permissions, some commands may be accepted but the Telegram action will fail.

## Open The Dashboard

The dashboard is a Telegram Mini App used to configure each group.

How to open it:

1. Open a private chat with `@ChoiLongGaBot`.
2. Tap **Menu** or the dashboard/setup button if it has been configured in Telegram.
3. Select a group that has already run `/active`.
4. Update settings and save changes.

The dashboard only shows activated groups where your Telegram account is an admin or creator.

Available settings include:

- Reply language: Vietnamese or English
- Auto-delete delay for command replies
- Service message cleanup
- Delete referral links or ban referral link senders
- Delete story messages or ban story senders
- New member verification
- New member verification timeout
- Blocked keywords

Keywords can be entered on multiple lines or separated with commas/semicolons.

## Commands

Send commands directly in the group. You do not need to append the bot username.

| Command               | Access | Description                                  |
| --------------------- | ------ | -------------------------------------------- |
| `/active`             | Admin  | Activate the group for the bot and dashboard |
| `/deactive`           | Admin  | Remove group settings/data from the bot      |
| `/report`             | Member | Reply to a spam message to report it         |
| `/id username`        | Admin  | Resolve a Telegram user ID from a username   |
| `/lock`               | Admin  | Reply to a user to lock chat permission      |
| `/lock 10m`           | Admin  | Reply to a user to lock for 10 minutes       |
| `/lock 2h`            | Admin  | Reply to a user to lock for 2 hours          |
| `/lock 123456789`     | Admin  | Lock by Telegram user ID                     |
| `/lock @username 10m` | Admin  | Lock by Telegram username for 10 minutes     |
| `/lock 123456789 10m` | Admin  | Lock a user ID for 10 minutes                |
| `/unlock`             | Admin  | Reply to a user to restore chat permission   |
| `/unlock 123456789`   | Admin  | Restore chat permission by user ID           |
| `/unlock @username`   | Admin  | Restore chat permission by username          |
| `/ban`                | Admin  | Reply to a user to ban                       |
| `/ban 123456789`      | Admin  | Ban by user ID                               |
| `/ban @username`      | Admin  | Ban by Telegram username                     |
| `/unban`              | Admin  | Reply to a user to unban                     |
| `/unban 123456789`    | Admin  | Unban by user ID                             |
| `/unban @username`    | Admin  | Unban by Telegram username                   |
| `/warn`               | Admin  | Reply to a user to warn                      |
| `/warn 123456789`     | Admin  | Warn by user ID                              |
| `/warn @username`     | Admin  | Warn by Telegram username                    |
| `/unwarn`             | Admin  | Reply to a user to clear warnings            |
| `/unwarn 123456789`   | Admin  | Clear warnings by user ID                    |
| `/unwarn @username`   | Admin  | Clear warnings by Telegram username          |

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

Lock a user for 2 hours:

```text
/lock 2h
```

Ban a user:

```text
/ban
```

Reply with this command to the user's message.

Report spam:

```text
/report
```

Members can reply with `/report` to a spam message so admins can review it.

Resolve a user ID from a username:

```text
/id @username
```

Moderation commands also accept usernames:

```text
/ban @username
/lock @username 30m
```

Ask admins for support:

```text
/support
```

Members must send `/support` in a private chat with the bot, not in the group. The bot asks the member to choose a language first (`vi` or `en`), then asks for the group name. If no activated group matches, it asks the member to enter the name again. After a group is matched, the bot asks for the issue description, saves the request, and shows it in the Mini App dashboard with the member profile and any warning/ban history plus latest reason found for that member. Each member can send up to `2` support requests every `24` hours.

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
4. If the verification expires or the user fails too many attempts, admins can handle the user manually with `/unlock`, `/lock`, or `/ban`.

## Notes

- The bot does not ban, lock, or warn admins/creators.
- Admin-only commands sent by regular members are deleted, except `/report`.
- `/support` only works in a private chat with the bot. The bot asks for language, then group name, then issue description. Each member is limited to `2` requests every `24` hours.
- `/id username` uses GramJS and requires `ANTI_SPAM_TELEGRAM_API_ID` plus `ANTI_SPAM_TELEGRAM_API_HASH`. It also works in private chat with the bot.
- `/lock`, `/unlock`, `/ban`, `/unban`, `/warn`, and `/unwarn` accept both Telegram user IDs and `@username`.
- `/lock` only restricts chat permission. It does not ban the user.
- `/ban` uses Telegram ban. The user cannot rejoin until an admin or the bot runs `/unban`.
- A group must run `/active` before it appears in the dashboard.
