<script setup>
import {useRoute} from "vue-router";
import ElementUpdate from '../components/ElementUpdate.vue'
import {onMounted, ref, watch} from "vue";
import axios from "../http/axios";
import Pageable from '../components/Pageable.vue'
import {ElMessage} from "element-plus";

const route = useRoute()
const dialogElement = ref(false)
const elementId = ref(0)
const deleteId = ref(0)
const pageData = ref({});
const pageSize = ref(15);
const name = ref("")
const types = ref([])
const stepList = ref([])
const checkDialog = ref(false)

watch(dialogElement, (newValue, oldValue) => {
  if (!newValue) {
    elementId.value = 0
  }
})
watch(checkDialog, (newValue, oldValue) => {
  if (!newValue) {
    deleteId.value = 0;
    stepList.value = [];
  }
})
const editElement = async (id) => {
  elementId.value = id
  await open()
}
const open = () => {
  dialogElement.value = true
}
const flush = () => {
  dialogElement.value = false
  getElementList();
}
const getElementList = (pageNum, pSize) => {
  axios.get("/controller/elements/list", {
    params: {
      projectId: route.params.projectId,
      eleTypes: types.value.length > 0 ? types.value : undefined,
      name: name.value,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const deleteEle = (id) => {
  axios.get("/controller/elements/deleteCheck", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      stepList.value = resp['data'];
      if (stepList.value.length === 0) {
        deleteReal(id);
      } else {
        deleteId.value = id;
        checkDialog.value = true;
      }
    }
  })
}
//复制元素，复制以后重新拉去列表
const copyElement = (id) =>{
  axios.get("/controller/elements/copyEle", {
    params:{
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getElementList();
    }
  })
}
const deleteReal = (id) => {
  axios.delete("/controller/elements", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      checkDialog.value = false;
      getElementList();
    }
  })
}
const filter = (e) => {
  types.value = e.eleType
  getElementList()
}
onMounted(() => {
  getElementList();
})
</script>
<template>
  <el-dialog v-model="dialogElement" title="控件元素信息" width="600px">
    <element-update v-if="dialogElement" :project-id="route.params.projectId"
                    :element-id="elementId" @flush="flush"/>
  </el-dialog>
  <el-dialog v-model="checkDialog" title="步骤信息" width="600px">
    <el-alert title="警告！" type="warning" show-icon :closable="false" description="该控件已存在于以下步骤中，
    删除该控件将连同以下步骤一并删除！请前往对应步骤修改控件或确认对应步骤已废弃！"/>
    <el-table :data="stepList" border style="margin-top: 20px">
      <el-table-column prop="id" width="90" label="步骤Id" align="center"></el-table-column>
      <el-table-column label="所属用例Id" width="90" align="center">
        <template #default="scope">
          <el-tag size="mini" v-if="scope.row.caseId=== 0">无</el-tag>
          <span v-else>{{ scope.row.caseId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属用例名称" header-align="center">
        <template #default="scope">
          <span v-if="scope.row.caseId=== 0">无所属用例</span>
          <span v-else>{{ scope.row.testCasesDTO.name }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="text-align: center;margin-top: 20px">
      <el-button size="small" type="danger" @click="deleteReal(deleteId)">确认删除</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加控件元素</el-button>
  <el-table
      @filter-change="filter"
      :data="pageData['content']"
      style="width: 100%; margin-top: 20px"
      border
  >
    <el-table-column label="控件id" width="90" align="center" prop="id">
    </el-table-column>

    <el-table-column
        :show-overflow-tooltip="true"
        width="260"
        header-align="center"
        prop="eleName"
    >
      <template #header>
        <el-input v-model="name" size="mini" @input="getElementList()" placeholder="输入元素控件名称搜索"/>
      </template>
    </el-table-column>

    <el-table-column column-key="eleType" label="定位类型" width="130" align="center" :filters="[
        { text: 'id（resource-id）', value: 'id' },
        { text: 'xpath', value: 'xpath' },
        { text: 'name', value: 'name' },
        { text: 'cssSelector', value: 'cssSelector' },
        { text: '坐标', value: 'point' },
        { text: '图片', value: 'image' },
        { text: 'nsPredicate', value: 'nsPredicate' },
        { text: 'linkText', value: 'linkText' },
        { text: 'className', value: 'className' },
        { text: 'tagName', value: 'tagName' },
        { text: 'partialLinkText', value: 'partialLinkText' },
        { text: 'cssSelectorAndText', value: 'cssSelectorAndText' },
      ]">
      <template #default="scope">
        <span v-if="scope.row.eleType.length === 0">未指定</span>
        <span v-else>
              <el-tag size="medium" v-if="scope.row.eleType === 'image'"
              >图片</el-tag
              >
              <el-tag size="medium" v-else-if="scope.row.eleType === 'point'"
              >坐标</el-tag
              >
              <el-tag size="medium" v-else>{{ scope.row.eleType }}</el-tag>
            </span>
      </template>
    </el-table-column>

    <el-table-column
        :show-overflow-tooltip="true"
        label="控件元素值"
        header-align="center"
    >
      <template #default="scope">
        <el-image
            :z-index="5000"
            v-if="scope.row.eleType === 'image'"
            fit="contain"
            style="width: 100px; height: 100%; margin-top: 10px"
            :src="scope.row.eleValue"
            :preview-src-list="[scope.row.eleValue]"
        ></el-image>
        <span v-else-if="scope.row.eleValue">{{ scope.row.eleValue }}</span>
        <span v-else>未填写</span>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="210" align="center">
      <template #default="scope">
        <el-button type="primary"  size="mini"
        @click="copyElement(scope.row.id)">
          复制
        </el-button>
        <el-button
            type="primary"
            size="mini"
            @click="editElement(scope.row.id)"
        >编辑
        </el-button
        >
        <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="deleteEle(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该控件元素吗？"
        >
          <template #reference>
            <el-button
                type="danger"
                size="mini"
            >删除
            </el-button
            >
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable :is-page-set="true" :total="pageData['totalElements']"
            :current-page="pageData['number']+1"
            :page-size="pageData['size']"
            @change="getElementList"></pageable>
</template>