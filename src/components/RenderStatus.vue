<script setup>
import axios from '@/http/axios';
import { ElMessage } from 'element-plus';

const statusList = {
  ONLINE: {
    type: 'success',
  },
  OFFLINE: {
    type: 'info',
  },
  DISCONNECTED: {
    type: 'info',
  },
  DEBUGGING: {},
  TESTING: {},
  UNAUTHORIZED: {
    type: 'danger',
  },
  ERROR: {
    type: 'warning',
  },
};
const props = defineProps({
  status: String,
  user: String,
  udId: {
    default: '',
    type: String,
    required: false,
  },
});
const selObj = statusList[props.status] || { type: 'danger' };
const stopDebug = () => {
  axios
    .get('/controller/devices/stopDebug', { params: { udId: props.udId } })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
      }
    });
};
</script>

<template>
  <el-popconfirm
    v-if="udId.length > 0 && status === 'DEBUGGING'"
    title="确定强制解除该设备占用状态吗？"
    icon-color="#F56C6C"
    @confirm="stopDebug"
  >
    <template #reference>
      <el-tag
        :type="selObj.type"
        size="mini"
        style="float: right; cursor: pointer"
      >
        {{ user + ' ' + $t('devices.status.' + status) }}
      </el-tag>
    </template>
  </el-popconfirm>
  <el-tag v-else :type="selObj.type" size="mini" style="float: right">
    {{ $t('devices.status.' + status) }}
  </el-tag>
</template>
