<script setup>
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import axios from "@/http/axios";
import {ElMessage} from "element-plus";
import Pageable from '@/components/Pageable.vue'

const route = useRoute()

const pageData = ref({})
const pageSize = ref(15);
const path = ref("")
const dialogVisible = ref(false)
const updateRoles = ref(null)
const roleResourcesList = ref([])
const roleResourcesDialogVisible = ref(false)

const lastRoleId = ref("")

const roleParams = ref({
  id: null,
  roleName: "",
  comment: ""
})

const open = () => {
  roleParams.value = {
    id: null,
    roleName: "",
    comment: ""
  }
  dialogVisible.value = true
}

const edit = (row) => {
  roleParams.value = {
    id: row.id,
    roleName: row.roleName,
    comment: row.comment
  }
  dialogVisible.value = true
}

const summit = () => {
  updateRoles['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/roles/edit", roleParams.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogVisible.value = false
          getRolesList();
        }
      })
    }
  })
}

const deleteRole = (roleId) => {
  axios.delete("/controller/roles/delete", {
    params: {
      id: roleId
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}

const change = async (checked, child) => {
  await updateRoleResource(child)
  
}

const updateRoleResource = (row) => {
  let data = new FormData();
  data.append('roleId',lastRoleId.value);
  data.append('resId',row.id);
  data.append('hasAuth',row.hasAuth);
  axios.put("/controller/roles/update", data).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
            message: resp['message'],
          });
    }
        
  })
}


const getRoleResourceList = (roleId)=> {
  lastRoleId.value = roleId
  axios.get("/controller/resources/roleResource", {
    params: {
      roleId
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
          roleResourcesList.value = resp.data
          console.log(roleResourcesList)
          roleResourcesDialogVisible.value = true
        }else {
          ElMessage.success({
            message: resp['message'],
          });
        }
    
  })
}

const getRolesList = (pageNum, pSize)=> {
  axios.get("/controller/roles/list", {
    params: {
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}

onMounted(() => {
  getRolesList()
})
</script>
<template>
  
  <el-dialog v-model="dialogVisible" title="添加/编辑角色" width="600px">
    <el-form ref="updateRoles" :model="roleParams" size="small" class="demo-table-expand" label-width="90px"
             label-position="left">
      <el-form-item
          prop="roleName"
          label="角色名称"
          :rules="{
          required: true,
          message: '角色名称不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="roleParams.roleName"
            placeholder="请输入参数名"
        ></el-input>
      </el-form-item>
      <el-form-item
          prop="comment"
          label="描述"
          :rules="{
          required: true,
          message: '参数值不能为空',
          trigger: 'blur',
        }"
      >
        <el-input
            v-model="roleParams.comment"
            placeholder="请输入角色描述"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">确 定</el-button>
    </div>
  </el-dialog>
  <el-dialog v-model="roleResourcesDialogVisible" title="权限配置" width="70%">
    
    <div v-for="parent in roleResourcesList" :key="parent.id">
        {{parent.desc}}
        <el-form-item style="margin-left: 20px">
          <el-checkbox v-for="child in parent.child" :key="child.id" v-model="child.hasAuth" @change="change(child.hasAuth, child)">{{child.desc}}</el-checkbox>
        </el-form-item>
    </div>
    
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">添加角色</el-button>
  
  
  <el-table
      :data="pageData['content']"
      style="width: 100%; margin-top: 20px"
      border
  >
    <el-table-column label="角色" width="90" align="center" prop="id"></el-table-column>
    <el-table-column label="名称"  align="center" prop="roleName"></el-table-column>
    <el-table-column label="描述"  align="center" prop="comment">
    </el-table-column>
    <el-table-column fixed="right" label="操作" align="center">
      <template #default="scope">
        <el-button
                type="primary"
                size="mini"
                @click="getRoleResourceList(scope.row.id)"
            >权限配置
            </el-button>
        <el-button
                type="primary"
                size="mini"
                @click="edit(scope.row)"
            >编辑
            </el-button>
            <el-popconfirm
            style="margin-left: 10px"
            :confirmButtonText="$t('form.confirm')"
            :cancelButtonText="$t('form.cancel')"
            @confirm="deleteRole(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该角色吗？"
        >
          <template #reference>
            <el-button
                type="danger"
                size="mini"
            >
              删除
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
    
  </el-table>
  <pageable :is-page-set="true" :total="pageData['totalElements']"
            :current-page="pageData['number']+1"
            :page-size="pageData['size']"
            @change="getRolesList"></pageable>
</template>