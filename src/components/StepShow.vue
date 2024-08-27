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

import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { Edit } from '@element-plus/icons';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import CodeEditor from './CodeEditor.vue';
import axios from '../http/axios';
import ChildStepListView from './ChildStepListView.vue';

const { t: $t } = useI18n();
const route = useRoute();
const props = defineProps({
  step: Object,
});

const childStep = ref([]);

const summitStep = () => {
  axios.put('/controller/steps', props.step).then((resp) => {
    if (resp.code === 2000) {
      ElMessage.success({
        message: resp.message,
      });
    }
  });
};

const getPublicStepInfo = (id) => {
  axios.get('/controller/publicSteps', { params: { id } }).then((resp) => {
    if (resp.code === 2000) {
      if (resp.data.steps) {
        childStep.value = resp.data.steps;
      }
    }
  });
};

const getAssertTextOpe = (s) => {
  switch (s) {
    case 'equal':
      return $t('stepDetail.verify.equalTo');
    case 'notEqual':
      return $t('stepDetail.verify.notEqual');
    case 'contain':
      return $t('stepDetail.verify.contain');
    case 'notContain':
      return $t('stepDetail.verify.notContain');
    default:
      return $t('stepDetail.verify.unknownType');
  }
};

const getScrollToDire = (direction) => {
  switch (direction) {
    case 'up':
      return $t('stepDetail.upwards');
    case 'down':
      return $t('stepDetail.downwards');
    default:
      return $t('stepDetail.unknownScrollSideType');
  }
};
const getEleResult = (s) => {
  const ss = s.toUpperCase();
  if (ss.indexOf('POCO') !== -1) {
    return 'POCO';
  }
  if (ss.indexOf('WEBVIEW') !== -1) {
    return 'WebView';
  }
  return $t('stepDetail.native');
};

const getNotes = (text, type) => {
  const notes = [];
  const textArray = text.split('\n');
  let index = 0;
  // 过滤掉前面空行
  for (let i = 0; i < textArray.length; i++) {
    if (textArray[i].trim() === '') {
      index++;
    } else {
      break;
    }
  }
  // 获取前面的注释
  const prefix = type === 'Groovy' ? '//' : '#';
  if (text.trim().substring(0, prefix.length) === prefix) {
    while (
      index < textArray.length &&
      textArray[index].trim().substring(0, prefix.length) === prefix
    ) {
      const cur = textArray[index++].trim();
      notes.push(cur.substring(prefix.length, cur.length).trim());
    }
    return `: ${notes.join(',')}`;
  }
  if (
    text.trim().substring(0, 2) === '/*' &&
    type === 'Groovy' &&
    text.indexOf('*/') !== -1
  ) {
    // 处理大片注释的情况
    return `: ${text
      .substring(text.indexOf('/*') + 2, text.indexOf('*/'))
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .join(',')}`;
  }
  return '';
};
</script>

<template>
  <span
    v-if="step.stepType === 'runScript'"
    style="display: inline-block; margin-right: 10px; flex: 1; width: 70%"
  >
    <el-collapse style="margin: 5px 0">
      <el-collapse-item>
        <template #title>
          <el-tag size="small" type="warning" style="margin-right: 10px">{{
            $t('stepDetail.runSelfDefinedScript') +
            getNotes(step.content, step.text)
          }}</el-tag>
          {{ $t('stepDetail.click.expandOrCollapse') }}
          <el-icon>
            <Edit />
          </el-icon>
        </template>
        <CodeEditor
          v-model:code="step.content"
          v-model:language="step.text"
          :project-id="route.params.projectId"
          :show-footer="true"
          :show-tool-bar="true"
          height="auto"
          @save="summitStep"
        ></CodeEditor>
      </el-collapse-item>
    </el-collapse>
  </span>
  <span v-if="step.conditionType === 1">
    <el-tag size="small" type="warning" style="margin-right: 10px">if</el-tag>
  </span>
  <span v-if="step.conditionType === 2">
    <el-tag size="small" type="warning" style="margin-right: 10px"
      >else if</el-tag
    >
  </span>
  <span v-if="step.conditionType === 3">
    <el-tag size="small" type="warning" style="margin-right: 10px">else</el-tag>
  </span>
  <span v-if="step.conditionType === 4">
    <el-tag size="small" type="warning" style="margin-right: 10px"
      >while</el-tag
    >
  </span>
  <span v-if="step.stepType === 'siriCommand'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.sendSiriCmd')
    }}</el-tag
    >{{ step.content }}
  </span>
  <span v-if="step.stepType === 'swipeByDefinedDirection'">
    <el-tag size="small">{{ $t('stepDetail.screenCenter') }}</el-tag>
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.text.toUpperCase() }}</el-tag
    >
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.swipe')
    }}</el-tag>
    {{ step.content }} px
  </span>
  <span v-if="step.stepType === 'webElementScrollToView'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.scrollControl')
    }}</el-tag>
    <el-tag type="info" size="small" style="margin-right: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    <el-tag size="small">{{ $t('stepDetail.topVisible') }}</el-tag>
  </span>
  <span v-if="step.stepType === 'lock'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.system.rotateDevice.lock')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'closeKeyboard'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.system.keyboard.closeKeyboard')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'unLock'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.system.rotateDevice.unlock')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'screenSub'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.system.rotateDevice.screenSub')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'screenAdd'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.system.rotateDevice.screenAdd')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'screenAbort'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.system.rotateDevice.screenAbort')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'switchTouchMode'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.set.touchMode')
    }}</el-tag
    >{{ $t('stepDetail.set.to') + ':' + step.content + $t('stepDetail.mode') }}
  </span>
  <span v-if="step.stepType === 'keyCode' || step.stepType === 'keyCodeSelf'">
    <el-tag size="small"
      >{{ $t('stepDetail.pressSys') }}{{ step.content
      }}{{ $t('stepDetail.key') }}</el-tag
    >
  </span>
  <span v-if="step.stepType === 'airPlaneMode'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.network.airPlaneMode')
    }}</el-tag
    >{{
      step.content === 'true' ? $t('stepDetail.open') : $t('stepDetail.close')
    }}
  </span>
  <span v-if="step.stepType === 'wifiMode'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.network.wifiMode')
    }}</el-tag
    >{{
      step.content === 'true' ? $t('stepDetail.open') : $t('stepDetail.close')
    }}
  </span>
  <span v-if="step.stepType === 'locationMode'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.network.locationMode')
    }}</el-tag
    >{{
      step.content === 'true' ? $t('stepDetail.open') : $t('stepDetail.close')
    }}
  </span>
  <span v-if="step.stepType === 'switchWindowMode'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.element.switchWindowMode')
    }}</el-tag
    >{{
      step.content === 'true'
        ? $t('stepDetail.multiWindowMode')
        : $t('stepDetail.singleWindowMode')
    }}
  </span>
  <span v-if="step.stepType === 'switchIgnoreMode'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.element.switchIgnoreMode')
    }}</el-tag
    >{{
      step.content === 'true'
        ? $t('stepDetail.verify.ignore')
        : $t('stepDetail.verify.notIgnore')
    }}
  </span>
  <span v-if="step.stepType === 'switchVisibleMode'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.element.switchVisibleMode')
    }}</el-tag
    >{{
      step.content === 'true' ? $t('stepDetail.display') : $t('stepDetail.hide')
    }}
  </span>
  <span
    v-if="
      step.stepType === 'logElementAttr' ||
      step.stepType === 'logPocoElementAttr'
    "
  >
    <el-tag size="small">{{ $t('stepDetail.logOutput') }}</el-tag>
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    <el-tag size="small" style="margin: 0 10px">{{
      $t('stepDetail.control.info')
    }}</el-tag>
    {{ $t('stepDetail.targetAttr') }}：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'tap'">
    <el-tag size="small">{{ $t('stepDetail.click.coordinate') }}</el-tag>
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'longPressPoint'">
    <el-tag size="small">{{ $t('stepDetail.pressCoordinate') }}</el-tag>
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    {{ step.content }} ms
  </span>
  <span v-if="step.stepType === 'swipe'">
    <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px">{{
      $t('stepDetail.dragTo')
    }}</el-tag>
    <el-tag type="info" size="small">{{ step.elements[1]['eleName'] }}</el-tag>
  </span>
  <span v-if="step.stepType === 'setPasteboard'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.system.keyboard.setClipperByKeyboard')
    }}</el-tag>
    {{ $t('stepDetail.text') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'getPasteboard'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.system.keyboard.getClipperByKeyboard')
    }}</el-tag>
    {{ $t('stepDetail.getToVariable') }}：{{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'findElementInterval' ||
      step.stepType === 'setDefaultFindPocoElementInterval' ||
      step.stepType === 'setDefaultFindWebViewElementInterval'
    "
  >
    <el-tag size="small" style="margin-right: 10px"
      >{{ $t('stepDetail.set.search') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.control.strategy') }}</el-tag
    >
    {{ $t('stepDetail.retries') }}：{{ step.content }}
    {{ $t('stepDetail.retriesInterval') }}：{{ step.text }} ms
  </span>
  <span v-if="step.stepType === 'openApp'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.app.openApp')
    }}</el-tag>
    {{ $t('stepDetail.app.pkg') }}：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'terminate'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.app.terminate')
    }}</el-tag>
    {{ $t('stepDetail.app.pkg') }}：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'install'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.app.install')
    }}</el-tag>
    {{
      step.content === '2'
        ? $t('stepDetail.app.installFromPkglist')
        : $t('stepDetail.app.path') + step.text
    }}
  </span>
  <span v-if="step.stepType === 'uninstall'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.app.uninstall')
    }}</el-tag>
    {{ $t('stepDetail.app.pkg') }}:{{ step.text }}
  </span>
  <span v-if="step.stepType === 'runBack'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.iOSOptions.app.runBack')
    }}</el-tag>
    {{ $t('stepDetail.label.iOSOptions.app.runBack') }} {{ step.content }} ms
  </span>
  <span v-if="step.stepType === 'appReset'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.app.appReset')
    }}</el-tag>
    {{ $t('stepDetail.app.empty') }} {{ step.text }}
    {{ $t('stepDetail.bufferMemory') }}
  </span>
  <span v-if="step.stepType === 'appAutoGrantPermissions'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.label.androidOptions.app.appAutoGrantPermissions')
    }}</el-tag>
    {{ $t('stepDetail.app.authorize') }} {{ step.text }}
    {{ $t('stepDetail.declearedRights') }}
  </span>
  <span v-if="step.stepType === 'toWebView'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.switch.webview')
    }}</el-tag>
    {{ $t('stepDetail.WebviewName') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'toHandle'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.switch.handler')
    }}</el-tag>
    {{ $t('stepDetail.handleSwitchInfo') }}：{{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'isExistEle' ||
      step.stepType === 'isExistWebViewEle' ||
      step.stepType === 'isExistPocoEle'
    "
  >
    <el-tag size="small" style="margin-right: 10px"
      >{{ getEleResult(step.stepType)
      }}{{
        $t('stepDetail.label.androidOptions.element.uiEle.isExistEle')
      }}</el-tag
    >{{ $t('stepDetail.verify.assert') }}：
    <el-tag type="info" size="small" style="margin-right: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    {{
      step.content === 'true'
        ? $t('stepDetail.verify.existed')
        : $t('stepDetail.verify.notExisted')
    }}
  </span>
  <span
    v-if="
      step.stepType === 'isExistEleNum' ||
      step.stepType === 'isExistWebViewEleNum' ||
      step.stepType === 'isExistPocoEleNum'
    "
  >
    <el-tag size="small" style="margin-right: 10px"
      >{{ getEleResult(step.stepType)
      }}{{
        $t('stepDetail.label.androidOptions.element.uiEle.isExistEleNum')
      }}</el-tag
    >{{ $t('stepDetail.verify.assert') }}：
    <el-tag type="info" size="small" style="margin-right: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    {{ $t('stepDetail.number') }} {{ step.content }} {{ step.text }}
  </span>

  <span
    v-if="
      step.stepType === 'click' ||
      step.stepType === 'webViewClick' ||
      step.stepType === 'pocoClick'
    "
  >
    <el-tag size="small"
      >{{ $t('stepDetail.click.action') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.control.element') }}</el-tag
    >
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
  </span>
  <span
    v-if="
      step.stepType === 'iteratorAndroidElement' ||
      step.stepType === 'iteratorIOSElement' ||
      step.stepType === 'iteratorPocoElement'
    "
  >
    <el-tag size="small"
      >{{ $t('stepDetail.iterate') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.control.name') }}</el-tag
    >
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    <el-tag size="small" style="margin-left: 10px">{{
      $t('stepDetail.control.subControl')
    }}</el-tag>
  </span>
  <span
    v-if="step.stepType === 'sendKeys' || step.stepType === 'webViewSendKeys'"
  >
    <el-tag size="small"
      >{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.control.element') }}</el-tag
    >
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px">{{
      $t('stepDetail.enterText')
    }}</el-tag>
    {{ step.content }}
  </span>
  <span v-if="step.stepType === 'setClipperByKeyboard'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.set.textToClipboard')
    }}</el-tag>
    {{ step.content }}
  </span>
  <span v-if="step.stepType === 'sendKeyForce'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.inputMethod')
    }}</el-tag>
    {{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'sendKeysByActions' ||
      step.stepType === 'webViewSendKeysByActions'
    "
  >
    <el-tag size="small"
      >{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.control.element') }}</el-tag
    >
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >{{ $t('stepDetail.enterText') }}(Actions)</el-tag
    >
    {{ step.content }}
  </span>
  <span v-if="step.stepType === 'swipe2' || step.stepType === 'pocoSwipe'">
    <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px">{{
      $t('stepDetail.dragTo')
    }}</el-tag>
    <el-tag type="info" size="small">{{ step.elements[1]['eleName'] }}</el-tag>
  </span>
  <span v-if="step.stepType === 'drag2' || step.stepType === 'drag'">
    <el-tag size="small" style="margin-right: 10px">
      {{ $t('stepDetail.dragUp') }}</el-tag
    >
    <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px">{{
      $t('stepDetail.dragMove')
    }}</el-tag>
    <el-tag type="info" size="small">{{ step.elements[1]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px">
      {{ $t('stepDetail.dragDown') }}</el-tag
    >
  </span>
  <span
    v-if="
      step.stepType === 'motionEvent' || step.stepType === 'motionEventByPoint'
    "
  >
    <el-tag size="small" type="info">{{ step.elements[0]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px">{{
      $t('stepDetail.motionType.Exec')
    }}</el-tag>
    <el-tag type="info" size="small" style="margin-right: 10px">
      {{ step.text.toUpperCase() }}</el-tag
    >
  </span>
  <span
    v-if="step.stepType === 'longPress' || step.stepType === 'pocoLongPress'"
  >
    <el-tag size="small"
      >{{ $t('stepDetail.longPress') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.control.element') }}</el-tag
    >
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    {{ step.content }} ms
  </span>
  <span v-if="step.stepType === 'clear' || step.stepType === 'webViewClear'">
    <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >{{ $t('stepDetail.empty') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.inputBox') }}</el-tag
    >
  </span>
  <span
    v-if="
      step.stepType === 'getTextValue' ||
      step.stepType === 'getWebViewTextValue' ||
      step.stepType === 'getPocoTextValue'
    "
  >
    <el-tag size="small"
      >{{ $t('stepDetail.get') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.text') }}</el-tag
    >
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    {{ $t('stepDetail.getToVariable') }}：{{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'obtainElementAttr' ||
      step.stepType === 'obtainPocoElementAttr'
    "
  >
    <el-tag size="small"
      >{{ $t('stepDetail.get') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.control.attribute') }}</el-tag
    >
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    {{ $t('stepDetail.its') }} {{ step.text }}
    {{ $t('stepDetail.attributeToVariable') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'getClipperByKeyboard'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.system.keyboard.getClipperByKeyboard')
    }}</el-tag>
    {{ $t('stepDetail.getToVariable') }}：{{ step.content }}
  </span>
  <!--三个指令前端显示上保留，用于兼容老版本升级上来之后，依然能正常的显示和运行-->
  <span
    v-if="
      step.stepType === 'getText' ||
      step.stepType === 'getWebViewText' ||
      step.stepType === 'getPocoText'
    "
  >
    <el-tag size="small"
      >{{ $t('stepDetail.verify.verify') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.text') }}</el-tag
    >
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    {{ $t('stepDetail.verify.expectedValue') }}：{{ step.content }}
  </span>
  <!--大于2.5.0版本，增强的文本断言能力-->
  <span
    v-if="
      step.stepType === 'assertText' ||
      step.stepType === 'assertWebViewText' ||
      step.stepType === 'assertPocoText'
    "
  >
    <el-tag size="small"
      >{{ $t('stepDetail.verify.assert') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.text') }}</el-tag
    >
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    {{ $t('stepDetail.verify.expect') }}:
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px">{{
      getAssertTextOpe(step.content)
    }}</el-tag
    >{{ step.text }}
  </span>
  <span v-if="step.stepType === 'getTitle'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.verify.title')
    }}</el-tag>
    {{ $t('stepDetail.verify.expectedValue') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'getUrl'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.verify.url')
    }}</el-tag>
    {{ $t('stepDetail.verify.expectedValue') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'getActivity'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.verify.activity')
    }}</el-tag>
    {{ $t('stepDetail.verify.expectedValue') }}：{{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'getElementAttr' ||
      step.stepType === 'getPocoElementAttr'
    "
  >
    <el-tag size="small" style="margin-right: 10px"
      >{{ $t('stepDetail.verify.verify') }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.elementAttribute') }}</el-tag
    >
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    {{ $t('stepDetail.verify.assert') }}：
    <el-tag size="small" style="margin-right: 10px">{{ step.text }}</el-tag>
    {{ $t('stepDetail.verify.expectedValue') }}：
    <el-tag size="small" style="margin-right: 10px">{{ step.content }}</el-tag>
  </span>
  <span v-if="step.stepType === 'setTheRealPositionOfTheWindow'">
    <el-tag type="warning" size="small">{{
      $t('stepDetail.set.offset')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'assertEquals'">
    <el-tag type="warning" size="small">{{
      $t('stepDetail.verify.equalTo')
    }}</el-tag>
    {{ $t('stepDetail.verify.actualValue') }}：{{ step.text }}
    {{ $t('stepDetail.verify.expectedValue') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'assertNotEquals'">
    <el-tag type="warning" size="small">{{
      $t('stepDetail.verify.notEqual')
    }}</el-tag>
    {{ $t('stepDetail.verify.actualValue') }}：{{ step.text }}
    {{ $t('stepDetail.verify.expectedValue') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'assertTrue'">
    <el-tag type="warning" size="small">{{
      $t('stepDetail.verify.contain')
    }}</el-tag>
    {{ $t('stepDetail.verify.actualValue') }}：{{ step.text }}
    {{ $t('stepDetail.verify.expectedValue') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'assertNotTrue'">
    <el-tag type="warning" size="small">{{
      $t('stepDetail.verify.notContain')
    }}</el-tag>
    {{ $t('stepDetail.verify.actualValue') }}：{{ step.text }}
    {{ $t('stepDetail.verify.expectedValue') }}：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'stepScreen'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.img.stepScreen')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'webViewRefresh'">
    <el-tag size="small">{{ $t('stepDetail.refreshPage') }}</el-tag>
  </span>
  <span v-if="step.stepType === 'webViewBack'">
    <el-tag size="small">{{ $t('stepDetail.rollbackPage') }}</el-tag>
  </span>
  <span v-if="step.stepType === 'startPocoDriver'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.element.poco.startPocoDriver')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'closePocoDriver'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.element.poco.closePocoDriver')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'freezeSource'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.element.poco.freezeSource')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'thawSource'">
    <el-tag size="small">{{
      $t('stepDetail.label.androidOptions.element.poco.thawSource')
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'checkImage'">
    <el-tag size="small">{{ $t('stepDetail.detect') }}</el-tag>
    <el-tag
      type="info"
      style="margin-left: 10px; margin-right: 10px"
      size="small"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.imageSimilarity')
    }}</el-tag>
    {{ $t('stepDetail.verify.expectedMatchRatio') }}：{{ step.content }} %
  </span>
  <span v-if="step.stepType === 'clickByImg'">
    <el-tag size="small">{{ $t('stepDetail.localization') }}</el-tag>
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    ><el-tag size="small">{{ $t('stepDetail.andClick') }}</el-tag>
  </span>
  <span v-if="step.stepType === 'readText'">
    <el-tag size="small" style="margin-right: 10px">{{
      $t('stepDetail.textIdentifyInImage')
    }}</el-tag>
    <el-tag size="small" type="info" style="margin-right: 10px">
      {{
        step.content === 'chi_sim'
          ? $t('stepDetail.language.simplifiedChinese')
          : $t('stepDetail.language.english')
      }}</el-tag
    >
    {{ $t('stepDetail.verify.expectContain') }}：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'publicStep'">
    <el-tag type="warning" size="small">{{
      $t('stepDetail.usePublicSteps')
    }}</el-tag>
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.content
    }}</el-tag>
    <el-popover
      placement="bottom"
      :fallback-placements="['bottom', 'top', 'right', 'left']"
      popper-class="popper-auto-flow"
      :width="700"
      trigger="click"
    >
      <child-step-list-view :steps="childStep" />
      <template #reference>
        <el-button
          style="margin-left: 10px"
          size="mini"
          @click="getPublicStepInfo(step.text)"
          >{{ $t('publicStepTS.viewSteps') }}</el-button
        >
      </template>
    </el-popover>
  </span>
  <span v-if="step.stepType === 'monkey'">
    <el-tag style="margin-right: 10px" type="warning" size="small">{{
      $t('stepDetail.randomEventsTest')
    }}</el-tag>
    {{ $t('stepDetail.app.pkg') }}：{{
      JSON.parse(step.content).packageName
    }}&nbsp;&nbsp;{{ $t('stepDetail.eventsNum') }}：{{
      JSON.parse(step.content).pctNum
    }}
  </span>
  <span v-if="step.stepType === 'stepHold'">
    <el-tag size="small" style="margin-right: 5px">{{
      $t('stepDetail.set.stepsInterval')
    }}</el-tag>
    {{ $t('stepDetail.stepInterval') }} {{ step.content }} ms
  </span>
  <span v-if="step.stepType === 'pause'">
    <el-tag size="small" style="margin-right: 5px">{{
      $t('stepDetail.label.androidOptions.spec.pause')
    }}</el-tag>
    {{ $t('stepDetail.wait') }} {{ step.content }} ms
  </span>
  <span v-if="step.stepType === 'setSnapshotMaxDepth'">
    <el-tag size="small" style="margin-right: 5px">{{
      $t('stepDetail.set.maxControlTraverseDepth')
    }}</el-tag>
    {{ $t('stepDetail.max') }} {{ step.content }} {{ $t('stepDetail.layer') }}
  </span>
  <span v-if="step.stepType === 'scrollToEle'">
    <el-tag size="small"
      >{{ getScrollToDire(step.text) }}{{ $t('stepDetail.scrollTo')
      }}{{ getEleResult(step.stepType)
      }}{{ $t('stepDetail.control.element') }}</el-tag
    >
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    {{ $t('stepDetail.maxTries') }}{{ step.content
    }}{{ $t('stepDetail.times') }}
  </span>
  <span>
    <el-tag
      v-if="step.conditionType !== 3 && step.conditionType !== 0"
      size="small"
      type="warning"
      style="margin-left: 10px"
      >{{ $t('stepDetail.noException') }}</el-tag
    >
  </span>
</template>
