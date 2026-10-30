import { reactive, watch } from 'vue';
const initial=()=>({user:'林晓',users:['林晓','陈宇','许言','周宁'],projects:[{id:1,name:'校园导览交互设计',description:'让第一次来到校园的人，也能轻松找到方向。',owner:'林晓',members:['林晓','陈宇','许言','周宁'],start:'2026-10-26',end:'2026-11-08'},{id:2,name:'读书分享会',description:'一起整理观点，让灵感被看见。',owner:'陈宇',members:['林晓','陈宇'],start:'2026-10-28',end:'2026-11-12'}],tasks:[{id:11,project:1,name:'完成用户访谈与需求整理',people:['林晓','陈宇'],assigned:'2026-10-26',start:'2026-10-26',end:'2026-10-29',priority:'重要',progress:100,note:'整理三类典型用户的导航需求。'},{id:12,project:1,name:'绘制核心流程与页面草图',people:['许言','林晓'],assigned:'2026-10-27',start:'2026-10-28',end:'2026-11-02',priority:'重要',progress:45,note:'覆盖搜索地点、路线规划与到达反馈。'},{id:13,project:1,name:'准备原型演示与可用性走查',people:['周宁'],assigned:'2026-10-28',start:'2026-10-30',end:'2026-11-06',priority:'普通',progress:10,note:'准备三个测试场景。'},{id:14,project:2,name:'整理本周分享提纲',people:['林晓'],assigned:'2026-10-28',start:'2026-10-28',end:'2026-10-29',priority:'普通',progress:20,note:'每人准备一个值得讨论的问题。'}],messages:[{id:1,task:12,from:'许言',to:['林晓'],text:'核心流程已经整理好，可以一起看看草图。',time:'2026/10/30 10:24',read:false}]});

let saved;try{saved=JSON.parse(localStorage.getItem('together-v1'))}catch{}
export const state=reactive(saved||initial());
watch(state, persist, { deep: true });
export function persist(){localStorage.setItem('together-v1',JSON.stringify(state))}
export function reset(){Object.assign(state,initial(),{profiles:{},friends:{},invites:[]});persist()}
export const project=id=>state.projects.find(p=>p.id===Number(id));
export const canEdit=t=>project(t.project)?.owner===state.user;
export const visible=t=>canEdit(t)||t.people.includes(state.user);
export const progress=p=>{const tasks=state.tasks.filter(t=>t.project===p.id);return tasks.length?Math.round(tasks.reduce((s,t)=>s+t.progress,0)/tasks.length):0};
export const status=t=>t.progress===100?'已完成':t.end<new Date().toLocaleDateString('sv-SE')?'已逾期':t.progress?'进行中':'待开始';
export function message(task,text){const t=state.tasks.find(t=>t.id===task);state.messages.unshift({id:Date.now(),task,from:state.user,to:[...new Set([project(t.project).owner,...t.people])].filter(x=>x!==state.user),text,time:new Date().toLocaleString('zh-CN'),read:false});persist()}
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// 扩展数据兼容旧的本地演示记录。
state.profiles ||= {}; state.friends ||= {}; state.invites ||= [];
export const profile=(u=state.user)=>state.profiles[u]||{nickname:u,avatar:'',bio:''};
export const displayName=u=>profile(u).nickname||u;
export const load=u=>state.tasks.filter(t=>t.people.includes(u)&&t.progress<100).length;
export function retract(m){if(m.from!==state.user||m.retracted)return;m.retracted=true;m.text='此留言已撤回';m.attachments=[]}
export function invite(to,projectId){if(to===state.user)return '不能邀请自己';if(state.invites.some(i=>i.to===to&&i.project===projectId&&i.status==='待处理'))return '已经发出邀请';state.invites.push({id:Date.now(),from:state.user,to,project:projectId,status:'待处理'});return '邀请已发送'}
export function respond(inv,accept){if(inv.to!==state.user||inv.status!=='待处理')return;inv.status=accept?'已接受':'已拒绝';if(accept){if(inv.project){const p=project(inv.project);if(p&&!p.members.includes(state.user))p.members.push(state.user)}else{state.friends[state.user]||=[];state.friends[inv.from]||=[];if(!state.friends[state.user].includes(inv.from))state.friends[state.user].push(inv.from);if(!state.friends[inv.from].includes(state.user))state.friends[inv.from].push(state.user)}}}
