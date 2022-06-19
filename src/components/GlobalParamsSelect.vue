<script setup>
import {ref} from "vue";
import axios from "../http/axios";

const props = defineProps({
  label: String,
  place: String,
  projectId: Number,
  step: Object,
})
const pageData = ref([]
);
const getGlobalParamsList = (event) => {
  if (event) {
    axios.get("/controller/globalParams/list", {
      params: {
        projectId: props.projectId,
      }
    }).then(resp => {
      pageData.value = resp.data
    })
  }
}
</script>
<template>
  <el-form-item
      :label="label"
      :rules="[
            { required: true, message: place, trigger: 'change' },
          ]">
    <el-select
        filterable
        value-key="id"
        v-model="step.content"
        allow-create
        :placeholder="place"
        placeholder="请输入变量名称筛选"
        @visible-change="getGlobalParamsList">
      <el-option
          v-if="pageData!==null"
          v-for="item in pageData"
          :key="item.id"
          :label="'{{' + item['paramsKey'] + '}}'"
          :value="'{{' + item['paramsKey'] + '}}'">
      </el-option>
    </el-select>
  </el-form-item>
</template>