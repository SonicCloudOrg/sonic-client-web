<script setup>
import { onMounted, ref } from 'vue';
// eslint-disable-next-line import/no-cycle
import axios from '@/http/axios';
import { ElButton, ElMessage } from 'element-plus';
import Pageable from '@/components/Pageable.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AlertRobotUpdate from '../components/AlertRobotUpdate.vue';

const { t: $t } = useI18n();
const route = useRoute();
const pageData = ref({ totalElements: 0, number: 0, size: 0 });
const pageSize = ref(15);
const pageCurrNum = ref(1);
const updateFormModel = ref(null);
const { robotMap, sceneMap } = AlertRobotUpdate;
const add = () => {
  updateFormModel.value = {
    id: null,
    scene: 'testsuite',
    robotType: 1,
    projectId: route.params.projectId,
  };
};
const getAlertRobots = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/alertRobots/list', {
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
const submit = (model) => {
  axios.put('/controller/alertRobots', model).then((resp) => {
    if (resp.code === 2000) {
      ElMessage.success({
        message: resp.message,
      });
      updateFormModel.value = null;
      getAlertRobots();
    }
  });
};
const deleteById = (id, projectId) => {
  axios
    .delete('/controller/alertRobots', {
      params: {
        id,
        projectId,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        getAlertRobots();
      }
    });
};
onMounted(() => {
  getAlertRobots();
});
</script>

<template>
  <alert-robot-update
    :data-to-edit="updateFormModel"
    :is-admin="false"
    @save="submit"
    @abort="updateFormModel = null"
  />
  <el-button size="mini" round type="primary" @click="add">{{
    $t('robot.ui.add')
  }}</el-button>

  <el-table
    :data="pageData['content']"
    style="width: 100%; margin-top: 20px"
    border
  >
    <el-table-column :label="$t('robot.id')" align="center" prop="id" />
    <el-table-column :label="$t('robot.name')" align="center" prop="name" />
    <el-table-column :label="$t('robot.scene')" align="center" prop="scene">
      <template #default="scope">
        {{ $t(sceneMap[scope.row.scene]) }}
      </template>
    </el-table-column>
    <el-table-column
      :label="$t('robot.robotType')"
      align="center"
      prop="robotType"
      ><template #default="scope">
        {{ robotMap[scope.row.robotType] }}
      </template>
    </el-table-column>
    <el-table-column :label="$t('robot.muteRule')" align="center"
      ><template #default="scope">
        <el-tag v-if="!scope.row.muteRule" type="info">{{
          $t('robot.consts.nomute')
        }}</el-tag>
        <el-popover v-else trigger="hover" width="auto">
          <template #default>
            <pre>{{ scope.row.muteRule }}</pre>
          </template>
          <template #reference>
            <el-tag>{{ $t('robot.consts.customTemplate') }}</el-tag>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column :label="$t('robot.template')" align="center"
      ><template #default="scope">
        <el-tag v-if="!scope.row.template" type="info">{{
          $t('robot.consts.defaultTemplate')
        }}</el-tag
        ><el-popover v-else trigger="hover" width="auto">
          <template #default>
            <pre>{{ scope.row.template }}</pre>
          </template>
          <template #reference>
            <el-tag>{{ $t('robot.consts.customTemplate') }}</el-tag>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column fixed="right" :label="$t('common.operate')" align="center">
      <template #default="scope">
        <template v-if="!!scope.row.projectId">
          <el-button
            type="primary"
            size="mini"
            @click="updateFormModel = scope.row"
            >{{ $t('common.edit') }}
          </el-button>
          <el-popconfirm
            style="margin-left: 10px"
            :confirm-button-text="$t('form.confirm')"
            :cancel-button-text="$t('form.cancel')"
            icon="el-icon-warning"
            icon-color="red"
            :title="$t('robot.ui.delMessage')"
            @confirm="deleteById(scope.row.id, scope.row.projectId)"
          >
            <template #reference>
              <el-button type="danger" size="mini">
                {{ $t('common.delete') }}
              </el-button>
            </template>
          </el-popconfirm>
        </template>
        <template v-else>({{ $t('robot.ui.globalRobot') }})</template>
      </template>
    </el-table-column>
  </el-table>
  <pageable
    :is-page-set="true"
    :total="pageData['totalElements']"
    :current-page="pageData['number'] + 1"
    :page-size="pageData['size']"
    @change="getAlertRobots"
  ></pageable>
</template>
