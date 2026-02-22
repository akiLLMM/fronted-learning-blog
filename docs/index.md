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
      link: /projects/ai-knowledge-workbench/

---
<script setup>
function getPosts(modules) {
  return Object.entries(modules)
    .map(([filePath, module]) => {
      const frontmatter =
        module.__pageData?.frontmatter || {}

      return {
        title: frontmatter.title || "Untitled",
        description: frontmatter.description || "",
        date: frontmatter.date || "",
        link: filePath
          .replace("../", "/")
          .replace(".md", "")
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

// ✅ glob 必须写死
const projects = getPosts(
  import.meta.glob("./notes/projects/ai-knowledge-workbench/**/*.md", { eager: true })
)

const engineering = getPosts(
  import.meta.glob("./notes/engineering/**/*.md", { eager: true })
)

const tooling = getPosts(
  import.meta.glob("./notes/tooling/**/*.md", { eager: true })
)

const archive = getPosts(
  import.meta.glob("./notes/archive/**/*.md", { eager: true })
)
</script>

<style>
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

<div class="section">
  <div class="section-title">🚀 Projects</div>
  <div class="card-grid">
    <a v-for="item in projects" :key="item.link" :href="item.link" class="card">
      <div class="card-title">{{ item.title }}</div>
      <div class="card-desc">{{ item.description }}</div>
      <div class="card-date">{{ item.date }}</div>
    </a>
  </div>
</div>

<div class="section">
  <div class="section-title">🧠 Engineering Thinking</div>
  <div class="card-grid">
    <a v-for="item in engineering" :key="item.link" :href="item.link" class="card">
      <div class="card-title">{{ item.title }}</div>
      <div class="card-desc">{{ item.description }}</div>
    </a>
  </div>
</div>

<div class="section">
  <div class="section-title">🛠 Tooling & Workflow</div>
  <div class="card-grid">
    <a v-for="item in tooling" :key="item.link" :href="item.link" class="card">
      <div class="card-title">{{ item.title }}</div>
      <div class="card-desc">{{ item.description }}</div>
    </a>
  </div>
</div>

<div class="section">
  <div class="section-title">📦 Archive</div>
  <div class="card-grid">
    <a v-for="item in archive" :key="item.link" :href="item.link" class="card">
      <div class="card-title">{{ item.title }}</div>
      <div class="card-desc">{{ item.description }}</div>
    </a>
  </div>
</div>
