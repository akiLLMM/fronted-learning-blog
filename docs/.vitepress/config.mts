import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Aki Frontend Notes",
  description: "记录 Vue / JavaScript / 前端工程化的学习过程与踩坑经验",
   base: "/frontend-learning-blog/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
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
