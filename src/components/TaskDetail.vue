<script setup>
import { ref, computed, watch } from 'vue';
import { state, project, canEdit, creator, status, message, retract, displayName } from '../store.js';
const props=defineProps({task:Object});
const emit=defineEmits(['close','edit','delete','notify']);
const comment=ref(''),attachments=ref([]),error=ref(''),requestOpen=ref(false),reason=ref(''),newDate=ref('');
// 动态属性也先暂存，由用户明确选择保留或放弃。
const progressDraft=ref(props.task.progress),helpDraft=ref(!!props.task.help);
const dirty=computed(()=>progressDraft.value!==props.task.progress||helpDraft.value!==!!props.task.help);
const participant=computed(()=>props.task.people.includes(state.user));
const comments=computed(()=>state.messages.filter(m=>m.task===props.task.id));
function discard(){progressDraft.value=props.task.progress;helpDraft.value=!!props.task.help}
watch(()=>[props.task.progress,props.task.help],discard);
function keep(){if(!participant.value)return;props.task.progress=progressDraft.value;props.task.help=helpDraft.value;emit('notify','已保留进度与求助状态')}
function close(){if((dirty.value||comment.value||attachments.value.length)&&!window.confirm('尚有未保留的编辑或未发送留言，确定放弃并关闭？'))return;emit('close')}
function files(e){error.value='';const list=[...e.target.files];if(list.length>5){e.target.value='';return error.value='最多选择5个附件'}attachments.value=list.map(f=>({name:f.name,size:f.size}))}
function send(){if(!comment.value.trim()&&!attachments.value.length)return;message(props.task.id,comment.value.trim()||'发送了附件');state.messages[0].attachments=attachments.value;attachments.value=[];comment.value='';emit('notify','留言已发送')}
function sendRequest(){error.value='';if(!participant.value||canEdit(props.task))return;if(props.task.extension?.status==='待处理')return error.value='已有待处理申请';if(!reason.value.trim()||!newDate.value||newDate.value<=props.task.end)return error.value='请填写原因，并选择晚于当前截止日期的新日期';props.task.extension={reason:reason.value,date:newDate.value,status:'待处理',from:state.user};message(props.task.id,'申请延期至 '+newDate.value+'：'+reason.value);requestOpen.value=false;emit('notify','延期申请已发给任务创建者')}
function decide(accept){const r=props.task.extension;if(!canEdit(props.task)||!r||r.status!=='待处理')return;if(accept)props.task.end=r.date;r.status=accept?'已同意':'已拒绝';message(props.task.id,'延期申请'+r.status);emit('notify','延期申请'+r.status)}
</script>
<template>
<div class="overlay" @click.self="close"><section class="drawer">
  <div class="between"><span class="eyebrow">TASK DETAILS</span><button class="close" @click="close">×</button></div>
  <h2>{{ task.name }}</h2><p class="muted">{{ project(task.project)?.name }}</p>
  <section class="task-static"><h3>任务信息</h3><p class="muted">相对固定的属性，仅任务创建者可修改。</p>
    <div class="detail-meta"><span>创建者</span><b>{{ displayName(creator(task)) }}</b><span>负责人</span><b>{{ task.people.map(displayName).join('、') }}</b><span>计划时间</span><b>{{ task.start }} — {{ task.end }}</b><span>分配日期</span><b>{{ task.assigned }}</b><span>重要程度</span><b>{{ task.priority }}</b><span>任务说明</span><b>{{ task.note||'暂无说明' }}</b></div>
    <div v-if="canEdit(task)" class="actions"><button class="secondary" @click="emit('edit',task)">编辑任务信息</button><button class="text red" @click="emit('delete',task)">删除任务</button></div>
  </section>
  <section class="task-dynamic"><h3>执行进展</h3><p class="muted">{{ status(task) }} · 负责人可更新进度和求助状态，0% 表示待开始。</p>
    <h3>任务进度 <span class="accent">{{ progressDraft }}%</span></h3><input v-model.number="progressDraft" :disabled="!participant" class="range" type="range" min="0" max="100" step="5" aria-label="任务进度">
    <div class="between muted"><small>0% · 待开始</small><small>100% · 已完成</small></div>
    <button v-if="participant" class="secondary" @click="helpDraft=!helpDraft">{{ helpDraft?'✓ 解除求助':'⚑ 遇到困难，需要帮助' }}</button><p v-if="helpDraft" class="red">需要帮助，请在协作区说明困难。</p>
    <div v-if="dirty" class="actions"><button class="primary" @click="keep">保留编辑</button><button class="secondary" @click="discard">放弃</button></div>
    <div class="support-box"><h3>延期协商</h3><button v-if="participant&&!canEdit(task)&&task.extension?.status!=='待处理'" class="text" @click="requestOpen=!requestOpen">申请延期</button><p v-else-if="canEdit(task)" class="muted">你是创建者，可审核成员的延期申请；直接调整日期请编辑任务信息。</p><p v-else-if="!participant" class="muted">只有任务负责人可以申请延期。</p>
      <form v-if="requestOpen&&participant&&!canEdit(task)" @submit.prevent="sendRequest"><label>建议截止日期<input v-model="newDate" type="date" required></label><textarea v-model="reason" placeholder="说明延期原因" required></textarea><button class="primary">发送申请</button></form>
      <div v-if="task.extension"><p>{{ displayName(task.extension.from) }} 申请延期至 {{ task.extension.date }} · {{ task.extension.status }}</p><p class="muted">{{ task.extension.reason }}</p><template v-if="canEdit(task)&&task.extension.status==='待处理'"><button class="primary" @click="decide(true)">同意延期</button><button class="secondary" @click="decide(false)">拒绝</button></template></div>
    </div>
    <section class="collaboration"><h2>协作</h2><h3>协作留言</h3>
      <div v-for="m in comments" :key="m.id" class="comment"><b>{{ displayName(m.from) }}</b><small>{{ m.time }}</small><p>{{ m.text }}</p><div v-for="(a,i) in m.attachments||[]" :key="i" class="attachment">📎 {{ a.name }} · {{ Math.ceil(a.size/1024) }} KB</div><button v-if="m.from===state.user&&!m.retracted" class="text" @click="retract(m)">撤回</button></div>
      <form @submit.prevent="send"><textarea v-model="comment" maxlength="500" placeholder="写下进展，或给伙伴一个回应…"></textarea><label class="file-label">📎 添加文件<input type="file" multiple @change="files"></label><small class="muted">原型展示附件名称和大小，不上传文件内容。</small><div v-for="(a,i) in attachments" :key="i" class="attachment">{{ a.name }}<button type="button" @click="attachments.splice(i,1)">移除</button></div><button class="primary">发送留言 ↗</button></form>
    </section><p class="red" role="alert">{{ error }}</p>
  </section>
</section></div>
</template>
