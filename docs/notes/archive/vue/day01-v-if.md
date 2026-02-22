# Vue 学习 Day 1：v-if / v-show

## 今天学了什么
- v-if 的条件渲染原理
- v-show 的 display 切换

## 踩坑记录
- v-if 和 v-for 不要一起用
- key 不要用 index

## 示例代码
```vue
<div v-if="visible">Hello</div>
