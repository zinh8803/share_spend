# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Nuxt 3 + Tailwind CSS. Frontend only for now, driven by mock data; the backend (Laravel REST API + Sanctum + MySQL) comes later per `feature.md`. Charts: Apache ECharts.

## Users

Primary: Gen Z, roughly 18–28, in Vietnam. Friend groups who eat out together, travel together (e.g. "Nhóm đi Đà Lạt"), or share a rented flat (rent, electricity, water, internet). They currently settle up by hand in Zalo chats or Excel.

Secondary (served, not prioritised): families managing household budgets, and small company teams tracking lunch money, parties, and team funds.

## Product Purpose

ShareSpend combines a personal expense tracker with a group expense splitter. Users log their own income and spending, create groups, record shared expenses, split them automatically, and see at a glance who owes whom and how much. Success: nobody has to calculate splits by hand, and users come back daily for personal tracking, not only when a trip happens.

## Positioning

Personal tracking and group splitting in one place, with a strict separation between "money I paid" and "money I actually spent": if Vinh pays 500.000đ for four people, his real spend is 125.000đ and 375.000đ is a receivable. Personal reports stay correct because of this.

## Operating Context

- Splitting at the table after a meal, on a phone, in a hurry.
- Trip groups that accumulate many expenses over several days, then settle once.
- Shared-flat groups with monthly recurring bills.
- Invites go out via link or invite code, typically pasted into Zalo/Messenger.
- Settlement is confirmed manually (no bank / QR integration in MVP).

## Capabilities and Constraints

- Currency: VND by default, formatted like `125.000đ`. Money is never stored as float.
- Split methods: Equal and Exact in MVP; Percentage and Shares in Phase 2.
- Invariant: the sum of all member shares must equal the expense total, including rounding remainders.
- Debt statuses: Pending, Partially Paid, Paid, Cancelled.
- Group roles: Owner and Member in MVP (Admin later). Groups can be Active or Archived (archived = read-only).
- Removing a member or deleting an expense never silently erases history.
- Group expenses are not counted twice in personal spending; only the user's own share counts.
- MVP screens: Login/Register, Dashboard, Transactions, Create Transaction, Categories, Groups, Group Detail, Members, Expenses, Create Expense, Expense Detail, Balances, Settlements, Reports, Settings.
- Default categories: Ăn uống, Di chuyển, Nhà ở, Mua sắm, Sức khỏe, Khác.
- Interface language: Vietnamese.
- Undecided: final product name (ShareSpend is a working name), pricing (Freemium model proposed, not validated).

## Brand Commitments

- Working name: ShareSpend.
- User directive: modern, Gen Z feel, with cute illustrations from open image libraries. Text labels must not be paired with icons (no icon-before-label decoration on buttons, nav items, or headings).

## Evidence on Hand

- `feature.md`: full business requirements document (BRD).
- No real users, testimonials, metrics, logos, or screenshots exist. Do not fabricate them; demo data must read as clearly sample data.

## Product Principles

1. Settling up should feel lighter than the meal: clear numbers, few taps, no blame.
2. Paid and owed are different things; always show both honestly.
3. Personal habit first: daily tracking brings people back, group splitting makes them invite friends.
4. Each group is its own space: data, debt, and permissions never leak between groups.
5. Never lose history: edits recalculate, deletions leave a trail.

