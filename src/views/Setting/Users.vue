<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from '@/http/axios';
import { ElMessage } from 'element-plus';
import Pageable from '@/components/Pageable.vue';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

const route = useRoute();

const pageData = ref({});
const pageSize = ref(15);
const pageCurrNum = ref(1);
const name = ref('');
const dialogVisible = ref(false);

const state = ref('');

const userRole = ref({
  roleId: null,
  userName: '',
  id: null,
});

const open = (row) => {
  userRole.value = {
    roleId: row.roleId,
    userName: row.userName,
    id: row.id,
  };
  state.value = row.roleName;
  dialogVisible.value = true;
};

const updateUserRole = (userRole) => {
  const data = new FormData();
  data.append('roleId', userRole.roleId);
  data.append('userId', userRole.id);
  axios.put('/controller/users/changeRole', data).then((resp) => {
    if (resp.code === 2000) {
      dialogVisible.value = false;
      ElMessage.success({
        message: resp.message,
      });
      getUserList(1);
    }
  });
};

const getRolesList = (queryString, cb) => {
  axios
    .get('/controller/roles/list', {
      params: {
        page: 1,
        isAll: true,
      },
    })
    .then((resp) => {
      cb(resp.data.content);
    });
};

const handleSelect = async (item) => {
  userRole.value.roleId = item.id;
};

const summit = async () => {
  await updateUserRole(userRole.value);
};

const getUserList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/users/list', {
      params: {
        page: pageCurrNum.value,
        pageSize: pageSize.value,
        userName: name.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};

onMounted(() => {
  getUserList();
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('usersTS.dialogVisible.editUser')"
    width="600px"
  >
    <el-form
      ref="updateRoles"
      :model="userRole"
      size="small"
      class="demo-table-expand"
      label-width="90px"
      label-position="left"
    >
      <el-form-item :label="$t('usersTS.dialogVisible.userName')">
        <el-input v-model="userRole.userName" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('form.role')">
        <el-autocomplete
          v-model="state"
          value-key="roleName"
          :fetch-suggestions="getRolesList"
          style="width: 100%"
          :placeholder="$t('usersTS.dialogVisible.chooseUserName')"
          @select="handleSelect"
        >
          <template #default="{ item }">
            <div class="value">{{ item.roleName }}</div>
            <span class="link" style="margin-left: 10px; font-size: 12px">{{
              item.comment
            }}</span>
          </template>
        </el-autocomplete>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">{{
        $t('modulesTS.sure')
      }}</el-button>
    </div>
  </el-dialog>
  <el-table :data="pageData['content']" style="width: 100%" border>
    <el-table-column
      :label="$t('usersTS.pageData.userId')"
      width="90"
      align="center"
      prop="id"
    ></el-table-column>
    <el-table-column
      :label="$t('usersTS.pageData.userName')"
      align="center"
      prop="userName"
    >
      <template #header>
        <el-input
          v-model="name"
          size="mini"
          :placeholder="$t('usersTS.pageData.inputName')"
          @input="getUserList(1)"
        />
      </template>
    </el-table-column>
    <el-table-column :label="$t('form.role')" align="center" prop="roleName">
    </el-table-column>
    <el-table-column fixed="right" :label="$t('common.operate')" align="center">
      <template #default="scope">
        <el-button type="primary" size="mini" @click="open(scope.row)"
          >{{ $t('usersTS.pageData.roleConfiguration') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <pageable
    :is-page-set="true"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getUserList"
  ></pageable>
</template>
