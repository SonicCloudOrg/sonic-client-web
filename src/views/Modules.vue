<script setup>
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import axios from "../http/axios";
import {ElMessage} from "element-plus";

import {useI18n} from 'vue-i18n'
const {t: $t} = useI18n()

const route = useRoute()
const dialogVisible = ref(false)
const pageData = ref([])
const updateModule = ref(null)
const modules = ref({
  id: null,
  projectId: route.params.projectId,
  name: ""
})
const editModule = async (id) => {
  await open()
  await getModuleInfo(id)
}
const open = () => {
  modules.value = {
    id: null,
    projectId: route.params.projectId,
    name: ""
  }
  dialogVisible.value = true
}
const getModuleList = () => {
  axios.get("/controller/modules/list", {
    params: {
      projectId: route.params.projectId,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const getModuleInfo = (id) => {
  axios.get("/controller/modules", {
    params: {
      id
    }
  }).then(resp => {
    modules.value = resp.data
  })
}
const deleteModule = (id) => {
  axios.delete("/controller/modules", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getModuleList();
    }
  })
}
const summit = () => {
  updateModule['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/modules", modules.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogVisible.value = false
          getModuleList();
        }
      })
    }
  })
}
onMounted(() => {
  getModuleList();
})
</script>
<template>
  <el-dialog v-model="dialogVisible" :title="$t('modulesTS.info')" width="400px">
    <el-form ref="updateModule" :model="modules" size="small" class="demo-table-expand" label-width="90px"
             label-position="left">
      <el-form-item
          prop="name"
          :label="$t('modulesTS.name')"
          :rules="{
          required: true,
          message: $t('modulesTS.isNotNull'),
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="modules.name"
            :placeholder="$t('modulesTS.inputName')"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">{{$t('modulesTS.sure')}}</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">{{$t('modulesTS.add')}}</el-button>
  <el-row :gutter="20">
    <el-col :span="6" v-for="m in pageData" style="margin-top: 20px">
      <el-card>
        <div style="text-align: center;font-size:14px;color:#606266"> {{ m.name }}</div>
        <el-divider style="margin: 12px 0;"></el-divider>
        <div style="text-align: center">
          <el-button
              type="primary"
              size="mini"
              @click="editModule(m.id)"
          >{{$t('common.edit')}}
          </el-button
          >
          <el-popconfirm
              style="margin-left: 10px"
              :confirmButtonText="$t('form.confirm')"
              :cancelButtonText="$t('form.cancel')"
              @confirm="deleteModule(m.id)"
              icon="el-icon-warning"
              iconColor="red"
              :title="$t('modulesTS.del')"
          >
            <template #reference>
              <el-button
                  type="danger"
                  size="mini"
              >{{$t('common.delete')}}
              </el-button
              >
            </template>
          </el-popconfirm>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
