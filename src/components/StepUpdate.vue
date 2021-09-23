<script setup>
import {onMounted, ref} from "vue";
import {Tickets} from "@element-plus/icons";
import ElementSelect from './ElementSelect.vue'

const props = defineProps({
  projectId: Number,
  caseId: Number,
  platform: Number,
  stepId: Number
})
const step = ref({
  id: null,
  caseId: props.caseId,
  projectId: props.projectId,
  stepType: "",
  elements: [],
  text: "",
  content: "",
  error: 1
})
const stepForm = ref(null)
const changeType = (e) => {
}
const summit = () => {
  stepForm['value'].validate((valid) => {
    console.log(valid)
  })
}
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
        value: "click",
        label: "点击控件元素",
      },
      {
        value: "sendKeys",
        label: "输入文本",
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
        label: "图像文字识别",
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
        value: "pause",
        label: "强制等待",
      }
    ],
  },
])
onMounted(() => {
  if (props.platform === 1) {
    options.value = androidOptions.value
  }
})
</script>
<template>
  <el-form
      label-position="left"
      class="demo-table-expand"
      label-width="80px"
      ref="stepForm"
      :model="step"
      size="small"
  >
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

    <el-divider>
      <el-icon :size="15">
        <Tickets/>
      </el-icon>
    </el-divider>

    <element-select v-if="step.stepType==='clickByImg'"
                    label="控件截图" place="请选择控件元素截图"
                    :index="0" :step="step"/>

    <div v-if="step.stepType === 'readText'">
      <div style="font-size: 13px; color: #999;margin-bottom: 10px"
      >默认语言包只有简体中文和英文，需要额外添加可以咨询管理员。
      </div
      >
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

    <el-form-item
        prop="error"
        label="异常处理"
        :rules="{
            required: true,
            message: '异常处理不能为空',
            trigger: 'change',
          }"
    >
      <el-select
          v-model="step.error"
          placeholder="请选择异常处理方案"
      >
        <el-option label="忽略" :value="1"></el-option>
        <el-option label="告警" :value="2"></el-option>
        <el-option label="中断" :value="3"></el-option>
      </el-select>
    </el-form-item>
  </el-form>

  <div style="text-align: center;margin-top: 20px">
    <el-button @click="summit" size="small" type="primary">提交</el-button>
  </div>
</template>