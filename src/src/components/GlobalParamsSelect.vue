<script setup>
import { ref } from 'vue';
import axios from '../http/axios';

const props = defineProps({
  label: String,
  place: String,
  projectId: Number,
  step: Object,
});
const pageData = ref([]);
const getGlobalParamsList = (event) => {
  if (event) {
    axios
      .get('/controller/globalParams/list', {
        params: {
          projectId: props.projectId,
        },
      })
      .then((resp) => {
        pageData.value = resp.data;
      });
  }
};
</script>

<template>
  <el-form-item
    :label="label"
    :rules="[{ required: true, message: place, trigger: 'change' }]"
  >
    <el-select
      v-model="step.content"
      filterable
      value-key="id"
      allow-create
      :placeholder="place"
      @visible-change="getGlobalParamsList"
    >
      <el-option
        v-for="item in pageData"
        v-if="pageData !== null"
        :key="item.id"
        :label="'{{' + item['paramsKey'] + '}}'"
        :value="'{{' + item['paramsKey'] + '}}'"
      >
      </el-option>
    </el-select>
  </el-form-item>
</template>
