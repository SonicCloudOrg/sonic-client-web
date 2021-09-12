<template>
  <el-tag :type="type" size="mini" style="float: right">
    {{ text }}
  </el-tag>
</template>
<script setup>
import {defineProps, onMounted, ref} from "vue";
const type = ref('')
const text = ref('')
const props = defineProps(
    {
      status: String,
    }
);
onMounted(() => {
  switch (props.status) {
    case 'ONLINE':
      type.value = 'success';
      text.value = '空闲中';
      break
    case 'OFFLINE':
      type.value = 'info';
      text.value = '已离线';
      break
    case "DISCONNECTED":
      type.value = 'info';
      text.value = '已断开';
      break
    case "DEBUGGING":
      text.value = '占用中';
      break
    case "TESTING":
      text.value = '测试中';
      break
    case "UNAUTHORIZED":
      type.value = 'danger';
      text.value = '未授权';
      break
    case "ERROR":
      type.value = 'warning';
      text.value = '异常中';
    default :
      type.value = 'warning';
      text.value = '加载中';
  }
})
</script>