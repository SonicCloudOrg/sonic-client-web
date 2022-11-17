<script setup>
/*
 *   sonic-client-web  Front end of Sonic cloud real machine platform.
 *   Copyright (C) 2022 SonicCloudOrg
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import CodeEditor from './CodeEditor.vue';
import axios from '../http/axios';

const props = defineProps({
  projectId: Number,
  id: Number,
});
const emit = defineEmits(['flush']);

const script = ref({
  id: null,
  name: '',
  projectId: props.projectId,
  scriptLanguage: 'Groovy',
  content:
    'println androidDriver.getSessionId()\n' +
    'println iDevice.getSerialNumber()\n' +
    'println globalParams.toJSONString()\n' +
    'logUtil.sendStepLog(1,"My Steps","My Detail")\n' +
    '\n' +
    'def test(){\n' +
    '      println "Hello world"\n' +
    '}\n' +
    '\n' +
    'test()\n',
});
const scriptForm = ref(null);
const summit = () => {
  scriptForm.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/scripts', script.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          emit('flush');
        }
      });
    }
  });
};
const getInfo = (id) => {
  axios.get('/controller/scripts', { params: { id } }).then((resp) => {
    if (resp.code === 2000) {
      script.value = resp.data;
    }
  });
};
onMounted(() => {
  if (props.id !== 0) {
    getInfo(props.id);
  }
});
</script>

<template>
  <el-form
    ref="scriptForm"
    label-position="left"
    class="demo-table-expand"
    label-width="90px"
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
      <el-input v-model="script.name" size="mini" placeholder="输入模板名称" />
    </el-form-item>

    <div style="margin: 4px 0">
      <CodeEditor
        v-model:code="script.content"
        v-model:language="script.scriptLanguage"
        :show-footer="true"
        :project-id="projectId"
        :show-tool-bar="true"
        height="auto"
        @save="summit"
      ></CodeEditor>
    </div>
  </el-form>
</template>
