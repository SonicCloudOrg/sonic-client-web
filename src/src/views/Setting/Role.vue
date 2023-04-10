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
const path = ref('');
const dialogVisible = ref(false);
const updateRoles = ref(null);
const roleResourcesList = ref([]);
const roleResourcesDialogVisible = ref(false);

const lastRoleId = ref('');

const roleParams = ref({
  id: null,
  roleName: '',
  comment: '',
});

const open = () => {
  roleParams.value = {
    id: null,
    roleName: '',
    comment: '',
  };
  dialogVisible.value = true;
};

const edit = (row) => {
  roleParams.value = {
    id: row.id,
    roleName: row.roleName,
    comment: row.comment,
  };
  dialogVisible.value = true;
};

const summit = () => {
  updateRoles.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/roles/edit', roleParams.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          dialogVisible.value = false;
          getRolesList();
        }
      });
    }
  });
};

const deleteRole = (roleId) => {
  axios
    .delete('/controller/roles/delete', {
      params: {
        id: roleId,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};

const change = async (checked, child) => {
  await updateRoleResource(child);
};

const updateRoleResource = (row) => {
  const data = new FormData();
  data.append('roleId', lastRoleId.value);
  data.append('resId', row.id);
  data.append('hasAuth', row.hasAuth);
  axios.put('/controller/roles/update', data).then((resp) => {
    if (resp.code === 2000) {
      ElMessage.success({
        message: resp.message,
      });
    }
  });
};

const getRoleResourceList = (roleId) => {
  lastRoleId.value = roleId;
  axios
    .get('/controller/resources/roleResource', {
      params: {
        roleId,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        roleResourcesList.value = resp.data;
        roleResourcesDialogVisible.value = true;
      } else {
        ElMessage.success({
          message: resp.message,
        });
      }
    });
};

const getRolesList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/roles/list', {
      params: {
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};

onMounted(() => {
  getRolesList();
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('roleTS.dialogVisible.addOrEdit')"
    width="600px"
  >
    <el-form
      ref="updateRoles"
      :model="roleParams"
      size="small"
      class="demo-table-expand"
      label-width="90px"
      label-position="left"
    >
      <el-form-item
        prop="roleName"
        :label="$t('roleTS.dialogVisible.roleName')"
        :rules="{
          required: true,
          message: $t('roleTS.dialogVisible.roleNoNull'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="roleParams.roleName"
          :placeholder="$t('roleTS.dialogVisible.inputParam')"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="comment"
        :label="$t('resourceTS.pageData.message')"
        :rules="{
          required: true,
          message: $t('roleTS.dialogVisible.paramNoNull'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="roleParams.comment"
          :placeholder="$t('roleTS.dialogVisible.roleInfo')"
        ></el-input>
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="summit">{{
        $t('modulesTS.sure')
      }}</el-button>
    </div>
  </el-dialog>
  <el-dialog
    v-model="roleResourcesDialogVisible"
    :title="$t('settingIndexTS.center.rights')"
    width="70%"
  >
    <div v-for="parent in roleResourcesList" :key="parent.id">
      {{ parent.desc }}
      <el-form-item style="margin-left: 20px">
        <el-checkbox
          v-for="child in parent.child"
          :key="child.id"
          v-model="child.hasAuth"
          @change="change(child.hasAuth, child)"
          >{{ child.desc }}</el-checkbox
        >
      </el-form-item>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="open">{{
    $t('roleTS.dialogVisible.addRole')
  }}</el-button>

  <el-table
    :data="pageData['content']"
    style="width: 100%; margin-top: 20px"
    border
  >
    <el-table-column
      :label="$t('roleTS.pageData.role')"
      width="90"
      align="center"
      prop="id"
    ></el-table-column>
    <el-table-column
      :label="$t('roleTS.pageData.nameL')"
      align="center"
      prop="roleName"
    ></el-table-column>
    <el-table-column
      :label="$t('resourceTS.pageData.message')"
      align="center"
      prop="comment"
    >
    </el-table-column>
    <el-table-column fixed="right" :label="$t('common.operate')" align="center">
      <template #default="scope">
        <el-button
          type="primary"
          size="mini"
          @click="getRoleResourceList(scope.row.id)"
          >{{ $t('settingIndexTS.center.rights') }}
        </el-button>
        <el-button type="primary" size="mini" @click="edit(scope.row)"
          >{{ $t('common.edit') }}
        </el-button>
        <el-popconfirm
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('roleTS.pageData.delMessage')"
          @confirm="deleteRole(scope.row.id)"
        >
          <template #reference>
            <el-button type="danger" size="mini">
              {{ $t('common.delete') }}
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
    @change="getRolesList"
  ></pageable>
</template>
