---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Aki
  text: Frontend Engineer · AI Builder
  tagline: Vue3 · TypeScript · RAG · Engineering Practice
  actions:
    - theme: brand
      text: View Main Project
      link: notes/projects/ai-knowledge-workbench/
    - theme: alt
      text: Live Demo
      link: https://akillmm.github.io/kbench/

---

<script setup>
import ProjectsCard from "./components/ProjectsCard.vue"
</script>

<ClientOnly>
    <ProjectsCard />
</ClientOnly>
