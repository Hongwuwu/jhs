<script setup>
import { ref, reactive, computed } from 'vue';
import { state, project, load } from '../store.js';
const props=defineProps({kind:String,item:Object,projectId:Number});
const emit=defineEmits(['close','saved']);
const draft=reactive(props.item?JSON.parse(JSON.stringify(props.item)):{name:'',description:'',note:'',start:new Date().toLocaleDateString('sv-SE'),end:'',members:[state.user],people:[],priority:'普通',progress:0});
const error=ref('');
const isProject=props.kind==='project';
const options=computed(()=>isProject?state.users:project(props.projectId)?.members||[]);
const people=computed({get:()=>isProject?draft.members:draft.people,set:v=>{if(isProject)draft.members=v;else draft.people=v}});
function cancel(){if(window.confirm('放弃本次编辑？'))emit('close')}
function save(){if(!draft.name.trim())return error.value='请填写名称';if(!draft.start||!draft.end||draft.end<draft.start)return error.value='请选择有效日期，截止日期不能早于开始日期';if(!isProject&&!draft.people.length)return error.value='请至少选择一位负责人';emit('saved',JSON.parse(JSON.stringify(draft)))}
</script>
<template>
  <div class="overlay centered" @click.self="cancel"><form class="dialog" novalidate @submit.prevent="save">
    <div class="between"><h2>{{ item?'编辑':'创建' }}{{ isProject?'项目':'任务' }}</h2><button type="button" class="close" @click="cancel">×</button></div>
    <label>名称 *<input v-model="draft.name" maxlength="60" placeholder="给它一个清晰的名字"></label>
    <label>说明<textarea v-if="isProject" v-model="draft.description"></textarea><textarea v-else v-model="draft.note"></textarea></label>
    <div class="dates"><label>开始日期 *<input v-model="draft.start" type="date"></label><label>截止日期 *<input v-model="draft.end" type="date"></label></div>
    <label>{{ isProject?'项目成员':'任务负责人 *' }}</label><div class="checks"><label v-for="u in options" :key="u"><input v-model="people" type="checkbox" :value="u" :disabled="isProject&&u===(item?.owner||state.user)">{{ u }}<small v-if="!isProject" class="muted">待办 {{ load(u) }} 项{{ load(u)>=3?' · 较忙':'' }}</small></label></div>
    <label v-if="!isProject">重要程度<select v-model="draft.priority"><option>普通</option><option>重要</option><option>紧急</option></select></label><p class="red" role="alert">{{ error }}</p>
    <div class="actions end"><button type="button" class="secondary" @click="cancel">取消</button><button class="primary">保存</button></div>
  </form></div>
</template>
