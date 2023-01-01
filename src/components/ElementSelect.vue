<script setup>
import { ref, onMounted } from 'vue';
import { QuestionFilled } from '@element-plus/icons';
import axios from '../http/axios';

const props = defineProps({
  label: String,
  place: String,
  index: Number,
  type: String,
  projectId: Number,
  step: Object,
});
const pageData = ref({
  content: [],
});
const moduleId = ref(0);
const name = ref('');
const pageSize = ref(10);
const currentPage = ref(0);
const findByName = (n) => {
  props.step.elements[props.index] = null;
  name.value = n;
  findByProjectIdAndEleType(true);
};
const findByProjectIdAndEleType = (event, pageNum, pSize) => {
  if (event) {
    props.step.elements[props.index] = null;
    axios
      .get('/controller/elements/list', {
        params: {
          name: name.value,
          projectId: props.projectId,
          moduleIds: [moduleId.value],
          type: props.type,
          page: pageNum || 1,
          pageSize: pSize || pageSize.value,
        },
      })
      .then((resp) => {
        pageData.value = resp.data;
        if (name.value.length === 0) {
          if (props.type === 'normal') {
            if (props.step.platform === 1) {
              pageData.value.content.push({
                id: null,
                eleName: '当前迭代控件',
                eleType: 'androidIterator',
                eleValue: '',
                moduleId: 0,
                projectId: props.projectId,
              });
            }
            if (props.step.platform === 2) {
              pageData.value.content.push({
                id: null,
                eleName: '当前迭代控件',
                eleType: 'iOSIterator',
                eleValue: '',
                moduleId: 0,
                projectId: props.projectId,
              });
            }
          }
          if (props.type === 'poco') {
            pageData.value.content.push({
              id: null,
              eleName: '当前迭代控件',
              eleType: 'pocoIterator',
              eleValue: '',
              moduleId: 0,
              projectId: props.projectId,
            });
          }
        }
        currentPage.value = pageData.value.number + 1;
      });
  }
};
const moduleList = ref([]);
const getModuleList = () => {
  axios
    .get('/controller/modules/list', { params: { projectId: props.projectId } })
    .then((resp) => {
      if (resp.code === 2000) {
        moduleList.value = resp.data;
        moduleList.value.push({ id: 0, name: '无' });
        if (props.step.elements[props.index] != null) {
          moduleId.value = props.step.elements[props.index].moduleId;
        }
      }
    });
};
const findByModule = (n) => {
  props.step.elements[props.index] = null;
  findByProjectIdAndEleType(true);
};
onMounted(() => {
  if (props.step.elements[props.index]) {
    pageData.value.content.push(props.step.elements[props.index]);
  }
  if (props.type === 'normal') {
    if (props.step.platform === 1) {
      pageData.value.content.push({
        id: null,
        eleName: '当前迭代控件',
        eleType: 'androidIterator',
        eleValue: '',
        moduleId: 0,
        projectId: props.projectId,
      });
    }
    if (props.step.platform === 2) {
      pageData.value.content.push({
        id: null,
        eleName: '当前迭代控件',
        eleType: 'iOSIterator',
        eleValue: '',
        moduleId: 0,
        projectId: props.projectId,
      });
    }
  }
  if (props.type === 'poco') {
    pageData.value.content.push({
      id: null,
      eleName: '当前迭代控件',
      eleType: 'pocoIterator',
      eleValue: '',
      moduleId: 0,
      projectId: props.projectId,
    });
  }
  getModuleList();
});
</script>

<template>
  <el-form-item
    :label="label"
    :rules="[{ required: true, message: place, trigger: 'change' }]"
    :prop="'elements[' + index + ']'"
  >
    <el-card>
      <span style="font-size: 14px; color: #99a9bf; margin-right: 10px"
        >模块筛选</span
      >
      <el-select v-model="moduleId" size="small" @change="findByModule">
        <el-option
          v-for="item in moduleList"
          :key="item.name"
          :value="item.id"
          :label="item.name"
        >
        </el-option>
      </el-select>

      <div style="margin-top: 10px">
        <span style="font-size: 14px; color: #99a9bf; margin-right: 10px"
          >名称筛选</span
        >
        <el-select
          v-model="step.elements[index]"
          filterable
          remote
          :remote-method="findByName"
          value-key="id"
          placeholder="请输入控件名称筛选"
          @visible-change="findByProjectIdAndEleType"
        >
          <el-option
            v-for="item in pageData['content']"
            v-if="pageData['content'] !== null"
            :key="item.id"
            :label="item['eleName']"
            :value="item"
          >
            <span>{{ item['eleName'] }}</span>
            <el-popover
              v-if="
                item.eleType === 'androidIterator' ||
                item.eleType === 'pocoIterator' ||
                item.eleType === 'iOSIterator'
              "
              placement="right"
              :width="300"
              trigger="hover"
            >
              <p>
                当父级步骤存在
                <strong style="color: #409eff">迭代控件</strong>
                时，可选择本控件作为
                <strong style="color: #409eff">当前迭代控件</strong> 进行操作
              </p>
              <template #reference>
                <el-icon
                  :size="15"
                  style="vertical-align: middle; margin-left: 5px"
                >
                  <QuestionFilled />
                </el-icon>
              </template>
            </el-popover>
          </el-option>
          <div style="text-align: center; margin-top: 5px">
            <el-pagination
              v-model:current-page="currentPage"
              small
              layout="prev, pager, next"
              hide-on-single-page
              :total="pageData['totalElements']"
              :page-size="pageSize"
              @current-change="findByProjectIdAndEleType(true, $event)"
            >
            </el-pagination>
          </div>
        </el-select>
      </div>
    </el-card>
  </el-form-item>
</template>
