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
const pageSize = ref(10);
const pageCurrNum = ref(1);
const dialogVisible = ref(false);
const memberDialogVisible = ref(false);

const memberParams = ref({
  userName: '',
});


// 添加成员
const openAddMember = (row) => {
  memberParams.value = {
    projectId: parseInt(route.params.projectId),
    userName: row.userName,
    memberRole: 0,
  };
  memberDialogVisible.value = true;
};

const addMemberForm = ref(null);
const addMemberFunction = () => {
  addMemberForm.value.validate(async (valid) => {
    if (valid) {
      await axios
        .post('/controller/projects/addMember', memberParams.value)
        .then((resp) => {
          if (resp.code === 2000) {
            memberDialogVisible.value = false;
            ElMessage.success({
              message: resp.message,
            });
            getMemberList(1);
          }
        });
    }
  });
};


// 查询项目成员
const getMemberList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/projects/listMembers', {
      params: {
        projectId: route.params.projectId,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};

// 删除项目成员
const deleteProjectUsers = (id) => {
  axios
    .delete('/controller/projects/deleteMember', {
      params: {
        id: id,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          dialogVisible.value = false;
          getMemberList();
        }
    });
};

onMounted(() => {
  getMemberList();
});
</script>

<template>
  <el-dialog
    v-model="memberDialogVisible"
    :title="$t('proMemberTS.dialogVisible.addMember')"
    width="600px"
  >
    <el-form
      ref="addMemberForm"
      :model="memberParams"
      size="small"
      class="demo-table-expand"
     
      label-position="left"
    >
      <el-form-item
        prop="userName"
        :label="$t('proMemberTS.pageData.memberName')"
        :rules="{
          required: true,
          message: $t('proMemberTS.pageData.memberNoNull'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="memberParams.userName"
          :placeholder="$t('proMemberTS.dialogVisible.inputParam')"
        ></el-input>
      </el-form-item>
    </el-form>

    <div style="text-align: center">
      <el-button size="small" type="primary" @click="addMemberFunction">{{
        $t('modulesTS.sure')
      }}</el-button>
    </div>
  </el-dialog>

  <el-button size="mini" round type="primary" @click="openAddMember">{{
    $t('proMemberTS.dialogVisible.addMember')
  }}
  </el-button>

  <el-table :data="pageData['content']" style="width: 100%; margin-top: 20px" border >
    <el-table-column
      :label="$t('proMemberTS.pageData.memberId')"
      width="90"
      align="center"
      prop="id"
    >
     </el-table-column>
    <el-table-column
      :label="$t('proMemberTS.pageData.memberName')"
      align="center"
      prop="userName"
    ></el-table-column>

    <el-table-column
      :label="$t('proMemberTS.pageData.memberRole')"
      align="center"
      prop="memberRole"
    >
    <template #default="scope">
      <span v-if = "scope.row.memberRole == 1" >{{$t('proMemberTS.pageData.createBy')}}</span>
      <span v-if = "scope.row.memberRole == 0" >{{$t('proMemberTS.pageData.members')}}</span>
    </template> 
  </el-table-column>

    <el-table-column fixed="right" :label="$t('common.operate')" align="center">
      <template #default="scope">
        <el-popconfirm v-if = "scope.row.memberRole == 0"
          style="margin-left: 10px"
          :confirm-button-text="$t('form.confirm')"
          :cancel-button-text="$t('form.cancel')"
          icon="el-icon-warning"
          icon-color="red"
          :title="$t('proMemberTS.pageData.delMessage')"
          @confirm="deleteProjectUsers(scope.row.id)"
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
    @change="getMemberList"
  ></pageable>
</template>
