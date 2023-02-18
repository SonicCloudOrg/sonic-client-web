<script setup>
import { ref, onMounted } from 'vue';
import { QuestionFilled } from '@element-plus/icons';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';

const { t: $t } = useI18n();
const props = defineProps({
  label: String,
  place: String,
  index: Number,
  type: String,
  projectId: Number,
  step: Object,
  ignoreIterator: {
    type: Boolean,
    default: false,
  },
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
        if (name.value.length === 0 && !props.ignoreIterator) {
          if (props.type === 'normal') {
            if (props.step.platform === 1) {
              pageData.value.content.push({
                id: null,
                eleName: $t('element.currentIteration'),
                eleType: 'androidIterator',
                eleValue: '',
                moduleId: 0,
                projectId: props.projectId,
              });
            }
            if (props.step.platform === 2) {
              pageData.value.content.push({
                id: null,
                eleName: $t('element.currentIteration'),
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
              eleName: $t('element.currentIteration'),
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
        moduleList.value.push({ id: 0, name: $t('common.null') });
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
      <span style="font-size: 14px; color: #99a9bf; margin-right: 10px">{{
        $t('element.modelFilter')
      }}</span>
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
        <span style="font-size: 14px; color: #99a9bf; margin-right: 10px">{{
          $t('element.nameFilter')
        }}</span>
        <el-select
          v-model="step.elements[index]"
          filterable
          remote
          :remote-method="findByName"
          value-key="id"
          :placeholder="$t('element.namePlace')"
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
                {{ $t('element.whenList') }}
                <strong style="color: #409eff">{{
                  $t('element.iterationList')
                }}</strong>
                {{ $t('element.thenList') }}
                <strong style="color: #409eff">{{
                  $t('element.currentIteration')
                }}</strong
                >{{ $t('element.last') }}
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
