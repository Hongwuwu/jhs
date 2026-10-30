<script setup>
import {reactive,ref} from 'vue';import {state,profile} from '../store.js';
const emit=defineEmits(['close','notify']);const draft=reactive({...profile()});const error=ref('');
function upload(e){const f=e.target.files[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>500*1024){error.value='请选择 500KB 以内的 PNG、JPEG 或 WebP 图片';return}const r=new FileReader();r.onload=()=>draft.avatar=r.result;r.readAsDataURL(f)}
function save(){if(!draft.nickname.trim())return error.value='昵称不能为空';state.profiles[state.user]={...draft,nickname:draft.nickname.trim()};emit('notify','个人资料已保存');emit('close')}
</script>
<template><div class="overlay centered" @click.self="emit('close')"><form class="dialog" @submit.prevent="save"><div class="between"><h2>编辑个人资料</h2><button type="button" class="close" @click="emit('close')">×</button></div><label>头像 <img v-if="draft.avatar" class="profile-preview" :src="draft.avatar"><input type="file" accept="image/png,image/jpeg,image/webp" @change="upload"></label><label>昵称<input v-model="draft.nickname" maxlength="20" required></label><label>个性签名<textarea v-model="draft.bio" maxlength="100"></textarea></label><p class="muted">账号身份不变，修改昵称不会影响任务归属。</p><p class="red">{{ error }}</p><button class="primary">保存资料</button></form></div></template>
