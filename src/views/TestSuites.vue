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
const agentList = ref([])
const platformList = [{name: "安卓", value: 1, img: "ANDROID"}
  , {name: "iOS（暂不开放）", value: 2, img: "IOS", disabled: true}
  , {name: "WEB（暂不开放）", value: 5, img: "chrome", disabled: true}]
const deviceData = ref({})
const devicePageSize = ref(10)
const getDevice = (pageNum, pSize) => {
  axios
      .get("/controller/devices/list", {
        params: {
          page: pageNum || 1,
          pageSize: pSize || devicePageSize.value
        },
      })
      .then((resp) => {
        if (resp['code'] === 2000) {
          deviceData.value = resp.data;
        }
      });
}
const findAgentById = (id) => {
  let result = '未知'
  for (let i in agentList.value) {
    if (agentList.value[i].id === id) {
      result = agentList.value[i].name
      break
    }
  }
  return result
}
const getAllAgents = () => {
  axios
      .get("/controller/agents/list").then((resp) => {
    agentList.value = resp.data
  })
}
const getTestSuiteList = () => {

}
const deleteSuite = (id) => {

}
const editSuite = (id) => {

}
onMounted(() => {
  getDevice()
  getAllAgents()
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="测试套件信息" width="90%">
    <el-row>
      <el-col :span="10">
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
                v-model="testSuite.platform"
                placeholder="请选择平台"
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
        </el-form>
      </el-col>
      <el-col :span="14">
        <el-table
            ref="multipleTable"
            :data="deviceData['content']"
            style="width: 100%"
            border
        >
          <el-table-column align="center" type="selection" width="35"/>
          <el-table-column label="设备图片" align="center" width="80">
            <template #default="scope">
              <el-image
                  style="
                      position: absolute;
                      top: 7px;
                      bottom: 7px;
                      left: 7px;
                      right: 7px;
                      margin: auto;
                    "
                  fit="contain"
                  :src="getImg(scope.row.model)"
                  :preview-src-list="[getImg(scope.row.model)]"
                  hide-on-click-modal
              >
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="设备序列号" align="center" prop="udId" show-overflow-tooltip/>
          <el-table-column label="设备型号" align="center" prop="model" width="120"/>
          <el-table-column label="制造商" align="center" width="120">
            <template #default="scope">
              <img
                  v-if="
                  scope.row.manufacturer === 'HUAWEI' || scope.row.manufacturer === 'samsung' || scope.row.manufacturer === 'OnePlus'||scope.row.manufacturer === 'GIONEE'
                "
                  style="width: 80px"
                  :src="getImg(scope.row.manufacturer)"
              />
              <img
                  v-else-if="scope.row.manufacturer === 'Xiaomi' ||scope.row.manufacturer === 'APPLE'"
                  style="width: 30px"
                  :src="getImg(scope.row.manufacturer)"
              />
              <img
                  v-else
                  style="width: 70px"
                  :src="getImg(scope.row.manufacturer)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <div style="text-align: center;margin-top: 20px">
      <el-button @click="summit" size="small" type="primary">提交</el-button>
    </div>
  </el-dialog>
  <el-button size="mini" round type="primary" @click="dialogVisible = true">添加测试套件</el-button>
  <el-table :data="pageData['content']" border style="margin-top: 15px">
    <el-table-column width="80" label="套件Id" prop="id" align="center" show-overflow-tooltip/>
    <el-table-column min-width="280" prop="name" header-align="center" show-overflow-tooltip>
      <template #header>
        <el-input v-model="name" size="mini" @input="getTestSuiteList()" placeholder="输入测试套件名称搜索"/>
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