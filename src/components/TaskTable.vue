<script setup>
import { ref, computed } from 'vue';
import { state, visible, status, project } from '../store.js';
// props 是父组件传进来的数据；emit 把用户操作交给父组件。
const props = defineProps({ projectId: Number, mine: Boolean });
const emit = defineEmits(['open', 'create']);
const search = ref('');
const filter = ref('全部');
const sort=ref('end'), descending=ref(false);
const sorted=computed(()=>[...tasks.value].sort((a,b)=>{let result=sort.value==='priority'?(['普通','重要','紧急'].indexOf(b.priority)-['普通','重要','紧急'].indexOf(a.priority)):sort.value==='project'?(project(a.project)?.name||'').localeCompare(project(b.project)?.name||'','zh-CN'):(a.end.localeCompare(b.end));return descending.value?-result:result}));
// computed 会在依赖变化后自动重新计算列表。
const tasks = computed(() => state.tasks.filter(visible)
  .filter(t => props.mine ? t.people.includes(state.user) : t.project === props.projectId)
  .filter(t => t.name.includes(search.value))
  .filter(t => filter.value === '全部' || status(t) === filter.value));
</script>

<template>
  <section class="table-panel">
    <div class="toolbar">
      <div class="filters"><button v-for="f in ['全部','进行中','待开始','已完成','已逾期']" :key="f" :class="{ chosen: filter === f }" @click="filter = f">{{ f }}</button></div>
      <div><select v-model="sort" aria-label="任务排序"><option value="end">截止时间</option><option value="priority">重要程度</option><option value="project">项目名称（拼音）</option></select><button @click="descending=!descending">{{ descending?'倒序 ↓':'正序 ↑' }}</button><input v-model="search" aria-label="搜索任务" placeholder="搜索任务…"><button v-if="!mine && project(projectId)?.owner === state.user" class="primary" @click="emit('create')">＋ 添加任务</button></div>
    </div>
    <table>
      <thead><tr><th>任务名称</th><th>负责人</th><th>截止日期</th><th>状态</th><th>进度</th><th></th></tr></thead>
      <tbody><tr v-for="t in sorted" :key="t.id" tabindex="0" @click="emit('open', t)" @keydown.enter="emit('open', t)">
        <td><span class="task-symbol">◇</span><b>{{ t.name }}</b><span v-if="t.help" class="badge danger">需要帮助</span><small v-if="t.priority === '重要'" class="important">重要</small><div class="task-project">{{ project(t.project)?.name }}</div></td>
        <td>{{ t.people.join('、') }}</td><td>{{ t.end }}</td><td><span :class="['badge', {danger: status(t)==='已逾期', success: status(t)==='已完成'}]">{{ status(t) }}</span></td>
        <td><div class="inline-progress"><div class="track"><div :style="{width:t.progress+'%'}"></div></div>{{ t.progress }}%</div></td><td>↗</td>
      </tr></tbody>
    </table>
    <div v-if="!tasks.length" class="empty">暂时没有任务<p>试试其他筛选条件，或创建一个新任务。</p><button class="text" @click="search=''; filter='全部'">清空筛选</button></div>
  </section>
</template>
