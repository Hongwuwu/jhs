<script setup>
import { computed } from 'vue';
import { state, visible } from '../store.js';
const emit = defineEmits(['open-task']);
const inbox=computed(()=>state.messages.filter(m=>m.to.includes(state.user)));
function open(m){m.read=true;const task=state.tasks.find(t=>t.id===m.task);if(task&&visible(task))emit('open-task',task)}
</script>
<template>
  <section class="messages"><div class="section-title"><h2>收件箱 <span>{{ inbox.filter(m=>!m.read).length }} 条未读</span></h2><button class="text" @click="inbox.forEach(m=>m.read=true)">全部标为已读</button></div>
    <article v-for="m in inbox" :key="m.id" :class="['message',{unread:!m.read}]" @click="open(m)"><span class="avatar">{{ m.from[0] }}</span><div><b>{{ m.from }} <span class="muted">在任务中留言</span></b><p>{{ m.text }}</p><small>{{ state.tasks.find(t=>t.id===m.task)?.name }} · {{ m.time }}</small></div><span v-if="!m.read" class="dot"></span></article>
    <div v-if="!inbox.length" class="empty">消息都处理好了，继续专注吧。</div>
  </section>
</template>
