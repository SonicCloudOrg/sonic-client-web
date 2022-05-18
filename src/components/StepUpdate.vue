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
import {Tickets, QuestionFilled} from "@element-plus/icons";
import ElementSelect from './ElementSelect.vue'
import axios from "../http/axios";
import {ElMessage} from "element-plus";

const props = defineProps({
  projectId: Number,
  caseId: Number,
  platform: Number,
  stepId: Number,
  parentId: Number,
})
const selectCondition = (e) => {
  step.value.stepType = "";
  step.value.text = "";
  step.value.elements = [];
  step.value.content = "";
  step.value.error = 1;
  if (e === 3) {
    step.value.stepType = "else";
  }
}
const step = ref({
  id: null,
  caseId: props.caseId,
  parentId: 0,
  projectId: props.projectId,
  platform: props.platform,
  stepType: "",
  elements: [],
  text: "",
  conditionType: 0,
  content: "",
  error: 3
})
const activityList = ref([{name: ""}])
const add = () => {
  activityList.value.push({name: ""});
}
const delObj = (data) => {
  if (activityList.value.length === 0) {
    return;
  }
  for (let i in activityList.value) {
    const item = activityList.value[i];
    if (item == data) {
      activityList.value.splice(i, 1);
      break;
    }
  }
}
const monkey = ref({
  packageName: "",
  pctNum: 10,
  options: [
    {
      name: "sleepTime",
      value: 500,
    },
    {
      name: "tapEvent",
      value: 40,
    },
    {
      name: "longPressEvent",
      value: 20,
    },
    {
      name: "swipeEvent",
      value: 40,
    },
    {
      name: "zoomEvent",
      value: 10,
    },
    {
      name: "systemEvent",
      value: 5,
    },
    {
      name: "navEvent",
      value: 5,
    },
    {
      name: "isOpenH5Listener",
      value: true,
    },
    {
      name: "isOpenPackageListener",
      value: true,
    },
    {
      name: "isOpenActivityListener",
      value: true,
    },
    {
      name: "isOpenNetworkListener",
      value: true,
    },
  ],
})
const monkeyOptions = {
  sleepTime: {
    label: "用户操作时延",
    des: "指定事件间的时延，单位ms",
  },
  tapEvent: {
    label: "轻触事件权重",
    des: "随机坐标轻触",
  },
  longPressEvent: {
    label: "长按事件权重",
    des: "随机坐标长按1～3秒",
  },
  swipeEvent: {
    label: "滑动事件权重",
    des: "随机两个坐标滑动",
  },
  zoomEvent: {
    label: "多点触控事件权重",
    des: "随机双指放大或缩小",
  },
  systemEvent: {
    label: "物理按键事件权重",
    des: "Home、返回、音量控制键等等",
  },
  navEvent: {
    label: "系统导航事件权重",
    des: "随机开关WIFI、飞行模式、定位",
  },
  isOpenH5Listener: {
    label: "H5页面监听器",
    des: "检测是否长时间停留在H5页面",
  },
  isOpenPackageListener: {
    label: "应用包名监听器",
    des: "检测当前应用是否为被测应用",
  },
  isOpenActivityListener: {
    label: "黑名单Activity监听器",
    des: "检测当前Activity是否在黑名单内",
  },
  isOpenNetworkListener: {
    label: "网络状态监听器",
    des: "检测设备是否处于飞行模式和WIFI网络",
  },
}
const stepForm = ref(null)
const changeType = (e) => {
  step.value.text = "";
  step.value.elements = [];
  step.value.content = "";
  activityList.value = [{name: ""}]
}
const isShowInputNumber = (data) => {
  if (data === "isOpenH5Listener"
      || data === "isOpenPackageListener"
      || data === "isOpenActivityListener"
      || data === "isOpenNetworkListener") {
    return false;
  } else {
    return true;
  }
}
const removeEmpty = (data) => {
  for (let i in data) {
    const item = data[i];
    if (item.name === "") {
      data.splice(i, 1);
    }
  }
}
const emit = defineEmits(['flush']);
const summitStep = () => {
  stepForm['value'].validate((valid) => {
    if (valid) {
      if (step.value.stepType === 'monkey') {
        removeEmpty(activityList.value)
        step.value.text = JSON.stringify(activityList.value);
        step.value.content = JSON.stringify(monkey.value);
      }
      axios.put("/controller/steps", step.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit("flush");
        }
      })
    }
  })
}
const getPublicStepList = () => {
  axios.get("/controller/publicSteps/findNameByProjectId", {
    params: {
      projectId: props.projectId,
      platform: props.platform
    }
  }).then(resp => {
    publicStepList.value = resp.data
  })
}
const getStepInfo = (id) => {
  axios.get("/controller/steps", {
    params: {
      id
    }
  }).then(resp => {
    step.value = resp.data
    if (step.value.stepType === 'pause'
        || step.value.stepType === 'stepHold'
        || step.value.stepType === 'longPressPoint'
        || step.value.stepType === 'runBack'
        || step.value.stepType === 'longPress'
        || step.value.stepType === 'checkImage') {
      step.value.content = parseInt(step.value.content);
    }
    if (step.value.stepType === 'monkey') {
      monkey.value = JSON.parse(step.value.content);
      activityList.value = JSON.parse(step.value.text);
    }
  })
}
const publicStepList = ref([])
const options = ref([])
const androidOptions = ref([
  {
    label: "设备操作",
    value: "system",
    children: [
      {
        value: "rotateDevice",
        label: "屏幕交互",
        children: [
          {
            value: "lock",
            label: "锁定屏幕",
          },
          {
            value: "unLock",
            label: "解锁屏幕",
          },
          {
            value: "screenSub",
            label: "左转屏幕",
          },
          {
            value: "screenAdd",
            label: "右转屏幕",
          },
          {
            value: "screenAbort",
            label: "关闭自动旋转",
          },
        ],
      },
      {
        value: "interaction",
        label: "物理交互",
        children: [
          {
            value: "keyCode",
            label: "系统按键",
          },
          {
            value: "hideKey",
            label: "隐藏键盘",
          },
        ],
      },
      {
        value: "netWork",
        label: "网络相关",
        children: [
          {
            value: "airPlaneMode",
            label: "切换飞行模式",
          },
          {
            value: "wifiMode",
            label: "切换WIFI模式",
          },
          {
            value: "locationMode",
            label: "切换位置服务",
          },
        ],
      },
    ],
  },
  {
    label: "触控操作",
    value: "action",
    children: [
      {
        value: "tap",
        label: "点击坐标",
      },
      {
        value: "longPressPoint",
        label: "长按坐标",
      },
      {
        value: "swipe",
        label: "滑动拖拽",
      },
      {
        label: "多点触控",
        value: "zoom"
      },
    ],
  },
  {
    label: "应用操作",
    value: "app",
    children: [
      {
        value: "openApp",
        label: "打开应用",
      },
      {
        value: "terminate",
        label: "终止应用",
      },
      {
        value: "install",
        label: "安装应用",
      },
      {
        value: "uninstall",
        label: "卸载应用",
      },
      {
        value: "runBack",
        label: "后台运行应用",
      },
      {
        value: "toWebView",
        label: "切换WebView",
      },
      {
        value: "toHandle",
        label: "切换Handle",
      },
    ],
  },
  {
    label: "控件元素操作",
    value: "element",
    children: [
      {
        value: "isExistEle",
        label: "判断控件元素是否存在",
      },
      {
        value: "click",
        label: "点击控件元素",
      },
      {
        value: "sendKeys",
        label: "输入文本",
      },
      {
        value: "swipe2",
        label: "拖拽控件元素",
      },
      {
        value: "longPress",
        label: "长按控件元素",
      },
      {
        value: "clear",
        label: "清空输入框",
      },
      {
        value: "getTextValue",
        label: "获取文本",
      },
    ],
  },
  {
    label: "验证操作",
    value: "check",
    children: [
      {
        value: "getText",
        label: "验证文本",
      },
      {
        value: "getTitle",
        label: "验证标题",
      },
      {
        value: "assert",
        label: "自定义断言",
        children: [
          {
            value: "assertEquals",
            label: "断言验证(相等)",
          },
          {
            value: "assertTrue",
            label: "断言验证(包含)",
          },
          {
            value: "assertNotTrue",
            label: "断言验证(不包含)",
          },
        ],
      },
    ],
  },
  {
    label: "图像操作",
    value: "img",
    children: [
      {
        value: "stepScreen",
        label: "获取截图",
      },
      {
        value: "checkImage",
        label: "检测图像相似度",
      },
      {
        value: "clickByImg",
        label: "图像定位并点击",
      },
      {
        value: "readText",
        label: "图像文字识别（暂时关闭）",
        disabled: true
      },
    ],
  },
  {
    label: "特殊操作",
    value: "spec",
    children: [
      {
        value: "publicStep",
        label: "公共步骤",
      },
      {
        value: "monkey",
        label: "随机事件",
      },
      {
        value: "traverse",
        label: "遍历页面(暂未开放)",
        disabled: true
      },
      {
        value: "stepHold",
        label: "步骤间隔设置",
      },
      {
        value: "pause",
        label: "强制等待",
      }
    ],
  },
])
const iOSOptions = ref([
  {
    label: "设备操作",
    value: "system",
    children: [
      {
        value: "rotateDevice",
        label: "屏幕交互",
        children: [
          {
            value: "lock",
            label: "锁定屏幕",
          },
          {
            value: "unLock",
            label: "解锁屏幕",
          }
        ],
      },
      {
        value: "specaction",
        label: "特殊交互",
        children: [
          {
            value: "siriCommand",
            label: "Siri指令",
          },
        ],
      },
      {
        value: "interaction",
        label: "物理交互",
        children: [
          {
            value: "keyCode",
            label: "系统按键",
          },
          {
            value: "hideKey",
            label: "隐藏键盘",
          },
        ],
      },
    ],
  },
  {
    label: "触控操作",
    value: "action",
    children: [
      {
        value: "tap",
        label: "点击坐标",
      },
      {
        value: "longPressPoint",
        label: "长按坐标",
      },
      {
        value: "swipe",
        label: "滑动拖拽",
      },
      {
        label: "多点触控",
        value: "zoom"
      },
    ],
  },
  {
    label: "应用操作",
    value: "app",
    children: [
      {
        value: "openApp",
        label: "打开应用",
      },
      {
        value: "terminate",
        label: "终止应用",
      },
      {
        value: "install",
        label: "安装应用",
      },
      {
        value: "uninstall",
        label: "卸载应用",
      },
      {
        value: "runBack",
        label: "后台运行应用",
      },
    ],
  },
  {
    label: "控件元素操作",
    value: "element",
    children: [
      {
        value: "isExistEle",
        label: "判断控件元素是否存在",
      },
      {
        value: "click",
        label: "点击控件元素",
      },
      {
        value: "sendKeys",
        label: "输入文本",
      },
      {
        value: "swipe2",
        label: "拖拽控件元素",
      },
      {
        value: "longPress",
        label: "长按控件元素",
      },
      {
        value: "clear",
        label: "清空输入框",
      },
      {
        value: "getTextValue",
        label: "获取文本",
      },
    ],
  },
  {
    label: "验证操作",
    value: "check",
    children: [
      {
        value: "getText",
        label: "验证文本",
      },
      {
        value: "getTitle",
        label: "验证标题",
      },
      {
        value: "assert",
        label: "自定义断言",
        children: [
          {
            value: "assertEquals",
            label: "断言验证(相等)",
          },
          {
            value: "assertTrue",
            label: "断言验证(包含)",
          },
          {
            value: "assertNotTrue",
            label: "断言验证(不包含)",
          },
        ],
      },
    ],
  },
  {
    label: "图像操作",
    value: "img",
    children: [
      {
        value: "stepScreen",
        label: "获取截图",
      },
      {
        value: "checkImage",
        label: "检测图像相似度",
      },
      {
        value: "clickByImg",
        label: "图像定位并点击",
      },
      {
        value: "readText",
        label: "图像文字识别（暂时关闭）",
        disabled: true
      },
    ],
  },
  {
    label: "特殊操作",
    value: "spec",
    children: [
      {
        value: "publicStep",
        label: "公共步骤",
      },
      {
        value: "monkey",
        label: "随机事件(暂未开放)",
        disabled: true
      },
      {
        value: "traverse",
        label: "遍历页面(暂未开放)",
        disabled: true
      },
      {
        value: "stepHold",
        label: "步骤间隔设置",
      },
      {
        value: "pause",
        label: "强制等待",
      },
    ],
  },
])
onMounted(() => {
  if (props.platform === 1) {
    options.value = androidOptions.value
  }
  if (props.platform === 2) {
    options.value = iOSOptions.value
  }
  if (props.stepId !== 0) {
    getStepInfo(props.stepId)
  }
  if (props.parentId !== 0) {
    step.value.parentId = props.parentId;
  }
})
</script>
<template>
  <el-form
      label-position="left"
      class="demo-table-expand"
      label-width="90px"
      ref="stepForm"
      :model="step"
      size="small"
  >
    <div v-if="step.conditionType !==3">
      <el-form-item
          prop="stepType"
          label="步骤类型"
          :rules="{
            required: true,
            message: '请填写步骤类型',
            trigger: 'change',
          }"
      >
        <el-cascader
            filterable
            style="width: 100%"
            size="small"
            placeholder="请填写步骤类型"
            v-model="step.stepType"
            :options="options"
            :props="{ emitPath: false,expandTrigger: 'hover' }"
            @change="changeType"
        >
          <template #default="{ node, data }">
            <span>{{ data.label }}</span>
            <span v-if="!node.isLeaf">&nbsp;({{ data.children.length }})</span>
          </template>
        </el-cascader>
      </el-form-item>
    </div>

    <el-divider>
      <el-icon :size="15">
        <Tickets/>
      </el-icon>
    </el-divider>

    <div v-if="step.stepType === 'keyCode'">
      <el-form-item label="系统按键"
                    :rules="[
            { required: true, message: '请选择系统按键', trigger: 'change' },
          ]"
                    prop="content">
        <el-select
            v-if="platform === 1"
            v-model="step.content"
            placeholder="请选择系统按键"
        >
          <el-option-group label="常用按键">
            <el-option value="HOME"></el-option>
            <el-option value="BACK"></el-option>
            <el-option value="MENU"></el-option>
            <el-option value="APP_SWITCH"></el-option>
          </el-option-group>
          <el-option-group label="其他">
            <el-option value="ENTER"></el-option>
            <el-option value="DEL"></el-option>
            <el-option value="BRIGHTNESS_DOWN"></el-option>
            <el-option value="BRIGHTNESS_UP"></el-option>
            <el-option value="VOLUME_UP"></el-option>
            <el-option value="VOLUME_DOWN"></el-option>
            <el-option value="VOLUME_MUTE"></el-option>
            <el-option value="CAMERA"></el-option>
            <el-option value="CALL"></el-option>
            <el-option value="EXPLORER"></el-option>
            <el-option value="POWER"></el-option>
          </el-option-group>
        </el-select>
        <el-select
            v-if="platform === 2"
            v-model="step.content"
            placeholder="请选择系统按键"
        >
          <el-option value="home"></el-option>
          <el-option value="volumeup"></el-option>
          <el-option value="volumedown"></el-option>
        </el-select>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'tap'">
      <element-select label="坐标控件" place="请选择坐标控件元素"
                      :index="0" :project-id="projectId" type="point" :step="step"/>
    </div>

    <div v-if="step.stepType === 'longPressPoint'">
      <element-select label="坐标控件" place="请选择坐标控件元素"
                      :index="0" :project-id="projectId" type="point" :step="step"/>
      <el-form-item label="长按时间">
        <el-input-number
            v-model="step.content"
            :min="100"
            :step="100"
        ></el-input-number>
        ms
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'swipe'">
      <element-select label="从控件" place="请选择坐标控件元素"
                      :index="0" :project-id="projectId" type="point" :step="step"/>
      <element-select label="拖拽到" place="请选择坐标控件元素"
                      :index="1" :project-id="projectId" type="point" :step="step"/>
    </div>

    <div v-if="step.stepType === 'zoom'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 合理设置好坐标位置，可以实现双指放大或缩小操作"/>
      <element-select label="从控件" place="请选择坐标控件元素"
                      :index="0" :project-id="projectId" type="point" :step="step"/>
      <element-select label="移动到" place="请选择坐标控件元素"
                      :index="1" :project-id="projectId" type="point" :step="step"/>
      <element-select label="同时控件" place="请选择坐标控件元素"
                      :index="2" :project-id="projectId" type="point" :step="step"/>
      <element-select label="移动到" place="请选择坐标控件元素"
                      :index="3" :project-id="projectId" type="point" :step="step"/>
    </div>

    <div v-if="step.stepType === 'openApp'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"/>
      <el-form-item
          prop="text"
          label="打开应用"
          :rules="{
            required: true,
            message: '包名不能为空',
            trigger: 'blur',
          }"
      >
        <el-input
            v-model="step.text"
            placeholder="请输入启动的App包名"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'terminate'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"/>
      <el-form-item
          prop="text"
          label="终止应用"
          :rules="{
            required: true,
            message: '包名不能为空',
            trigger: 'blur',
          }"
      >
        <el-input
            v-model="step.text"
            placeholder="请输入终止的App包名"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'install'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"/>
      <el-form-item
          prop="text"
          label="安装路径"
          :rules="{
            required: true,
            message: '路径不能为空',
            trigger: 'blur',
          }"
      >
        <el-input
            v-model="step.text"
            placeholder="请输入App下载路径或本地apk路径"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'uninstall'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"/>
      <el-form-item
          prop="text"
          label="卸载应用"
          :rules="{
            required: true,
            message: '包名不能为空',
            trigger: 'blur',
          }"
      >
        <el-input
            v-model="step.text"
            placeholder="请输入卸载的App包名"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'runBack'">
      <el-form-item label="后台运行">
        <el-input-number
            v-model="step.content"
            :min="1000"
            :step="1000"
        ></el-input-number>
        ms
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'toWebView'">
      <el-form-item label="WebView">
        <el-input
            v-model="step.content"
            placeholder="请输入WebView名称"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'toHandle'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: Handle相当于页面的Tab，切换WebView后找不到页面可以尝试切换Handle"/>
      <el-form-item label="Handle标题">
        <el-input
            v-model="step.content"
            placeholder="请输入Handle页面标题的名称"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'isExistEle'">
      <element-select label="控件元素" place="请选择控件元素"
                      :index="0" :project-id="projectId" type="normal" :step="step"/>
      <el-form-item label="存在与否" prop="content" :rules="{
            required: true,
            message: '断言不能为空',
            trigger: 'change',
          }">
        <el-select v-model="step.content">
          <el-option label="存在" value="true"></el-option>
          <el-option label="不存在" value="false"></el-option>
        </el-select>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'click'">
      <element-select label="控件元素" place="请选择控件元素"
                      :index="0" :project-id="projectId" type="normal" :step="step"/>
    </div>

    <div v-if="step.stepType === 'sendKeys'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"/>
      <element-select label="控件元素" place="请选择控件元素"
                      :index="0" :project-id="projectId" type="normal" :step="step"/>
      <el-form-item label="输入值">
        <el-input
            v-model="step.content"
            placeholder="请输入值"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'swipe2'">
      <element-select label="从控件" place="请选择控件元素"
                      :index="0" :project-id="projectId" type="normal" :step="step"/>
      <element-select label="拖拽到" place="请选择控件元素"
                      :index="1" :project-id="projectId" type="normal" :step="step"/>
    </div>

    <div v-if="step.stepType === 'longPress'">
      <element-select label="控件元素" place="请选择控件元素"
                      :index="0" :project-id="projectId" type="normal" :step="step"/>
      <el-form-item label="长按时间">
        <el-input-number
            v-model="step.content"
            :min="100"
            :step="100"
        ></el-input-number>
        ms
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'clear'">
      <element-select label="控件元素" place="请选择控件元素"
                      :index="0" :project-id="projectId" type="normal" :step="step"/>
    </div>

    <div v-if="step.stepType === 'getTextValue'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 可以将获取的文本放入临时变量中"/>
      <element-select label="控件元素" place="请选择控件元素"
                      :index="0" :project-id="projectId" type="normal" :step="step"/>
      <el-form-item label="变量名">
        <el-input
            v-model="step.content"
            placeholder="请输入变量名"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'getText'">
      <element-select label="控件元素" place="请选择控件元素"
                      :index="0" :project-id="projectId" type="normal" :step="step"/>
      <el-form-item label="期望值">
        <el-input
            v-model="step.content"
            placeholder="请输入期望值"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'getTitle'">
      <el-form-item label="期望值">
        <el-input
            v-model="step.content"
            placeholder="请输入期望值"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'siriCommand'">
      <el-form-item label="siri指令">
        <el-input
            v-model="step.content"
            placeholder="请输入siri指令，例：what day is it today?"
        ></el-input>
      </el-form-item>
    </div>

    <div
        v-if="
          step.stepType === 'assertEquals' ||
          step.stepType === 'assertTrue' ||
          step.stepType === 'assertNotTrue'
        "
    >
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 可使用{{变量名}}将全局变量或临时变量插入，验证时将替换该内容为变量值"/>
      <el-form-item label="真实值">
        <el-input
            v-model="step.text"
            placeholder="请输入真实值"
        ></el-input>
      </el-form-item>
      <el-form-item label="期望值">
        <el-input
            v-model="step.content"
            placeholder="请输入期望值"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType==='clickByImg'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 默认按顺序使用SIFT特征匹配、AKAZE特征匹配和模板匹配算法"/>
      <element-select label="控件截图" place="请选择控件元素截图"
                      :index="0" :project-id="projectId" type="image" :step="step"/>
    </div>

    <div v-if="step.stepType === 'readText'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 默认语言包只有简体中文和英文，需要额外添加可以咨询管理员。"/>
      <el-form-item
          prop="content"
          label="识别语言"
          :rules="{
            required: true,
            message: '语言类型不能为空',
            trigger: 'change',
          }"
      >
        <el-select
            v-model="step.content"
            placeholder="请选择识别语言类型"
        >
          <el-option label="简体中文" value="chi_sim"></el-option>
          <el-option label="英文" value="eng"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
          prop="text"
          label="期望内容"
          :rules="{
            required: true,
            message: '期望文本不能为空',
            trigger: 'blur',
          }"
      >
        <el-input
            type="text"
            v-model="step.text"
            placeholder="请输入期望包含的文本内容"
        ></el-input>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'checkImage'">
      <element-select label="页面截图" place="请选择页面截图"
                      :index="0" :project-id="projectId" type="image" :step="step"/>
      <el-form-item label="期望相似度">
        <el-input-number
            v-model="step.content"
            :min="70"
            :step="1"
        ></el-input-number>
        %
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'publicStep'">
      <el-form-item label="公共步骤" prop="text" :rules="{
            required: true,
            message: '公共步骤不能为空',
            trigger: 'change',
          }">
        <el-select
            v-model="step.text"
            placeholder="请选择公共步骤"
            no-data-text="该项目暂未添加公共步骤"
            @visible-change="getPublicStepList"
        >
          <el-option
              v-for="item in publicStepList"
              :key="item.id"
              :label="item.name"
              :value="item.id + ''"
          ></el-option>
        </el-select>
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'stepHold'">
      <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
                title="TIPS: 设置后从该步骤开始，后面的每个步骤都会按照设置值来间隔。"/>
      <el-form-item label="步骤间隔">
        <el-input-number
            v-model="step.content"
            :min="0"
            :step="1000"
        ></el-input-number>
        ms
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'pause'">
      <el-form-item label="等待时间">
        <el-input-number
            v-model="step.content"
            :min="1000"
            :step="1000"
        ></el-input-number>
        ms
      </el-form-item>
    </div>

    <div v-if="step.stepType === 'monkey'">
      <el-form
          :model="monkey"
          label-position="left"
          label-width="90px"
          class="demo-table-expand"
          size="small"
      >
        <el-form-item label="测试包名">
          <el-input
              size="small"
              type="text"
              v-model="monkey.packageName"
              placeholder="请输入测试包名"
          ></el-input>
        </el-form-item>
        <el-form-item label="事件数量">
          <el-input-number
              style="width: 100%"
              size="small"
              v-model="monkey.pctNum"
              :min="10"
              :step="10"
          ></el-input-number>
        </el-form-item>
        <el-form-item style="margin-top: 10px" label="事件配置">
          <el-tabs type="border-card" stretch>
            <el-tab-pane label="详细配置">
              <el-table
                  :data="monkey.options"
                  border
                  :show-header="false"
              >
                <el-table-column>
                  <template #default="scope">
                    <el-popover
                        placement="top"
                        :width="200"
                        trigger="hover"
                        :content="monkeyOptions[scope.row.name].des"
                    >
                      <template #reference>
                        <div> {{ monkeyOptions[scope.row.name].label }}</div>
                      </template>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column width="190" align="center">
                  <template #default="scope">
                    <el-input-number
                        style="width: 100%"
                        size="small"
                        v-if="isShowInputNumber(scope.row.name)"
                        v-model="scope.row.value"
                        :min="0"
                        :step="10"
                    ></el-input-number>
                    <el-switch
                        v-else
                        v-model="scope.row.value"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                    >
                    </el-switch>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="Activity黑名单">
              <el-table
                  :data="activityList"
                  border
                  :show-header="false"
              >
                <el-table-column>
                  <template #default="scope">
                    <el-input v-model="scope.row.name" placeholder="Please input"/>
                  </template>
                </el-table-column>
                <el-table-column width="80" align="center">
                  <template #default="scope">
                    <el-button
                        type="danger"
                        size="mini"
                        @click="delObj(scope.row)"
                    >删除
                    </el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
              <div style="text-align: center;margin-top: 10px">
                <el-button
                    size="mini"
                    @click="add()"
                >新增
                </el-button
                >
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
      </el-form>
    </div>

    <el-form-item
        label="逻辑处理"
    >
      <el-select
          v-model="step.conditionType"
          placeholder="请选择逻辑条件"
          @change="selectCondition"
      >
        <el-option label="无" :value="0"></el-option>
        <el-option label="if" :value="1"></el-option>
        <el-option label="else if" :value="2"></el-option>
        <el-option label="else" :value="3"></el-option>
        <el-option label="while" :value="4"></el-option>
      </el-select>
      <el-popover
          placement="right-start"
          title="逻辑处理"
          :width="300"
          trigger="hover"
      >
        <p>
          意为该测试步骤关联的逻辑处理
        </p>
        <div><strong style="color: #409EFF">if：</strong>该步骤无异常时，会执行子步骤</div>
        <div><strong style="color: #E6A23C">eles if：</strong>如果上一个if条件步骤有异常，则进入该逻辑判断，无异常时会执行子步骤</div>
        <div><strong style="color: #F56C6C">else：</strong>如果以上条件全失败，则执行子步骤</div>
        <div><strong style="color: #67C23A">while：</strong>如果条件无异常，则重复执行子步骤</div>
        <template #reference>
          <el-icon :size="18" style="vertical-align: middle;margin-left: 10px;">
            <QuestionFilled/>
          </el-icon>
        </template>
      </el-popover>
    </el-form-item>

    <div v-if="step.conditionType===0">
      <el-form-item
          label="异常处理"
      >
        <el-select
            v-model="step.error"
            placeholder="请选择异常处理方案"
        >
          <el-option label="忽略" :value="1"></el-option>
          <el-option label="告警" :value="2"></el-option>
          <el-option label="中断" :value="3"></el-option>
        </el-select>
        <el-popover
            placement="right-start"
            title="异常处理"
            :width="300"
            trigger="hover"
        >
          <p>
            意为该测试步骤出现异常时的处理方案
          </p>
          <div><strong style="color: #409EFF">忽略：</strong>忽略异常并继续执行（逻辑处理时不抛出异常）</div>
          <div><strong style="color: #E6A23C">告警：</strong>标记警告并获取异常截图和异常堆栈，然后继续执行（逻辑处理时不抛出异常）</div>
          <div><strong style="color: #F56C6C">中断：</strong>标记失败并获取异常截图、异常堆栈和测试录像，然后中断执行（逻辑处理时抛出异常）</div>
          <template #reference>
            <el-icon :size="18" style="vertical-align: middle;margin-left: 10px;">
              <QuestionFilled/>
            </el-icon>
          </template>
        </el-popover>
      </el-form-item>
    </div>
  </el-form>

  <div style="text-align: center;margin-top: 20px">
    <el-button @click="summitStep" size="small" type="primary">提交</el-button>
  </div>
</template>