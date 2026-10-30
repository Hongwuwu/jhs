<script setup>
import { ref, computed } from 'vue';
import { state, reset, visible, canEdit } from './store.js';
import WorkspaceArea from './areas/WorkspaceArea.vue';
import ProjectsArea from './areas/ProjectsArea.vue';
import MessagesArea from './areas/MessagesArea.vue';
import TaskDetail from './components/TaskDetail.vue';
import PeopleArea from './areas/PeopleArea.vue';
import ProfileEditor from './components/ProfileEditor.vue';
import {profile,displayName} from './store.js';
import EditDialog from './components/EditDialog.vue';
// ref 保存会变化的页面状态。JS 中使用 .value，template 中直接使用变量名。
const profileOpen=ref(false);const deleted=ref(null);let undoTimer;
function undo(){if(!deleted.value)return;state.tasks.push(deleted.value.task);state.messages.push(...deleted.value.messages);deleted.value=null;clearTimeout(undoTimer);notify('任务已恢复')}
const page=ref('workspace');
const projects=computed(()=>state.projects.filter(p=>p.owner===state.user||p.members.includes(state.user)));
const selected=ref(projects.value[0]?.id);
const detail=ref(null);
const editor=ref(null);
const toast=ref('');let timer;
const titles={workspace:'工作台',projects:'项目空间',messages:'消息中心',people:'好友与邀请'};
const unread=computed(()=>state.messages.some(m=>m.to.includes(state.user)&&!m.read));
function notify(text){toast.value=text;clearTimeout(timer);timer=setTimeout(()=>toast.value='',2600)}
function selectProject(id){selected.value=id;page.value='projects'}
function switchUser(){selected.value=projects.value[0]?.id;detail.value=null;editor.value=null;profileOpen.value=false}
function openEditor(kind,item=null){if(kind==='task'&&item)selected.value=item.project;editor.value={kind,item}}
function save(draft){const kind=editor.value.kind;if(kind==='project'){if(draft.id)Object.assign(state.projects.find(p=>p.id===draft.id),draft);else{draft.id=Date.now();draft.owner=state.user;state.projects.push(draft);selectProject(draft.id)}}else{if(draft.id)Object.assign(state.tasks.find(t=>t.id===draft.id),draft);else state.tasks.push({...draft,id:Date.now(),project:selected.value,assigned:new Date().toLocaleDateString('sv-SE')})}editor.value=null;notify('已保存，相关页面已同步更新')}
function remove(task){if(canEdit(task)&&window.confirm('确定删除「'+task.name+'」及关联留言？')){deleted.value={task:JSON.parse(JSON.stringify(task)),messages:state.messages.filter(m=>m.task===task.id).map(m=>JSON.parse(JSON.stringify(m)))};clearTimeout(undoTimer);undoTimer=setTimeout(()=>deleted.value=null,10000);state.tasks=state.tasks.filter(t=>t.id!==task.id);state.messages=state.messages.filter(m=>m.task!==task.id);detail.value=null;notify('任务已删除')}}
function deleteProject(p){if(p.owner!==state.user)return;const tasks=state.tasks.filter(t=>t.project===p.id);if(!window.confirm('确定删除项目「'+p.name+'」？将同时删除 '+tasks.length+' 个任务、关联留言和项目邀请。此操作无法撤销。'))return;const ids=new Set(tasks.map(t=>t.id));state.projects=state.projects.filter(x=>x.id!==p.id);state.tasks=state.tasks.filter(t=>!ids.has(t.id));state.messages=state.messages.filter(m=>!ids.has(m.task));state.invites=state.invites.filter(i=>i.project!==p.id);if(detail.value&&ids.has(detail.value.id))detail.value=null;deleted.value=null;selected.value=projects.value[0]?.id;notify('项目及关联数据已删除')}
function nudge(p){if(p.owner!==state.user)return;const now=Date.now();if(p.lastNudge&&now-p.lastNudge<60000)return notify('刚刚已催促，请一分钟后再试');const pending=state.tasks.filter(t=>t.project===p.id&&t.progress<100);const recipients=[...new Set(pending.flatMap(t=>t.people))].filter(u=>u!==state.user);if(!recipients.length)return notify('没有需要催促的成员');for(const [index,u] of recipients.entries()){const tasks=pending.filter(t=>t.people.includes(u));state.messages.unshift({id:now+index,task:tasks[0].id,from:state.user,to:[u],text:'项目「'+p.name+'」进度提醒：你还有 '+tasks.length+' 项任务未完成，请及时更新进度；有困难可求助或申请延期。',time:new Date().toLocaleString('zh-CN'),read:false,kind:'reminder'});}p.lastNudge=now;notify('已向 '+recipients.length+' 位成员发送提醒')}
function resetDemo(){if(window.confirm('重置全部演示数据？')){reset();switchUser();page.value='workspace';notify('演示数据已重置')}}
</script>

<template>
  <!-- 全局布局由你负责；三个 area 是团队成员各自负责的组件。 -->
  <aside>
    <a class="brand" @click="page='workspace'">◈ <b>同频</b><small>TOGETHER</small></a>
    <p class="nav-label">协作空间</p>
    <button v-for="(title,key) in titles" :key="key" :class="['nav',{active:page===key}]" @click="page=key">{{ {workspace:'◫',projects:'▦',messages:'◉',people:'♧'}[key] }} <span>{{ title }}</span><i v-if="key==='messages'&&unread" class="dot"></i></button>
    <div class="side-bottom"><div class="demo">交互原型 · 本地演示</div><p>每一次协作，都有回响。</p><button class="text" @click="resetDemo">↺ 重置演示数据</button></div>
  </aside>
  <div class="shell">
    <header><span>协作空间 / {{ titles[page] }}</span><div class="identity"><span class="muted">演示身份</span><select v-model="state.user" aria-label="切换演示身份" @change="switchUser"><option v-for="u in state.users" :key="u">{{ u }}</option></select><button class="avatar" aria-label="编辑个人资料" @click="profileOpen=true"><img v-if="profile().avatar" :src="profile().avatar"><template v-else>{{ displayName(state.user)[0] }}</template></button><button class="text" @click="profileOpen=true">{{ displayName(state.user) }}</button></div></header>
    <main>
      <div class="heading"><div><p class="eyebrow">YOUR TEAM, IN SYNC</p><h1>{{ {workspace:'让协作，向前一步。',projects:'把想法，一起完成。',messages:'不错过每一次回应。',people:'和伙伴一起，向前一步。'}[page] }}</h1><p class="muted">{{ page==='workspace'?state.user+'，欢迎回来。这里是你和团队的最新进展。':page==='projects'?'从目标到行动，让每个任务都有清晰的方向。':'任务动态与伙伴留言，都汇集在这里。' }}</p></div><button v-if="page!=='messages'" class="primary" @click="openEditor('project')">＋ 创建项目</button></div>
      <WorkspaceArea v-if="page==='workspace'" :key="state.user" @select="selectProject" @all-projects="page='projects'" @open-task="detail=$event" />
      <ProjectsArea v-else-if="page==='projects'" :key="state.user" :selected="selected" @select="selectProject" @delete-project="deleteProject" @nudge="nudge" @edit="openEditor('project',$event)" @create-task="openEditor('task')" @open-task="detail=$event" />
      <PeopleArea v-else-if="page==='people'" @notify="notify" /><MessagesArea v-else @open-task="detail=$event" />
      <footer>同频 TOGETHER · 让每一份努力，都朝着同一个方向。</footer>
    </main>
  </div>
  <TaskDetail v-if="detail&&visible(detail)" :key="detail.id" :task="detail" @close="detail=null" @edit="openEditor('task',$event)" @delete="remove" @notify="notify" />
  <EditDialog v-if="editor" :kind="editor.kind" :item="editor.item" :project-id="selected" @close="editor=null" @saved="save" />
  <ProfileEditor v-if="profileOpen" :key="state.user" @close="profileOpen=false" @notify="notify" /><div v-if="deleted" class="undo-bar">任务已删除（10 秒内可恢复）<button @click="undo">撤销</button></div><div v-if="toast" class="toast" role="status">✓ {{ toast }}</div>
</template>
