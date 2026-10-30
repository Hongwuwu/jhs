<script setup>
import { computed, ref } from 'vue';
import { state, visible, retract, displayName } from '../store.js';
const emit = defineEmits(['open-task']);
const tab=ref('收件箱');
const sent=computed(()=>state.messages.filter(m=>m.from===state.user));
const shown=computed(()=>tab.value==='收件箱'?inbox.value:sent.value);
const inbox=computed(()=>state.messages.filter(m=>m.to.includes(state.user)));
function open(m){m.read=true;const task=state.tasks.find(t=>t.id===m.task);if(task&&visible(task))emit('open-task',task)}
</script>
<template>
  <section class="messages"><div class="tabs"><button v-for="t in ['收件箱','我发出的']" :key="t" :class="{chosen:tab===t}" @click="tab=t">{{ t }}</button></div><div class="section-title"><h2>收件箱 <span>{{ inbox.filter(m=>!m.read).length }} 条未读</span></h2><button class="text" @click="inbox.forEach(m=>m.read=true)">全部标为已读</button></div>
    <article v-for="m in shown" :key="m.id" :class="['message',{unread:!m.read}]" @click="open(m)"><span class="avatar">{{ m.from[0] }}</span><div><b>{{ displayName(m.from) }} <span class="muted">在任务中留言</span></b><p>{{ m.text }}</p><div v-for="(a,i) in m.attachments||[]" :key="i" class="attachment">📎 {{ a.name }}</div><button v-if="m.from===state.user&&!m.retracted" class="text" @click.stop="retract(m)">撤回留言</button><small>{{ state.tasks.find(t=>t.id===m.task)?.name }} · {{ m.time }}</small></div><span v-if="!m.read" class="dot"></span></article>
    <div v-if="!shown.length" class="empty">消息都处理好了，继续专注吧。</div>
  </section>
</template>
