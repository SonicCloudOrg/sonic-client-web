<script setup>
import {ref} from "vue";

const props = defineProps({
  projectId: Number,
  platform: Number
})
const testCase = ref({
  id: null,
  name: "",
  platform: props.platform,
  projectId: props.projectId,
  module: "",
  version: "",
  des: ""
})
</script>
<template>
  <el-form
      label-position="left"
      class="demo-table-expand"
      label-width="90px"
      ref="caseForm"
      :model="testCase"
      size="small"
  >
    <el-form-item
        prop="name"
        label="用例名称"
        :rules="{
            required: true,
            message: '请填写用例名称',
            trigger: 'blur',
          }"
    >
      <el-input v-model="testCase.name" size="mini" placeholder="输入用例名称"/>
    </el-form-item>
  </el-form>
</template>