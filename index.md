---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Aki
  text: Frontend Engineer · AI Builder
  tagline: Vue3 · TypeScript · RAG · Engineering Practice
  actions:
    - theme: brand
      text: 🚀 View Main Project
      link: /Projects/ai-knowledge-workbench/

---

<script setup>
const sections = [
  {
    title: "🚀 Projects",
    description: "Engineering-driven frontend systems and AI applications.",
    items: [
      {
        name: "AI Knowledge Workbench",
        desc: "Vue3 + RAG + MCP modular AI workspace",
        link: "/projects/ai-knowledge-workbench/"
      }
    ]
  },
  {
    title: "🧠 Engineering Thinking",
    description: "Architectural decisions and system-level abstractions.",
    items: [
      {
        name: "State Management Design",
        desc: "Layered state & composable architecture",
        link: "/engineering/state-management/"
      },
      {
        name: "Login Security Strategy",
        desc: "Cookie, SameSite, CSRF analysis",
        link: "/engineering/login-security/"
      }
    ]
  },
  {
    title: "🛠 Tooling & Workflow",
    description: "Engineering efficiency & workflow optimization.",
    items: [
      {
        name: "Git Branch Strategy",
        desc: "Feature branch & merge flow",
        link: "/engineering/git-workflow/"
      },
      {
        name: "Deployment Strategy",
        desc: "GitHub Pages vs Vercel",
        link: "/tooling/deploy-comparison/"
      }
    ]
  },
  {
    title: "📦 Archive",
    description: "Learning notes & early explorations.",
    items: [
      {
        name: "TodoList Demo",
        desc: "Component responsibility practice",
        link: "/archive/todolist/"
      }
    ]
  }
]
</script>

<style>
.section {
  margin-top: 60px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.section-desc {
  opacity: 0.6;
  margin-bottom: 24px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.25s ease;
  text-decoration: none;
  color: inherit;
}

.card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-4px);
}

.card-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.card-desc {
  font-size: 14px;
  opacity: 0.6;
}
</style>

<div v-for="section in sections" :key="section.title" class="section">
  <div class="section-title">{{ section.title }}</div>
  <div class="section-desc">{{ section.description }}</div>

  <div class="card-grid">
    <a
      v-for="item in section.items"
      :key="item.name"
      :href="item.link"
      class="card"
    >
      <div class="card-title">{{ item.name }}</div>
      <div class="card-desc">{{ item.desc }}</div>
    </a>
  </div>
</div>

<footer style="margin-top: 80px; opacity: 0.5; font-size: 14px;">
Building systems. Refining structure. Thinking in layers.
</footer>
