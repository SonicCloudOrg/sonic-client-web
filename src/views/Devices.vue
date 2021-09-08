<template>
  <el-page-header
      @back="router.go(-1)"
      content="设备中心"
      style="margin-bottom: 10px"
  >
  </el-page-header>

  <el-card :body-style="{ padding: '10px' }">
    <el-form
        label-position="left"
        class="demo-table-expand"
        label-width="90px"
        style="margin-left: 20px"
    >
      <el-form-item label="安卓系统">
        <el-checkbox
            label="全选"
            style="float: left; margin-right: 20px"
            :indeterminate="isAllAndroid"
            v-model="checkAllAndroid"
            @change="handleAndroid"
        ></el-checkbox>
        <el-checkbox-group
            v-model="androidSystem"
            @change="handleCheckedAndroid"
        >
          <el-checkbox
              v-for="version in androidSystemVersion"
              :key="version"
              :label="version"
          ><el-image
              style="vertical-align: middle; width: 30px; margin-right: 5px"
              fit="contain"
              :src="getImg('ANDROID')"
          >
          </el-image
          >{{ version }}</el-checkbox
          >
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="iOS系统">
        <el-checkbox
            label="全选"
            style="float: left; margin-right: 20px"
            :indeterminate="isAlliOS"
            v-model="checkAlliOS"
            @change="handleiOS"
        ></el-checkbox>
        <el-checkbox-group v-model="iOSSystem" @change="handleCheckediOS">
          <el-checkbox
              v-for="version in iOSSystemVersion"
              :key="version"
              :label="version"
          >
            <el-image
                style="vertical-align: middle; width: 30px"
                fit="contain"
                :src="getImg('IOS')"
            >
            </el-image
            >{{ version }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="设备制造商">
        <el-checkbox
            label="全选"
            style="float: left; margin-right: 20px"
            :indeterminate="isAllMan"
            v-model="checkAllMan"
            @change="handleMan"
        ></el-checkbox>
        <el-checkbox-group
            v-model="checkMan"
            class="deviceRadio"
            @change="handleCheckedMan"
        >
          <el-checkbox v-for="man in manufacturer" :key="man" :label="man">
            <el-image
                v-if="
                  man === 'HUAWEI' || man === 'samsung' || man === 'OnePlus'
                "
                style="vertical-align: middle; width: 80px"
                fit="contain"
                :src="getImg(man)"
            >
            </el-image>
            <el-image
                v-else-if="man === 'Xiaomi'"
                style="vertical-align: middle; width: 30px"
                fit="contain"
                :src="getImg(man)"
            >
            </el-image>
            <el-image
                v-else-if="man === 'APPLE'"
                style="vertical-align: middle; width: 30px"
                fit="contain"
                :src="getImg(man)"
            >
            </el-image>
            <el-image
                v-else
                style="vertical-align: middle; width: 70px"
                fit="contain"
                :src="getImg(man)"
            >
            </el-image>
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="CPU处理器">
        <el-checkbox
            label="全选"
            style="float: left; margin-right: 20px"
            :indeterminate="isAllCpu"
            v-model="checkAllCpu"
            @change="handleCpu"
        ></el-checkbox>
        <el-checkbox-group v-model="cpu" @change="handleCheckedCpu">
          <el-checkbox v-for="c in cpus" :key="c" :label="c"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="屏幕分辨率">
        <el-checkbox
            label="全选"
            style="float: left; margin-right: 20px"
            :indeterminate="isAllSize"
            v-model="checkAllSize"
            @change="handleSize"
        ></el-checkbox>
        <el-checkbox-group v-model="size" @change="handleCheckedSize">
          <el-checkbox v-for="s in sizes" :key="s" :label="s"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="所在位置">
        <el-checkbox
            label="全选"
            style="float: left; margin-right: 20px"
            :indeterminate="isAllWebhost"
            v-model="checkAllWebHost"
            @change="handleWebhost"
        ></el-checkbox>
        <el-checkbox-group v-model="webHost" @change="handleCheckedWebhost">
          <el-checkbox
              v-for="agent in agentList"
              :key="agent"
              :label="agent.webHost"
          >{{ agent.agentName }}</el-checkbox
          >
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="设备状态">
        <el-checkbox
            label="全选"
            style="float: left; margin-right: 20px"
            :indeterminate="isAllStatus"
            v-model="checkAllStatus"
            @change="handleStatus"
        ></el-checkbox>
        <el-checkbox-group v-model="status" @change="handleCheckedStatus">
          <el-checkbox
              v-for="statusDevice in statusList"
              :key="statusDevice"
              :label="statusDevice.value"
          >{{ statusDevice.name }}</el-checkbox
          >
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="设备型号">
        <el-input
            style="width: 300px"
            v-model="name"
            type="text"
            size="mini"
            placeholder="输入要筛选的型号"
            maxlength="20"
            show-word-limit
            clearable
            @input="handleInput"
        >
        </el-input>
      </el-form-item>
    </el-form>

    <el-row :gutter="20">
      <div style="text-align: center">
        <el-divider class="deviceCardDivider">设备列表</el-divider>
      </div>
      <el-col
          :xs="12"
          :sm="12"
          :md="12"
          :lg="6"
          :xl="6"
          v-for="device in pageData.content"
          :key="device"
          style="margin-top: 20px"
      >
        <el-card
            shadow="hover"
            :body-style="{ padding: '10px 10px 15px 10px' }"
            class="deviceCard"
        >
          <div slot="header">
              <span v-if="device.deviceName">{{
                  device.deviceName.length > 25
                      ? device.deviceName.substring(0, 17) + "..."
                      : device.deviceName
                }}</span>
            <el-tag
                size="mini"
                type="success"
                style="float: right"
                v-if="device.status === 'ONLINE'"
            >空闲中</el-tag
            >
            <el-tag
                size="mini"
                type="info"
                style="float: right"
                v-else-if="device.status === 'OFFLINE'"
            >已离线</el-tag
            >
            <el-tag
                size="mini"
                type="info"
                style="float: right"
                v-else-if="device.status === 'DISCONNECTED'"
            >已断开</el-tag
            >
            <el-tag
                size="mini"
                style="float: right"
                v-else-if="device.status === 'DEBUG'"
            >占用中</el-tag
            >
            <el-tag
                size="mini"
                style="float: right"
                v-else-if="device.status === 'SUITE'"
            >测试中</el-tag
            >
            <el-tag
                size="mini"
                type="danger"
                style="float: right"
                v-else-if="device.status === 'UNAUTHORIZED'"
            >未授权</el-tag
            >
            <el-tag
                size="mini"
                type="warning"
                style="float: right"
                v-else-if="device.status === 'ERROR'"
            >异常中</el-tag
            >
            <el-tag size="mini" style="float: right" type="warning" v-else
            >加载中</el-tag
            >
          </div>
          <el-row>
            <el-col :span="10">
              <el-image
                  style="height: 160px"
                  fit="contain"
                  :src="getPhoneImg(device.deviceName)"
                  :preview-src-list="[getPhoneImg(device.deviceName)]"
              >
              </el-image>
            </el-col>
            <el-col :span="14">
              <el-form
                  label-position="left"
                  class="device-form"
                  label-width="80px"
                  style="margin: 0 0 15px 10px"
              >
                <el-form-item label="设备名称">
                  <div>{{ device.name }}</div>
                </el-form-item>
                <el-form-item label="制造商">
                  <img
                      height="55%"
                      v-if="
                        device.manufacturer === 'Meizu' ||
                        device.manufacturer === 'vivo' ||
                        device.manufacturer === 'Yulong'
                      "
                      style="
                        position: absolute;
                        top: 11px;
                        bottom: 11px;
                        left: 0px;
                      "
                      :src="getImg(device.manufacturer)"
                  />
                  <img
                      height="75%"
                      v-else-if="
                        device.manufacturer === 'HUAWEI' ||
                        device.manufacturer === 'samsung' ||
                        device.manufacturer === 'OnePlus'
                      "
                      style="
                        position: absolute;
                        top: 10px;
                        bottom: 10px;
                        left: 0px;
                      "
                      :src="getImg(device.manufacturer)"
                  />
                  <img
                      height="90%"
                      v-else-if="device.manufacturer === 'Xiaomi'"
                      style="
                        position: absolute;
                        top: 7px;
                        bottom: 7px;
                        left: 0px;
                      "
                      :src="getImg(device.manufacturer)"
                  />
                  <img
                      height="95%"
                      v-else-if="device.manufacturer === 'APPLE'"
                      style="
                        position: absolute;
                        top: 7px;
                        bottom: 7px;
                        left: 0px;
                      "
                      :src="getImg(device.manufacturer)"
                  />
                  <img
                      height="110%"
                      v-else-if="device.manufacturer === 'OPPO'"
                      style="
                        position: absolute;
                        top: 7px;
                        bottom: 7px;
                        left: 0px;
                      "
                      :src="getImg(device.manufacturer)"
                  />
                  <img
                      height="80%"
                      v-else
                      style="
                        position: absolute;
                        top: 7px;
                        bottom: 7px;
                        left: 0px;
                      "
                      :src="getImg(device.manufacturer)"
                  />
                </el-form-item>
                <el-form-item label="设备系统">
                  <img
                      height="25px"
                      style="
                        position: absolute;
                        top: 7px;
                        bottom: 7px;
                        left: 0px;
                      "
                      :src="getImg(device.platform)"
                  />
                </el-form-item>
                <el-form-item label="系统版本">
                  <div>{{ device.version }}</div>
                </el-form-item>
                <el-form-item label="分辨率">
                  <div>{{ device.size }}</div>
                </el-form-item>
                <el-form-item label="所在位置">
                  <div>{{ findAgentByWebHost(device.webHost) }}</div>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <div style="text-align: center">
            <el-popover placement="right-end" width="350" trigger="hover">
              <el-form
                  label-position="left"
                  class="demo-table-expand"
                  label-width="90px"
                  style="margin-left: 10px; word-break: break-all"
                  v-if="device.id"
              >
                <el-form-item label="设备名称">
                  <span>{{ device.name }}</span>
                </el-form-item>
                <el-form-item label="设备型号">
                  <span>{{ device.deviceName }}</span>
                </el-form-item>
                <el-form-item label="设备UDID">
                  <span>{{ device.serialNum }}</span>
                </el-form-item>
                <el-form-item label="屏幕分辨率">
                  <span>{{ device.size }}</span>
                </el-form-item>
                <el-form-item label="SDK版本">
                  <span>{{ device.api }}</span>
                </el-form-item>
                <el-form-item label="CPU版本">
                  <span>{{ device.cpu }}</span>
                </el-form-item>
                <el-form-item label="安装密码">
                  <el-input
                      show-word-limit
                      v-model="device.password"
                      type="text"
                      size="mini"
                      placeholder="默认为cs123456"
                      maxlength="30"
                      style="position: absolute; top: 7px; bottom: 7px"
                  >
                    <el-button
                        slot="append"
                        size="mini"
                        @click="saveDevice(device)"
                    >保存</el-button
                    >
                  </el-input>
                </el-form-item>
                <el-form-item label="快捷操作">
                  <el-popconfirm
                      placement="top"
                      confirmButtonText="确认"
                      cancelButtonText="取消"
                      @confirm="
                        reboot(
                          device.webHost,
                          device.platform,
                          device.serialNum
                        )
                      "
                      icon="el-icon-warning"
                      iconColor="red"
                      title="确定重启该设备吗？"
                  >
                    <el-button
                        type="danger"
                        size="mini"
                        :disabled="
                          device.status !== 'ONLINE' &&
                          device.status !== 'DEBUG' &&
                          device.status !== 'SUITE' &&
                          device.status !== 'ERROR'
                        "
                        slot="reference"
                    >重启</el-button
                    >
                  </el-popconfirm>
                </el-form-item>
              </el-form>
              <el-button slot="reference" size="mini">更多信息</el-button>
            </el-popover>
          </div>
        </el-card>
      </el-col>
    </el-row>
<!--    <Pageable-->
<!--        :isPageSet="false"-->
<!--        :pagedata="pageData"-->
<!--        @changePage="findAll"-->
<!--    ></Pageable>-->
  </el-card>
</template>

<script setup>
import {ref,onMounted, onBeforeMount} from "vue";
const checkAllAndroid=ref( false);
    const isAllAndroid=ref( false);
  const  checkAlliOS = ref(false);
    isAlliOS: false,
    checkAllMan: false,
    isAllMan: false,
    checkAllCpu: false,
    isAllCpu: false,
    checkAllSize: false,
    isAllSize: false,
    checkAllWebHost: false,
    isAllWebhost: false,
    checkAllStatus: false,
    isAllStatus: false,
    pageData: {},
pageSize: 8,
    checkMan: [],
    name: "",
    androidSystem: [],
    iOSSystem: [],
    cpu: [],
    status: [],
    size: [],
    webHost: [],
    cpus: [],
    sizes: [],
    androidSystemVersion: [5, 6, 7, 8, 9, 10, 11, 12],
    iOSSystemVersion: [9, 10, 11, 12, 13, 14],
    manufacturer: [
  "APPLE",
  "HUAWEI",
  "Xiaomi",
  "OPPO",
  "vivo",
  "samsung",
  "Meizu",
  "Google",
  "OnePlus",
  "360",
  "Yulong",
],
    statusList: [
  {
    name: "空闲中",
    value: "ONLINE",
  },
  {
    name: "占用中",
    value: "DEBUG",
  },
  {
    name: "测试中",
    value: "SUITE",
  },
  {
    name: "已断开",
    value: "DISCONNECTED",
  },
  {
    name: "已离线",
    value: "OFFLINE",
  },
  {
    name: "未授权",
    value: "UNAUTHORIZED",
  },
  {
    name: "异常中",
    value: "ERROR",
  },
],
    agentList: [],
</script>