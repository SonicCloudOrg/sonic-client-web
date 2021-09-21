<script setup>
import {onMounted, ref} from "vue";

const dialogVisible = ref(false)
const step = ref({
  stepType: ""
})
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
        label: "Monkey随机事件",
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
const open = () => {
  dialogVisible.value = true
}
onMounted(() => {
  options.value = androidOptions.value
})
defineExpose({open})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="步骤信息">
    <el-cascader
        style="width: 100%"
        size="small"
        placeholder="请选择操作类型"
        v-model="step.stepType"
        :options="options"
        :props="{ emitPath: false,expandTrigger: 'hover' }"
    >
      <template #default="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf">({{ data.children.length }})</span>
      </template>
    </el-cascader>
  </el-dialog>
</template>