<template>
  <el-tag :type="selObj.type" size="mini" style="float: right">
    {{ selObj.text }}
  </el-tag>
</template>
<script setup>
import {defineProps} from "vue";

const statusList = {
  ONLINE: {
    type: 'success',
    text: '空闲中'
  },
  OFFLINE: {
    type: 'info',
    text: '已离线'
  },
  DISCONNECTED: {
    type: 'info',
    text: '已断开'
  },
  DEBUGGING: {
    text: '占用中'
  },
  TESTING: {
    text: '测试中'
  },
  UNAUTHORIZED: {
    type: 'danger',
    text: '未授权'
  },
  ERROR: {
    type: 'warning',
    text: '异常中'
  },
}
const props = defineProps(
    {
      status: String,
    }
);
const selObj = statusList[props.status] || {type: 'danger', text: '加载中'}
</script>