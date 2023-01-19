<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { Delete, Rank, Plus } from '@element-plus/icons';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import Pageable from './Pageable.vue';

const { t: $t } = useI18n();
const route = useRoute();
const props = defineProps({
  suiteId: Number,
});
const suiteParamsList = ref([])
const suiteParams = ref({
    suiteId:props.suiteId,
    paramsKey: '',
    paramsValue:''
})
const reset = () => {
    suiteParams.value = {
        suiteId:props.suiteId,
        paramsKey: '',
        paramsValue:''
    }
}
const getTestSuiteParams = () => {
    axios.get('/controller/testSuitesParams/list',{
        params: {suiteId:props.suiteId}
    })
    .then(resp => {
        if (resp.code === 2000) {
            suiteParamsList.value = resp.data;
        }
    })
}
const handleSave = (isAdd) => {
    if (isAdd) {
        delete suiteParams.value.id
    }
    axios.put('/controller/testSuitesParams',suiteParams.value).then(resp => {
        if (resp.code === 2000) {
            ElMessage.success({
                message: resp.message
            })
            getTestSuiteParams()
            reset()
        }
    })
}
const handleEdit = (index,row) => {
    suiteParams.value.id = row.id
    suiteParams.value.paramsKey = row.paramsKey
    suiteParams.value.paramsValue = row.paramsValue
    suiteParams.value.suiteId = row.suiteId
}
const handleDelete = (id) => {
    axios.delete('/controller/testSuitesParams',{
        params: {id: id}
    })
    .then(resp => {
            if (resp.code === 2000) {
                ElMessage.success({
                    message: resp.message
            })
            getTestSuiteParams()   
        }
    })
}

onMounted(() => {
    getTestSuiteParams()
});
</script>

<template>
    <el-alert
      style="margin-bottom: 10px"
      :title="$t('globalParamsTs.dialogVisible.specialUse')"
      :description="$t('globalParamsTs.dialogVisible.messageInfo')"
      type="info"
      show-icon
      close-text="Get!"
    />
    <el-form
      ref="suiteParamsForm"
      :model="suiteParams"
      size="small"
      label-width="90px"
      label-position="left"
    >
      <el-form-item
        prop="paramsKey"
        :label="$t('globalParamsTs.dialogVisible.keyName')"
        :rules="{
          required: true,
          message: $t('globalParamsTs.dialogVisible.keyNameMessage'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="suiteParams.paramsKey"
          :placeholder="$t('globalParamsTs.dialogVisible.inputName')"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="paramsValue"
        :label="$t('globalParamsTs.dialogVisible.valueName')"
        :rules="{
          required: true,
          message: $t('globalParamsTs.dialogVisible.valueNameMessage'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="suiteParams.paramsValue"
          :placeholder="$t('globalParamsTs.dialogVisible.inputValue')"
          style="width:80%"
        ></el-input>
        <el-button type="success" @click="handleSave(false)" style="margin-left:10px">保存</el-button>
        <el-button type="danger" @click="handleSave(true)" style="margin-left:10px">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="suiteParamsList" style="width: 100%">
        <el-table-column prop="id" label="ID">
        </el-table-column>
        <el-table-column prop="paramsKey" label="参数名">
        </el-table-column>
        <el-table-column prop="paramsValue" label="参数值">
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-button type="text" @click="handleEdit(scope.$index,scope.row)">编辑</el-button>
                <el-popconfirm title="请确认是否删除？" :key="scope.row.id" @confirm="handleDelete(scope.row.id)">
                    <template #reference>
                        <el-button type="text">删除</el-button>
                    </template>
                </el-popconfirm>
            </template>
        </el-table-column>
    </el-table>
</template>
