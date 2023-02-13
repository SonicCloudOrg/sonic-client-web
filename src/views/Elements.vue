<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import ElementUpdate from '../components/ElementUpdate.vue';
import axios from '../http/axios';
import Pageable from '../components/Pageable.vue';

const { t: $t } = useI18n();

const route = useRoute();
const dialogElement = ref(false);
const elementId = ref(0);
const deleteId = ref(0);
const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const name = ref('');
const value = ref('');
const types = ref([]);
const stepList = ref([]);
const checkDialog = ref(false);

watch(dialogElement, (newValue, oldValue) => {
  if (!newValue) {
    elementId.value = 0;
  }
});
watch(checkDialog, (newValue, oldValue) => {
  if (!newValue) {
    deleteId.value = 0;
    stepList.value = [];
  }
});
const editElement = async (id) => {
  elementId.value = id;
  await open();
};
const open = () => {
  dialogElement.value = true;
};
const flush = () => {
  dialogElement.value = false;
  getElementList();
};
const moduleIds = ref([]);
const getElementList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/elements/list', {
      params: {
        projectId: route.params.projectId,
        eleTypes: types.value.length > 0 ? types.value : undefined,
        moduleIds: moduleIds.value.length > 0 ? moduleIds.value : undefined,
        name: name.value,
        value: value.value,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};
const deleteEle = (id) => {
  axios
    .get('/controller/elements/deleteCheck', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        stepList.value = resp.data;
        if (stepList.value.length === 0) {
          deleteReal(id);
        } else {
          deleteId.value = id;
          checkDialog.value = true;
        }
      }
    });
};
// 复制元素，复制以后重新拉去列表
const copyElement = (id) => {
  axios
    .get('/controller/elements/copyEle', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getElementList();
      }
    });
};
const deleteReal = (id) => {
  axios
    .delete('/controller/elements', {
      params: {
        id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        checkDialog.value = false;
        getElementList();
      }
    });
};
const moduleList = ref([]);
const getModuleList = () => {
  axios
    .get('/controller/modules/list', {
      params: { projectId: route.params.projectId },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        resp.data.map((item) => {
          moduleList.value.push({ text: item.name, value: item.id });
        });
        moduleList.value.push({ text: '无', value: 0 });
      }
    });
};
const filter = (e) => {
  if (e.eleType) {
    types.value = e.eleType;
  }
  if (e.moduleId) {
    moduleIds.value = e.moduleId;
  }
  getElementList();
};
onMounted(() => {
  getElementList();
  getModuleList();
});
</script>

<template>
  <el-dialog
    v-model="dialogElement"
    :title="$t('elements.eleInfo')"
    width="600px"
  >
    <element-update
      v-if="dialogElement"
      :project-id="route.params.projectId"
      :element-id="elementId"
      @flush="flush"
    />
  </el-dialog>
  <el-dialog
    v-model="checkDialog"
    :title="$t('elements.stepInfo')"
    width="600px"
  >
    <el-alert
      :title="$t('elements.warn')"
      type="warning"
      show-icon
      :closable="false"
      :description="$t('elements.warnInfo')"
    />
    <el-table :data="stepList" border style="margin-top: 20px">
      <el-table-column
        prop="id"
        width="90"
        :label="$t('elements.stepList.stepId')"
        align="center"
      ></el-table-column>
      <el-table-column
        :label="$t('elements.stepList.useCaseId')"
        width="90"
        align="center"
      >
        <template #default="scope">
          <el-tag v-if="scope.row.caseId === 0" size="mini">{{
            $t('common.null')
          }}</el-tag>
          <span v-else>{{ scope.row.caseId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('elements.stepList.userCaseName')"
        header-align="center"
      >
        <template #default="scope">
          <span v-if="scope.row.caseId === 0">{{
            $t('elements.stepList.noCase')
          }}</span>
          <span v-else>{{ scope.row.testCasesDTO.name }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="text-align: center; margin-top: 20px">
      <el-button size="small" type="danger" @click="deleteReal(deleteId)">{{
        $t('elements.sureDelete')
      }}</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">{{
    $t('elements.addElement')
  }}</el-button>
  <el-table
    :data="pageData['content']"
    style="width: 100%; margin-top: 20px"
    border
    @filter-change="filter"
  >
    <el-table-column label="id" width="90" align="center" prop="id">
    </el-table-column>

    <el-table-column
      :show-overflow-tooltip="true"
      width="260"
      header-align="center"
      prop="eleName"
    >
      <template #header>
        <el-input
          v-model="name"
          size="mini"
          :placeholder="$t('elements.inputNameSearch')"
          @input="getElementList()"
        />
      </template>
    </el-table-column>

    <el-table-column
      width="120"
      :label="$t('elements.moduleName')"
      prop="moduleId"
      column-key="moduleId"
      align="center"
      :filters="moduleList"
    >
      <template #default="scope">
        <el-tag v-if="scope.row.modulesDTO !== null" size="small">{{
          scope.row.modulesDTO.name
        }}</el-tag>
        <span v-else>无</span>
      </template>
    </el-table-column>

    <el-table-column
      column-key="eleType"
      :label="$t('elements.targetingType')"
      width="130"
      align="center"
      :filters="[
        { text: 'id（resource-id）', value: 'id' },
        { text: 'xpath', value: 'xpath' },
        { text: 'accessibilityId', value: 'accessibilityId' },
        { text: 'classChain', value: 'classChain' },
        { text: 'POCO', value: 'poco' },
        { text: 'name', value: 'name' },
        { text: 'cssSelector', value: 'cssSelector' },
        { text: $t('elements.coordinate'), value: 'point' },
        { text: $t('elements.picture'), value: 'image' },
        { text: 'nsPredicate', value: 'nsPredicate' },
        { text: 'uiautomator', value: 'androidUIAutomator' },
        { text: 'linkText', value: 'linkText' },
        { text: 'className', value: 'className' },
        { text: 'tagName', value: 'tagName' },
        { text: 'partialLinkText', value: 'partialLinkText' },
        { text: 'cssSelectorAndText', value: 'cssSelectorAndText' },
      ]"
    >
      <template #default="scope">
        <span v-if="scope.row.eleType.length === 0">{{
          $t('elements.notSpecified')
        }}</span>
        <span v-else>
          <el-tag v-if="scope.row.eleType === 'image'" size="medium">{{
            $t('elements.picture')
          }}</el-tag>
          <el-tag v-else-if="scope.row.eleType === 'point'" size="medium">{{
            $t('elements.coordinate')
          }}</el-tag>
          <el-tag v-else size="medium">{{ scope.row.eleType }}</el-tag>
        </span>
      </template>
    </el-table-column>

    <el-table-column
      :show-overflow-tooltip="true"
      :label="$t('elements.cEleValue')"
      header-align="center"
    >
      <template #header>
        <el-input
          v-model="value"
          size="mini"
          :placeholder="$t('elements.inputKeySearch')"
          @input="getElementList()"
        />
      </template>
      <template #default="scope">
        <el-image
          v-if="scope.row.eleType === 'image'"
          :z-index="5000"
          fit="contain"
          style="width: 100px; height: 100%; margin-top: 10px"
          :src="scope.row.eleValue"
          :preview-src-list="[scope.row.eleValue]"
        ></el-image>
        <span v-else-if="scope.row.eleValue">{{ scope.row.eleValue }}</span>
        <span v-else>无</span>
      </template>
    </el-table-column>

    <el-table-column :label="$t('common.operate')" width="230" align="center">
      <template #default="scope">
        <el-button
          type="primary"
          size="mini"
          @click="copyElement(scope.row.id)"
        >
          {{ $t('common.copy') }}
        </el-button>
        <el-button type="primary" size="mini" @click="editElement(scope.row.id)"
          >{{ $t('common.edit') }}
        </el-button>
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('elements.sureDelInfo')"
          @confirm="deleteEle(scope.row.id)"
        >
          <template #reference>
            <el-button type="danger" size="mini"
              >{{ $t('common.delete') }}
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable
    :is-page-set="true"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getElementList"
  ></pageable>
</template>
