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
import { Tickets, QuestionFilled } from '@element-plus/icons';
import { ElMessage } from 'element-plus';
import ElementSelect from './ElementSelect.vue';
import GlobalParamsSelect from './GlobalParamsSelect.vue';
import axios from '../http/axios';

const props = defineProps({
  projectId: Number,
  caseId: Number,
  platform: Number,
  stepId: Number,
  parentId: Number,
});
const selectCondition = (e) => {
  step.value.error = 1;
};
const step = ref({
  id: null,
  caseId: props.caseId,
  parentId: 0,
  projectId: props.projectId,
  platform: props.platform,
  stepType: '',
  elements: [],
  text: '',
  conditionType: 0,
  content: '',
  error: 3,
});
const activityList = ref([{ name: '' }]);
const add = () => {
  activityList.value.push({ name: '' });
};
const delObj = (data) => {
  if (activityList.value.length === 0) {
    return;
  }
  for (const i in activityList.value) {
    const item = activityList.value[i];
    if (item == data) {
      activityList.value.splice(i, 1);
      break;
    }
  }
};
const switchPocoType = (e) => {
  switch (e) {
    case 'UNITY_3D':
    case 'UE4':
      step.value.text = '5001';
      break;
    case 'COCOS_2DX_JS':
    case 'COCOS_CREATOR':
    case 'EGRET':
      step.value.text = '5003';
      break;
    case 'COCOS_2DX_LUA':
      step.value.text = '15004';
      break;
    case 'COCOS_2DX_C_PLUS_1':
      step.value.text = '18888';
      break;
  }
};
const pocoTypeList = ref([
  {
    name: 'Unity3d',
    value: 'UNITY_3D',
    img: 'Unity',
  },
  {
    name: 'Egret',
    value: 'EGRET',
    img: 'Egret',
  },
  {
    name: 'UE4',
    value: 'UE4',
    img: 'UE4',
  },
  {
    name: 'Cocos2dx-js',
    value: 'COCOS_2DX_JS',
    img: 'Cocos2dx',
  },
  {
    name: 'Cocos2dx-lua',
    value: 'COCOS_2DX_LUA',
    img: 'Cocos2dx',
  },
  {
    name: 'Cocos2dx-c++',
    value: 'COCOS_2DX_C_PLUS_1',
    img: 'Cocos2dx',
  },
  {
    name: 'Cocos-creator',
    value: 'COCOS_CREATOR',
    img: 'Cocos2dx',
  },
]);
const monkey = ref({
  packageName: '',
  pctNum: 10,
  options: [
    {
      name: 'sleepTime',
      value: 500,
    },
    {
      name: 'tapEvent',
      value: 40,
    },
    {
      name: 'longPressEvent',
      value: 20,
    },
    {
      name: 'swipeEvent',
      value: 40,
    },
    {
      name: 'systemEvent',
      value: 5,
    },
    {
      name: 'navEvent',
      value: 5,
    },
    {
      name: 'isOpenH5Listener',
      value: true,
    },
    {
      name: 'isOpenPackageListener',
      value: true,
    },
    {
      name: 'isOpenActivityListener',
      value: true,
    },
    {
      name: 'isOpenNetworkListener',
      value: true,
    },
  ],
});
const monkeyOptions = {
  sleepTime: {
    label: '用户操作时延',
    des: '指定事件间的时延，单位ms',
  },
  tapEvent: {
    label: '轻触事件权重',
    des: '随机坐标轻触',
  },
  longPressEvent: {
    label: '长按事件权重',
    des: '随机坐标长按1～3秒',
  },
  swipeEvent: {
    label: '滑动事件权重',
    des: '随机两个坐标滑动',
  },
  systemEvent: {
    label: '物理按键事件权重',
    des: 'Home、返回键等等',
  },
  navEvent: {
    label: '系统导航事件权重',
    des: '随机开关WIFI',
  },
  isOpenH5Listener: {
    label: 'H5页面监听器',
    des: '检测是否长时间停留在H5页面',
  },
  isOpenPackageListener: {
    label: '应用包名监听器',
    des: '检测当前应用是否为被测应用',
  },
  isOpenActivityListener: {
    label: '黑名单Activity监听器',
    des: '检测当前Activity是否在黑名单内',
  },
  isOpenNetworkListener: {
    label: '网络状态监听器',
    des: '检测设备是否处于飞行模式和WIFI网络',
  },
};
const stepForm = ref(null);
const changeType = (e) => {
  step.value.text = '';
  step.value.elements = [];
  step.value.content = '';
  activityList.value = [{ name: '' }];
  if (
    step.value.stepType === 'iteratorAndroidElement' ||
    step.value.stepType === 'iteratorIOSElement' ||
    step.value.stepType === 'iteratorPocoElement'
  ) {
    step.value.conditionType = 4;
  }
};
const isShowInputNumber = (data) => {
  if (
    data === 'isOpenH5Listener' ||
    data === 'isOpenPackageListener' ||
    data === 'isOpenActivityListener' ||
    data === 'isOpenNetworkListener'
  ) {
    return false;
  }
  return true;
};
const attrList = ref([]);
const removeEmpty = (data) => {
  for (const i in data) {
    const item = data[i];
    if (item.name === '') {
      data.splice(i, 1);
    }
  }
};
const offsets = ref({
  offsetWidth: 0,
  offsetHeight: 0,
  windowWidth: 0,
  windowHeight: 0,
});
const emit = defineEmits(['flush']);
const summitStep = () => {
  stepForm.value.validate((valid) => {
    if (valid) {
      if (step.value.conditionType === 3) {
        step.value.stepType = '';
        step.value.text = '';
        step.value.elements = [];
        step.value.content = '';
        step.value.error = 1;
      } else if (step.value.stepType === 'monkey') {
        removeEmpty(activityList.value);
        step.value.text = JSON.stringify(activityList.value);
        step.value.content = JSON.stringify(monkey.value);
      } else if (step.value.stepType === 'setTheRealPositionOfTheWindow') {
        step.value.content = JSON.stringify(offsets.value);
      } else if (
        step.value.stepType === 'logElementAttr' ||
        step.value.stepType === 'logPocoElementAttr'
      ) {
        step.value.text = JSON.stringify(attrList.value);
      } else if (step.value.stepType === 'runScript') {
        if (step.value.text.length === 0) {
          step.value.text = 'Groovy';
        }
        if (step.value.content.length === 0) {
          step.value.content =
            'def test(){\n' +
            '      println "Hello world"\n' +
            '}\n' +
            '\n' +
            'test()\n';
        }
      }
      axios.put('/controller/steps', step.value).then((resp) => {
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
const getPublicStepList = () => {
  axios
    .get('/controller/publicSteps/findNameByProjectId', {
      params: {
        projectId: props.projectId,
        platform: props.platform,
      },
    })
    .then((resp) => {
      publicStepList.value = resp.data;
    });
};
const getStepInfo = (id) => {
  axios
    .get('/controller/steps', {
      params: {
        id,
      },
    })
    .then((resp) => {
      step.value = resp.data;
      if (
        step.value.stepType === 'pause' ||
        step.value.stepType === 'stepHold' ||
        step.value.stepType === 'longPressPoint' ||
        step.value.stepType === 'findElementInterval' ||
        step.value.stepType === 'setDefaultFindPocoElementInterval' ||
        step.value.stepType === 'longPress' ||
        step.value.stepType === 'checkImage'
      ) {
        step.value.content = parseInt(step.value.content);
      }
      if (
        step.value.stepType === 'findElementInterval' ||
        step.value.stepType === 'setDefaultFindPocoElementInterval'
      ) {
        step.value.text = parseInt(step.value.text);
      }
      if (step.value.stepType === 'install') {
        if (step.value.content === '') {
          step.value.content = 1;
        } else {
          step.value.content = parseInt(step.value.content);
        }
      }
      if (step.value.stepType === 'setTheRealPositionOfTheWindow') {
        offsets.value = JSON.parse(step.value.content);
      }
      if (
        step.value.stepType === 'logElementAttr' ||
        step.value.stepType === 'logPocoElementAttr'
      ) {
        attrList.value = JSON.parse(step.value.text);
      }
      if (step.value.stepType === 'monkey') {
        monkey.value = JSON.parse(step.value.content);
        activityList.value = JSON.parse(step.value.text);
      }
    });
};
const publicStepList = ref([]);
const options = ref([]);
const androidOptions = ref([
  {
    label: '设备操作',
    value: 'system',
    children: [
      {
        value: 'rotateDevice',
        label: '屏幕交互',
        children: [
          {
            value: 'lock',
            label: '锁定屏幕',
          },
          {
            value: 'unLock',
            label: '解锁屏幕',
          },
          {
            value: 'screenSub',
            label: '左转屏幕',
          },
          {
            value: 'screenAdd',
            label: '右转屏幕',
          },
          {
            value: 'screenAbort',
            label: '关闭自动旋转',
          },
        ],
      },
      {
        value: 'interaction',
        label: '特殊交互',
        children: [
          {
            value: 'keyCode',
            label: '系统按键',
          },
          {
            value: 'keyCodeSelf',
            label: '系统按键（自定义）',
          },
          {
            value: 'sendKeyForce',
            label: 'Sonic输入法输入',
          },
          {
            value: 'closeKeyboard',
            label: '关闭Sonic输入法',
          },
        ],
      },
      {
        value: 'netWork',
        label: '网络相关',
        children: [
          {
            value: 'airPlaneMode',
            label: '切换飞行模式',
          },
          {
            value: 'wifiMode',
            label: '切换WIFI模式',
          },
          {
            value: 'locationMode',
            label: '切换位置服务',
          },
        ],
      },
    ],
  },
  {
    label: '应用操作',
    value: 'app',
    children: [
      {
        value: 'openApp',
        label: '打开应用',
      },
      {
        value: 'terminate',
        label: '终止应用',
      },
      {
        value: 'install',
        label: '安装应用',
      },
      {
        value: 'uninstall',
        label: '卸载应用',
      },
      {
        value: 'appReset',
        label: '清空App内存缓存',
      },
    ],
  },
  {
    label: '控件元素操作',
    value: 'element',
    children: [
      {
        label: '安卓原生控件',
        value: 'uiEle',
        children: [
          {
            value: 'findElementInterval',
            label: '设置查找控件策略',
          },
          {
            value: 'switchWindowMode',
            label: '切换窗口模式',
          },
          {
            value: 'switchVisibleMode',
            label: '切换Invisible控件展示',
          },
          {
            value: 'isExistEle',
            label: '判断控件元素是否存在',
          },
          {
            value: 'click',
            label: '点击控件元素',
          },
          {
            value: 'sendKeys',
            label: '输入文本',
          },
          {
            value: 'sendKeysByActions',
            label: '输入文本(Actions)',
          },
          {
            value: 'swipe2',
            label: '拖拽控件元素',
          },
          {
            value: 'longPress',
            label: '长按控件元素',
          },
          {
            value: 'clear',
            label: '清空输入框',
          },
          {
            value: 'getElementAttr',
            label: '验证控件属性',
          },
          {
            value: 'getTextValue',
            label: '获取文本',
          },
          {
            value: 'getText',
            label: '验证文本',
          },
          {
            value: 'logElementAttr',
            label: '日志输出控件信息',
          },
          {
            value: 'iteratorAndroidElement',
            label: '迭代控件列表',
          },
        ],
      },
      {
        label: '坐标控件',
        value: 'pointEle',
        children: [
          {
            value: 'tap',
            label: '点击坐标',
          },
          {
            value: 'longPressPoint',
            label: '长按坐标',
          },
          {
            value: 'swipe',
            label: '滑动拖拽',
          },
        ],
      },
      {
        label: 'WebView控件',
        value: 'webViewEle',
        children: [
          {
            value: 'toWebView',
            label: '切换WebView',
          },
          {
            value: 'toHandle',
            label: '切换Handle',
          },
          {
            value: 'isExistWebViewEle',
            label: '判断控件元素是否存在',
          },
          {
            value: 'webViewClick',
            label: '点击控件元素',
          },
          {
            value: 'webViewSendKeys',
            label: '输入文本',
          },
          {
            value: 'webViewClear',
            label: '清空输入框',
          },
          {
            value: 'getWebViewTextValue',
            label: '获取文本',
          },
          {
            value: 'getWebViewText',
            label: '验证文本',
          },
          {
            value: 'getTitle',
            label: '验证标题',
          },
          {
            value: 'getUrl',
            label: '验证网址',
          },
          {
            value: 'webViewRefresh',
            label: '刷新页面',
          },
          {
            value: 'webViewBack',
            label: '回退页面',
          },
        ],
      },
      {
        label: 'POCO控件',
        value: 'pocoEle',
        children: [
          {
            value: 'startPocoDriver',
            label: '启动PocoDriver',
          },
          {
            value: 'setDefaultFindPocoElementInterval',
            label: '设置查找控件策略',
          },
          {
            value: 'setTheRealPositionOfTheWindow',
            label: '设置偏移量',
          },
          {
            value: 'isExistPocoEle',
            label: '判断控件元素是否存在',
          },
          {
            value: 'pocoClick',
            label: '点击控件元素',
          },
          {
            value: 'pocoLongPress',
            label: '长按控件元素',
          },
          {
            value: 'pocoSwipe',
            label: '拖拽控件元素',
          },
          {
            value: 'freezeSource',
            label: '冻结控件树',
          },
          {
            value: 'thawSource',
            label: '解冻控件树',
          },
          {
            value: 'closePocoDriver',
            label: '关闭PocoDriver',
          },
          {
            value: 'getPocoElementAttr',
            label: '验证控件属性',
          },
          {
            value: 'getPocoTextValue',
            label: '获取文本',
          },
          {
            value: 'getPocoText',
            label: '验证文本',
          },
          {
            value: 'logPocoElementAttr',
            label: '日志输出控件信息',
          },
          {
            value: 'iteratorPocoElement',
            label: '迭代控件列表',
          },
        ],
      },
    ],
  },
  {
    label: '验证操作',
    value: 'check',
    children: [
      {
        value: 'getActivity',
        label: '验证Activity',
      },
      {
        value: 'assert',
        label: '自定义断言',
        children: [
          {
            value: 'assertEquals',
            label: '断言验证(相等)',
          },
          {
            value: 'assertTrue',
            label: '断言验证(包含)',
          },
          {
            value: 'assertNotTrue',
            label: '断言验证(不包含)',
          },
        ],
      },
    ],
  },
  {
    label: '图像操作',
    value: 'img',
    children: [
      {
        value: 'stepScreen',
        label: '获取截图',
      },
      {
        value: 'checkImage',
        label: '检测图像相似度',
      },
      {
        value: 'clickByImg',
        label: '图像定位并点击',
      },
      {
        value: 'readText',
        label: '图像文字识别（暂时关闭）',
        disabled: true,
      },
    ],
  },
  {
    label: '特殊操作',
    value: 'spec',
    children: [
      {
        value: 'publicStep',
        label: '公共步骤',
      },
      {
        value: 'runScript',
        label: '自定义脚本',
      },
      {
        value: 'monkey',
        label: '随机事件',
      },
      {
        value: 'traverse',
        label: '遍历页面(暂未开放)',
        disabled: true,
      },
      {
        value: 'pause',
        label: '强制等待',
      },
    ],
  },
  {
    label: '运行设置',
    value: 'settings',
    children: [
      {
        value: 'stepHold',
        label: '步骤间隔设置',
      },
      {
        value: 'switchTouchMode',
        label: '触控模式设置',
      },
    ],
  },
]);
const iOSOptions = ref([
  {
    label: '设备操作',
    value: 'system',
    children: [
      {
        value: 'rotateDevice',
        label: '屏幕交互',
        children: [
          {
            value: 'lock',
            label: '锁定屏幕',
          },
          {
            value: 'unLock',
            label: '解锁屏幕',
          },
        ],
      },
      {
        value: 'specaction',
        label: '特殊交互',
        children: [
          {
            value: 'siriCommand',
            label: 'Siri指令',
          },
          {
            value: 'sendKeyForce',
            label: '键盘输入',
          },
        ],
      },
      {
        value: 'interaction',
        label: '物理交互',
        children: [
          {
            value: 'keyCode',
            label: '系统按键',
          },
        ],
      },
      {
        value: 'pasteboard',
        label: '剪切板管理',
        children: [
          {
            value: 'setPasteboard',
            label: '设置文本',
          },
          {
            value: 'getPasteboard',
            label: '获取文本',
          },
        ],
      },
    ],
  },
  {
    label: '应用操作',
    value: 'app',
    children: [
      {
        value: 'openApp',
        label: '打开应用',
      },
      {
        value: 'terminate',
        label: '终止应用',
      },
      {
        value: 'install',
        label: '安装应用',
      },
      {
        value: 'uninstall',
        label: '卸载应用',
      },
      {
        value: 'runBack',
        label: '后台运行应用',
      },
    ],
  },
  {
    label: '控件元素操作',
    value: 'element',
    children: [
      {
        label: 'iOS原生控件',
        value: 'xcEle',
        children: [
          {
            value: 'findElementInterval',
            label: '设置查找控件策略',
          },
          {
            value: 'isExistEle',
            label: '判断控件元素是否存在',
          },
          {
            value: 'click',
            label: '点击控件元素',
          },
          {
            value: 'sendKeys',
            label: '输入文本',
          },
          {
            value: 'swipe2',
            label: '拖拽控件元素',
          },
          {
            value: 'longPress',
            label: '长按控件元素',
          },
          {
            value: 'clear',
            label: '清空输入框',
          },
          {
            value: 'getElementAttr',
            label: '验证控件属性',
          },
          {
            value: 'getTextValue',
            label: '获取文本',
          },
          {
            value: 'getText',
            label: '验证文本',
          },
          {
            value: 'logElementAttr',
            label: '日志输出控件信息',
          },
          {
            value: 'iteratorIOSElement',
            label: '迭代控件列表',
          },
        ],
      },
      {
        label: '坐标控件',
        value: 'pointEle',
        children: [
          {
            value: 'tap',
            label: '点击坐标',
          },
          {
            value: 'longPressPoint',
            label: '长按坐标',
          },
          {
            value: 'swipe',
            label: '滑动拖拽',
          },
        ],
      },
      {
        label: 'POCO控件',
        value: 'pocoEle',
        children: [
          {
            value: 'startPocoDriver',
            label: '启动PocoDriver',
          },
          {
            value: 'setDefaultFindPocoElementInterval',
            label: '设置查找控件策略',
          },
          {
            value: 'setTheRealPositionOfTheWindow',
            label: '设置偏移量',
          },
          {
            value: 'isExistPocoEle',
            label: '判断控件元素是否存在',
          },
          {
            value: 'pocoClick',
            label: '点击控件元素',
          },
          {
            value: 'pocoLongPress',
            label: '长按控件元素',
          },
          {
            value: 'pocoSwipe',
            label: '拖拽控件元素',
          },
          {
            value: 'freezeSource',
            label: '冻结控件树',
          },
          {
            value: 'thawSource',
            label: '解冻控件树',
          },
          {
            value: 'closePocoDriver',
            label: '关闭PocoDriver',
          },
          {
            value: 'getPocoElementAttr',
            label: '验证控件属性',
          },
          {
            value: 'getPocoTextValue',
            label: '获取文本',
          },
          {
            value: 'getPocoText',
            label: '验证文本',
          },
          {
            value: 'logPocoElementAttr',
            label: '日志输出控件信息',
          },
          {
            value: 'iteratorPocoElement',
            label: '迭代控件列表',
          },
        ],
      },
    ],
  },
  {
    label: '验证操作',
    value: 'check',
    children: [
      {
        value: 'assert',
        label: '自定义断言',
        children: [
          {
            value: 'assertEquals',
            label: '断言验证(相等)',
          },
          {
            value: 'assertTrue',
            label: '断言验证(包含)',
          },
          {
            value: 'assertNotTrue',
            label: '断言验证(不包含)',
          },
        ],
      },
    ],
  },
  {
    label: '图像操作',
    value: 'img',
    children: [
      {
        value: 'stepScreen',
        label: '获取截图',
      },
      {
        value: 'checkImage',
        label: '检测图像相似度',
      },
      {
        value: 'clickByImg',
        label: '图像定位并点击',
      },
      {
        value: 'readText',
        label: '图像文字识别（暂时关闭）',
        disabled: true,
      },
    ],
  },
  {
    label: '特殊操作',
    value: 'spec',
    children: [
      {
        value: 'publicStep',
        label: '公共步骤',
      },
      {
        value: 'runScript',
        label: '自定义脚本',
      },
      {
        value: 'monkey',
        label: '随机事件(暂未开放)',
        disabled: true,
      },
      {
        value: 'traverse',
        label: '遍历页面(暂未开放)',
        disabled: true,
      },
      {
        value: 'pause',
        label: '强制等待',
      },
    ],
  },
  {
    label: '运行设置',
    value: 'settings',
    children: [
      {
        value: 'stepHold',
        label: '步骤间隔设置',
      },
    ],
  },
]);
onMounted(() => {
  if (props.platform === 1) {
    options.value = androidOptions.value;
  }
  if (props.platform === 2) {
    options.value = iOSOptions.value;
  }
  if (props.stepId !== 0) {
    getStepInfo(props.stepId);
  }
  if (props.parentId !== 0) {
    step.value.parentId = props.parentId;
  }
  getPublicStepList();
});
</script>

<template>
  <el-form
    ref="stepForm"
    label-position="left"
    class="demo-table-expand"
    label-width="90px"
    :model="step"
    size="small"
  >
    <div v-if="step.conditionType !== 3">
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
          v-model="step.stepType"
          filterable
          style="width: 100%"
          size="small"
          placeholder="请填写步骤类型"
          :options="options"
          :props="{ emitPath: false, expandTrigger: 'hover' }"
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
        <Tickets />
      </el-icon>
    </el-divider>

    <div v-if="step.conditionType !== 3">
      <div v-if="step.stepType === 'keyCodeSelf'">
        <el-form-item
          label="按键Code"
          :rules="[
            { required: true, message: '请输入按键Code', trigger: 'blur' },
          ]"
          prop="content"
        >
          <el-input
            v-model="step.content"
            placeholder="请输入按键Code"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'keyCode'">
        <el-form-item
          label="系统按键"
          :rules="[
            { required: true, message: '请选择系统按键', trigger: 'change' },
          ]"
          prop="content"
        >
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

      <div v-if="step.stepType === 'switchTouchMode'">
        <el-form-item
          label="触控模式"
          :rules="[
            {
              required: true,
              message: '请选择触控模式，默认为APK触控',
              trigger: 'change',
            },
          ]"
          prop="content"
        >
          <el-select v-model="step.content" placeholder="请选择触控模式">
            <el-option value="SONIC_APK"></el-option>
            <el-option value="ADB"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'tap'">
        <element-select
          label="坐标控件"
          place="请选择坐标控件元素"
          :index="0"
          :project-id="projectId"
          type="point"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'longPressPoint'">
        <element-select
          label="坐标控件"
          place="请选择坐标控件元素"
          :index="0"
          :project-id="projectId"
          type="point"
          :step="step"
        />
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
        <element-select
          label="从控件"
          place="请选择坐标控件元素"
          :index="0"
          :project-id="projectId"
          type="point"
          :step="step"
        />
        <element-select
          label="拖拽到"
          place="请选择坐标控件元素"
          :index="1"
          :project-id="projectId"
          type="point"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'pocoClick'">
        <element-select
          label="POCO控件"
          place="请选择POCO控件元素"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'pocoLongPress'">
        <element-select
          label="POCO控件"
          place="请选择POCO控件元素"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item label="长按时间">
          <el-input-number
            v-model="step.content"
            :min="100"
            :step="100"
          ></el-input-number>
          ms
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'pocoSwipe'">
        <element-select
          label="从控件"
          place="请选择坐标控件元素"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <element-select
          label="拖拽到"
          place="请选择坐标控件元素"
          :index="1"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'startPocoDriver'">
        <el-form-item
          label="游戏引擎"
          prop="content"
          :rules="{
            required: true,
            message: '引擎不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content" @change="switchPocoType">
            <el-option
              v-for="item in pocoTypeList"
              :key="item.name"
              :value="item.value"
              :label="item.name"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="通信端口"
          prop="text"
          :rules="{
            required: true,
            message: '端口不能为空',
            trigger: 'change',
          }"
        >
          <el-input
            v-model="step.text"
            style="width: 200px"
            placeholder="Default connect port"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'setTheRealPositionOfTheWindow'">
        <el-form-item
          label="offsetWidth"
          label-width="120"
          :rules="{
            required: true,
            message: 'offsetWidth不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="offsets.offsetWidth"
            placeholder="请输入offsetWidth"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="offsetHeight"
          label-width="120"
          :rules="{
            required: true,
            message: 'offsetHeight不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="offsets.offsetHeight"
            placeholder="请输入offsetHeight"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="windowWidth"
          label-width="120"
          :rules="{
            required: true,
            message: 'windowWidth不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="offsets.windowWidth"
            placeholder="请输入windowWidth"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="windowHeight"
          label-width="120"
          :rules="{
            required: true,
            message: 'windowHeight不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="offsets.windowHeight"
            placeholder="请输入windowHeight"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'isExistPocoEle'">
        <element-select
          label="POCO控件"
          place="请选择POCO控件元素"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item
          label="存在与否"
          prop="content"
          :rules="{
            required: true,
            message: '断言不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option label="存在" value="true"></el-option>
            <el-option label="不存在" value="false"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'openApp'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"
        />
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
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"
        />
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
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"
        />
        <el-form-item
          label="安装方式"
          prop="content"
          :rules="{
            required: true,
            message: '安装方式不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option label="自定义下载路径或本地安装" :value="1"></el-option>
            <el-option label="已有安装包列表安装" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="step.content === 1"
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
        <el-alert
          v-if="step.content === 2"
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 需要先接入Jenkins插件，并确认安装包管理有对应安装包。多个符合条件的安装包优先选择最新的安装。"
        />
        <el-form-item v-if="step.content === 2" prop="text" label="分支名称">
          <el-input
            v-model="step.text"
            placeholder="请输入分支名称，支持模糊匹配，可以为空"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'uninstall'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"
        />
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

      <div v-if="step.stepType === 'appReset'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"
        />
        <el-form-item
          prop="text"
          label="清空应用"
          :rules="{
            required: true,
            message: '包名不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="step.text"
            placeholder="请输入清空应用的App包名"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'toWebView'">
        <el-form-item label="包名">
          <el-input
            v-model="step.content"
            placeholder="请输入WebView所在包名"
          ></el-input>
        </el-form-item>
        <el-form-item label="进程名">
          <el-input
            v-model="step.text"
            placeholder="（可选）请输入WebView所在进程名，不输入默认为包名"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'toHandle'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: Handle相当于页面的Tab，切换WebView后找不到页面可以尝试切换Handle"
        />
        <el-form-item label="Handle信息">
          <el-input
            v-model="step.content"
            placeholder="请输入Handle页面标题 或 地址 或 index下标"
          ></el-input>
        </el-form-item>
      </div>

      <div
        v-if="
          step.stepType === 'isExistEle' ||
          step.stepType === 'isExistWebViewEle'
        "
      >
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item
          label="存在与否"
          prop="content"
          :rules="{
            required: true,
            message: '断言不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option label="存在" value="true"></el-option>
            <el-option label="不存在" value="false"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div
        v-if="
          step.stepType === 'airPlaneMode' ||
          step.stepType === 'wifiMode' ||
          step.stepType === 'locationMode'
        "
      >
        <el-form-item
          label="开启与否"
          prop="content"
          :rules="{
            required: true,
            message: '状态不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option label="开启" value="true"></el-option>
            <el-option label="关闭" value="false"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'switchWindowMode'">
        <el-form-item
          label="切换模式"
          prop="content"
          :rules="{
            required: true,
            message: '模式不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option label="多窗口模式" value="true"></el-option>
            <el-option label="单窗口模式" value="false"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'switchVisibleMode'">
        <el-form-item
          label="切换显示"
          prop="content"
          :rules="{
            required: true,
            message: '不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option label="显示" value="true"></el-option>
            <el-option label="隐藏" value="false"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'click' || step.stepType === 'webViewClick'">
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
      </div>

      <div
        v-if="
          step.stepType === 'sendKeys' || step.stepType === 'webViewSendKeys'
        "
      >
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"
        />
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item label="输入值">
          <el-input v-model="step.content" placeholder="请输入值"></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'sendKeyForce'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 本功能需要先唤醒系统键盘。需要临时变量或全局变量时，可以添加{{变量名}}的形式。"
        />
        <el-form-item label="输入值">
          <el-input v-model="step.content" placeholder="请输入值"></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'sendKeysByActions'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
        >
          <template #title>
            <div>
              TIPS: 使用Android Driver在Flutter页面输入文本时使用此方式。
            </div>
            <div>需要临时变量或全局变量时，可以添加{{ 变量名 }}的形式。</div>
          </template>
        </el-alert>
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item label="输入值">
          <el-input v-model="step.content" placeholder="请输入值"></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'swipe2'">
        <element-select
          label="从控件"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <element-select
          label="拖拽到"
          place="请选择控件元素"
          :index="1"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'longPress'">
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item label="长按时间">
          <el-input-number
            v-model="step.content"
            :min="100"
            :step="100"
          ></el-input-number>
          ms
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'clear' || step.stepType === 'webViewClear'">
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
      </div>

      <div
        v-if="
          step.stepType === 'getTextValue' ||
          step.stepType === 'getWebViewTextValue'
        "
      >
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 可以将获取的文本放入临时变量中"
        />
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item label="变量名">
          <el-input
            v-model="step.content"
            placeholder="请输入变量名"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getPocoTextValue'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 可以将获取的文本放入临时变量中"
        />
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item label="变量名">
          <el-input
            v-model="step.content"
            placeholder="请输入变量名"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'setPasteboard'">
        <el-form-item label="文本信息">
          <el-input
            v-model="step.content"
            placeholder="请输入设置的文本信息"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getPasteboard'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 获取的文本可放入临时变量中"
        />
        <el-form-item label="变量名">
          <el-input
            v-model="step.content"
            placeholder="请输入变量名"
          ></el-input>
        </el-form-item>
      </div>

      <div
        v-if="step.stepType === 'getText' || step.stepType === 'getWebViewText'"
      >
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item label="期望值">
          <el-input
            v-model="step.content"
            placeholder="请输入期望值"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getPocoText'">
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item label="期望值">
          <el-input
            v-model="step.content"
            placeholder="请输入期望值"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getTitle' || step.stepType === 'getUrl'">
        <el-form-item label="期望值">
          <el-input
            v-model="step.content"
            placeholder="请输入期望值"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getActivity'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"
        />
        <global-params-select
          label="期望值"
          place="请输入期望值或选择全局变量"
          :project-id="projectId"
          :step="step"
        />
      </div>

      <div
        v-if="
          step.stepType === 'logElementAttr' ||
          step.stepType === 'logPocoElementAttr'
        "
      >
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          :type="step.stepType === 'logElementAttr' ? 'normal' : 'poco'"
          :step="step"
        />
        <el-form-item
          label="控件属性"
          :rules="{
            required: true,
            message: '控件属性不能为空',
            trigger: 'change',
          }"
        >
          <el-select
            v-if="step.stepType === 'logPocoElementAttr'"
            v-model="attrList"
            label="目标属性"
            placeholder="请选择控件属性，可多选"
            multiple
          >
            <el-option value="layer"></el-option>
            <el-option value="name"></el-option>
            <el-option value="tag"></el-option>
            <el-option value="text"></el-option>
            <el-option value="texture"></el-option>
            <el-option value="_instanceId"></el-option>
            <el-option value="_ilayer"></el-option>
            <el-option value="type"></el-option>
            <el-option value="visible"></el-option>
            <el-option value="global"></el-option>
            <el-option value="local"></el-option>
            <el-option value="components"></el-option>
            <el-option value="anchorPoint"></el-option>
            <el-option value="scale"></el-option>
            <el-option value="size"></el-option>
            <el-option value="pos"></el-option>
            <el-option value="clickable"></el-option>
          </el-select>
          <el-select
            v-else-if="step.platform === 1"
            v-model="attrList"
            label="目标属性"
            placeholder="请选择控件属性，可多选"
            multiple
          >
            <el-option value="class"></el-option>
            <el-option value="password"></el-option>
            <el-option value="resource-id"></el-option>
            <el-option value="text"></el-option>
            <el-option value="content-desc"></el-option>
            <el-option value="package"></el-option>
            <el-option value="checkable"></el-option>
            <el-option value="checked"></el-option>
            <el-option value="clickable"></el-option>
            <el-option value="selected"></el-option>
            <el-option value="displayed"></el-option>
            <el-option value="enabled"></el-option>
            <el-option value="focusable"></el-option>
            <el-option value="focused"></el-option>
            <el-option value="long-clickable"></el-option>
            <el-option value="scrollable"></el-option>
            <el-option value="bounds"></el-option>
            <el-option value="extras"></el-option>
            <el-option value="contentSize"></el-option>
          </el-select>
          <el-select
            v-else
            v-model="attrList"
            label="目标属性"
            placeholder="请选择控件属性，可多选"
            multiple
          >
            <el-option value="UID"></el-option>
            <el-option value="accessibilityContainer"></el-option>
            <el-option value="accessible"></el-option>
            <el-option value="enabled"></el-option>
            <el-option value="index"></el-option>
            <el-option value="label"></el-option>
            <el-option value="name"></el-option>
            <el-option value="rect"></el-option>
            <el-option value="selected"></el-option>
            <el-option value="type"></el-option>
            <el-option value="visible"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getElementAttr'">
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item
          label="控件属性"
          prop="text"
          :rules="{
            required: true,
            message: '控件属性不能为空',
            trigger: 'change',
          }"
        >
          <el-select
            v-if="step.platform === 1"
            v-model="step.text"
            label="属性"
            placeholder="请选择控件属性"
          >
            <el-option value="checkable"></el-option>
            <el-option value="checked"></el-option>
            <el-option value="clickable"></el-option>
            <el-option value="selected"></el-option>
            <el-option value="displayed"></el-option>
            <el-option value="enabled"></el-option>
            <el-option value="focusable"></el-option>
            <el-option value="focused"></el-option>
            <el-option value="long-clickable"></el-option>
            <el-option value="scrollable"></el-option>
          </el-select>
          <el-select
            v-else
            v-model="step.text"
            label="属性"
            placeholder="请选择控件属性"
          >
            <el-option value="enabled"></el-option>
            <el-option value="visible"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="期望值"
          prop="content"
          :rules="{
            required: true,
            message: '断言不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option label="true" value="true"></el-option>
            <el-option label="false" value="false"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getPocoElementAttr'">
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item
          label="控件属性"
          prop="text"
          :rules="{
            required: true,
            message: '控件属性不能为空',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="step.text"
            label="属性"
            placeholder="请选择控件属性"
          >
            <el-option value="type"></el-option>
            <el-option value="name"></el-option>
            <el-option value="clickable"></el-option>
            <el-option value="visible"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="期望值" prop="content">
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
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 可使用{{变量名}}将全局变量或临时变量插入，验证时将替换该内容为变量值"
        />
        <el-form-item label="真实值">
          <el-input v-model="step.text" placeholder="请输入真实值"></el-input>
        </el-form-item>
        <el-form-item label="期望值">
          <el-input
            v-model="step.content"
            placeholder="请输入期望值"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'clickByImg'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 默认按顺序使用SIFT特征匹配、AKAZE特征匹配和模板匹配算法"
        />
        <element-select
          label="控件截图"
          place="请选择控件元素截图"
          :index="0"
          :project-id="projectId"
          type="image"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'readText'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 默认语言包只有简体中文和英文，需要额外添加可以咨询管理员。"
        />
        <el-form-item
          prop="content"
          label="识别语言"
          :rules="{
            required: true,
            message: '语言类型不能为空',
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content" placeholder="请选择识别语言类型">
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
            v-model="step.text"
            type="text"
            placeholder="请输入期望包含的文本内容"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'checkImage'">
        <element-select
          label="页面截图"
          place="请选择页面截图"
          :index="0"
          :project-id="projectId"
          type="image"
          :step="step"
        />
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
        <el-form-item
          label="公共步骤"
          prop="text"
          :rules="{
            required: true,
            message: '公共步骤不能为空',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="step.text"
            placeholder="请选择公共步骤"
            no-data-text="该项目暂未添加公共步骤"
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
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          title="TIPS: 设置后从该步骤开始，后面的每个步骤都会按照设置值来间隔。"
        />
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

      <div
        v-if="
          step.stepType === 'findElementInterval' ||
          step.stepType === 'setDefaultFindPocoElementInterval'
        "
      >
        <el-form-item label="重试次数">
          <el-input-number
            v-model="step.content"
            :min="0"
            :step="1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="重试间隔">
          <el-input-number
            v-model="step.text"
            :min="0"
            :step="500"
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
              v-model="monkey.packageName"
              size="small"
              type="text"
              placeholder="请输入测试包名"
            ></el-input>
          </el-form-item>
          <el-form-item label="事件数量">
            <el-input-number
              v-model="monkey.pctNum"
              style="width: 100%"
              size="small"
              :min="10"
              :step="10"
            ></el-input-number>
          </el-form-item>
          <el-form-item style="margin-top: 10px" label="事件配置">
            <el-tabs type="border-card" stretch>
              <el-tab-pane label="详细配置">
                <el-table :data="monkey.options" border :show-header="false">
                  <el-table-column>
                    <template #default="scope">
                      <el-popover
                        placement="top"
                        :width="200"
                        trigger="hover"
                        :content="monkeyOptions[scope.row.name].des"
                      >
                        <template #reference>
                          <div>{{ monkeyOptions[scope.row.name].label }}</div>
                        </template>
                      </el-popover>
                    </template>
                  </el-table-column>
                  <el-table-column width="190" align="center">
                    <template #default="scope">
                      <el-input-number
                        v-if="isShowInputNumber(scope.row.name)"
                        v-model="scope.row.value"
                        style="width: 100%"
                        size="small"
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
                <el-table :data="activityList" border :show-header="false">
                  <el-table-column>
                    <template #default="scope">
                      <el-input
                        v-model="scope.row.name"
                        placeholder="Please input"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column width="80" align="center">
                    <template #default="scope">
                      <el-button
                        type="danger"
                        size="mini"
                        @click="delObj(scope.row)"
                        >删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div style="text-align: center; margin-top: 10px">
                  <el-button size="mini" @click="add()">新增</el-button>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="step.stepType === 'runScript'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
        >
          <template #title>
            <span
              >TIPS: 保存后直接在步骤列表编辑脚本，关于脚本的使用，可参考
              <a
                href="https://sonic-cloud.cn/document?tag=runScript"
                target="_blank"
              >
                使用文档
              </a>
            </span>
          </template>
        </el-alert>
      </div>

      <div
        v-if="
          step.stepType === 'iteratorAndroidElement' ||
          step.stepType === 'iteratorIOSElement'
        "
      >
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          title="TIPS: 用于迭代操作控件列表，子步骤中引用【当前迭代控件】以操作列表中的控件"
          type="info"
        />
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
          :ignore-iterator="true"
        />
      </div>

      <div v-if="step.stepType === 'iteratorPocoElement'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          title="TIPS: 用于迭代操作控件列表，子步骤中引用【当前迭代控件】以操作列表中的控件"
          type="info"
        />
        <element-select
          label="控件元素"
          place="请选择控件元素"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
          :ignore-iterator="true"
        />
      </div>
    </div>

    <el-form-item label="逻辑处理">
      <el-select
        v-model="step.conditionType"
        placeholder="请选择逻辑条件"
        :disabled="
          step.stepType === 'iteratorAndroidElement' ||
          step.stepType === 'iteratorIOSElement' ||
          step.stepType === 'iteratorPocoElement'
        "
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
        <p>意为该测试步骤关联的逻辑处理</p>
        <div>
          <strong style="color: #409eff">if：</strong
          >该步骤无异常时，会执行子步骤
        </div>
        <div>
          <strong style="color: #e6a23c">eles if：</strong
          >如果上一个if条件步骤有异常，则进入该逻辑判断，无异常时会执行子步骤
        </div>
        <div>
          <strong style="color: #f56c6c">else：</strong
          >如果以上条件全失败，则执行子步骤
        </div>
        <div>
          <strong style="color: #67c23a">while：</strong
          >如果条件无异常，则重复执行子步骤
        </div>
        <template #reference>
          <el-icon :size="18" style="vertical-align: middle; margin-left: 10px">
            <QuestionFilled />
          </el-icon>
        </template>
      </el-popover>
    </el-form-item>

    <div v-if="step.conditionType === 0">
      <el-form-item label="异常处理">
        <el-select v-model="step.error" placeholder="请选择异常处理方案">
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
          <p>意为该测试步骤出现异常时的处理方案</p>
          <div>
            <strong style="color: #409eff">忽略：</strong
            >忽略异常并继续执行（逻辑处理时不抛出异常）
          </div>
          <div>
            <strong style="color: #e6a23c">告警：</strong
            >标记警告并获取异常截图和异常堆栈，然后继续执行（逻辑处理时不抛出异常）
          </div>
          <div>
            <strong style="color: #f56c6c">中断：</strong
            >标记失败并获取异常截图、异常堆栈和测试录像，然后中断执行（逻辑处理时抛出异常）
          </div>
          <template #reference>
            <el-icon
              :size="18"
              style="vertical-align: middle; margin-left: 10px"
            >
              <QuestionFilled />
            </el-icon>
          </template>
        </el-popover>
      </el-form-item>
    </div>
  </el-form>

  <div style="text-align: center; margin-top: 20px">
    <el-button size="small" type="primary" @click="summitStep">提交</el-button>
  </div>
</template>
