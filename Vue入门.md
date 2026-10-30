# 就着同频学 Vue

## 1. 先看入口
index.html 的 #app 是空容器。main.js 导入 App.vue，再用 createApp(App).mount('#app') 显示它。
App.vue 是根组件，它组合了侧栏、页头、三个业务区域和公共弹窗。

## 2. .vue 文件还是你认识的 HTML
打开 src/components/TaskTable.vue：script setup 写 JavaScript，template 写页面结构。
它比普通 HTML 多了 Vue 指令，这些指令让数据和界面保持同步。
全局 CSS 从 main.js 导入；也可以在组件里加 style scoped，把样式限制在本组件。

## 3. ref：会变化的值
TaskTable 中 const search = ref('') 表示搜索词可以变化。
JS 读取或修改时用 search.value；template 中直接写 search。
App.vue 的 page、selected、detail、editor 也是 ref。

## 4. 插值、属性、事件、输入
{{ t.name }}：把任务名称显示在文本位置。
:class="{ chosen: filter === f }"：根据条件决定 class。冒号是 v-bind 简写。
@click="filter = f"：点击修改筛选条件。@ 是 v-on 简写。
v-model="search"：输入框与 search 双向绑定，输入会改变量，变量变化也更新输入框。
v-model.number="task.progress"：把输入转换为数字。

## 5. 条件和循环
v-if="!tasks.length"：没有任务才显示空状态。v-if 会创建/移除对应内容。
v-for="t in tasks"：每个任务生成一行。:key="t.id" 给每一行稳定身份，便于 Vue 正确更新。

## 6. computed：从已有数据计算结果
TaskTable 的 tasks 根据搜索词、筛选条件、当前用户和项目计算。
search 或 state.tasks 一变，computed 会重新计算，列表自动更新。
不需要 querySelector，也不需要手动调用 render。
computed 应用于计算结果，避免在计算里修改别的状态。

## 7. 组件之间如何交流
ProjectsArea 把 selected 通过 :project-id 传给 TaskTable。
TaskTable 用 defineProps 接收，这是父组件给子组件的数据。
点击任务时 emit('open', t)，父组件通过 @open 接收，再继续通知 App 打开详情。
一般遵循：父组件传数据，子组件发事件；不要直接给 props 本身重新赋值。
本项目 TaskDetail 直接修改共享 task 对象的字段，是小型原型的简化方式；正式项目可改成 emit 更新事件或统一 store 操作。

## 8. reactive 与 watch
store.js 的 reactive 包装整个共享对象。它适合项目、任务等一组关联数据。
不同组件 import 同一个 state，因此进度变化会同时影响任务表和工作台。
watch(state, persist, { deep: true }) 监听嵌套字段变化并保存到浏览器。
保存是副作用，用 watch；筛选和统计是计算结果，用 computed。

## 建议练习顺序
1. 修改 App.vue 的欢迎语，观察保存后预览自动变化。
2. 修改 style.css 的主按钮颜色，理解 Vue 和 CSS 的关系。
3. 在 TaskTable 新增一个“重要任务”筛选条件，修改按钮数组和 computed。
4. 在 WorkspaceArea 增加“完成率”统计，先算数据，再写 template。
5. 最后尝试把 TaskDetail 中留言部分拆成独立组件，练习 props 和 emit。

不要一开始逐行读 store 的示例数据。先读 main.js、App.vue 布局，再读 TaskTable，最后看共享状态。
