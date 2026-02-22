# 在 Vue3 项目里封装 axios：拦截器、统一错误处理与 request 方法

> 目标：把“发请求”从业务代码里抽离，让页面只关心“调用 API”，不关心 token、baseURL、错误提示、业务 code 判断等细节。

## 1. 为什么 Vue 文档里没有 axios？

Vue 只负责 **视图层（View）**：响应式、组件、渲染。
“怎么请求后端数据”属于工程选型：你可以用 `fetch`，也可以用 `axios`。在真实项目里，axios 常用原因是：

* 更成熟的工程能力：`baseURL`、超时、拦截器、统一 headers
* 更好维护：错误处理、鉴权逻辑集中化
* TS 体验更好：可统一封装 `request<T>`

---

## 2. 这份 axios.ts 的总体结构

你这份文件分成三块：

* **logout()**：遇到 Token 失效时统一退出 + 刷新
* **createInstance()**：创建 axios 实例并注册拦截器（请求 + 响应）
* **createRequest(instance)**：基于 instance 包一层 `request<T>()`，自动拼 `baseURL`、加 token、合并配置

最终导出一个可直接调用的：

```ts
export const request = createRequest(instance)
```

---

## 3. logout：统一“退出登录”的兜底动作

```ts
function logout() {
  useUserStore().logout()
  location.reload()
}
```

### 它的作用

* 调用 pinia 的 `userStore.logout()` 清理 token / roles / 路由等（你 store 里还有 resetRouter 等动作）
* `location.reload()` 强制刷新，触发路由守卫把人带回登录页（这是很多 Admin 模板的常见做法）

### 为什么要强制刷新？

因为 SPA 里很多状态（pinia、缓存路由、tagsView）可能已经处于“半登录态”。强刷是最简单可靠的“恢复干净状态”。

---

## 4. createInstance：创建 axios 实例 + 注册拦截器

```ts
function createInstance() {
  const instance = axios.create()

  instance.interceptors.request.use(
    config => config,
    error => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response) => { ... },
    (error) => { ... }
  )

  return instance
}
```

### 4.1 请求拦截器：目前基本是“占位”

```ts
instance.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)
```

这表示：请求发出前不做额外处理（因为你把 token/baseURL 放到 createRequest 里统一做了）。

> 后续如果你想加“loading 全局锁”、请求日志、traceId、重复请求取消等，都可以放这里。

---

## 5. 响应拦截器（成功分支）：统一解包 + 业务 code 处理

这是这份封装最关键的部分：

```ts
(response) => {
  const apiData = response.data
  const responseType = response.config.responseType

  if (responseType === "blob" || responseType === "arraybuffer") return apiData

  const code = apiData.code
  if (code === undefined) {
    ElMessage.error("非本系统的接口")
    return Promise.reject(new Error("非本系统的接口"))
  }

  switch (code) {
    case 0:
      return apiData
    case 401:
      return logout()
    default:
      ElMessage.error(apiData.message || "Error")
      return Promise.reject(new Error("Error"))
  }
}
```

### 5.1 为什么先处理二进制（blob/arraybuffer）？

如果是文件下载、图片、zip 等二进制，后端返回的不一定是 `{code, data}` 格式。
所以直接 `return apiData`，避免走业务 code 分支。

### 5.2 `apiData.code`：你们和后端约定的“业务状态码”

这里假设后端统一返回：

```json
{ "code": 0, "data": ..., "message": "..." }
```

* `code === 0`：业务成功，直接返回 `apiData`
* `code === 401`：业务层 token 失效，直接 `logout()`
* 其它 code：弹错并 reject

### 5.3 为什么要判断 `code === undefined`？

这段是在防御：如果你调用了一个**不是本系统**的接口（比如第三方接口返回结构不是 `{code,data}`），就直接报错，避免业务代码误把结构当成可用数据。

> 注意：这条规则很“强硬”。如果你未来确实要调用第三方接口，可能要：
>
> * 给它单独建一个 axios 实例
> * 或者在 request 配置里加一个 `skipBizCodeCheck` 类似的开关（更工程化）

---

## 6. 响应拦截器（失败分支）：统一 HTTP 状态码映射

```ts
(error) => {
  const status = get(error, "response.status")
  const message = get(error, "response.data.message")

  switch (status) {
    case 400: error.message = "请求错误"; break
    case 401: error.message = message || "未授权"; logout(); break
    case 403: error.message = message || "拒绝访问"; break
    case 404: error.message = "请求地址出错"; break
    case 408: error.message = "请求超时"; break
    case 500: error.message = "服务器内部错误"; break
    ...
  }

  ElMessage.error(error.message)
  return Promise.reject(error)
}
```

### 6.1 这里处理的是“HTTP 状态码”

和上面 `apiData.code` 不一样：

* HTTP 状态码：网络层（404/500/401 等）
* 业务 code：业务层（你们自定义的 0/401/xxx）

### 6.2 为什么用 `lodash.get`？

避免 `error.response` 为空时直接报错（例如断网、跨域失败、请求被拦截）。

---

## 7. createRequest：把默认配置集中在一起

```ts
function createRequest(instance: AxiosInstance) {
  return <T>(config: AxiosRequestConfig): Promise<T> => {
    const token = getToken()
    const defaultConfig: AxiosRequestConfig = {
      baseURL: import.meta.env.VITE_BASE_URL,
      headers: {
        "Authorization": token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json"
      },
      data: {},
      timeout: 5000,
      withCredentials: false
    }
    const mergeConfig = merge(defaultConfig, config)
    return instance(mergeConfig)
  }
}
```

### 7.1 baseURL 从 env 来：环境无关

你在 `.env.development` 里写：

```env
VITE_BASE_URL=/api/v1
```

这意味着你业务代码只需要写相对路径：

```ts
request({ url: "users/me", method: "get" })
```

axios 会自动拼成：

```
/api/v1/users/me
```

### 7.2 自动带 token

每次请求都会读 cookie 里的 token：

```ts
"Authorization": token ? `Bearer ${token}` : undefined
```

业务页面不需要重复写鉴权头。

### 7.3 `merge(defaultConfig, config)` 的意义

调用方只要传自己关心的部分：

```ts
request({ url: "users/me", method: "get" })
```

默认的：

* baseURL
* headers
* timeout
* withCredentials

都自动补齐。

> 小提醒：`lodash.merge` 是深合并，会把对象层层合并。
> 如果你在某次请求里想“完全替换 headers”，要注意 merge 的行为（可能会保留默认 header）。

---

## 8. 最终导出：业务只用 request

```ts
const instance = createInstance()
export const request = createRequest(instance)
```

你的 API 文件里这样用：

```ts
export function getCurrentUserApi() {
  return request<Users.CurrentUserResponseData>({
    url: "users/me",
    method: "get"
  })
}
```

业务页面再调用：

```ts
const { data } = await getCurrentUserApi()
// 这里的 data 是拦截器处理过的 apiData.data（取决于你返回结构）
```

---

## 9. 这份封装在项目里的“真实价值”

它让项目做到：

* 页面只关心：调用什么 API、用什么参数
* 登录态统一：token 注入、过期退出
* 错误统一：业务错误、网络错误统一提示
* 环境无关：dev/prod 只改 env，不改业务代码

这就是典型的“工程化请求层”。

---

## 10. 常见踩坑与你项目当前相关的点

### 10.1 baseURL 只对“相对路径”生效

如果你请求写成：

```ts
url: "/api/chat/stream"
```

那 axios 不会拼接 `baseURL`。
这也是你看到 `/api/knowledge/list` 不带 `/api/v1` 的原因（绝对路径）。

### 10.2 同时使用 MSW + proxy 时要统一前缀策略

建议你明确分层：

* `/api/v1/**`：走 proxy / Apifox（后端型）
* `/api/**`：走 MSW（前端行为型，如 stream、本地 db）

并且避免一个接口两边都 mock，防止 `from service worker` 的 404 这种“截胡冲突”。

---

## 结语

axios 不是 Vue 的一部分，但在实际工程里，axios + 拦截器 + request 封装几乎是后台项目的标配。
这份 `axios.ts` 把“鉴权、错误处理、业务 code 解包、环境切换”集中在一起，让业务代码更干净，也更符合真实项目的写法。

---
