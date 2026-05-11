---
title: CSS Border和Background筆記
date: 2026-01-18
tags: [前端, 學習筆記]
summary: 記錄「CSS Border和Background筆記」相關內容：2026年1月18日 當按鈕同時有 `border` 和 `background` 時，使用 `hover:bg-primary-dark` 只有中間部分變深，外圍（邊框區域）保持...
status: 草稿
---

# CSS Border 和 Background 的 Hover 效果筆記

## 發現日期
2026年1月18日

## 問題描述
當按鈕同時有 `border` 和 `background` 時，使用 `hover:bg-primary-dark` 只有中間部分變深，外圍（邊框區域）保持原本顏色。

## 原因分析

### 按鈕結構
```html
<button class="bg-primary border-4 border-primary hover:bg-primary-dark">
```

### 視覺層次
```
┌─────────────────────────┐
│   border (4px 綠色)     │  ← border-primary (不受 hover:bg- 影響)
│  ┌───────────────────┐  │
│  │  background       │  │  ← bg-primary → hover:bg-primary-dark ✓
│  │  (中間區域)       │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## 重要結論

⚠️ **`bg-` 和 `border-` 是兩個獨立的 CSS 屬性！**

- `bg-primary` = `background-color: var(--color-primary)`
- `border-primary` = `border-color: var(--color-primary)`
- `hover:bg-primary-dark` **只改變** `background-color`
- **不會影響** `border-color`

## 解決方案

### 方案 1：同時改變背景和邊框
```html
<button class="... hover:bg-primary-dark hover:border-primary-dark">
```
效果：整個按鈕（包括邊框）都變深

### 方案 2：使用 filter（推薦）
```html
<button class="... hover:brightness-110">
```
效果：
- 整體變亮/變暗
- 自動應用到所有顏色（背景、邊框、文字）
- 更自然、統一

### 方案 3：改變邊框顏色
```html
<button class="... hover:border-white">
```
效果：邊框變成其他顏色作為對比

## 其他可用的 filter 效果

- `hover:brightness-110` - 變亮 10%
- `hover:brightness-90` - 變暗 10%
- `hover:saturate-150` - 顏色更鮮豔
- `hover:opacity-90` - 半透明
- `hover:contrast-125` - 對比度增強

## 最終採用方案

使用 `hover:brightness-110 hover:shadow-2xl`：
- 不會移動按鈕位置
- 整體變亮效果統一
- 搭配陰影加深，視覺反饋明確

## 額外學習

### CSS 盒模型層次（由外到內）
1. **margin** - 外邊距（透明）
2. **border** - 邊框（有顏色）← `border-color`
3. **padding** - 內邊距（透明，顯示背景色）
4. **content** - 內容區域 ← `background-color`

### Tailwind 的 hover 修飾符
- 可以應用在任何 utility class 前面
- `hover:bg-*`、`hover:border-*`、`hover:text-*` 是**獨立的**
- `hover:brightness-*` 等 filter 會影響**整個元素**（包括子元素）
