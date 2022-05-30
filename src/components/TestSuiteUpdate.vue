<script setup>
/*
 *  Copyright (C) [SonicCloudOrg] Sonic Project
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
import {onMounted, ref} from "vue";
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import {useRoute} from "vue-router";
import RenderDeviceName from "./RenderDeviceName.vue";
import RenderStatus from "./RenderStatus.vue";
import {VueDraggableNext} from 'vue-draggable-next';
import {Delete, Rank, Plus} from "@element-plus/icons";
import Pageable from './Pageable.vue'

const route = useRoute()
const props = defineProps({
  suiteId: Number
})
const img = import.meta.globEager("./../assets/img/*")
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu'
  }
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
const getPhoneImg = (name, url) => {
  let result;
  if (url === null || url.length === 0) {
    result = img['./../assets/img/default.png'].default
  } else {
    result = url;
  }
  return result;
}
const suiteForm = ref(null)
const platformList = [{name: "安卓", value: 1, img: "ANDROID"}
  , {name: "iOS", value: 2, img: "IOS"}]
const testSuite = ref({
  id: null,
  name: "",
  platform: null,
  cover: 1,
  projectId: route.params.projectId,
  devices: [],
  testCases: []
})
const deviceData = ref([])
const deviceDataBack = ref([])
const getDevice = () => {
  axios
      .get("/controller/devices/listAll", {params: {platform: testSuite.value.platform}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          deviceData.value = resp.data;
          deviceDataBack.value = resp.data;
        }
      });
}
const tabValue = ref("select")
const pageData = ref([])
const name = ref("")
const pageSize = ref(10);
const getTestCaseList = (pageNum, pSize) => {
  axios.get("/controller/testCases/list", {
    params: {
      platform: testSuite.value.platform,
      projectId: route.params.projectId,
      name: name.value,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const addToPublic = (e) => {
  testSuite.value.testCases.push(e)
  ElMessage.success({
    message: "选择成功！已加入到已选用例",
  });
}
const removeFromPublic = (e) => {
  testSuite.value.testCases.splice(e, 1);
  ElMessage.success({
    message: "移出成功！",
  });
}
const getSource = () => {
  getDevice();
  getTestCaseList()
}
const emit = defineEmits(['flush'])
const summit = () => {
  suiteForm['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/testSuites", testSuite.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit('flush');
        }
      })
    }
  })
}
const getSuiteInfo = (id) => {
  axios.get("/controller/testSuites", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      testSuite.value = resp.data
      if (testSuite.value.platform !== null) {
        getSource(testSuite.value.platform)
      }
    }
  })
}
const filterDevice = (name) => {
  if (name) {
    deviceData.value = deviceDataBack.value.filter((item) => {
      if ((item['model'] && item['model'].indexOf(name) !== -1)
          || (item['nickName'] && item['nickName'].indexOf(name) !== -1)
          || (item['chiName'] && item['chiName'].indexOf(name) !== -1)
          || (item['udId'] && item['udId'].indexOf(name) !== -1)) {
        return true
      }
    })
  } else {
    deviceData.value = deviceDataBack.value
  }
}
onMounted(() => {
  if (props.suiteId !== 0) {
    getSuiteInfo(props.suiteId)
  }
})
</script>
<template>
  <el-form
      label-position="left"
      class="demo-table-expand"
      label-width="90px"
      ref="suiteForm"
      :model="testSuite"
      size="small"
  >
    <el-form-item
        prop="name"
        label="套件名称"
        :rules="{
            required: true,
            message: '请填写套件名称',
            trigger: 'blur',
          }"
    >
      <el-input v-model="testSuite.name" size="mini" placeholder="输入套件名称"/>
    </el-form-item>
    <el-form-item
        prop="platform"
        label="平台"
        :rules="{
            required: true,
            message: '请选择平台',
            trigger: 'change',
          }"
    >
      <el-select
          style="width: 100%"
          v-model="testSuite.platform"
          placeholder="请选择平台"
          @change="getSource"
      >
        <el-option
            v-for="item in platformList"
            :key="item.name"
            :value="item.value"
            :label="item.name"
            :disabled="item['disabled']"
        >
          <div style="display: flex;align-items: center;justify-content: center">
            <el-avatar
                style="margin-right: 10px"
                :size="32"
                :src="getImg(item.img)"
                shape="square"
            ></el-avatar
            >
            {{ item.name }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
    <el-alert
        title="覆盖类型"
        type="info"
        description="用例覆盖即为每个用例只分配一个设备，设备覆盖即为每个设备都会执行所有用例"
        show-icon
        style="margin-bottom: 10px"
        close-text="Get!"
    >
    </el-alert>
    <el-form-item
        label="覆盖类型"
    >
      <el-select
          style="width: 100%"
          v-model="testSuite.cover"
          placeholder="请选择覆盖类型"
      >
        <el-option :value="1" label="用例覆盖"></el-option>
        <el-option :value="2" label="设备覆盖"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="device" label="关联设备">
      <el-select
          :disabled="testSuite.platform===null"
          value-key="id"
          clearable
          filterable
          :filter-method="filterDevice"
          style="width: 100%"
          v-model="testSuite.devices"
          multiple placeholder="请选择测试设备，可输入型号、备注、中文名称、序列号筛选">
        <el-option
            v-for="item in deviceData"
            :key="item.id"
            :label="item.model"
            :value="item"
        >
          <el-image
              style="height: 80%;float: left"
              fit="contain"
              :src="getPhoneImg(item.model,item['imgUrl'])"
          />
          <span style="float: left;margin-left: 10px"><RenderDeviceName :device="item"/></span>
          <span style="display: flex;float: right;
    align-items: center;">
          <span style="
            margin-left: 15px;
          color: #909399;
          font-size: 13px;
           font-style: italic;
        "
          >{{ item['udId'] }}</span
          >
            <RenderStatus style="margin-left: 15px;margin-right: -10px" :status="item['status']" :user="item['user']"/>
            </span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="testCases" label="关联用例">
      <el-tabs type="border-card" stretch v-model="tabValue">
        <el-tab-pane label="已选用例" name="select">
          <el-timeline v-if="testSuite.testCases.length>0">
            <VueDraggableNext tag="div"
                              v-model="testSuite.testCases"
                              handle=".handle"
                              animation="200"
                              forceFallback="true"
                              fallbackClass="shake"
                              ghostClass="g-host"
                              chosenClass="move">
              <el-timeline-item
                  v-for="(s, index) in testSuite.testCases"
                  :key="index"
                  :timestamp="'测试用例' + (index + 1)"
                  placement="top"
                  type="primary"
                  style="padding-bottom: 0px!important;"
                  :hollow="true"
              >
                {{ s.name }}
                <div style="float: right">
                  <el-button
                      class="handle"
                      circle
                      size="mini"
                  >
                    <el-icon :size="13" style="vertical-align: middle;">
                      <Rank/>
                    </el-icon>
                  </el-button>
                  <el-button
                      circle
                      type="danger"
                      size="mini"
                      @click="removeFromPublic(index)"
                  >
                    <el-icon :size="13" style="vertical-align: middle;">
                      <Delete/>
                    </el-icon>
                  </el-button>
                </div>
              </el-timeline-item>
            </VueDraggableNext>
          </el-timeline>
          <el-empty description="暂无用例" v-else>
            <el-button size="mini" @click="tabValue = 'list'">马上添加</el-button>
          </el-empty>
        </el-tab-pane>
        <el-tab-pane label="用例列表" name="list">
          <el-table :data="pageData['content']" border style="margin-top: 10px">
            <el-table-column width="80" label="用例Id" prop="id" align="center" show-overflow-tooltip/>
            <el-table-column min-width="280" prop="name" header-align="center" show-overflow-tooltip>
              <template #header>
                <el-input v-model="name" size="mini" @input="getTestCaseList()" placeholder="输入用例名称搜索"/>
              </template>
            </el-table-column>
            <el-table-column min-width="80" label="设计人" prop="designer" align="center" show-overflow-tooltip/>
            <el-table-column min-width="180" label="最后修改日期" prop="editTime" align="center"/>
            <el-table-column label="操作" width="80" align="center">
              <template #default="scope">
                <el-button
                    circle
                    size="mini"
                    @click="addToPublic(scope.row)"
                >
                  <el-icon :size="13" style="vertical-align: middle;">
                    <Plus/>
                  </el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pageable :is-page-set="false" :total="pageData['totalElements']"
                    :current-page="pageData['number']+1"
                    :page-size="pageData['size']"
                    @change="getTestCaseList"></pageable>
        </el-tab-pane>
      </el-tabs>
    </el-form-item>
  </el-form>

  <div style="text-align: center;margin-top: 20px">
    <el-button @click="summit" size="small" type="primary">提交</el-button>
  </div>
</template>