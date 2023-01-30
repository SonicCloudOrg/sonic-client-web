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
import CodeEditor from './CodeEditor.vue';
import axios from '../http/axios';

const route = useRoute();
const props = defineProps({
  step: Object,
});

const summitStep = () => {
  axios.put('/controller/steps', props.step).then((resp) => {
    if (resp.code === 2000) {
      ElMessage.success({
        message: resp.message,
      });
    }
  });
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
          <el-tag size="small" type="warning" style="margin-right: 10px"
            >运行自定义脚本</el-tag
          >
          点击展开/收起脚本编辑器
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
    <el-tag size="small" style="margin-right: 10px">发送Siri指令</el-tag
    >{{ step.content }}
  </span>
  <span v-if="step.stepType === 'lock'">
    <el-tag size="small">锁定设备</el-tag>
  </span>
  <span v-if="step.stepType === 'closeKeyboard'">
    <el-tag size="small">关闭Sonic输入法</el-tag>
  </span>
  <span v-if="step.stepType === 'unLock'">
    <el-tag size="small">解锁设备</el-tag>
  </span>
  <span v-if="step.stepType === 'screenSub'">
    <el-tag size="small">左转屏幕</el-tag>
  </span>
  <span v-if="step.stepType === 'screenAdd'">
    <el-tag size="small">右转屏幕</el-tag>
  </span>
  <span v-if="step.stepType === 'screenAbort'">
    <el-tag size="small">关闭自动旋转</el-tag>
  </span>
  <span v-if="step.stepType === 'switchTouchMode'">
    <el-tag size="small" style="margin-right: 10px">触控模式设置</el-tag
    >设置为：{{ step.content }} 模式
  </span>
  <span v-if="step.stepType === 'keyCode' || step.stepType === 'keyCodeSelf'">
    <el-tag size="small">按下系统{{ step.content }}键</el-tag>
  </span>
  <span v-if="step.stepType === 'airPlaneMode'">
    <el-tag size="small" style="margin-right: 10px">切换飞行模式</el-tag
    >{{ step.content === 'true' ? '开启' : '关闭' }}
  </span>
  <span v-if="step.stepType === 'wifiMode'">
    <el-tag size="small" style="margin-right: 10px">切换WIFI模式</el-tag
    >{{ step.content === 'true' ? '开启' : '关闭' }}
  </span>
  <span v-if="step.stepType === 'locationMode'">
    <el-tag size="small" style="margin-right: 10px">切换位置服务</el-tag
    >{{ step.content === 'true' ? '开启' : '关闭' }}
  </span>
  <span v-if="step.stepType === 'switchWindowMode'">
    <el-tag size="small" style="margin-right: 10px">切换窗口模式</el-tag
    >{{ step.content === 'true' ? '多窗口模式' : '单窗口模式' }}
  </span>
  <span v-if="step.stepType === 'switchVisibleMode'">
    <el-tag size="small" style="margin-right: 10px"
      >切换Invisible控件展示</el-tag
    >{{ step.content === 'true' ? '显示' : '隐藏' }}
  </span>
  <span
    v-if="
      step.stepType === 'logElementAttr' ||
      step.stepType === 'logPocoElementAttr'
    "
  >
    <el-tag size="small">日志输出</el-tag>
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    <el-tag size="small" style="margin: 0 10px">控件信息</el-tag>
    目标属性：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'tap'">
    <el-tag size="small">点击坐标</el-tag>
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'longPressPoint'">
    <el-tag size="small">长按坐标</el-tag>
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
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >滑动拖拽到</el-tag
    >
    <el-tag type="info" size="small">{{ step.elements[1]['eleName'] }}</el-tag>
  </span>
  <span v-if="step.stepType === 'setPasteboard'">
    <el-tag size="small" style="margin-right: 10px">设置剪切板文本</el-tag>
    文本：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'getPasteboard'">
    <el-tag size="small" style="margin-right: 10px">获取剪切板文本</el-tag>
    提取到变量：{{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'findElementInterval' ||
      step.stepType === 'setDefaultFindPocoElementInterval'
    "
  >
    <el-tag size="small" style="margin-right: 10px">设置查找控件策略</el-tag>
    重试次数：{{ step.content }} 重试间隔：{{ step.text }} ms
  </span>
  <span v-if="step.stepType === 'openApp'">
    <el-tag size="small" style="margin-right: 10px">打开应用</el-tag>
    应用包名：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'terminate'">
    <el-tag size="small" style="margin-right: 10px">终止应用</el-tag>
    应用包名：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'install'">
    <el-tag size="small" style="margin-right: 10px">安装应用</el-tag>
    {{ step.content === '2' ? '从安装包列表安装' : 'App路径：' + step.text }}
  </span>
  <span v-if="step.stepType === 'uninstall'">
    <el-tag size="small" style="margin-right: 10px">卸载应用</el-tag>
    应用包名：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'runBack'">
    <el-tag size="small" style="margin-right: 10px">后台运行应用</el-tag>
    后台运行 {{ step.content }} ms
  </span>
  <span v-if="step.stepType === 'appReset'">
    <el-tag size="small" style="margin-right: 10px">清空应用缓存内存</el-tag>
    清空应用 {{ step.text }} 缓存内存
  </span>
  <span v-if="step.stepType === 'toWebView'">
    <el-tag size="small" style="margin-right: 10px">切换WebView</el-tag>
    WebView名称：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'toHandle'">
    <el-tag size="small" style="margin-right: 10px">切换Handle</el-tag>
    Handle切换信息：{{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'isExistEle' ||
      step.stepType === 'isExistWebViewEle' ||
      step.stepType === 'isExistPocoEle'
    "
  >
    <el-tag size="small" style="margin-right: 10px">判断控件元素是否存在</el-tag
    >断言：
    <el-tag type="info" size="small" style="margin-right: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    {{ step.content === 'true' ? '存在' : '不存在' }}
  </span>
  <span
    v-if="
      step.stepType === 'click' ||
      step.stepType === 'webViewClick' ||
      step.stepType === 'pocoClick'
    "
  >
    <el-tag size="small">点击控件元素</el-tag>
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
    <el-tag size="small">迭代控件</el-tag>
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.elements[0]['eleName']
    }}</el-tag>
    <el-tag size="small" style="margin-left: 10px">子控件</el-tag>
  </span>
  <span
    v-if="step.stepType === 'sendKeys' || step.stepType === 'webViewSendKeys'"
  >
    <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >输入文本</el-tag
    >
    {{ step.content }}
  </span>
  <span v-if="step.stepType === 'sendKeyForce'">
    <el-tag size="small" style="margin-right: 10px">输入法输入</el-tag>
    {{ step.content }}
  </span>
  <span v-if="step.stepType === 'sendKeysByActions'">
    <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >输入文本(Actions)</el-tag
    >
    {{ step.content }}
  </span>
  <span v-if="step.stepType === 'swipe2' || step.stepType === 'pocoSwipe'">
    <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
    <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >滑动拖拽到</el-tag
    >
    <el-tag type="info" size="small">{{ step.elements[1]['eleName'] }}</el-tag>
  </span>
  <span
    v-if="step.stepType === 'longPress' || step.stepType === 'pocoLongPress'"
  >
    <el-tag size="small">长按控件元素</el-tag>
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
      >清空输入框</el-tag
    >
  </span>
  <span
    v-if="
      step.stepType === 'getTextValue' ||
      step.stepType === 'getWebViewTextValue' ||
      step.stepType === 'getPocoTextValue'
    "
  >
    <el-tag size="small">获取文本</el-tag>
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    获取到变量：{{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'getText' ||
      step.stepType === 'getWebViewText' ||
      step.stepType === 'getPocoText'
    "
  >
    <el-tag size="small">验证文本</el-tag>
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    期望值：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'getTitle'">
    <el-tag size="small" style="margin-right: 10px">验证标题</el-tag>
    期望值：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'getUrl'">
    <el-tag size="small" style="margin-right: 10px">验证网址</el-tag>
    期望值：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'getActivity'">
    <el-tag size="small" style="margin-right: 10px">验证Activity</el-tag>
    期望值：{{ step.content }}
  </span>
  <span
    v-if="
      step.stepType === 'getElementAttr' ||
      step.stepType === 'getPocoElementAttr'
    "
  >
    <el-tag size="small" style="margin-right: 10px">验证元素属性</el-tag>
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    断言：
    <el-tag size="small" style="margin-right: 10px">{{ step.text }}</el-tag>
    期望值：
    <el-tag size="small" style="margin-right: 10px">{{ step.content }}</el-tag>
  </span>
  <span v-if="step.stepType === 'setTheRealPositionOfTheWindow'">
    <el-tag type="warning" size="small">设置偏移量</el-tag>
  </span>
  <span v-if="step.stepType === 'assertEquals'">
    <el-tag type="warning" size="small">断言验证(相等)</el-tag>
    真实值：{{ step.text }} 期望值：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'assertTrue'">
    <el-tag type="warning" size="small">断言验证(包含)</el-tag>
    真实值：{{ step.text }} 期望值：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'assertNotTrue'">
    <el-tag type="warning" size="small">断言验证(不包含)</el-tag>
    真实值：{{ step.text }} 期望值：{{ step.content }}
  </span>
  <span v-if="step.stepType === 'stepScreen'">
    <el-tag size="small">获取截图</el-tag>
  </span>
  <span v-if="step.stepType === 'webViewRefresh'">
    <el-tag size="small">刷新页面</el-tag>
  </span>
  <span v-if="step.stepType === 'webViewBack'">
    <el-tag size="small">回退页面</el-tag>
  </span>
  <span v-if="step.stepType === 'startPocoDriver'">
    <el-tag size="small">启动PocoDriver</el-tag>
  </span>
  <span v-if="step.stepType === 'closePocoDriver'">
    <el-tag size="small">关闭PocoDriver</el-tag>
  </span>
  <span v-if="step.stepType === 'freezeSource'">
    <el-tag size="small">冻结控件树</el-tag>
  </span>
  <span v-if="step.stepType === 'thawSource'">
    <el-tag size="small">解冻控件树</el-tag>
  </span>
  <span v-if="step.stepType === 'checkImage'">
    <el-tag size="small">检测</el-tag>
    <el-tag
      type="info"
      style="margin-left: 10px; margin-right: 10px"
      size="small"
      >{{ step.elements[0]['eleName'] }}</el-tag
    >
    <el-tag size="small" style="margin-right: 10px">图像相似度</el-tag>
    期望匹配率：{{ step.content }} %
  </span>
  <span v-if="step.stepType === 'clickByImg'">
    <el-tag size="small">定位</el-tag>
    <el-tag
      type="info"
      size="small"
      style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
    ><el-tag size="small">并点击</el-tag>
  </span>
  <span v-if="step.stepType === 'readText'">
    <el-tag size="small" style="margin-right: 10px">图像文字识别</el-tag>
    <el-tag size="small" type="info" style="margin-right: 10px">
      {{ step.content === 'chi_sim' ? '简体中文' : '英文' }}</el-tag
    >
    期望包含：{{ step.text }}
  </span>
  <span v-if="step.stepType === 'publicStep'">
    <el-tag type="warning" size="small">使用公共步骤</el-tag>
    <el-tag type="info" size="small" style="margin-left: 10px">{{
      step.content
    }}</el-tag>
  </span>
  <span v-if="step.stepType === 'monkey'">
    <el-tag style="margin-right: 10px" type="warning" size="small"
      >随机事件测试</el-tag
    >
    应用包名：{{ JSON.parse(step.content).packageName }}&nbsp;&nbsp;事件数：{{
      JSON.parse(step.content).pctNum
    }}
  </span>
  <span v-if="step.stepType === 'stepHold'">
    <el-tag size="small" style="margin-right: 5px">步骤间隔设置</el-tag>
    每个步骤间隔 {{ step.content }} ms
  </span>
  <span v-if="step.stepType === 'pause'">
    <el-tag size="small" style="margin-right: 5px">强制等待</el-tag>
    等待 {{ step.content }} ms
  </span>
  <span>
    <el-tag
      v-if="step.conditionType !== 3 && step.conditionType !== 0"
      size="small"
      type="warning"
      style="margin-left: 10px"
      >无异常</el-tag
    >
  </span>
</template>
