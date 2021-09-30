<script setup>
import {onMounted, ref} from 'vue'
import {useStore} from "vuex";
import axios from "../http/axios";

const img = import.meta.globEager("./../assets/img/*")
const pageData = ref({})
const dialogVisible = ref(false)
const name = ref("")
const store = useStore()
const currentPage = ref(0)
const testSuite = ref({
  id: null,
  name: "",
  platform: null,
  projectId: store.state.project.id,
  moduleThread: 1,
  caseThread: 1,
  deviceThread: 10,
  devices: [{
    "id": 2,
    "name": "ddddd",
    "model": "Redmi Note 5",
    "udId": "333333",
    "status": "OFFLINE",
    "agentId": 1,
    "platform": 1,
    "size": "1080x720",
    "version": "7",
    "cpu": "arm",
    "manufacturer": "Xiaomi",
    "password": "123"
  }],
  testCases: []
})
const test = () => {
  console.log(testSuite.value.devices)
}
const getImg = (name) => {
  let result;
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
const platformList = [{name: "安卓", value: 1, img: "ANDROID"}
  , {name: "iOS（暂不开放）", value: 2, img: "IOS", disabled: true}
  , {name: "WEB（暂不开放）", value: 5, img: "chrome", disabled: true}]
const deviceData = ref([])
const getDevice = (platform) => {
  axios
      .get("/controller/devices/listAll", {params: {platform}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          deviceData.value = resp.data;
        }
      });
}
const testCaseData = ref([])
const getTestCaseList = (platform) => {
  axios
      .get("/controller/testCases/listAll", {params: {platform}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          testCaseData.value = resp.data;
        }
      });
}
const getSource = (platform) => {
  getDevice(platform);
  getTestCaseList(platform)
}
const getTestSuiteList = () => {

}
const deleteSuite = (id) => {

}
const editSuite = (id) => {

}
const c = (e) => {
  console.log(e)
}
onMounted(() => {
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="测试套件信息" width="550px">
    <el-form
        v-if="dialogVisible"
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
          prop="projectId"
          label="所属项目"
          :rules="{
            required: true,
            message: '请选择项目',
            trigger: 'change',
          }"
      >
        <el-select
            style="width: 100%"
            v-model="testSuite.projectId"
            placeholder="请选择项目"
        >
          <el-option
              v-for="item in store.state.projectList"
              :key="item.id"
              :value="item.id"
              :label="item['projectName']"
          >
            <div style=" display: flex;align-items: center;">
              <el-avatar
                  style="margin-right: 10px"
                  :size="32"
                  :src="item['projectImg']"
                  shape="square"
              ></el-avatar
              >
              {{ item['projectName'] }}
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模块并发数">
        <el-slider
            v-model="testSuite.moduleThread"
            :step="1"
            :max="10"
            :min="1"
            show-stops
        ></el-slider>
      </el-form-item>
      <el-form-item label="用例并发数">
        <el-slider
            v-model="testSuite.caseThread"
            :step="1"
            :max="10"
            :min="1"
            show-stops
        ></el-slider>
      </el-form-item>
      <el-form-item label="设备并发数">
        <el-slider
            v-model="testSuite.deviceThread"
            :step="1"
            :max="20"
            :min="1"
            show-stops
        ></el-slider>
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
      <el-form-item label="关联设备" v-if="testSuite.platform!==null">
        <el-select value-key="id"
                   collapse-tags
                   filterable
                   style="width: 100%"
                   v-model="testSuite.devices"
                   multiple placeholder="请选择测试设备">
          <el-option
              v-for="item in deviceData"
              :key="item.id"
              :label="item.model"
              :value="item"
          >
            <el-image
                style="height: 80%;float: left"
                fit="contain"
                :src="getImg(item.model)"
            >
            </el-image>
            <span style="float: left;margin-left: 10px">{{ item.model }}</span>
            <span style="
            margin-left: 15px;
          float: right;
          color: #909399;
          font-size: 13px;
           font-style: italic;
        "
            >{{ item.udId }}</span
            >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联用例" v-if="testSuite.platform!==null">
        <el-select value-key="id"
                   collapse-tags
                   filterable
                   style="width: 100%"
                   v-model="testSuite.testCases"
                   multiple placeholder="请选择测试用例">
          <el-option
              v-for="item in testCaseData"
              :key="item.id"
              :label="item.name"
              :value="item"
          >
            <span style="float: left;">{{ item.name }}</span>
            <span style="
            margin-left: 15px;
          float: right;
          color: #909399;
          font-size: 13px;
           font-style: italic;
        "
            >{{ item['editTime'] }}</span
            >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <div style="text-align: center;margin-top: 20px">
      <el-button @click="summit" size="small" type="primary">提交</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="dialogVisible = true">添加测试套件</el-button>
  <el-table :data="pageData['content']" border style="margin-top: 15px">
    <el-table-column width="80" label="套件Id" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column min-width="280" prop="name" header-align="center" show-overflow-tooltip>
      <template #header>
        <el-input v-model="name" size="mini" @input="getTestSuiteList" placeholder="输入测试套件名称搜索"/>
      </template>
    </el-table-column>
    <el-table-column label="套件平台" min-width="110" align="center">
      <template #default="scope">
        {{ scope.row.platform }}
      </template>
    </el-table-column>
    <el-table-column
        label="模块并发线程"
        min-width="110"
        align="center"
        prop="moduleThread"
    >
    </el-table-column>

    <el-table-column
        label="用例并发线程"
        min-width="110"
        align="center"
        prop="caseThread"
    >
    </el-table-column>

    <el-table-column
        label="设备并发线程"
        min-width="110"
        align="center"
        prop="deviceThread"
    >
    </el-table-column>
    <el-table-column label="关联设备" width="130" align="center">
      <template #default="scope">
        <el-popover placement="left-top" width="400">
          <el-table
              max-height="350"
              :data="scope.row['devices']"
              style="width: 100%; margin-top: 10px"
              border
          >
            <el-table-column
                label="设备id"
                width="90"
                prop="id"
                align="center"
            >
            </el-table-column>
            <el-table-column
                label="设备名称"
                prop="name"
                header-align="center"
            >
            </el-table-column>
            <el-table-column
                label="设备型号"
                prop="name"
                header-align="center"
            >
            </el-table-column>
          </el-table>
          <template #reference>
            <el-button size="mini"
            >查看列表
            </el-button
            >
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="关联用例" width="130" align="center">
      <template #default="scope">
        <el-popover placement="left-top" width="400">
          <el-table
              max-height="350"
              :data="scope.row['testCases']"
              style="width: 100%; margin-top: 10px"
              border
          >
            <el-table-column
                label="用例id"
                width="90"
                prop="id"
                align="center"
            >
            </el-table-column>
            <el-table-column
                label="用例名称"
                prop="name"
                header-align="center"
            >
            </el-table-column>
          </el-table>
          <template #reference>
            <el-button size="mini"
            >查看列表
            </el-button
            >
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column width="250" fixed="right" label="操作" align="center">
      <template #default="scope">
        <el-button size="mini" type="success">运行</el-button>
        <el-button size="mini" type="primary" @click="editSuite(scope.row.id)">编辑</el-button>
        <el-popconfirm
            style="margin-left: 10px"
            confirmButtonText="确认"
            cancelButtonText="取消"
            @confirm="deleteSuite(scope.row.id)"
            icon="el-icon-warning"
            iconColor="red"
            title="确定删除该测试套件吗？套件下的用例将移出该套件"
        >
          <template #reference>
            <el-button type="danger" size="mini">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <pageable
      :isPageSet="true"
      :total="pageData['totalElements']"
      :current-page="pageData['number']+1"
      :page-size="pageData['size']"
      @change="getTestSuiteList"
  ></pageable>
</template>