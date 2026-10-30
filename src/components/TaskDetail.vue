<script setup>
import { ref, computed } from 'vue';
import { state, project, canEdit, status, message, retract, displayName } from '../store.js';
const props=defineProps({task:Object});
const emit=defineEmits(['close','edit','delete','notify']);
const comment=ref('');const attachments=ref([]),fileError=ref(''),requestOpen=ref(false),reason=ref(''),newDate=ref('');
function files(e){fileError.value='';const selected=[...e.target.files];if(selected.length>5)return fileError.value='最多选择5个附件';attachments.value=selected.map(f=>({name:f.name,size:f.size}));}
function sendRequest(){if(!reason.value.trim()||!newDate.value||newDate.value<=props.task.end)return fileError.value='请填写原因，并选择晚于当前截止日期的新日期';props.task.extension={reason:reason.value,date:newDate.value,status:'待处理',from:state.user};message(props.task.id,'申请延期至 '+newDate.value+'：'+reason.value);requestOpen.value=false;emit('notify','延期申请已发送');}
function decide(accept){const r=props.task.extension;if(!canEdit(props.task)||r.status!=='待处理')return;if(accept)props.task.end=r.date;r.status=accept?'已同意':'已拒绝';message(props.task.id,'延期申请'+r.status);emit('notify','延期申请'+r.status);}
const comments=computed(()=>state.messages.filter(m=>m.task===props.task.id));
function send(){if(!comment.value.trim()&&!attachments.value.length)return;message(props.task.id,comment.value.trim()||'发送了附件');state.messages[0].attachments=attachments.value;attachments.value=[];comment.value='';emit('notify','留言已发送')}
</script>
<template>
  <div class="overlay" @click.self="emit('close')"><section class="drawer">
    <div class="between"><span class="eyebrow">TASK DETAILS</span><button class="close" @click="emit('close')">×</button></div>
    <h2>{{ task.name }}</h2><p class="muted">{{ project(task.project)?.name }}</p>
    <div class="detail-meta"><span>负责人</span><b>{{ task.people.join('、') }}</b><span>计划时间</span><b>{{ task.start }} — {{ task.end }}</b><span>分配日期</span><b>{{ task.assigned }}</b><span>当前状态</span><b>{{ status(task) }} · {{ task.priority }}</b></div>
    <div class="support-box"><button class="secondary" @click="task.help=!task.help;emit('notify',task.help?'已标记需要帮助':'求助标记已解除')">{{ task.help?'✓ 解除求助':'⚑ 遇到困难，需要帮助' }}</button><p v-if="task.help" class="red">此任务需要帮助，请在留言中说明困难。管理员可在任务列表看到标记。</p><button class="text" @click="requestOpen=!requestOpen">申请延期</button><form v-if="requestOpen" @submit.prevent="sendRequest"><label>建议截止日期<input v-model="newDate" type="date" required></label><textarea v-model="reason" placeholder="说明延期原因" required></textarea><button class="primary">发送申请</button></form><div v-if="task.extension"><p>延期申请：{{ task.extension.date }} · {{ task.extension.status }}</p><p class="muted">{{ task.extension.reason }}</p><template v-if="canEdit(task)&&task.extension.status==='待处理'"><button class="primary" @click="decide(true)">同意延期</button><button class="secondary" @click="decide(false)">拒绝</button></template></div></div><label v-if="canEdit(task)">重要程度 <select v-model="task.priority" @change="emit('notify','重要程度已更新')"><option>普通</option><option>重要</option><option>紧急</option></select></label><h3>任务进度 <span class="accent">{{ task.progress }}%</span></h3><input v-model.number="task.progress" class="range" type="range" min="0" max="100" step="5" aria-label="任务进度" @change="emit('notify','进度已保存，各页面已同步')">
    <div class="between muted"><small>待开始</small><small>已完成</small></div><h3>任务备注</h3><textarea v-model="task.note" aria-label="任务备注" @change="emit('notify','备注已保存')"></textarea>
    <div v-if="canEdit(task)" class="actions"><button class="secondary" @click="emit('edit',task)">编辑任务</button><button class="text red" @click="emit('delete',task)">删除任务</button></div>
    <h3>协作留言</h3><div v-for="m in comments" :key="m.id" class="comment"><b>{{ displayName(m.from) }}</b><small>{{ m.time }}</small><p>{{ m.text }}</p><div v-for="(a,i) in m.attachments||[]" :key="i" class="attachment">📎 {{ a.name }} · {{ Math.ceil(a.size/1024) }} KB</div><button v-if="m.from===state.user&&!m.retracted" class="text" @click="retract(m)">撤回</button></div>
    <form @submit.prevent="send"><textarea v-model="comment" maxlength="500" placeholder="写下进展，或给伙伴一个回应…"></textarea><label class="file-label">📎 添加文件<input type="file" multiple @change="files"></label><small class="muted">原型展示附件名称和大小，不上传文件内容。</small><div v-for="(a,i) in attachments" :key="i" class="attachment">{{ a.name }}<button type="button" @click="attachments.splice(i,1)">移除</button></div><p class="red">{{ fileError }}</p><button class="primary">发送留言 ↗</button></form>
  </section></div>
</template>
