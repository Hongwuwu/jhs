<script setup>
import { computed, ref } from 'vue';
import { state, project, progress } from '../store.js';
import TaskTable from '../components/TaskTable.vue';
const props = defineProps({ selected: Number });
const emit = defineEmits(['select','edit','create-task','open-task']);
const sort=ref('name'),descending=ref(false);
const sorted=computed(()=>[...projects.value].sort((a,b)=>(descending.value?-1:1)*(sort.value==='name'?a.name.localeCompare(b.name,'zh-CN'):a.end.localeCompare(b.end))));
const projects = computed(() => state.projects.filter(p => p.owner === state.user || p.members.includes(state.user)));
const active = computed(() => project(props.selected));
</script>
<template>
  <div class="toolbar"><label>项目排序 <select v-model="sort"><option value="name">名称（拼音）</option><option value="end">截止时间</option></select></label><button @click="descending=!descending">{{ descending?'倒序 ↓':'正序 ↑' }}</button></div><div class="tabs"><button v-for="p in sorted" :key="p.id" :class="{chosen:selected===p.id}" @click="emit('select',p.id)">{{ p.name }}</button></div>
  <section v-if="active" class="project-summary">
    <div><span class="badge">{{ active.owner===state.user?'项目管理员':'项目参与者' }}</span><h2>{{ active.name }}</h2><p class="muted">{{ active.description }}</p><small>{{ active.start }} — {{ active.end }} · 管理员 {{ active.owner }}</small><p class="members">成员：{{ active.members.join('、') }}</p></div>
    <div><strong>{{ progress(active) }}<small>%</small></strong><p class="muted">项目整体进度</p><button v-if="active.owner===state.user" class="secondary" @click="emit('edit',active)">编辑项目与成员</button></div>
  </section>
  <p v-else class="empty">还没有项目，创建一个吧。</p>
  <TaskTable :key="selected" :project-id="selected" @open="emit('open-task',$event)" @create="emit('create-task')" />
</template>
