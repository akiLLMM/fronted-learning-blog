import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Aki Frontend Notes",
  description: "记录 Vue / JavaScript / 前端工程化的学习过程与踩坑经验",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/akiLLMM' }
    ]
  }
})
