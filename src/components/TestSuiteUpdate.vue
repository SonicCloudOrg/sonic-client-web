<script setup>
/*
 *   sonic-client-web  Front end of Sonic cloud real machine platform.
 *   Copyright (C) 2022 SonicCloudOrg
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { VueDraggableNext } from 'vue-draggable-next';
import { Delete, Rank, Plus } from '@element-plus/icons';
import { useI18n } from 'vue-i18n';
import RenderDeviceName from './RenderDeviceName.vue';
import RenderStatus from './RenderStatus.vue';
import axios from '../http/axios';
import Pageable from './Pageable.vue';

const { t: $t } = useI18n();
const route = useRoute();
const props = defineProps({
  suiteId: Number,
});
const img = import.meta.globEager('./../assets/img/*');
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
const getPhoneImg = (name, url) => {
  let result;
  if (url === null || !url || (url && url.length === 0)) {
    result = img['./../assets/img/default.png'].default;
  } else {
    result = url;
  }
  return result;
};
const suiteForm = ref(null);
const platformList = [
  { name: 'Android', value: 1, img: 'ANDROID' },
  { name: 'iOS', value: 2, img: 'IOS' },
];
const testSuite = ref({
  id: null,
  name: '',
  platform: null,
  isOpenPerfmon: 0,
  perfmonInterval: 1000,
  cover: 1,
  projectId: route.params.projectId,
  devices: [],
  testCases: [],
});
const deviceData = ref([]);
const deviceDataBack = ref([]);
const getDevice = () => {
  axios
    .get('/controller/devices/listAll', {
      params: { platform: testSuite.value.platform },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        deviceData.value = resp.data;
        deviceDataBack.value = resp.data;
      }
    });
};
const tabValue = ref('select');
const pageData = ref([]);
const name = ref('');
const pageSize = ref(10);
const pageCurrNum = ref(1);
const getTestCaseList = (pageNum, pSize) => {
  pageSize.value = pSize || pageSize.value;
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/testCases/list', {
      params: {
        platform: testSuite.value.platform,
        projectId: route.params.projectId,
        name: name.value,
        page: pageCurrNum.value,
        pageSize: pageSize.value,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};
const addToPublic = (e) => {
  testSuite.value.testCases.push(e);
  ElMessage.success({
    message: '选择成功！已加入到已选用例',
  });
};
const removeFromPublic = (e) => {
  testSuite.value.testCases.splice(e, 1);
  ElMessage.success({
    message: '移出成功！',
  });
};
const getSource = () => {
  getDevice();
  getTestCaseList();
};
const emit = defineEmits(['flush']);
const summit = () => {
  suiteForm.value.validate((valid) => {
    if (valid) {
      axios.put('/controller/testSuites', testSuite.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
          });
          emit('flush');
        }
      });
    }
  });
};
const getSuiteInfo = (id) => {
  axios.get('/controller/testSuites', { params: { id } }).then((resp) => {
    if (resp.code === 2000) {
      testSuite.value = resp.data;
      if (testSuite.value.platform !== null) {
        getSource(testSuite.value.platform);
      }
    }
  });
};
const filterDevice = (name) => {
  if (name) {
    deviceData.value = deviceDataBack.value.filter((item) => {
      if (
        (item.model && item.model.indexOf(name) !== -1) ||
        (item.nickName && item.nickName.indexOf(name) !== -1) ||
        (item.chiName && item.chiName.indexOf(name) !== -1) ||
        (item.udId && item.udId.indexOf(name) !== -1)
      ) {
        return true;
      }
    });
  } else {
    deviceData.value = deviceDataBack.value;
  }
};
onMounted(() => {
  if (props.suiteId !== 0) {
    getSuiteInfo(props.suiteId);
  }
});
</script>

<template>
  <el-form
    ref="suiteForm"
    label-position="left"
    class="demo-table-expand"
    label-width="90px"
    :model="testSuite"
    size="small"
  >
    <el-form-item
      prop="name"
      :label="$t('suite.name')"
      :rules="{
        required: true,
        message: $t('suite.namePlace'),
        trigger: 'blur',
      }"
    >
      <el-input
        v-model="testSuite.name"
        size="mini"
        :placeholder="$t('suite.namePlace')"
      />
    </el-form-item>
    <el-form-item
      prop="platform"
      :label="$t('testcase.platform')"
      :rules="{
        required: true,
        message: $t('testcase.platformPlace'),
        trigger: 'change',
      }"
    >
      <el-select
        v-model="testSuite.platform"
        style="width: 100%"
        :placeholder="$t('testcase.platformPlace')"
        @change="getSource"
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
    <el-form-item :label="$t('suite.perf')">
      <el-switch
        v-model="testSuite.isOpenPerfmon"
        :active-value="1"
        :inactive-value="0"
      />
    </el-form-item>
    <el-form-item
      v-if="testSuite.isOpenPerfmon === 1"
      :label="$t('suite.interval')"
    >
      <el-input-number
        v-model="testSuite.perfmonInterval"
        style="margin-right: 10px"
        :min="1000"
        :step="500"
        :max="120000"
      />ms
    </el-form-item>
    <el-form-item :label="$t('testSuitesTS.coverType')">
      <el-select v-model="testSuite.cover" style="width: 100%">
        <el-option :value="1" :label="$t('testSuitesTS.testCover')"></el-option>
        <el-option
          :value="2"
          :label="$t('testSuitesTS.deviceCover')"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="device" :label="$t('testSuitesTS.associated')">
      <el-select
        v-model="testSuite.devices"
        :disabled="testSuite.platform === null"
        value-key="id"
        clearable
        filterable
        :filter-method="filterDevice"
        style="width: 100%"
        multiple
        :placeholder="$t('suite.devicePlace')"
      >
        <el-option
          v-for="item in deviceData"
          :key="item.id"
          :label="item.model"
          :value="item"
        >
          <el-image
            style="height: 80%; float: left"
            fit="contain"
            :src="getPhoneImg(item.model, item['imgUrl'])"
          />
          <span style="float: left; margin-left: 10px"
            ><RenderDeviceName :device="item"
          /></span>
          <span style="display: flex; float: right; align-items: center">
            <span
              style="
                margin-left: 15px;
                color: #909399;
                font-size: 13px;
                font-style: italic;
              "
              >{{ item['udId'] }}</span
            >
            <RenderStatus
              style="margin-left: 15px; margin-right: -10px"
              :status="item['status']"
              :user="item['user']"
            />
          </span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="testCases" :label="$t('testSuitesTS.associatedCase')">
      <el-tabs v-model="tabValue" type="border-card" stretch>
        <el-tab-pane :label="$t('suite.selectedCase')" name="select">
          <el-timeline v-if="testSuite.testCases.length > 0">
            <VueDraggableNext
              v-model="testSuite.testCases"
              tag="div"
              handle=".handle"
              animation="200"
              force-fallback="true"
              fallback-class="shake"
              ghost-class="g-host"
              chosen-class="move"
            >
              <el-timeline-item
                v-for="(s, index) in testSuite.testCases"
                :key="index"
                :timestamp="$t('homeTS.testCase.case') + (index + 1)"
                placement="top"
                type="primary"
                style="padding-bottom: 0px !important"
                :hollow="true"
              >
                {{ s.name }}
                <div style="float: right">
                  <el-button class="handle" circle size="mini">
                    <el-icon :size="13" style="vertical-align: middle">
                      <Rank />
                    </el-icon>
                  </el-button>
                  <el-button
                    circle
                    type="danger"
                    size="mini"
                    @click="removeFromPublic(index)"
                  >
                    <el-icon :size="13" style="vertical-align: middle">
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </el-timeline-item>
            </VueDraggableNext>
          </el-timeline>
          <el-empty v-else :description="$t('testcase.empty')">
            <el-button size="mini" @click="tabValue = 'list'">{{
              $t('testcase.add')
            }}</el-button>
          </el-empty>
        </el-tab-pane>
        <el-tab-pane :label="$t('testcase.list')" name="list">
          <el-table :data="pageData['content']" border style="margin-top: 10px">
            <el-table-column
              width="80"
              label="id"
              prop="id"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              min-width="280"
              prop="name"
              header-align="center"
              show-overflow-tooltip
            >
              <template #header>
                <el-input
                  v-model="name"
                  size="mini"
                  :placeholder="$t('testcase.namePlace')"
                  @input="getTestCaseList()"
                />
              </template>
            </el-table-column>
            <el-table-column
              min-width="80"
              :label="$t('testcase.designer')"
              prop="designer"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              min-width="180"
              :label="$t('testcase.editTime')"
              prop="editTime"
              align="center"
            />
            <el-table-column
              :label="$t('common.operate')"
              width="100"
              align="center"
            >
              <template #default="scope">
                <el-button circle size="mini" @click="addToPublic(scope.row)">
                  <el-icon :size="13" style="vertical-align: middle">
                    <Plus />
                  </el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pageable
            :is-page-set="false"
            :total="pageData['totalElements']"
            :current-page="pageData['number'] + 1"
            :page-size="pageData['size']"
            @change="getTestCaseList"
          ></pageable>
        </el-tab-pane>
      </el-tabs>
    </el-form-item>
  </el-form>

  <div style="text-align: center; margin-top: 20px">
    <el-button size="small" type="primary" @click="summit">{{
      $t('form.save')
    }}</el-button>
  </div>
</template>
