<script setup>
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
}
const props = defineProps(
    {
      status: String,
      user: String
    }
);
const selObj = statusList[props.status] || {type: 'danger'}
</script>

<template>
  <el-tag :type="selObj.type" size="mini" style="float: right">
    {{ status === 'DEBUGGING' ? user + " " + $t('devices.status.' + status) : $t('devices.status.' + status) }}
  </el-tag>
</template>