<script setup>
import {onMounted} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import Header from "@/components/Header.vue"
import defaultLogo from '@/assets/logo.png'

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
    <el-aside width="auto">
      <el-menu
          style="padding-top: 15px"
          :background-color="store.state.menuBack"
          :text-color="store.state.menuText"
          :active-text-color="store.state.menuActiveText"
          :collapse="store.state.isCollapse"
          :default-active="route.path"
          class="el-menu-vertical-demo font"
          router>
        <div class="flex-center" style="margin-bottom: 10px">
          <el-avatar
              :size="40"
              :src="defaultLogo"
              shape="square"
          ></el-avatar>
          <span class="project-name" v-if="!store.state.isCollapse">后台管理中心</span>
        </div>
        <el-sub-menu index="5">
          <template #title>
            <i class="el-icon-lock"></i>
            <span>权限配置</span>
          </template>
        <el-menu-item :index="'/Setting/Resources'">
          <i class="el-icon-notebook-1"></i>资源管理
        </el-menu-item>
        <el-menu-item :index="'/Setting/Roles'">
          <i class="el-icon-place"></i>角色管理
        </el-menu-item>
        <el-menu-item :index="'/Setting/Users'">
          <i class="el-icon-user"></i>用户配置
        </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <i class="el-icon-setting"></i>
            <span>系统配置</span>
          </template>
          <el-menu-item :index="'/Setting/SysJobs'">
            <i class="el-icon-time"></i>系统定时任务
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <Header></Header>
  </el-container>
</template>