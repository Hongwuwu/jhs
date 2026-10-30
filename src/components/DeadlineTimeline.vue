<script setup>
import {computed} from 'vue';
import {state,visible,status,project} from '../store.js';
const emit=defineEmits(['open']);
const tasks=computed(()=>state.tasks.filter(visible).filter(t=>t.progress<100).sort((a,b)=>a.end.localeCompare(b.end)));
</script>
<template><section class="timeline"><h2>DDL 时间轴 <span class="muted">未完成任务 · 按截止时间</span></h2><div v-for="t in tasks" :key="t.id" class="timeline-item" @click="emit('open',t)"><time>{{ t.end }}</time><span :class="['badge',{danger:status(t)==='已逾期'}]">{{ status(t) }}</span><b>{{ t.name }}</b><small class="muted">{{ project(t.project)?.name }} · {{ t.priority }}</small></div><p v-if="!tasks.length" class="muted">任务全部完成了。</p></section></template>
