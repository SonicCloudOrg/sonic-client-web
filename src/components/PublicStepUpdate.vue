<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import { Delete, Edit, Plus } from '@element-plus/icons';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import StepShow from './StepShow.vue';
import StepUpdate from './StepUpdate.vue';
import StepDraggable from './StepDraggable.vue';
import Pageable from './Pageable.vue';

const { t: $t } = useI18n();
const router = useRouter();
const route = useRoute();

const props = defineProps({
  projectId: Number,
  publicStepId: Number,
});
const img = import.meta.globEager('./../assets/img/*');
const publicStep = ref({
  id: null,
  projectId: props.projectId,
  platform: 1,
  name: '',
  steps: [],
});
// 公共步骤信息页面搜索文案
const searchText = ref('');
const updatePub = ref(null);
const parentId = ref(0);
const pageData = ref({});
const pageSize = ref(10);
const pageCurrNum = ref(1);
const dialogVisible = ref(false);
const stepId = ref(0);
const tabValue = ref('select');
const platformList = [
  { name: 'Android', value: 1, img: 'ANDROID' },
  { name: 'iOS', value: 2, img: 'IOS' },
];
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu';
  }
  if (name === 'LENOVO') {
    name = 'Lenovo';
  }
  try {
    result = img[`./../assets/img/${name}.jpg`].default;
  } catch {
    result = img['./../assets/img/unName.jpg'].default;
  }
  return result;
};
const getStepList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/steps/list', {
      params: {
        projectId: props.projectId,
        platform: publicStep.value.platform,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};

// 搜索步骤列表
const searchListOfSteps = (pageNum, pSize) => {
  if (searchText.value.length === 0) {
    getStepList(pageNum, pSize);
  } else {
    pageSize.value = pSize || pageSize.value;
    pageCurrNum.value = pageNum || pageCurrNum.value;
    axios
      .get('/controller/steps/search/list', {
        params: {
          projectId: props.projectId,
          platform: publicStep.value.platform,
          page: pageCurrNum.value,
          pageSize: pageSize.value,
          searchContent: searchText.value,
        },
      })
      .then((resp) => {
        pageData.value = resp.data;
      });
  }
};
const deleteStep = (id) => {
  axios
    .delete('/controller/steps', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getStepList();
      }
    });
};
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    stepId.value = 0;
    parentId.value = 0;
  }
});
const setParent = (id) => {
  parentId.value = id;
};
const editStep = async (id) => {
  stepId.value = id;
  await addStep();
};
const addStep = () => {
  dialogVisible.value = true;
};
let isAddOrRemoved = false;
const flush = async () => {
  if (isAddOrRemoved) {
    await axios
      .put('/controller/publicSteps', publicStep.value)
      .then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: $t('pubSteps.auto'),
          });
        }
      });
    isAddOrRemoved = false;
  }
  dialogVisible.value = false;
  if (publicStep.value.id !== 0 && publicStep.value.id !== null) {
    await getPublicStepInfo(publicStep.value.id);
  }
  getStepList();
};
const addToPublic = (e) => {
  publicStep.value.steps.push(e);
  isAddOrRemoved = true;
  ElMessage.success({
    message: $t('pubSteps.selectPass'),
  });
};
const removeFromPublic = (e) => {
  publicStep.value.steps.splice(e, 1);
  isAddOrRemoved = true;
  ElMessage.success({
    message: $t('pubSteps.removePass'),
  });
};
const emit = defineEmits(['flush']);
const summit = () => {
  updatePub.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/publicSteps', publicStep.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          if (publicStep.value.id === null || publicStep.value.id === 0) {
            getPublicStepInfo(resp.data.id);
            emit('flush', false);
          } else {
            emit('flush', true);
          }
        }
      });
    }
  });
};
const getPublicStepInfo = (id) => {
  axios.get('/controller/publicSteps', { params: { id } }).then((resp) => {
    if (resp.code === 2000) {
      publicStep.value = resp.data;
      getStepList();
    }
  });
};
onMounted(() => {
  if (props.publicStepId !== 0) {
    getPublicStepInfo(props.publicStepId);
  } else {
    getStepList();
  }
});
const jump = (id) => {
  let routeData;
  routeData = router.resolve({
    path: `/Home/${route.params.projectId}/StepListView/${id}`,
  });
  window.open(routeData.href, '_blank');
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('pubSteps.stepInfo')"
    width="600px"
  >
    <step-update
      v-if="dialogVisible"
      :step-id="stepId"
      :case-id="0"
      :project-id="projectId"
      :parent-id="parentId"
      :platform="publicStep.platform"
      @flush="flush"
    ></step-update>
  </el-dialog>
  <el-form
    ref="updatePub"
    :model="publicStep"
    size="small"
    class="demo-table-expand"
    label-width="110px"
    label-position="left"
  >
    <el-form-item
      prop="name"
      :label="$t('pubSteps.name')"
      :rules="{
        required: true,
        message: $t('pubSteps.nameMsg'),
        trigger: 'blur',
      }"
    >
      <el-input
        v-model="publicStep.name"
        :placeholder="$t('pubSteps.namePlace')"
      ></el-input>
    </el-form-item>
    <el-form-item
      prop="platform"
      :label="$t('pubSteps.platform')"
      :rules="{
        required: true,
        message: $t('pubSteps.platformPlace'),
        trigger: 'change',
      }"
    >
      <el-select
        v-model="publicStep.platform"
        style="width: 100%"
        :placeholder="$t('pubSteps.platformPlace')"
        :disabled="publicStep.steps.length > 0"
        @change="getStepList()"
      >
        <el-option
          v-for="item in platformList"
          :key="item.name"
          :value="item.value"
          :label="item.name"
          :disabled="item['disabled']"
        >
          <div
            style="display: flex; align-items: center; justify-content: center"
          >
            <el-avatar
              style="margin-right: 10px"
              :size="32"
              :src="getImg(item.img)"
              shape="square"
            ></el-avatar>
            {{ item.name }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
  <el-card v-if="publicStep.id === 0 || publicStep.id === null">
    <el-result icon="info" :title="$t('pubSteps.stepTip')"> </el-result>
  </el-card>
  <el-tabs v-else v-model="tabValue" type="border-card" stretch>
    <el-tab-pane :label="$t('pubSteps.selected')" name="select">
      <step-draggable
        :is-edit="true"
        :steps="publicStep.steps"
        @setParent="setParent"
        @addStep="addStep"
        @flush="flush"
        @editStep="editStep"
        @remove="removeFromPublic"
        @deleteStep="deleteStep"
      />
    </el-tab-pane>
    <el-tab-pane :label="$t('pubSteps.list')" name="list">
      <el-alert
        style="margin-bottom: 10px"
        show-icon
        :title="$t('pubSteps.listTip')"
        type="info"
        close-text="Get!"
      />
      <el-button size="mini" round type="primary" @click="addStep">{{
        $t('pubSteps.addStep')
      }}</el-button>
      <el-input
        v-model="searchText"
        style="width: 200px; margin-left: 5px"
        type="text"
        :placeholder="$t('pubSteps.searchPlace')"
        size="mini"
        @keyup.enter="searchListOfSteps()"
      ></el-input>
      <el-button
        style="margin-left: 5px"
        type="primary"
        size="mini"
        @click="searchListOfSteps()"
        >{{ $t('pubSteps.search') }}</el-button
      >
      <el-table :data="pageData['content']" border style="margin-top: 10px">
        <el-table-column
          width="80"
          label="id"
          prop="id"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column width="90" :label="$t('pubSteps.case')" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.caseId === 0" size="mini">{{
              $t('common.null')
            }}</el-tag>
            <span v-else>{{ scope.row.caseId }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('pubSteps.stepInfo')" header-align="center">
          <template #default="scope">
            <step-show :step="scope.row" />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.operate')"
          width="140"
          align="center"
        >
          <template #default="scope">
            <el-button circle size="mini" @click="addToPublic(scope.row)">
              <el-icon :size="13" style="vertical-align: middle">
                <Plus />
              </el-icon>
            </el-button>
            <el-button
              circle
              type="primary"
              size="mini"
              @click="editStep(scope.row.id)"
            >
              <el-icon :size="13" style="vertical-align: middle">
                <Edit />
              </el-icon>
            </el-button>
            <el-popconfirm
              v-if="scope.row.caseId === 0"
              style="margin-left: 10px"
              :confirm-button-text="$t('form.confirm')"
              :cancel-button-text="$t('form.cancel')"
              icon="el-icon-warning"
              icon-color="red"
              :title="$t('pubSteps.deleteCaseTip')"
              @confirm="deleteStep(scope.row.id)"
            >
              <template #reference>
                <el-button circle type="danger" size="mini">
                  <el-icon :size="13" style="vertical-align: middle">
                    <Delete />
                  </el-icon>
                </el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm
              v-else
              style="margin-left: 10px"
              :confirm-button-text="$t('pubSteps.goToCase')"
              :cancel-button-text="$t('form.cancel')"
              icon="el-icon-warning"
              icon-color="red"
              :title="$t('pubSteps.goToCaseTip')"
              @confirm="jump(scope.row.caseId)"
            >
              <template #reference>
                <el-button circle type="warning" size="mini">
                  <el-icon :size="13" style="vertical-align: middle">
                    <Delete />
                  </el-icon>
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <pageable
        :is-page-set="false"
        :total="pageData['totalElements']"
        :current-page="pageData['number'] + 1"
        :page-size="pageData['size']"
        @change="searchListOfSteps"
      ></pageable>
    </el-tab-pane>
  </el-tabs>
  <div style="text-align: center; margin-top: 20px">
    <el-button size="small" type="primary" @click="summit">{{
      $t('form.save')
    }}</el-button>
  </div>
</template>
