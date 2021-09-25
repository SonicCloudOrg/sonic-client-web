<script setup>
import {onMounted, defineProps, ref} from "vue";
import {Tickets, QuestionFilled} from "@element-plus/icons";
import ElementSelect from './ElementSelect.vue'
import axios from "../http/axios";
import {ElMessage} from "element-plus";

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
  platform: props.platform,
  stepType: "",
  elements: [],
  text: "",
  content: "",
  error: 1
})
const stepForm = ref(null)
const changeType = (e) => {
  step.value.text = "";
  step.value.elements = [];
  step.value.content = "";
}
const emit = defineEmits(['flush']);
const summitStep = () => {
  stepForm['value'].validate((valid) => {
    if (valid) {
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
        || step.value.stepType === 'longPressPoint'
        || step.value.stepType === 'runBack'
        || step.value.stepType === 'longPress'
        || step.value.stepType === 'checkImage') {
      step.value.content = parseInt(step.value.content);
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
  if (props.stepId !== 0) {
    getStepInfo(props.stepId)
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
      <el-form-item
          prop="content"
          label="应用包名"
          :rules="{
            required: true,
            message: '包名不能为空',
            trigger: 'blur',
          }"
      >
        <el-input
            v-model="step.content"
            placeholder="请输入应用包名"
        ></el-input>
      </el-form-item>
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
        <div><strong style="color: #409EFF">忽略：</strong>忽略异常并继续执行</div>
        <div><strong style="color: #E6A23C">告警：</strong>标记警告并获取异常截图和异常堆栈，然后继续执行</div>
        <div><strong style="color: #F56C6C">中断：</strong>标记失败并获取异常截图、异常堆栈和测试录像，然后中断执行</div>
        <template #reference>
          <el-icon :size="18" style="vertical-align: middle;margin-left: 10px;">
            <QuestionFilled/>
          </el-icon>
        </template>
      </el-popover>
    </el-form-item>
  </el-form>

  <div style="text-align: center;margin-top: 20px">
    <el-button @click="summitStep" size="small" type="primary">提交</el-button>
  </div>
</template>