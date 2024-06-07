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
import { useI18n } from 'vue-i18n';
import ElementSelect from './ElementSelect.vue';
import GlobalParamsSelect from './GlobalParamsSelect.vue';
import axios from '../http/axios';

const { t: $t } = useI18n();

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
  disabled: 0,
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
      name: 'isOpenPackageListener',
      value: true,
    },
    {
      name: 'isOpenH5Listener',
      value: false,
    },
    {
      name: 'isOpenActivityListener',
      value: false,
    },
    {
      name: 'isOpenNetworkListener',
      value: false,
    },
  ],
});
const monkeyOptions = {
  sleepTime: {
    label: $t('stepDetail.label.monkeyOptions.sleepTime'),
    des: $t('stepDetail.des.monkeyOptions.sleepTime'),
  },
  tapEvent: {
    label: $t('stepDetail.label.monkeyOptions.tapEvent'),
    des: $t('stepDetail.des.monkeyOptions.tapEvent'),
  },
  longPressEvent: {
    label: $t('stepDetail.label.monkeyOptions.longPressEvent'),
    des: $t('stepDetail.des.monkeyOptions.longPressEvent'),
  },
  swipeEvent: {
    label: $t('stepDetail.label.monkeyOptions.swipeEvent'),
    des: $t('stepDetail.des.monkeyOptions.swipeEvent'),
  },
  systemEvent: {
    label: $t('stepDetail.label.monkeyOptions.systemEvent'),
    des: $t('stepDetail.des.monkeyOptions.systemEvent'),
  },
  navEvent: {
    label: $t('stepDetail.label.monkeyOptions.navEvent'),
    des: $t('stepDetail.des.monkeyOptions.navEvent'),
  },
  isOpenPackageListener: {
    label: $t('stepDetail.label.monkeyOptions.isOpenPackageListener'),
    des: $t('stepDetail.des.monkeyOptions.isOpenPackageListener'),
  },
  isOpenH5Listener: {
    label: $t('stepDetail.label.monkeyOptions.isOpenH5Listener'),
    des: $t('stepDetail.des.monkeyOptions.isOpenH5Listener'),
  },
  isOpenActivityListener: {
    label: $t('stepDetail.label.monkeyOptions.isOpenActivityListener'),
    des: $t('stepDetail.des.monkeyOptions.isOpenActivityListener'),
  },
  isOpenNetworkListener: {
    label: $t('stepDetail.label.monkeyOptions.isOpenNetworkListener'),
    des: $t('stepDetail.des.monkeyOptions.isOpenNetworkListener'),
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
// 当前步骤类型，是否需要展示ByActions的 alert 提示
const shouldShowByActionsTip = (stepType) => {
  return (
    stepType === 'sendKeysByActions' || stepType === 'webViewSendKeysByActions'
  );
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
        step.value.stepType === 'swipeByDefinedDirection' ||
        step.value.stepType === 'findElementInterval' ||
        step.value.stepType === 'setDefaultFindPocoElementInterval' ||
        step.value.stepType === 'setDefaultFindWebViewElementInterval' ||
        step.value.stepType === 'longPress' ||
        step.value.stepType === 'checkImage' ||
        step.value.stepType === 'setSnapshotMaxDepth' ||
        step.value.stepType === 'scrollToEle'
      ) {
        step.value.content = parseInt(step.value.content);
      }
      if (
        step.value.stepType === 'findElementInterval' ||
        step.value.stepType === 'setDefaultFindPocoElementInterval' ||
        step.value.stepType === 'setDefaultFindWebViewElementInterval' ||
        step.value.stepType === 'isExistEleNum' ||
        step.value.stepType === 'isExistWebViewEleNum' ||
        step.value.stepType === 'isExistPocoEleNum'
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
      if (
        step.value.stepType === 'assertText' ||
        step.value.stepType === 'assertWebViewText' ||
        step.value.stepType === 'assertPocoText'
      ) {
        step.value.content = JSON.parse(step.value.content);
        step.value.text = JSON.parse(step.value.text);
      }
    });
};
const publicStepList = ref([]);
const options = ref([]);
const androidOptions = ref([
  {
    label: $t('stepDetail.label.androidOptions.system.self'),
    value: 'system',
    children: [
      {
        value: 'rotateDevice',
        label: $t('stepDetail.label.androidOptions.system.rotateDevice.self'),
        children: [
          {
            value: 'lock',
            label: $t(
              'stepDetail.label.androidOptions.system.rotateDevice.lock'
            ),
          },
          {
            value: 'unLock',
            label: $t(
              'stepDetail.label.androidOptions.system.rotateDevice.unlock'
            ),
          },
          {
            value: 'screenSub',
            label: $t(
              'stepDetail.label.androidOptions.system.rotateDevice.screenSub'
            ),
          },
          {
            value: 'screenAdd',
            label: $t(
              'stepDetail.label.androidOptions.system.rotateDevice.screenAdd'
            ),
          },
          {
            value: 'screenAbort',
            label: $t(
              'stepDetail.label.androidOptions.system.rotateDevice.screenAbort'
            ),
          },
        ],
      },
      {
        value: 'keyboard',
        label: $t('stepDetail.label.androidOptions.system.keyboard.self'),
        children: [
          {
            value: 'sendKeyForce',
            label: $t(
              'stepDetail.label.androidOptions.system.keyboard.sendKeyForce'
            ),
          },
          {
            value: 'closeKeyboard',
            label: $t(
              'stepDetail.label.androidOptions.system.keyboard.closeKeyboard'
            ),
          },
          {
            value: 'setClipperByKeyboard',
            label: $t(
              'stepDetail.label.androidOptions.system.keyboard.setClipperByKeyboard'
            ),
          },
          {
            value: 'getClipperByKeyboard',
            label: $t(
              'stepDetail.label.androidOptions.system.keyboard.getClipperByKeyboard'
            ),
          },
        ],
      },
      {
        value: 'interaction',
        label: $t('stepDetail.label.androidOptions.system.interaction.self'),
        children: [
          {
            value: 'keyCode',
            label: $t(
              'stepDetail.label.androidOptions.system.interaction.keyCode'
            ),
          },
          {
            value: 'keyCodeSelf',
            label: $t(
              'stepDetail.label.androidOptions.system.interaction.keyCodeSelf'
            ),
          },
          {
            value: 'swipeByDefinedDirection',
            label: $t(
              'stepDetail.label.androidOptions.system.interaction.swipeByDefinedDirection'
            ),
          },
        ],
      },
      {
        value: 'netWork',
        label: $t('stepDetail.label.androidOptions.system.network.self'),
        children: [
          {
            value: 'airPlaneMode',
            label: $t(
              'stepDetail.label.androidOptions.system.network.airPlaneMode'
            ),
          },
          {
            value: 'wifiMode',
            label: $t(
              'stepDetail.label.androidOptions.system.network.wifiMode'
            ),
          },
          {
            value: 'locationMode',
            label: $t(
              'stepDetail.label.androidOptions.system.network.locationMode'
            ),
          },
        ],
      },
    ],
  },
  {
    label: $t('stepDetail.label.androidOptions.app.self'),
    value: 'app',
    children: [
      {
        value: 'openApp',
        label: $t('stepDetail.label.androidOptions.app.openApp'),
      },
      {
        value: 'terminate',
        label: $t('stepDetail.label.androidOptions.app.terminate'),
      },
      {
        value: 'install',
        label: $t('stepDetail.label.androidOptions.app.install'),
      },
      {
        value: 'uninstall',
        label: $t('stepDetail.label.androidOptions.app.uninstall'),
      },
      {
        value: 'appReset',
        label: $t('stepDetail.label.androidOptions.app.appReset'),
      },
      {
        value: 'appAutoGrantPermissions',
        label: $t(
          'stepDetail.label.androidOptions.app.appAutoGrantPermissions'
        ),
      },
    ],
  },
  {
    label: $t('stepDetail.label.androidOptions.element.self'),
    value: 'element',
    children: [
      {
        label: $t('stepDetail.label.androidOptions.element.uiEle.self'),
        value: 'uiEle',
        children: [
          {
            value: 'findElementInterval',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.findElementInterval'
            ),
          },
          {
            value: 'switchWindowMode',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.switchWindowMode'
            ),
          },
          {
            value: 'switchVisibleMode',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.switchVisibleMode'
            ),
          },
          {
            value: 'switchIgnoreMode',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.switchIgnoreMode'
            ),
          },
          {
            value: 'isExistEle',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.isExistEle'
            ),
          },
          {
            value: 'isExistEleNum',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.isExistEleNum'
            ),
          },
          {
            value: 'click',
            label: $t('stepDetail.label.androidOptions.element.uiEle.click'),
          },
          {
            value: 'sendKeys',
            label: $t('stepDetail.label.androidOptions.element.uiEle.sendKeys'),
          },
          {
            value: 'sendKeysByActions',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.sendKeysByActions'
            ),
          },
          {
            value: 'swipe2',
            label: $t('stepDetail.label.androidOptions.element.uiEle.swipe2'),
          },
          {
            value: 'scrollToEle',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.scrollToEle'
            ),
          },
          {
            value: 'longPress',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.longPress'
            ),
          },
          {
            value: 'clear',
            label: $t('stepDetail.label.androidOptions.element.uiEle.clear'),
          },
          {
            value: 'obtainElementAttr',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.obtainElementAttr'
            ),
          },
          {
            value: 'getElementAttr',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.getElementAttr'
            ),
          },
          {
            value: 'getTextValue',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.getTextValue'
            ),
          },
          {
            value: 'assertText',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.assertText'
            ),
          },
          {
            value: 'logElementAttr',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.logElementAttr'
            ),
          },
          {
            value: 'iteratorAndroidElement',
            label: $t(
              'stepDetail.label.androidOptions.element.uiEle.iteratorAndroidElement'
            ),
          },
        ],
      },
      {
        label: $t('stepDetail.label.androidOptions.element.coordinate.self'),
        value: 'pointEle',
        children: [
          {
            value: 'tap',
            label: $t('stepDetail.label.androidOptions.element.coordinate.tap'),
          },
          {
            value: 'longPressPoint',
            label: $t(
              'stepDetail.label.androidOptions.element.coordinate.longPressPoint'
            ),
          },
          {
            value: 'swipe',
            label: $t(
              'stepDetail.label.androidOptions.element.coordinate.swipe'
            ),
          },
        ],
      },
      {
        label: $t('stepDetail.label.androidOptions.element.webView.self'),
        value: 'webViewEle',
        children: [
          {
            value: 'setDefaultFindWebViewElementInterval',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.setDefaultFindWebViewElementInterval'
            ),
          },
          {
            value: 'toWebView',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.toWebView'
            ),
          },
          {
            value: 'toHandle',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.toHandle'
            ),
          },
          {
            value: 'isExistWebViewEle',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.isExistWebViewEle'
            ),
          },
          {
            value: 'isExistWebViewEleNum',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.isExistWebViewEleNum'
            ),
          },
          {
            value: 'webViewClick',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.webViewClick'
            ),
          },
          {
            value: 'webElementScrollToView',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.webElementScrollToView'
            ),
          },
          {
            value: 'webViewSendKeys',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.webViewSendKeys'
            ),
          },
          {
            value: 'webViewSendKeysByActions',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.webViewSendKeysByActions'
            ),
          },
          {
            value: 'webViewClear',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.webViewClear'
            ),
          },
          {
            value: 'getWebViewTextValue',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.getWebViewTextValue'
            ),
          },
          {
            value: 'assertWebViewText',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.assertWebViewText'
            ),
          },
          {
            value: 'getTitle',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.getTitle'
            ),
          },
          {
            value: 'getUrl',
            label: $t('stepDetail.label.androidOptions.element.webView.getUrl'),
          },
          {
            value: 'webViewRefresh',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.webViewRefresh'
            ),
          },
          {
            value: 'webViewBack',
            label: $t(
              'stepDetail.label.androidOptions.element.webView.webViewBack'
            ),
          },
        ],
      },
      {
        label: $t('stepDetail.label.androidOptions.element.poco.self'),
        value: 'pocoEle',
        children: [
          {
            value: 'startPocoDriver',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.startPocoDriver'
            ),
          },
          {
            value: 'setDefaultFindPocoElementInterval',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.setDefaultFindPocoElementInterval'
            ),
          },
          {
            value: 'setTheRealPositionOfTheWindow',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.setTheRealPositionOfTheWindow'
            ),
          },
          {
            value: 'isExistPocoEle',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.isExistPocoEle'
            ),
          },
          {
            value: 'isExistPocoEleNum',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.isExistPocoEleNum'
            ),
          },
          {
            value: 'pocoClick',
            label: $t('stepDetail.label.androidOptions.element.poco.pocoClick'),
          },
          {
            value: 'pocoLongPress',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.pocoLongPress'
            ),
          },
          {
            value: 'pocoSwipe',
            label: $t('stepDetail.label.androidOptions.element.poco.pocoSwipe'),
          },
          {
            value: 'freezeSource',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.freezeSource'
            ),
          },
          {
            value: 'thawSource',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.thawSource'
            ),
          },
          {
            value: 'closePocoDriver',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.closePocoDriver'
            ),
          },
          {
            value: 'obtainPocoElementAttr',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.obtainPocoElementAttr'
            ),
          },
          {
            value: 'getPocoElementAttr',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.getPocoElementAttr'
            ),
          },
          {
            value: 'getPocoTextValue',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.getPocoTextValue'
            ),
          },
          {
            value: 'assertPocoText',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.assertPocoText'
            ),
          },
          {
            value: 'logPocoElementAttr',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.logPocoElementAttr'
            ),
          },
          {
            value: 'iteratorPocoElement',
            label: $t(
              'stepDetail.label.androidOptions.element.poco.iteratorPocoElement'
            ),
          },
        ],
      },
    ],
  },
  {
    label: $t('stepDetail.label.androidOptions.check.self'),
    value: 'check',
    children: [
      {
        value: 'getActivity',
        label: $t('stepDetail.label.androidOptions.check.getActivity'),
      },
      {
        value: 'assert',
        label: $t('stepDetail.label.androidOptions.check.assert.self'),
        children: [
          {
            value: 'assertEquals',
            label: $t(
              'stepDetail.label.androidOptions.check.assert.assertEquals'
            ),
          },
          {
            value: 'assertNotEquals',
            label: $t(
              'stepDetail.label.androidOptions.check.assert.assertNotEquals'
            ),
          },
          {
            value: 'assertTrue',
            label: $t(
              'stepDetail.label.androidOptions.check.assert.assertTrue'
            ),
          },
          {
            value: 'assertNotTrue',
            label: $t(
              'stepDetail.label.androidOptions.check.assert.assertNotTrue'
            ),
          },
        ],
      },
    ],
  },
  {
    label: $t('stepDetail.label.androidOptions.img.self'),
    value: 'img',
    children: [
      {
        value: 'stepScreen',
        label: $t('stepDetail.label.androidOptions.img.stepScreen'),
      },
      {
        value: 'checkImage',
        label: $t('stepDetail.label.androidOptions.img.checkImage'),
      },
      {
        value: 'clickByImg',
        label: $t('stepDetail.label.androidOptions.img.clickByImg'),
      },
    ],
  },
  {
    label: $t('stepDetail.label.androidOptions.spec.self'),
    value: 'spec',
    children: [
      {
        value: 'publicStep',
        label: $t('stepDetail.label.androidOptions.spec.publicStep'),
      },
      {
        value: 'runScript',
        label: $t('stepDetail.label.androidOptions.spec.runScript'),
      },
      {
        value: 'monkey',
        label: $t('stepDetail.label.androidOptions.spec.monkey'),
      },
      {
        value: 'pause',
        label: $t('stepDetail.label.androidOptions.spec.pause'),
      },
    ],
  },
  {
    label: $t('stepDetail.label.androidOptions.settings.self'),
    value: 'settings',
    children: [
      {
        value: 'stepHold',
        label: $t('stepDetail.label.androidOptions.settings.stepHold'),
      },
      {
        value: 'switchTouchMode',
        label: $t('stepDetail.label.androidOptions.settings.switchTouchMode'),
      },
    ],
  },
]);
const iOSOptions = ref([
  {
    label: $t('stepDetail.label.iOSOptions.system.self'),
    value: 'system',
    children: [
      {
        value: 'rotateDevice',
        label: $t('stepDetail.label.iOSOptions.system.rotateDevice.self'),
        children: [
          {
            value: 'lock',
            label: $t('stepDetail.label.iOSOptions.system.rotateDevice.lock'),
          },
          {
            value: 'unLock',
            label: $t('stepDetail.label.iOSOptions.system.rotateDevice.unlock'),
          },
        ],
      },
      {
        value: 'specaction',
        label: $t('stepDetail.label.iOSOptions.system.specaction.self'),
        children: [
          {
            value: 'siriCommand',
            label: $t(
              'stepDetail.label.iOSOptions.system.specaction.siriCommand'
            ),
          },
          {
            value: 'sendKeyForce',
            label: $t(
              'stepDetail.label.iOSOptions.system.specaction.sendKeyForce'
            ),
          },
          {
            value: 'swipeByDefinedDirection',
            label: $t(
              'stepDetail.label.iOSOptions.system.specaction.swipeByDefinedDirection'
            ),
          },
        ],
      },
      {
        value: 'interaction',
        label: $t('stepDetail.label.iOSOptions.system.interaction.self'),
        children: [
          {
            value: 'keyCode',
            label: $t('stepDetail.label.iOSOptions.system.interaction.keyCode'),
          },
        ],
      },
      {
        value: 'pasteboard',
        label: $t('stepDetail.label.iOSOptions.system.pasteboard.self'),
        children: [
          {
            value: 'setPasteboard',
            label: $t(
              'stepDetail.label.iOSOptions.system.pasteboard.setPasteboard'
            ),
          },
          {
            value: 'getPasteboard',
            label: $t(
              'stepDetail.label.iOSOptions.system.pasteboard.getPasteboard'
            ),
          },
        ],
      },
    ],
  },
  {
    label: $t('stepDetail.label.iOSOptions.app.self'),
    value: 'app',
    children: [
      {
        value: 'openApp',
        label: $t('stepDetail.label.iOSOptions.app.openApp'),
      },
      {
        value: 'terminate',
        label: $t('stepDetail.label.iOSOptions.app.terminate'),
      },
      {
        value: 'install',
        label: $t('stepDetail.label.iOSOptions.app.install'),
      },
      {
        value: 'uninstall',
        label: $t('stepDetail.label.iOSOptions.app.uninstall'),
      },
      {
        value: 'runBack',
        label: $t('stepDetail.label.iOSOptions.app.runBack'),
      },
    ],
  },
  {
    label: $t('stepDetail.label.iOSOptions.element.self'),
    value: 'element',
    children: [
      {
        label: $t('stepDetail.label.iOSOptions.element.xcEle.self'),
        value: 'xcEle',
        children: [
          {
            value: 'findElementInterval',
            label: $t(
              'stepDetail.label.iOSOptions.element.xcEle.findElementInterval'
            ),
          },
          {
            value: 'isExistEle',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.isExistEle'),
          },
          {
            value: 'isExistEleNum',
            label: $t(
              'stepDetail.label.iOSOptions.element.xcEle.isExistEleNum'
            ),
          },
          {
            value: 'click',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.click'),
          },
          {
            value: 'sendKeys',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.sendKeys'),
          },
          {
            value: 'sendKeysByActions',
            label: $t(
              'stepDetail.label.iOSOptions.element.xcEle.sendKeysByActions'
            ),
          },
          {
            value: 'swipe2',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.swipe2'),
          },
          {
            value: 'scrollToEle',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.scrollToEle'),
          },
          {
            value: 'longPress',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.longPress'),
          },
          {
            value: 'clear',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.clear'),
          },
          {
            value: 'obtainElementAttr',
            label: $t(
              'stepDetail.label.iOSOptions.element.xcEle.obtainElementAttr'
            ),
          },
          {
            value: 'getElementAttr',
            label: $t(
              'stepDetail.label.iOSOptions.element.xcEle.getElementAttr'
            ),
          },
          {
            value: 'getTextValue',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.getTextValue'),
          },
          {
            value: 'assertText',
            label: $t('stepDetail.label.iOSOptions.element.xcEle.assertText'),
          },
          {
            value: 'logElementAttr',
            label: $t(
              'stepDetail.label.iOSOptions.element.xcEle.logElementAttr'
            ),
          },
          {
            value: 'iteratorIOSElement',
            label: $t(
              'stepDetail.label.iOSOptions.element.xcEle.iteratorIOSElement'
            ),
          },
          {
            value: 'setSnapshotMaxDepth',
            label: $t(
              'stepDetail.label.iOSOptions.element.xcEle.setSnapshotMaxDepth'
            ),
          },
        ],
      },
      {
        label: $t('stepDetail.label.iOSOptions.element.coordinate.self'),
        value: 'pointEle',
        children: [
          {
            value: 'tap',
            label: $t('stepDetail.label.iOSOptions.element.coordinate.tap'),
          },
          {
            value: 'longPressPoint',
            label: $t(
              'stepDetail.label.iOSOptions.element.coordinate.longPressPoint'
            ),
          },
          {
            value: 'swipe',
            label: $t('stepDetail.label.iOSOptions.element.coordinate.swipe'),
          },
        ],
      },
      {
        label: $t('stepDetail.label.iOSOptions.element.poco.self'),
        value: 'pocoEle',
        children: [
          {
            value: 'startPocoDriver',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.startPocoDriver'
            ),
          },
          {
            value: 'setDefaultFindPocoElementInterval',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.setDefaultFindPocoElementInterval'
            ),
          },
          {
            value: 'setTheRealPositionOfTheWindow',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.setTheRealPositionOfTheWindow'
            ),
          },
          {
            value: 'isExistPocoEle',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.isExistPocoEle'
            ),
          },
          {
            value: 'isExistPocoEleNum',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.isExistPocoEleNum'
            ),
          },
          {
            value: 'pocoClick',
            label: $t('stepDetail.label.iOSOptions.element.poco.pocoClick'),
          },
          {
            value: 'pocoLongPress',
            label: $t('stepDetail.label.iOSOptions.element.poco.pocoLongPress'),
          },
          {
            value: 'pocoSwipe',
            label: $t('stepDetail.label.iOSOptions.element.poco.pocoSwipe'),
          },
          {
            value: 'freezeSource',
            label: $t('stepDetail.label.iOSOptions.element.poco.freezeSource'),
          },
          {
            value: 'thawSource',
            label: $t('stepDetail.label.iOSOptions.element.poco.thawSource'),
          },
          {
            value: 'closePocoDriver',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.closePocoDriver'
            ),
          },
          {
            value: 'obtainPocoElementAttr',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.obtainPocoElementAttr'
            ),
          },
          {
            value: 'getPocoElementAttr',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.getPocoElementAttr'
            ),
          },
          {
            value: 'getPocoTextValue',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.getPocoTextValue'
            ),
          },
          {
            value: 'assertPocoText',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.assertPocoText'
            ),
          },
          {
            value: 'logPocoElementAttr',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.logPocoElementAttr'
            ),
          },
          {
            value: 'iteratorPocoElement',
            label: $t(
              'stepDetail.label.iOSOptions.element.poco.iteratorPocoElement'
            ),
          },
        ],
      },
    ],
  },
  {
    label: $t('stepDetail.label.iOSOptions.check.self'),
    value: 'check',
    children: [
      {
        value: 'assert',
        label: $t('stepDetail.label.iOSOptions.check.assert.self'),
        children: [
          {
            value: 'assertEquals',
            label: $t('stepDetail.label.iOSOptions.check.assert.assertEquals'),
          },
          {
            value: 'assertNotEquals',
            label: $t(
              'stepDetail.label.iOSOptions.check.assert.assertNotEquals'
            ),
          },
          {
            value: 'assertTrue',
            label: $t('stepDetail.label.iOSOptions.check.assert.assertTrue'),
          },
          {
            value: 'assertNotTrue',
            label: $t('stepDetail.label.iOSOptions.check.assert.assertNotTrue'),
          },
        ],
      },
    ],
  },
  {
    label: $t('stepDetail.label.iOSOptions.img.self'),
    value: 'img',
    children: [
      {
        value: 'stepScreen',
        label: $t('stepDetail.label.iOSOptions.img.stepScreen'),
      },
      {
        value: 'checkImage',
        label: $t('stepDetail.label.iOSOptions.img.checkImage'),
      },
      {
        value: 'clickByImg',
        label: $t('stepDetail.label.iOSOptions.img.clickByImg'),
      },
    ],
  },
  {
    label: $t('stepDetail.label.iOSOptions.spec.self'),
    value: 'spec',
    children: [
      {
        value: 'publicStep',
        label: $t('stepDetail.label.iOSOptions.spec.publicStep'),
      },
      {
        value: 'runScript',
        label: $t('stepDetail.label.iOSOptions.spec.runScript'),
      },
      {
        value: 'monkey',
        label: $t('stepDetail.label.iOSOptions.spec.monkey'),
      },
      {
        value: 'pause',
        label: $t('stepDetail.label.iOSOptions.spec.pause'),
      },
    ],
  },
  {
    label: $t('stepDetail.label.iOSOptions.settings.self'),
    value: 'settings',
    children: [
      {
        value: 'stepHold',
        label: $t('stepDetail.label.iOSOptions.settings.stepHold'),
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
        :label="$t('stepDetail.stepType')"
        :rules="{
          required: true,
          message: $t('stepDetail.stepTypeInput'),
          trigger: 'change',
        }"
      >
        <el-cascader
          v-model="step.stepType"
          filterable
          style="width: 100%"
          size="small"
          :placeholder="$t('stepDetail.stepTypeInput')"
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
          :label="$t('stepDetail.keyCode')"
          :rules="[
            {
              required: true,
              message: $t('stepDetail.msg.input') + $t('stepDetail.keyCode'),
              trigger: 'blur',
            },
          ]"
          prop="content"
        >
          <el-input
            v-model="step.content"
            :placeholder="$t('stepDetail.msg.input') + $t('stepDetail.keyCode')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'keyCode'">
        <el-form-item
          :label="
            $t('stepDetail.label.androidOptions.system.interaction.keyCode')
          "
          :rules="[
            {
              required: true,
              message:
                $t('stepDetail.msg.select') +
                $t(
                  'stepDetail.label.androidOptions.system.interaction.keyCode'
                ),
              trigger: 'change',
            },
          ]"
          prop="content"
        >
          <el-select
            v-if="step.platform === 1"
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.select') +
              $t('stepDetail.label.androidOptions.system.interaction.keyCode')
            "
          >
            <el-option-group :label="$t('stepDetail.commonKey')">
              <el-option value="HOME"></el-option>
              <el-option value="BACK"></el-option>
              <el-option value="MENU"></el-option>
              <el-option value="APP_SWITCH"></el-option>
            </el-option-group>
            <el-option-group :label="$t('stepDetail.others')">
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
            v-if="step.platform === 2"
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.select') +
              $t('stepDetail.label.androidOptions.system.interaction.keyCode')
            "
          >
            <el-option value="home"></el-option>
            <el-option value="volume up"></el-option>
            <el-option value="volume down"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'switchTouchMode'">
        <el-form-item
          :label="$t('stepDetail.touchMode')"
          :rules="[
            {
              required: true,
              message: $t('stepDetail.msg.touch'),
              trigger: 'change',
            },
          ]"
          prop="content"
        >
          <el-select
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.select') + $t('stepDetail.touchMode')
            "
          >
            <el-option value="SONIC_APK"></el-option>
            <el-option value="ADB"></el-option>
            <el-option value="APPIUM_UIAUTOMATOR2_SERVER"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'tap'">
        <element-select
          :label="$t('stepDetail.label.androidOptions.element.coordinate.self')"
          :place="
            $t('stepDetail.msg.select') +
            $t('stepDetail.label.androidOptions.element.coordinate.self')
          "
          :index="0"
          :project-id="projectId"
          type="point"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'longPressPoint'">
        <element-select
          :label="$t('stepDetail.label.androidOptions.element.coordinate.self')"
          :place="
            $t('stepDetail.msg.select') +
            $t('stepDetail.label.androidOptions.element.coordinate.self')
          "
          :index="0"
          :project-id="projectId"
          type="point"
          :step="step"
        />
        <el-form-item :label="$t('stepDetail.pressTime')">
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
          :label="$t('stepDetail.fromControl')"
          :place="
            $t('stepDetail.msg.select') +
            $t('stepDetail.label.androidOptions.element.coordinate.self')
          "
          :index="0"
          :project-id="projectId"
          type="point"
          :step="step"
        />
        <element-select
          :label="$t('stepDetail.dragTo')"
          :place="
            $t('stepDetail.msg.select') +
            $t('stepDetail.label.androidOptions.element.coordinate.self')
          "
          :index="1"
          :project-id="projectId"
          type="point"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'pocoClick'">
        <element-select
          :label="$t('stepDetail.pocoControl')"
          :place="$t('stepDetail.msg.select') + $t('stepDetail.pocoControl')"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'pocoLongPress'">
        <element-select
          :label="$t('stepDetail.pocoControl')"
          :place="$t('stepDetail.msg.select') + $t('stepDetail.pocoControl')"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item :label="$t('stepDetail.pressTime')">
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
          :label="$t('stepDetail.fromControl')"
          :place="
            $t('stepDetail.msg.select') +
            $t('stepDetail.label.androidOptions.element.coordinate.self')
          "
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <element-select
          :label="$t('stepDetail.dragTo')"
          :place="
            $t('stepDetail.msg.select') +
            $t('stepDetail.label.androidOptions.element.coordinate.self')
          "
          :index="1"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'startPocoDriver'">
        <el-form-item
          :label="$t('stepDetail.gameEngine')"
          prop="content"
          :rules="{
            required: true,
            message: $t('stepDetail.engine') + $t('stepDetail.msg.notBeEmpty'),
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
          :label="$t('stepDetail.communicationPort')"
          prop="text"
          :rules="{
            required: true,
            message: $t('stepDetail.port') + $t('stepDetail.msg.notBeEmpty'),
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
            message: 'offsetWidth' + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="offsets.offsetWidth"
            :placeholder="$t('stepDetail.msg.input') + 'offsetWidth'"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="offsetHeight"
          label-width="120"
          :rules="{
            required: true,
            message: 'offsetHeight' + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="offsets.offsetHeight"
            :placeholder="$t('stepDetail.msg.input') + 'offsetHeight'"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="windowWidth"
          label-width="120"
          :rules="{
            required: true,
            message: 'windowWidth' + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="offsets.windowWidth"
            :placeholder="$t('stepDetail.msg.input') + 'windowWidth'"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="windowHeight"
          label-width="120"
          :rules="{
            required: true,
            message: 'windowHeight' + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="offsets.windowHeight"
            :placeholder="$t('stepDetail.msg.input') + 'windowHeight'"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'isExistPocoEle'">
        <element-select
          :label="$t('stepDetail.pocoControl')"
          :place="$t('stepDetail.msg.select') + $t('stepDetail.pocoControl')"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item
          :label="$t('stepDetail.verify.existedOrNot')"
          prop="content"
          :rules="{
            required: true,
            message:
              $t('stepDetail.verify.assert') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option
              :label="$t('stepDetail.verify.existed')"
              value="true"
            ></el-option>
            <el-option
              :label="$t('stepDetail.verify.notExisted')"
              value="false"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'isExistPocoEleNum'">
        <element-select
          :label="$t('stepDetail.pocoControl')"
          :place="$t('stepDetail.msg.select') + $t('stepDetail.pocoControl')"
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <div>
          <el-form-item :label="$t('stepDetail.verify.num')" :model="step">
            <el-select v-model="step.content" prop="content">
              <el-option
                :label="$t('stepDetail.verify.greaterThan')"
                value=">"
              ></el-option>
              <el-option
                :label="$t('stepDetail.verify.lessThan')"
                value="<"
              ></el-option>
              <el-option
                :label="$t('stepDetail.verify.equalTo')"
                value="="
              ></el-option>
              <el-option
                :label="$t('stepDetail.verify.notLessThan')"
                value=">="
              ></el-option>
              <el-option
                :label="$t('stepDetail.verify.notGreaterThan')"
                value="<="
              ></el-option>
            </el-select>

            <el-input-number
              v-model="step.text"
              :placeholder="$t('stepDetail.verify.enterNum')"
              :min="0"
              style="width: 150px; margin-left: 10px"
              prop="text"
            ></el-input-number>
          </el-form-item>
        </div>
      </div>

      <div v-if="step.stepType === 'openApp'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="`${$t('stepDetail.msgTips.variable')}&#123;&#123;${$t('stepDetail.variableName')}&#125;&#125;`"
        />
        <el-form-item
          prop="text"
          :label="$t('stepDetail.label.androidOptions.app.openApp')"
          :rules="{
            required: true,
            message: $t('stepDetail.app.pkg') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.startPkgName')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'terminate'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="`${$t('stepDetail.msgTips.variable')}&#123;&#123;${$t('stepDetail.variableName')}&#125;&#125;`"
        />
        <el-form-item
          prop="text"
          :label="$t('stepDetail.label.androidOptions.app.terminate')"
          :rules="{
            required: true,
            message: $t('stepDetail.app.pkg') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.stopPkgName')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'install'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="`${$t('stepDetail.msgTips.variable')}&#123;&#123;${$t('stepDetail.variableName')}&#125;&#125;`"
        />
        <el-form-item
          :label="$t('stepDetail.installation')"
          prop="content"
          :rules="{
            required: true,
            message:
              $t('stepDetail.installation') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option
              :label="$t('stepDetail.msg.installDefine')"
              :value="1"
            ></el-option>
            <el-option
              :label="$t('stepDetail.msg.installList')"
              :value="2"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="step.content === 1"
          prop="text"
          :label="$t('stepDetail.installPath')"
          :rules="{
            required: true,
            message: $t('stepDetail.path') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.installPathInput')"
          ></el-input>
        </el-form-item>
        <el-alert
          v-if="step.content === 2"
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.install')"
        />
        <el-form-item
          v-if="step.content === 2"
          prop="text"
          :label="$t('stepDetail.app.branchName')"
        >
          <el-input
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.branchName')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'uninstall'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="`${$t('stepDetail.msgTips.variable')}&#123;&#123;${$t('stepDetail.variableName')}&#125;&#125;`"
        />
        <el-form-item
          prop="text"
          :label="$t('stepDetail.label.androidOptions.app.uninstall')"
          :rules="{
            required: true,
            message: $t('stepDetail.app.pkg') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.uninstallPkgName')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'runBack'">
        <el-form-item :label="$t('stepDetail.label.iOSOptions.app.runBack')">
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
          :title="`${$t('stepDetail.msgTips.variable')}&#123;&#123;${$t('stepDetail.variableName')}&#125;&#125;`"
        />
        <el-form-item
          prop="text"
          :label="$t('stepDetail.app.empty')"
          :rules="{
            required: true,
            message: $t('stepDetail.app.pkg') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.clearAppPkgName')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'appAutoGrantPermissions'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.androidPkgName')"
        />
        <el-form-item
          prop="text"
          :label="$t('stepDetail.app.authorize')"
          :rules="{
            required: true,
            message: $t('stepDetail.app.pkg') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.authPkgNameInput')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'swipeByDefinedDirection'">
        <el-form-item
          :label="$t('stepDetail.side')"
          :rules="[
            {
              required: true,
              message: $t('stepDetail.msg.select') + $t('stepDetail.side'),
              trigger: 'change',
            },
          ]"
          prop="text"
        >
          <el-select
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.select') + $t('stepDetail.side')"
          >
            <el-option label="UP" value="up"></el-option>
            <el-option label="DOWN" value="down"></el-option>
            <el-option label="LEFT" value="left"></el-option>
            <el-option label="RIGHT" value="right"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('stepDetail.slideDistance')">
          <el-input-number
            v-model="step.content"
            :min="1"
            :step="10"
          ></el-input-number>
          px
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'toWebView'">
        <el-form-item :label="$t('stepDetail.app.pkg')">
          <el-input
            v-model="step.content"
            :placeholder="$t('stepDetail.msg.webviewPkgName')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('stepDetail.processName')">
          <el-input
            v-model="step.text"
            :placeholder="$t('stepDetail.msg.processName')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'toHandle'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.tab')"
        />
        <el-form-item :label="$t('stepDetail.handleInfo')">
          <el-input
            v-model="step.content"
            :placeholder="$t('stepDetail.msg.titleInput')"
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
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item
          :label="$t('stepDetail.verify.existedOrNot')"
          prop="content"
          :rules="{
            required: true,
            message:
              $t('stepDetail.verify.assert') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option
              :label="$t('stepDetail.verify.existed')"
              value="true"
            ></el-option>
            <el-option
              :label="$t('stepDetail.verify.notExisted')"
              value="false"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div
        v-if="
          step.stepType === 'isExistEleNum' ||
          step.stepType === 'isExistWebViewEleNum'
        "
      >
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <div>
          <el-form-item :label="$t('stepDetail.verify.num')" :model="step">
            <el-select v-model="step.content" prop="content">
              <el-option
                :label="$t('stepDetail.verify.greaterThan')"
                value=">"
              ></el-option>
              <el-option
                :label="$t('stepDetail.verify.lessThan')"
                value="<"
              ></el-option>
              <el-option
                :label="$t('stepDetail.verify.equalTo')"
                value="="
              ></el-option>
              <el-option
                :label="$t('stepDetail.verify.notLessThan')"
                value=">="
              ></el-option>
              <el-option
                :label="$t('stepDetail.verify.notGreaterThan')"
                value="<="
              ></el-option>
            </el-select>

            <el-input-number
              v-model="step.text"
              :placeholder="$t('stepDetail.enterNum')"
              :min="0"
              style="width: 150px; margin-left: 10px"
              prop="text"
            ></el-input-number>
          </el-form-item>
        </div>
      </div>

      <div
        v-if="
          step.stepType === 'airPlaneMode' ||
          step.stepType === 'wifiMode' ||
          step.stepType === 'locationMode'
        "
      >
        <el-form-item
          :label="$t('stepDetail.openOrNot')"
          prop="content"
          :rules="{
            required: true,
            message: $t('stepDetail.status') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option :label="$t('stepDetail.open')" value="true"></el-option>
            <el-option
              :label="$t('stepDetail.close')"
              value="false"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'switchWindowMode'">
        <el-form-item
          :label="$t('stepDetail.switch.mode')"
          prop="content"
          :rules="{
            required: true,
            message: $t('stepDetail.mode') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option
              :label="$t('stepDetail.multiWindowMode')"
              value="true"
            ></el-option>
            <el-option
              :label="$t('stepDetail.singleWindowMode')"
              value="false"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'switchIgnoreMode'">
        <el-form-item
          :label="$t('stepDetail.ignoreOrNot')"
          prop="content"
          :rules="{
            required: true,
            message: $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option
              :label="$t('stepDetail.verify.ignore')"
              value="true"
            ></el-option>
            <el-option
              :label="$t('stepDetail.verify.notIgnore')"
              value="false"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'switchVisibleMode'">
        <el-form-item
          :label="$t('stepDetail.switch.display')"
          prop="content"
          :rules="{
            required: true,
            message: $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option
              :label="$t('stepDetail.display')"
              value="true"
            ></el-option>
            <el-option :label="$t('stepDetail.hide')" value="false"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'webElementScrollToView'">
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'click' || step.stepType === 'webViewClick'">
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
      </div>

      <div
        v-if="
          step.stepType === 'sendKeys' ||
          step.stepType === 'webViewSendKeys' ||
          step.stepType === 'sendKeysByActions' ||
          step.stepType === 'webViewSendKeysByActions'
        "
      >
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
        >
          <template #title>
            <div v-if="shouldShowByActionsTip(step.stepType)">
              {{ $t('stepDetail.msgTips.focus') }}
            </div>
            <div>
              {{`${$t('stepDetail.msgTips.variable')}&#123;&#123;${$t('stepDetail.variableName')}&#125;&#125;`}}
            </div>
          </template>
        </el-alert>
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item :label="$t('stepDetail.inputValue')">
          <el-input
            v-model="step.content"
            :placeholder="$t('stepDetail.inputValue')"
          ></el-input>
        </el-form-item>
      </div>

      <div
        v-if="
          step.stepType === 'sendKeyForce' ||
          step.stepType === 'setClipperByKeyboard'
        "
      >
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="`${$t('stepDetail.msgTips.sysKey')}&#123;&#123;${$t('stepDetail.variableName')}&#125;&#125;`"
        />
        <el-form-item :label="$t('stepDetail.inputValue')">
          <el-input
            v-model="step.content"
            :placeholder="$t('stepDetail.inputValue')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'swipe2'">
        <element-select
          :label="$t('stepDetail.fromControl')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <element-select
          :label="$t('stepDetail.dragTo')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="1"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'scrollToEle'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.table')"
        />
        <element-select
          :label="$t('stepDetail.targetControl')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item
          :label="$t('stepDetail.scrollOrientation')"
          prop="content"
          :rules="{
            required: true,
            message:
              $t('stepDetail.scrollOrientation') +
              $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.text">
            <el-option
              :label="$t('stepDetail.downwards')"
              value="down"
            ></el-option>
            <el-option :label="$t('stepDetail.upwards')" value="up"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('stepDetail.maxScroll')"
          prop="text"
          :rules="{
            required: true,
            message:
              $t('stepDetail.scrollNum') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-input-number
            v-model="step.content"
            :min="1"
            :step="1"
          ></el-input-number>
          <span style="margin-left: 10px">{{ $t('stepDetail.times') }}</span>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'setSnapshotMaxDepth'">
        <el-form-item :label="$t('stepDetail.maxDepth')">
          <el-input-number
            v-model="step.content"
            :min="1"
            :max="60"
          ></el-input-number>
        </el-form-item>
      </div>
      <div v-if="step.stepType === 'longPress'">
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item :label="$t('stepDetail.pressTime')">
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
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
      </div>

      <div v-if="step.stepType === 'getClipperByKeyboard'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.text')"
        />
        <el-form-item :label="$t('stepDetail.variableName')">
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.variableName')
            "
          ></el-input>
        </el-form-item>
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
          :title="$t('stepDetail.msgTips.text')"
        />
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item :label="$t('stepDetail.variableName')">
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.variableName')
            "
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getPocoTextValue'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.text')"
        />
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item :label="$t('stepDetail.variableName')">
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.variableName')
            "
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'setPasteboard'">
        <el-form-item :label="$t('stepDetail.textInfo')">
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.set.textInfo')
            "
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getPasteboard'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.text')"
        />
        <el-form-item :label="$t('stepDetail.variableName')">
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.variableName')
            "
          ></el-input>
        </el-form-item>
      </div>

      <!--这里UI上还需要保留，用于在老版本升级上来之后，可以编辑用-->
      <div
        v-if="
          step.stepType === 'getText' ||
          step.stepType === 'getWebViewText' ||
          step.stepType === 'getPocoText'
        "
      >
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          :type="step.stepType === 'getPocoText' ? 'poco' : 'normal'"
          :step="step"
        />
        <el-form-item :label="$t('stepDetail.verify.expectedValue')">
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.verify.expectedValue')
            "
          ></el-input>
        </el-form-item>
      </div>

      <!-- >2.5版本之后，增强类型的文本断言 -->
      <div
        v-if="
          step.stepType === 'assertText' ||
          step.stepType === 'assertWebViewText' ||
          step.stepType === 'assertPocoText'
        "
      >
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          :type="step.stepType === 'assertPocoText' ? 'poco' : 'normal'"
          :step="step"
        />
        <el-form-item
          :label="$t('stepDetail.verify.assertType')"
          prop="content"
          :rules="{
            required: true,
            message:
              $t('stepDetail.verify.assertType') +
              $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select v-model="step.content">
            <el-option
              :label="$t('stepDetail.verify.equalTo')"
              value="equal"
            ></el-option>
            <el-option
              :label="$t('stepDetail.verify.notEqual')"
              value="notEqual"
            ></el-option>
            <el-option
              :label="$t('stepDetail.verify.contain')"
              value="contain"
            ></el-option>
            <el-option
              :label="$t('stepDetail.verify.notContain')"
              value="notContain"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('stepDetail.verify.expectedValue')"
          prop="text"
          :rules="{
            required: true,
            message:
              $t('stepDetail.verify.expectedValue') +
              $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-input
            v-model="step.text"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.verify.expectedValue')
            "
          ></el-input>
        </el-form-item>
      </div>
      <div v-if="step.stepType === 'getTitle' || step.stepType === 'getUrl'">
        <el-form-item :label="$t('stepDetail.verify.expectedValue')">
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.verify.expectedValue')
            "
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'getActivity'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="`${$t('stepDetail.msgTips.variable')}&#123;&#123;${$t('stepDetail.variableName')}&#125;&#125;`"
        />
        <global-params-select
          :label="$t('stepDetail.verify.expectedValue')"
          :place="$t('stepDetail.msg.expected')"
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
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          :type="step.stepType === 'logElementAttr' ? 'normal' : 'poco'"
          :step="step"
        />
        <el-form-item
          :label="$t('stepDetail.control.attribute')"
          :rules="{
            required: true,
            message:
              $t('stepDetail.control.attribute') +
              $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select
            v-if="step.stepType === 'logPocoElementAttr'"
            v-model="attrList"
            :label="$t('stepDetail.targetAttr')"
            :placeholder="$t('stepDetail.msg.control')"
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
            :label="$t('stepDetail.targetAttr')"
            :placeholder="$t('stepDetail.msg.control')"
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
            :label="$t('stepDetail.targetAttr')"
            :placeholder="$t('stepDetail.msg.control')"
            multiple
          >
            <el-option value="UID"></el-option>
            <el-option value="accessibilityContainer"></el-option>
            <el-option value="accessible"></el-option>
            <el-option value="enabled"></el-option>
            <el-option value="index"></el-option>
            <el-option value="label"></el-option>
            <el-option value="name"></el-option>
            <el-option value="value"></el-option>
            <el-option value="rect"></el-option>
            <el-option value="selected"></el-option>
            <el-option value="type"></el-option>
            <el-option value="visible"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div
        v-if="
          step.stepType === 'getElementAttr' ||
          step.stepType === 'obtainElementAttr'
        "
      >
        <el-alert
          v-show="step.stepType === 'obtainElementAttr'"
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.controlAttribute')"
        />
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="normal"
          :step="step"
        />
        <el-form-item
          :label="$t('stepDetail.control.attribute')"
          prop="text"
          :rules="{
            required: true,
            message:
              $t('stepDetail.control.attribute') +
              $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select
            v-if="step.platform === 1"
            v-model="step.text"
            :label="$t('stepDetail.attribute')"
            :placeholder="
              $t('stepDetail.msg.select') + $t('stepDetail.control.attribute')
            "
          >
            <el-option value="centerCoordinate"></el-option>
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
            v-model="step.text"
            :label="$t('stepDetail.attribute')"
            :placeholder="
              $t('stepDetail.msg.select') + $t('stepDetail.control.attribute')
            "
          >
            <el-option value="UID"></el-option>
            <el-option value="accessibilityContainer"></el-option>
            <el-option value="accessible"></el-option>
            <el-option value="enabled"></el-option>
            <el-option value="index"></el-option>
            <el-option value="label"></el-option>
            <el-option value="name"></el-option>
            <el-option value="value"></el-option>
            <el-option value="rect"></el-option>
            <el-option value="selected"></el-option>
            <el-option value="type"></el-option>
            <el-option value="visible"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="step.stepType === 'getElementAttr'"
          :label="$t('stepDetail.verify.expectedValue')"
          prop="content"
        >
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.verify.expectedValue')
            "
          ></el-input>
        </el-form-item>
        <el-form-item
          v-else
          :label="$t('stepDetail.variableName')"
          prop="content"
        >
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.variableName')
            "
          ></el-input>
        </el-form-item>
      </div>

      <div
        v-if="
          step.stepType === 'getPocoElementAttr' ||
          step.stepType === 'obtainPocoElementAttr'
        "
      >
        <el-alert
          v-show="step.stepType === 'obtainPocoElementAttr'"
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.controlAttribute')"
        />
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
        />
        <el-form-item
          :label="$t('stepDetail.control.attribute')"
          prop="text"
          :rules="{
            required: true,
            message:
              $t('stepDetail.control.attribute') +
              $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select
            v-model="step.text"
            :label="$t('stepDetail.attribute')"
            :placeholder="
              $t('stepDetail.msg.select') + $t('stepDetail.control.attribute')
            "
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
        </el-form-item>
        <el-form-item
          v-if="step.stepType === 'getPocoElementAttr'"
          :label="$t('stepDetail.verify.expectedValue')"
          prop="content"
        >
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.verify.expectedValue')
            "
          ></el-input>
        </el-form-item>
        <el-form-item
          v-else
          :label="$t('stepDetail.variableName')"
          prop="content"
        >
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.variableName')
            "
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'siriCommand'">
        <el-form-item :label="$t('stepDetail.siriCmd')">
          <el-input
            v-model="step.content"
            :placeholder="$t('stepDetail.msg.siri')"
          ></el-input>
        </el-form-item>
      </div>

      <div
        v-if="
          step.stepType === 'assertEquals' ||
          step.stepType === 'assertNotEquals' ||
          step.stepType === 'assertTrue' ||
          step.stepType === 'assertNotTrue'
        "
      >
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="`${$t('stepDetail.use')} &#123;&#123;${$t('stepDetail.variableName')}&#125;&#125; ${$t('stepDetail.msgTips.verify')}`"
        />
        <el-form-item :label="$t('stepDetail.verify.actualValue')">
          <el-input
            v-model="step.text"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.verify.actualValue')
            "
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('stepDetail.verify.expectedValue')">
          <el-input
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.input') + $t('stepDetail.verify.expectedValue')
            "
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'clickByImg'">
        <el-alert
          show-icon
          style="margin-bottom: 10px"
          close-text="Get!"
          type="info"
          :title="$t('stepDetail.msgTips.order')"
        />
        <element-select
          :label="$t('stepDetail.control.screenshot')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.screenshot')
          "
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
          :title="$t('stepDetail.msgTips.language')"
        />
        <el-form-item
          prop="content"
          :label="$t('stepDetail.identifyLanguages')"
          :rules="{
            required: true,
            message:
              $t('stepDetail.language.type') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select
            v-model="step.content"
            :placeholder="
              $t('stepDetail.msg.select') + $t('stepDetail.identifyLanguages')
            "
          >
            <el-option
              :label="$t('stepDetail.language.simplifiedChinese')"
              value="chi_sim"
            ></el-option>
            <el-option
              :label="$t('stepDetail.language.english')"
              value="eng"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          prop="text"
          :label="$t('stepDetail.verify.expectedText')"
          :rules="{
            required: true,
            message:
              $t('stepDetail.verify.expectedText') +
              $t('stepDetail.msg.notBeEmpty'),
            trigger: 'blur',
          }"
        >
          <el-input
            v-model="step.text"
            type="text"
            :placeholder="$t('stepDetail.msg.text')"
          ></el-input>
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'checkImage'">
        <element-select
          :label="$t('stepDetail.pageScreenshot')"
          :place="$t('stepDetail.msg.select') + $t('stepDetail.pageScreenshot')"
          :index="0"
          :project-id="projectId"
          type="image"
          :step="step"
        />
        <el-form-item :label="$t('stepDetail.verify.expectedMatchRatio')">
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
          :label="$t('stepDetail.label.iOSOptions.spec.publicStep')"
          prop="text"
          :rules="{
            required: true,
            message: $t('routes.publicStep') + $t('stepDetail.msg.notBeEmpty'),
            trigger: 'change',
          }"
        >
          <el-select
            v-model="step.text"
            :placeholder="
              $t('stepDetail.msg.select') + $t('routes.publicSteps')
            "
            :no-data-text="$t('stepDetail.msg.publicStep')"
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
          :title="$t('stepDetail.msgTips.publicStep')"
        />
        <el-form-item :label="$t('stepDetail.stepInterval')">
          <el-input-number
            v-model="step.content"
            :min="0"
            :step="1000"
          ></el-input-number>
          ms
        </el-form-item>
      </div>

      <div v-if="step.stepType === 'pause'">
        <el-form-item :label="$t('stepDetail.waitTime')">
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
          step.stepType === 'setDefaultFindPocoElementInterval' ||
          step.stepType === 'setDefaultFindWebViewElementInterval'
        "
      >
        <el-form-item :label="$t('stepDetail.retries')">
          <el-input-number
            v-model="step.content"
            :min="0"
            :step="1"
          ></el-input-number>
        </el-form-item>
        <el-form-item :label="$t('stepDetail.retriesInterval')">
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
          <el-form-item :label="$t('stepDetail.testPkgName')">
            <el-input
              v-model="monkey.packageName"
              size="small"
              type="text"
              :placeholder="
                $t('stepDetail.msg.input') + $t('stepDetail.testPkgName')
              "
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('stepDetail.eventsNum')">
            <el-input-number
              v-model="monkey.pctNum"
              style="width: 100%"
              size="small"
              :min="10"
              :step="10"
            ></el-input-number>
          </el-form-item>
          <el-form-item
            style="margin-top: 10px"
            :label="$t('stepDetail.eventConfigure')"
          >
            <el-tabs type="border-card" stretch>
              <el-tab-pane :label="$t('stepDetail.detailConfigure')">
                <el-table :data="monkey.options" border :show-header="false">
                  <el-table-column>
                    <template #default="scope">
                      <el-popover
                        :disabled="
                          step.platform === 2 &&
                          (scope.row.name === 'isOpenH5Listener' ||
                            scope.row.name === 'isOpenActivityListener' ||
                            scope.row.name === 'isOpenNetworkListener')
                        "
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
                        :disabled="
                          step.platform === 2 &&
                          (scope.row.name === 'isOpenH5Listener' ||
                            scope.row.name === 'isOpenActivityListener' ||
                            scope.row.name === 'isOpenNetworkListener')
                        "
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                      >
                      </el-switch>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane
                v-if="step.platform === 1"
                :label="$t('stepDetail.activityBlacklist')"
              >
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
                        >{{ $t('stepDetail.delete') }}
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div style="text-align: center; margin-top: 10px">
                  <el-button size="mini" @click="add()">{{
                    $t('stepDetail.new')
                  }}</el-button>
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
              >{{ $t('stepDetail.msgTips.reference') }}
              <a
                href="https://sonic-cloud.cn/document?tag=runScript"
                target="_blank"
              >
                {{ $t('stepDetail.userDoc') }}
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
          :title="$t('stepDetail.msgTips.iteration')"
          type="info"
        />
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
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
          :title="$t('stepDetail.msgTips.iteration')"
          type="info"
        />
        <element-select
          :label="$t('stepDetail.control.element')"
          :place="
            $t('stepDetail.msg.select') + $t('stepDetail.control.element')
          "
          :index="0"
          :project-id="projectId"
          type="poco"
          :step="step"
          :ignore-iterator="true"
        />
      </div>
    </div>

    <el-form-item :label="$t('stepDetail.logic.process')">
      <el-select
        v-model="step.conditionType"
        :placeholder="
          $t('stepDetail.msg.select') + $t('stepDetail.logic.condition')
        "
        :disabled="
          step.stepType === 'iteratorAndroidElement' ||
          step.stepType === 'iteratorIOSElement' ||
          step.stepType === 'iteratorPocoElement'
        "
        @change="selectCondition"
      >
        <el-option :label="$t('stepDetail.none')" :value="0"></el-option>
        <el-option label="if" :value="1"></el-option>
        <el-option label="else if" :value="2"></el-option>
        <el-option label="else" :value="3"></el-option>
        <el-option label="while" :value="4"></el-option>
      </el-select>
      <el-popover
        placement="right-start"
        :title="$t('stepDetail.logic.process')"
        :width="300"
        trigger="hover"
      >
        <p>{{ $t('stepDetail.logic.msgProcess') }}</p>
        <div>
          <strong style="color: #409eff">if：</strong
          >{{ $t('stepDetail.logic.msgSubStep') }}
        </div>
        <div>
          <strong style="color: #e6a23c">eles if：</strong
          >{{ $t('stepDetail.logic.msgIf') }}
        </div>
        <div>
          <strong style="color: #f56c6c">else：</strong
          >{{ $t('stepDetail.logic.msgFailure') }}
        </div>
        <div>
          <strong style="color: #67c23a">while：</strong
          >{{ $t('stepDetail.logic.msgRepeat') }}
        </div>
        <template #reference>
          <el-icon :size="18" style="vertical-align: middle; margin-left: 10px">
            <QuestionFilled />
          </el-icon>
        </template>
      </el-popover>
    </el-form-item>

    <div v-if="step.conditionType === 0">
      <el-form-item :label="$t('stepDetail.exception.handling')">
        <el-select
          v-model="step.error"
          :placeholder="
            $t('stepDetail.msg.select') + $t('stepDetail.exception.handling')
          "
        >
          <el-option
            :label="$t('stepDetail.exception.ignore')"
            :value="1"
          ></el-option>
          <el-option
            :label="$t('stepDetail.exception.warning')"
            :value="2"
          ></el-option>
          <el-option
            :label="$t('stepDetail.exception.interrupt')"
            :value="3"
          ></el-option>
        </el-select>
        <el-popover
          placement="right-start"
          :title="$t('stepDetail.exception.handling')"
          :width="300"
          trigger="hover"
        >
          <p>{{ $t('stepDetail.exception.msgException') }}</p>
          <div>
            <strong style="color: #409eff">{{
              $t('stepDetail.exception.ignore')
            }}</strong
            >{{ $t('stepDetail.exception.msgContinue') }}
          </div>
          <div>
            <strong style="color: #e6a23c">{{
              $t('stepDetail.exception.warning')
            }}</strong
            >{{ $t('stepDetail.exception.msgWarning') }}
          </div>
          <div>
            <strong style="color: #f56c6c">{{
              $t('stepDetail.exception.interrupt')
            }}</strong
            >{{ $t('stepDetail.exception.msgInterrupt') }}
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
    <el-button size="small" type="primary" @click="summitStep">{{
      $t('stepDetail.submit')
    }}</el-button>
  </div>
</template>
