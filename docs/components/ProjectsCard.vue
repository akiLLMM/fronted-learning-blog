<script setup>
import { withBase } from "vitepress"

function formatDate(dateStr) {
  if (!dateStr) return ""

  const date = new Date(dateStr)

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
}

function getPosts(modules) {
  return Object.entries(modules)
      .map(([filePath, module]) => {

        const frontmatter =
            module.default?.__pageData?.frontmatter ||
            module.__pageData?.frontmatter ||
            {}

        return {
          title: frontmatter.title || "Untitled",
          description: frontmatter.description || "",
          date: frontmatter.date || "",
          link: filePath
              .replace("../notes", "/notes")
              .replace(".md", "")
        }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
}

const projects = getPosts(
    import.meta.glob("../notes/projects/ai-knowledge-workbench/**/*.md", { eager: true })
)

const engineering = getPosts(
    import.meta.glob("../notes/engineering/**/*.md", { eager: true })
)

const tooling = getPosts(
    import.meta.glob("../notes/tooling/**/*.md", { eager: true })
)

const archive = getPosts(
    import.meta.glob("../notes/archive/**/*.md", { eager: true })
)

const sections = [
  { title: "🚀 Projects", list: projects, showDate: true },
  { title: "🧠 Engineering Thinking", list: engineering },
  { title: "🛠 Tooling & Workflow", list: tooling },
  { title: "📦 Archive", list: archive }
]
</script>

<template>
  <div
      v-for="section in sections"
      :key="section.title"
      class="section"
  >
    <div class="section-title">
      {{ section.title }}
    </div>

    <div class="card-grid">
      <a
          v-for="item in section.list"
          :key="item.link"
          :href="withBase(item.link)"
          class="card"
      >
        <div class="card-title">{{ item.title }}</div>
        <div class="card-desc">{{ item.description }}</div>
        <div v-if="item.date" class="card-date">
          {{ formatDate(item.date) }}
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.section {
  margin-top: 60px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
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

.card-date {
  font-size: 12px;
  opacity: 0.4;
  margin-top: 8px;
}
</style>
