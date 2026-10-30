<script setup>
import { ref, computed } from 'vue';
import { state, project, canEdit, status, message } from '../store.js';
const props=defineProps({task:Object});
const emit=defineEmits(['close','edit','delete','notify']);
const comment=ref('');
const comments=computed(()=>state.messages.filter(m=>m.task===props.task.id));
function send(){if(!comment.value.trim())return;message(props.task.id,comment.value.trim());comment.value='';emit('notify','留言已发送')}
</script>
<template>
  <div class="overlay" @click.self="emit('close')"><section class="drawer">
    <div class="between"><span class="eyebrow">TASK DETAILS</span><button class="close" @click="emit('close')">×</button></div>
    <h2>{{ task.name }}</h2><p class="muted">{{ project(task.project)?.name }}</p>
    <div class="detail-meta"><span>负责人</span><b>{{ task.people.join('、') }}</b><span>计划时间</span><b>{{ task.start }} — {{ task.end }}</b><span>分配日期</span><b>{{ task.assigned }}</b><span>当前状态</span><b>{{ status(task) }} · {{ task.priority }}</b></div>
    <h3>任务进度 <span class="accent">{{ task.progress }}%</span></h3><input v-model.number="task.progress" class="range" type="range" min="0" max="100" step="5" aria-label="任务进度" @change="emit('notify','进度已保存，各页面已同步')">
    <div class="between muted"><small>待开始</small><small>已完成</small></div><h3>任务备注</h3><textarea v-model="task.note" aria-label="任务备注" @change="emit('notify','备注已保存')"></textarea>
    <div v-if="canEdit(task)" class="actions"><button class="secondary" @click="emit('edit',task)">编辑任务</button><button class="text red" @click="emit('delete',task)">删除任务</button></div>
    <h3>协作留言</h3><div v-for="m in comments" :key="m.id" class="comment"><b>{{ m.from }}</b><small>{{ m.time }}</small><p>{{ m.text }}</p></div>
    <form @submit.prevent="send"><textarea v-model="comment" required maxlength="500" placeholder="写下进展，或给伙伴一个回应…"></textarea><button class="primary">发送留言 ↗</button></form>
  </section></div>
</template>
