<script setup>
import {onMounted} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import Header from "./Header.vue"

const store = useStore();
const route = useRoute();
onMounted(() => {
  const windowWidth = document.body.clientWidth;
  if (windowWidth < 1200) {
    store.commit("autoChangeCollapse");
  }
})
</script>

<template>
  <el-container>
    <el-aside width="auto" v-if="route.params.projectId">
      <el-menu
          :background-color="store.state.menuBack" :text-color="store.state.menuText"
          :active-text-color="store.state.menuActiveText"
          :collapse="store.state.isCollapse"
          :default-active="route.path"
          :unique-opened="true"
          class="el-menu-vertical-demo font"
      >
        <p class="flex-center">
          <el-avatar
              :size="40"
              :src="store.state.project.projectImg"
              shape="square"
          ></el-avatar>
          <span class="project-name" v-if="!store.state.isCollapse">{{
              store.state.project.projectName
            }}</span>
        </p>
        <el-menu-item :index="'/' + route.params.projectId + '/ProjectIndex'">
          <i class="el-icon-data-analysis"></i>
          <template #title>项目概况</template>
        </el-menu-item>

        <el-sub-menu index="2">
          <template #title>
            <i class="el-icon-folder-opened"></i>
            <span>测试用例管理</span>
          </template>
          <el-sub-menu index="1-4">
            <template #title><i class="el-icon-tickets"></i>测试用例</template>
            <el-menu-item :index="'/' + route.params.projectId + '/AndroidTestCases'">
              <i class="el-icon-d-arrow-right"></i>安卓端测试用例
            </el-menu-item>
            <el-menu-item :index="'/' + route.params.projectId + '/IOSTestCases'">
              <i class="el-icon-d-arrow-right"></i>iOS端测试用例
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item :index="'/' + route.params.projectId + '/TestSuites'">
            <i class="el-icon-document-copy"></i>测试套件
          </el-menu-item>
          <el-menu-item :index="'/' + route.params.projectId + '/Jobs'">
            <i class="el-icon-timer"></i>定时任务
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <i class="el-icon-lock"></i>
            <span>测试数据管理</span>
          </template>
          <el-menu-item :index="'/' + route.params.projectId + '/Elements'">
            <i class="el-icon-thumb"></i>元素管理
          </el-menu-item>
          <el-menu-item :index="'/' + route.params.projectId + '/PublicStep'">
            <i class="el-icon-star-off"></i>公共步骤
          </el-menu-item>
          <el-menu-item :index="'/' + route.params.projectId + '/GlobalParams'">
            <i class="el-icon-user"></i>全局参数
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <i class="el-icon-paperclip"></i>
            <span>测试结果分析</span>
          </template>
          <el-menu-item :index="'/' + route.params.projectId + '/Results'">
            <i class="el-icon-s-data"></i>测试结果
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="7">
          <template #title>
            <i class="el-icon-connection"></i>
            <span>持续集成设置</span>
          </template>
          <el-menu-item :index="'/' + route.params.projectId + '/InstallPackage'">
            <i class="el-icon-sold-out"></i>批量装包
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <i class="el-icon-setting"></i>
            <span>项目高级设置</span>
          </template>
          <el-menu-item :index="'/' + route.params.projectId + '/Modules'">
            <i class="el-icon-price-tag"></i>模块管理
          </el-menu-item>
          <el-menu-item :index="'/' + route.params.projectId + '/Versions'">
            <i class="el-icon-coin"></i>迭代管理
          </el-menu-item>
          <el-menu-item :index="'/' + route.params.projectId + '/ProjectOption'">
            <i class="el-icon-key"></i>其他设置
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <Header></Header>
  </el-container>
</template>