<script setup>
/*
 *  Copyright (C) [SonicCloudOrg] Sonic Project
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
import {onMounted, ref} from "vue";
import CodeEditor from './CodeEditor.vue'
import axios from "../http/axios";
import {ElMessage} from "element-plus";

const props = defineProps({
  projectId: Number,
  id: Number
})
const emit = defineEmits(['flush']);

const script = ref({
  id: null,
  name: "",
  projectId: props.projectId,
  scriptLanguage: "Groovy",
  content: 'println androidDriver.getSessionId()\n' +
      'println iDevice.getSerialNumber()\n' +
      'println globalParams.toJSONString()\n' +
      'logUtil.sendStepLog(1,"My Steps","My Detail")\n' +
      '\n' +
      'def test(){\n' +
      '      println "Hello world"\n' +
      '}\n' +
      '\n' +
      'test()\n',
})
const scriptForm = ref(null);
const summit = () => {
  scriptForm['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/scripts", script.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit("flush");
        }
      })
    }
  })
}
const getInfo = (id) => {
  axios.get("/controller/scripts", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      script.value = resp.data
    }
  })
}
onMounted(() => {
  if (props.id !== 0) {
    getInfo(props.id)
  }
})
</script>

<template>
  <el-form
      label-position="left"
      class="demo-table-expand"
      label-width="90px"
      ref="scriptForm"
      :model="script"
      size="small"
  >
    <el-form-item
        prop="name"
        label="模板名称"
        :rules="{
            required: true,
            message: '请填写模板名称',
            trigger: 'blur',
          }"
    >
      <el-input v-model="script.name" size="mini" placeholder="输入模板名称"/>
    </el-form-item>

    <div style="margin: 4px 0;">
      <CodeEditor v-model:code="script.content" v-model:language="script.scriptLanguage" :show-footer="true"
                  :project-id="projectId"
                  :show-tool-bar="true"
                  height="auto" @save="summit"></CodeEditor>
    </div>
  </el-form>

</template>