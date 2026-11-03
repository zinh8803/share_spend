---
version: 1
slug: "app-pages-index-vue"
primary_target: "app/pages/index.vue"
related_targets: ["app/pages","app/components"]
---

# Surface brief: ShareSpend web app (15 MVP screens)

Scope: the whole authenticated app plus Login/Register, built in Nuxt 3 + Tailwind with mock data. Visitor mode: Operate.

Audience and job: Vietnamese Gen Z friend groups (trips, shared flats, lunch crews) logging personal spending daily and settling shared bills with minimal math. Key tasks: add a transaction in seconds, create a shared expense and split it, see who owes whom, record a payment.

Constraints: Vietnamese UI copy; VND formatting `125.000đ`; no icons paired with text labels anywhere (buttons, nav, headings, chips); cute illustrations from open libraries (DiceBear Notionists + Open Peeps, CC0; Microsoft Fluent Emoji 3D, MIT) used as images in their own right; demo data reads as sample data.

## Direction contract

THESIS: Every group is a photobooth strip of friends; money is written beside them like a handwritten caption. Refuses the category default of a grey sidebar, white cards and a green accent ledger (Splitwise).

OWN-WORLD: Lilac-washed ground (#EDE6FF), white "print" panels with thick 3px ink (#222) borders and small radii, pastel frame fills (lilac #C9B6FF, sky #A8D8FF, blush #FFD6E2, butter #FFF1A8), pink selection (#FF8FB1). Be Vietnam Pro for UI, Patrick Hand for captions. Money direction colours reserved: mint-green for "nhận về", rose for "phải trả", never decorative.

STORY: The user understands their month at a glance, sees each group as their friends' faces, knows exactly who owes whom, and settles in one tap.

FIRST VIEWPORT: White top bar with ink underline: wordmark, text nav pills (active pill lilac), primary "Tạo khoản chi" ink pill at right. Groups screen: three tilted photobooth strips at left (the selected one outlined pink), a large white panel at right with group name, three pastel stat tiles, debt rows (avatar frame, "An nợ Vinh", handwritten note, tabular amount), and a "Ghi nhận thanh toán" pill.

FORM: Photobooth 4 Khung, my top grounded candidate (rank 1), chosen as IMPECCABLE'S PICK. seed:72bb191cef2b7009

SIGNATURE: Photobooth strips: groups and split participants render as stacked frames with illustrated avatars; a strip "develops" (frames fade in sequentially with a slight tilt settle) when a group or split appears. Changed balances stay highlighted until seen (boarding-pass raise).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
