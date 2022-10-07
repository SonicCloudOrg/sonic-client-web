<script setup>
import {onMounted} from "vue";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import Header from "../components/Header.vue"
import defaultLogo from '../assets/logo.png'

import {useI18n} from 'vue-i18n'
const {t: $t} = useI18n()

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
          style="padding-top: 15px"
          :background-color="store.state.menuBack"
          :text-color="store.state.menuText"
          :active-text-color="store.state.menuActiveText"
          :collapse="store.state.isCollapse"
          :default-active="route.path"
          :unique-opened="true"
          class="el-menu-vertical-demo font"
          router
      >
        <div class="flex-center" style="margin-bottom: 10px">
          <el-avatar
              :size="40"
              :src="(store.state.project['projectImg']&&store.state.project['projectImg'].length>0)?store.state.project['projectImg']:defaultLogo"
              shape="square"
          ></el-avatar>
          <span class="project-name" v-if="!store.state.isCollapse">{{
              store.state.project['projectName']
            }}</span>
        </div>
        <el-menu-item :index="'/Home/' + route.params.projectId + '/ProjectIndex'">
          <i class="el-icon-data-analysis"></i>
          <template #title>{{$t('homeTS.projectOverview')}}</template>
        </el-menu-item>

        <el-sub-menu index="2">
          <template #title>
            <i class="el-icon-folder-opened"></i>
            <span>{{$t('homeTS.testCaseManagement')}}</span>
          </template>
          <el-sub-menu index="1-4">
            <template #title><i class="el-icon-tickets"></i>{{$t('homeTS.testCase.case')}}</template>
            <el-menu-item :index="'/Home/' + route.params.projectId + '/AndroidTestCase'">
              <i class="el-icon-d-arrow-right"></i>{{$t('homeTS.testCase.adCase')}}
            </el-menu-item>
            <el-menu-item :index="'/Home/' + route.params.projectId + '/IOSTestCase'">
              <i class="el-icon-d-arrow-right"></i>{{$t('homeTS.testCase.iosCase')}}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/TestSuites'">
            <i class="el-icon-document-copy"></i>{{$t('homeTS.testSuite')}}
          </el-menu-item>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/Jobs'">
            <i class="el-icon-timer"></i>{{$t('routes.timedTask')}}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <i class="el-icon-lock"></i>
            <span>{{$t('homeTS.testDataManagement')}}</span>
          </template>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/Elements'">
            <i class="el-icon-thumb"></i>{{$t('routes.controlElement')}}
          </el-menu-item>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/PublicStep'">
            <i class="el-icon-star-off"></i>{{$t('routes.publicSteps')}}
          </el-menu-item>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/Scripts'">
            <i class="el-icon-document-add"></i>{{$t('routes.scripts')}}
          </el-menu-item>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/GlobalParams'">
            <i class="el-icon-user"></i>{{$t('routes.globalParameter')}}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <i class="el-icon-paperclip"></i>
            <span>{{$t('homeTS.testResults')}}</span>
          </template>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/Results'">
            <i class="el-icon-s-data"></i>{{$t('routes.testResult')}}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="7">
          <template #title>
            <i class="el-icon-connection"></i>
            <span>{{$t('homeTS.setting')}}</span>
          </template>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/Packages'" >
            <i class="el-icon-suitcase"></i>{{$t('homeTS.package.mange')}}
          </el-menu-item>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/Crash'" disabled>
            <i class="el-icon-position"></i>{{$t('homeTS.crashReport')}}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <i class="el-icon-setting"></i>
            <span>{{$t('homeTS.projectSetting.setting')}}</span>
          </template>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/Modules'">
            <i class="el-icon-price-tag"></i>{{$t('homeTS.projectSetting.mange')}}
          </el-menu-item>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/Versions'">
            <i class="el-icon-coin"></i>{{$t('homeTS.projectSetting.update')}}
          </el-menu-item>
          <el-menu-item :index="'/Home/' + route.params.projectId + '/ProjectOption'">
            <i class="el-icon-key"></i>{{$t('routes.projectSetting')}}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <Header></Header>
  </el-container>
</template>
