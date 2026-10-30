<script setup>
import { computed } from 'vue';
import { state, progress, status } from '../store.js';
import TaskTable from '../components/TaskTable.vue';
const emit = defineEmits(['select','all-projects','open-task']);
const projects = computed(() => state.projects.filter(p=>p.owner===state.user||p.members.includes(state.user)));
const stats = computed(() => {const ts=state.tasks.filter(t=>t.people.includes(state.user));return [ts.filter(t=>t.progress<100).length,ts.filter(t=>status(t)==='已逾期').length,ts.filter(t=>t.progress===100).length,projects.value.length]});
</script>
<template>
  <div class="stats"><div v-for="(v,i) in stats" :key="i" class="stat"><span>{{ ['待完成任务','需要关注','已经完成','参与项目'][i] }}</span><strong>{{ String(v).padStart(2,'0') }}</strong><small>{{ ['按节奏推进你的计划','逾期任务，及时沟通','每一步都值得被记录','与伙伴们共同前进'][i] }}</small></div></div>
  <div class="section-title"><h2>正在协作</h2><button class="text" @click="emit('all-projects')">查看全部 ↗</button></div>
  <div class="project-grid"><article v-for="p in projects" :key="p.id" class="project-card" @click="emit('select',p.id)"><div class="card-top"><span class="project-icon">▦</span><span class="badge">{{ p.owner===state.user?'我管理的':'我参与的' }}</span></div><h3>{{ p.name }}</h3><p class="muted">{{ p.description }}</p><div class="between"><small>整体进度</small><b>{{ progress(p) }}%</b></div><div class="track"><div :style="{width:progress(p)+'%'}"></div></div><div class="card-footer"><span>{{ p.members.map(n=>n[0]).join(' · ') }}</span><small>{{ p.end }} 截止 ↗</small></div></article></div>
  <div class="section-title"><h2>我的任务</h2><span class="muted">专注当下，稳步推进</span></div>
  <TaskTable mine @open="emit('open-task',$event)" />
</template>
