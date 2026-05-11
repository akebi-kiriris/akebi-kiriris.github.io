---
title: CSS_Global_Reset_覆蓋_Tailwind_Padding_問題
date: 2026-03-11
tags: [前端, 除錯]
summary: 記錄「CSS_Global_Reset_覆蓋_Tailwind_Padding_問題」相關內容：**發現日期**：2026-03-11   **症狀**：TasksView 的卡片內容貼著邊界，加再多 `p-5`、`px-6` 都沒效果，刪掉也沒差
status: 草稿
---

# `* { padding: 0 }` 覆蓋所有 Tailwind Padding 的鳥問題

**發現日期**：2026-03-11  
**症狀**：TasksView 的卡片內容貼著邊界，加再多 `p-5`、`px-6` 都沒效果，刪掉也沒差

---

## 症狀描述

- `p-5` 加了沒用
- `p-5` 刪了也沒變化
- 改用 `m`（margin）時，左右有間距，但上下沒有（且整張卡片往外推，不是內縮）
- 全站所有 padding utility 都像廢物

---

## 根本原因

`src/style.css` 裡有一個全域重置：

```css
/* 有夠鳥的寫法 */
* {
  padding: 0;
  box-sizing: border-box;
}
```

### 為什麼這樣會蓋掉 Tailwind？

Tailwind v4 把所有 utility class（`p-5`、`px-6`、`pb-24` ...）放進 `@layer utilities` 裡。

CSS Cascade Layer 規則：**沒有放進任何 `@layer` 的普通 CSS，優先級天生高於所有 `@layer` 裡的樣式**，跟 specificity 無關。

所以：
```
* { padding: 0 }          ← 沒有 @layer，cascade 優先度最高
.p-5 { padding: 1.25rem } ← 在 @layer utilities 裡，天生輸
```

無論 `.p-5` 的 specificity 是多少，都打不過沒有 layer 的 `*`。

### 為什麼 margin 左右有用、上下沒用？

`margin` 沒被 `*` 重置，所以左右的確生效。但上下方向遇到了 **margin collapse（外距塌陷）**：父層 card div 沒有 `border`、沒有 `padding`、沒有 `overflow`，子層的 `margin-top` / `margin-bottom` 會穿透父層塌陷掉，看起來像是「上下沒有 margin」。

---

## 修法

把 `*` 包進 `@layer base {}`，讓它和 utility 在同一個 layer 裡比 specificity。  
此時 `.p-5`（specificity: 0,1,0）自然勝過 `*`（specificity: 0,0,0）：

```css
/* ✅ 正確寫法 */
@layer base {
  * {
    padding: 0;
    box-sizing: border-box;
  }
}
```

---

## 教訓

在使用 Tailwind v4 的專案裡，**全域 CSS reset 一律要放進 `@layer base {}`**，否則會靜默覆蓋所有 utility padding/margin，而且 debug 起來毫無頭緒。
