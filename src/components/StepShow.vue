<script setup>
defineProps({
  step: Object,
})
</script>
<template>
   <span v-if="step.stepType === 'lock'">
      <el-tag size="small">锁定设备</el-tag>
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
  <span v-if="step.stepType === 'keyCode'">
      <el-tag size="small">按下系统{{ step.content }}键</el-tag>
  </span>
  <span v-if="step.stepType === 'hideKey'">
      <el-tag size="small">隐藏键盘</el-tag>
    </span>
  <span v-if="step.stepType === 'airPlaneMode'">
      <el-tag size="small">切换飞行模式</el-tag>
    </span>
  <span v-if="step.stepType === 'wifiMode'">
      <el-tag size="small">切换WIFI模式</el-tag>
    </span>
  <span v-if="step.stepType === 'locationMode'">
      <el-tag size="small">切换位置服务</el-tag>
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
  <span v-if="step.stepType === 'zoom'">
      <el-tag size="small">多点触控</el-tag>
      <el-tag
          type="info"
          size="small"
          style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
      >
      <el-tag size="small">移动到</el-tag>
      <el-tag
          type="info"
          size="small"
          style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[1]['eleName'] }}</el-tag
      >同时
      <el-tag
          type="info"
          size="small"
          style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[2]['eleName'] }}</el-tag
      >
      <el-tag size="small">移动到</el-tag>
      <el-tag type="info" size="small" style="margin-left: 10px">{{
          step.elements[3]['eleName']
        }}</el-tag>
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
      App路径：{{ step.text }}
    </span>
  <span v-if="step.stepType === 'uninstall'">
      <el-tag size="small" style="margin-right: 10px">卸载应用</el-tag>
      应用包名：{{ step.text }}
    </span>
  <span v-if="step.stepType === 'runBack'">
      <el-tag size="small" style="margin-right: 10px">后台运行应用</el-tag>
      后台运行 {{ step.content }} ms
    </span>
  <span v-if="step.stepType === 'toWebView'">
      <el-tag size="small" style="margin-right: 10px">切换WebView</el-tag>
      WebView名称：{{ step.content }}
    </span>
  <span v-if="step.stepType === 'toHandle'">
      <el-tag size="small" style="margin-right: 10px">切换Handle</el-tag>
      Handle页面标题：{{ step.content }}
    </span>
  <span v-if="step.stepType === 'click'">
      <el-tag size="small">点击控件元素</el-tag>
      <el-tag type="info" size="small" style="margin-left: 10px">{{
          step.elements[0]['eleName']
        }}</el-tag>
    </span>
  <span v-if="step.stepType === 'sendKeys'">
      <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
      <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >输入文本</el-tag
      >
      {{ step.content }}
    </span>
  <span v-if="step.stepType === 'swipe2'">
      <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
      <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >滑动拖拽到</el-tag
      >
      <el-tag type="info" size="small">{{ step.elements[1]['eleName'] }}</el-tag>
    </span>
  <span v-if="step.stepType === 'longPress'">
      <el-tag size="small">长按控件元素</el-tag>
      <el-tag
          type="info"
          size="small"
          style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
      >
      {{ step.content }} ms
    </span>
  <span v-if="step.stepType === 'clear'">
      <el-tag type="info" size="small">{{ step.elements[0]['eleName'] }}</el-tag>
      <el-tag size="small" style="margin-left: 10px; margin-right: 10px"
      >清空输入框</el-tag
      >
    </span>
  <span v-if="step.stepType === 'getTextValue'">
      <el-tag size="small">获取文本</el-tag>
      <el-tag
          type="info"
          size="small"
          style="margin-left: 10px; margin-right: 10px"
      >{{ step.elements[0]['eleName'] }}</el-tag
      >
      获取到变量：{{ step.content }}
    </span>
  <span v-if="step.stepType === 'getText'">
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
        {{ step.content === "chi_sim" ? "简体中文" : "英文" }}</el-tag
      >
      期望包含：{{ step.text }}
    </span>
  <span v-if="step.stepType === 'publicStep'">
      <el-tag type="warning" size="small">使用公共步骤</el-tag>
      <el-tag
          type="info"
          size="small"
          style="margin-left: 10px;"
      >{{ step.content }}</el-tag
      >
    </span>
  <span v-if="step.stepType === 'monkey'">
      <el-tag style="margin-right: 10px" type="warning" size="small">随机事件测试</el-tag>
     应用包名：{{ JSON.parse(step.content).packageName }}&nbsp;&nbsp;事件数：{{ JSON.parse(step.content).pctNum }}
    </span>
  <span v-if="step.stepType === 'pause'">
      <el-tag size="small" style="margin-right: 5px">强制等待</el-tag>
      等待 {{ step.content }} ms
    </span>
</template>