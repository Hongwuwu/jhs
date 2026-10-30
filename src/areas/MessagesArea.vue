<script setup>
import { computed, ref } from 'vue';
import { state, visible, retract, displayName, respond, project } from '../store.js';
const emit = defineEmits(['open-task']);
const tab=ref('收件箱');
const invitations=computed(()=>state.invites.filter(i=>tab.value==='收件箱'?i.to===state.user:i.from===state.user));
const unreadInvites=computed(()=>state.invites.filter(i=>i.to===state.user&&!i.read).length);
function readAll(){inbox.value.forEach(m=>m.read=true);state.invites.filter(i=>i.to===state.user).forEach(i=>i.read=true)}
function answer(i,accept){respond(i,accept);i.read=true}

const sent=computed(()=>state.messages.filter(m=>m.from===state.user));
const shown=computed(()=>tab.value==='收件箱'?inbox.value:sent.value);
const inbox=computed(()=>state.messages.filter(m=>m.to.includes(state.user)));
function open(m){m.read=true;const task=state.tasks.find(t=>t.id===m.task);if(task&&visible(task))emit('open-task',task)}
</script>
<template>
  <section class="messages"><div class="tabs"><button v-for="t in ['收件箱','我发出的']" :key="t" :class="{chosen:tab===t}" @click="tab=t">{{ t }}</button></div><div class="section-title"><h2>收件箱 <span>{{ inbox.filter(m=>!m.read).length + unreadInvites }} 条未读</span></h2><button class="text" @click="readAll">全部标为已读</button></div>
    <h3 v-if="invitations.length">好友申请与项目邀请</h3>
    <article v-for="i in invitations" :key="'invite-'+i.id" :class="['message','invitation-card',{unread:tab==='收件箱'&&!i.read}]" @click="i.to===state.user&&(i.read=true)">
      <span class="avatar">✉</span><div><b>{{ displayName(i.from) }} <span class="muted">{{ i.project?'发来项目邀请':'发来好友申请' }}</span></b><p><span class="badge">{{ i.project?'项目邀请':'好友申请' }}</span> {{ i.project?'邀请 '+displayName(i.to)+' 加入「'+(project(i.project)?.name||'已删除项目')+'」':'申请与 '+displayName(i.to)+' 成为好友' }}</p><span class="badge">{{ i.status }}</span></div>
      <template v-if="i.to===state.user&&i.status==='待处理'"><button class="primary" @click.stop="answer(i,true)">接受</button><button class="secondary" @click.stop="answer(i,false)">拒绝</button></template>
    </article>
    <h3 v-if="shown.length">任务消息</h3>
    <article v-for="m in shown" :key="m.id" :class="['message',{unread:!m.read}]" @click="open(m)"><span class="avatar">{{ m.from[0] }}</span><div><b>{{ displayName(m.from) }} <span class="muted">{{ m.kind==='reminder'?'发来进度提醒':'在任务中留言' }}</span></b><p>{{ m.text }}</p><div v-for="(a,i) in m.attachments||[]" :key="i" class="attachment">📎 {{ a.name }}</div><button v-if="m.from===state.user&&!m.retracted&&m.kind!=='reminder'" class="text" @click.stop="retract(m)">撤回留言</button><small>{{ state.tasks.find(t=>t.id===m.task)?.name }} · {{ m.time }}</small></div><span v-if="!m.read" class="dot"></span></article>
    <div v-if="!shown.length&&!invitations.length" class="empty">消息都处理好了，继续专注吧。</div>
  </section>
</template>
