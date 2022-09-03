<script setup>
import {ref, onMounted} from "vue";
import axios from "../http/axios";

const props = defineProps({
  label: String,
  place: String,
  index: Number,
  type: String,
  projectId: Number,
  step: Object,
})
const pageData = ref({
  content: []
});
const moduleId = ref(0)
const name = ref("")
const pageSize = ref(10);
const currentPage = ref(0)
const findByName = (n) => {
  props.step.elements[props.index] = null
  name.value = n
  findByProjectIdAndEleType(true)
}
const findByProjectIdAndEleType = (event, pageNum, pSize) => {
  if (event) {
    props.step.elements[props.index] = null
    axios.get("/controller/elements/list", {
      params: {
        name: name.value,
        projectId: props.projectId,
        moduleIds: [moduleId.value],
        type: props.type,
        page: pageNum || 1,
        pageSize: pSize || pageSize.value,
      }
    }).then(resp => {
      pageData.value = resp.data
      currentPage.value = pageData.value['number'] + 1
    })
  }
}
const moduleList = ref([])
const getModuleList = () => {
  axios.get("/controller/modules/list", {params: {projectId: props.projectId}}).then(resp => {
    if (resp['code'] === 2000) {
      moduleList.value = resp.data;
      moduleList.value.push({id: 0, name: '无'})
    }
  })
}
const findByModule = (n) => {
  props.step.elements[props.index] = null
  findByProjectIdAndEleType(true)
}
onMounted(() => {
  if (props.step.elements[props.index]) {
    pageData.value['content'].push(props.step.elements[props.index])
  }
  getModuleList()
})
</script>
<template>
  <el-form-item
      :label="label"
      :rules="[
            { required: true, message: place, trigger: 'change' },
          ]"
      :prop="'elements['+index+']'"
  >
    <el-card>
      <span style="font-size: 14px;color: #99a9bf;margin-right:10px">模块筛选</span>
      <el-select size="small" v-model="moduleId" @change="findByModule">
        <el-option
            v-for="item in moduleList"
            :key="item.name"
            :value="item.id"
            :label="item.name"
        >
        </el-option>
      </el-select>

      <div style="margin-top: 10px">
        <span style="font-size: 14px;color: #99a9bf;margin-right:10px">名称筛选</span>
        <el-select
            filterable
            remote
            :remote-method="findByName"
            value-key="id"
            v-model="step.elements[index]"
            placeholder="请输入控件名称筛选"
            @visible-change="findByProjectIdAndEleType"
        >
          <el-option
              v-if="pageData['content']!==null"
              v-for="item in pageData['content']"
              :key="item.id"
              :label="item['eleName']"
              :value="item"
          ></el-option>
          <div style="text-align:center;margin-top: 5px;">
            <el-pagination small layout="prev, pager, next"
                           hide-on-single-page
                           v-model:current-page="currentPage"
                           :total="pageData['totalElements']"
                           :page-size="pageSize"
                           @current-change="findByProjectIdAndEleType(true,$event)">
            </el-pagination>
          </div>
        </el-select>
      </div>
    </el-card>
  </el-form-item>
</template>