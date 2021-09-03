<template>
  <el-container>
    <el-aside width="auto">
      <el-menu
          :collapse="store.state.isCollapse"
          :default-active="route.path"
          active-text-color="#409EFF"
          :unique-opened="true"
          class="el-menu-vertical-demo"
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
        <el-menu-item :index="'/Home/' + projectId + '/ProjectIndex'">
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
            <el-menu-item :index="'/Home/' + projectId + '/AndroidTestCases'">
              <i class="el-icon-d-arrow-right"></i>安卓端测试用例
            </el-menu-item>
            <el-menu-item :index="'/Home/' + projectId + '/IOSTestCases'">
              <i class="el-icon-d-arrow-right"></i>iOS端测试用例
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item :index="'/Home/' + projectId + '/TestSuites'">
            <i class="el-icon-document-copy"></i>测试套件
          </el-menu-item>
          <el-menu-item :index="'/Home/' + projectId + '/Jobs'">
            <i class="el-icon-timer"></i>定时任务
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <i class="el-icon-lock"></i>
            <span>测试数据管理</span>
          </template>
          <el-menu-item :index="'/Home/' + projectId + '/Elements'">
            <i class="el-icon-thumb"></i>元素管理
          </el-menu-item>
          <el-menu-item :index="'/Home/' + projectId + '/PublicStep'">
            <i class="el-icon-star-off"></i>公共步骤
          </el-menu-item>
          <el-menu-item :index="'/Home/' + projectId + '/GlobalParams'">
            <i class="el-icon-user"></i>全局参数
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <i class="el-icon-paperclip"></i>
            <span>测试结果分析</span>
          </template>
          <el-menu-item :index="'/Home/' + projectId + '/Results'">
            <i class="el-icon-s-data"></i>测试结果
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="7">
          <template #title>
            <i class="el-icon-connection"></i>
            <span>持续集成设置</span>
          </template>
          <el-menu-item :index="'/Home/' + projectId + '/InstallPackage'">
            <i class="el-icon-sold-out"></i>批量装包
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <i class="el-icon-setting"></i>
            <span>项目高级设置</span>
          </template>
          <el-menu-item :index="'/Home/' + projectId + '/Modules'">
            <i class="el-icon-price-tag"></i>模块管理
          </el-menu-item>
          <el-menu-item :index="'/Home/' + projectId + '/Versions'">
            <i class="el-icon-coin"></i>迭代管理
          </el-menu-item>
          <el-menu-item :index="'/Home/' + projectId + '/ProjectOption'">
            <i class="el-icon-key"></i>其他设置
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container direction="vertical">
      <div style="height: 100%">
        <el-header>
          <el-menu mode="horizontal" class="el-menu-horizontal-demo">
            <el-menu-item
                index="1"
                @click="store.commit('changeCollapse')"
                v-if="route.params.projectId"
            >
              <i v-if="store.state.isCollapse === false" class="el-icon-s-fold"></i>
              <i v-if="store.state.isCollapse === true" class="el-icon-s-unfold"></i>
            </el-menu-item>
            <el-menu-item v-else @click="addStar()" index="2">
              <i class="el-icon-refresh"></i>
            </el-menu-item>
            <!-- <el-sub-menu index="1">
                    <template #title>
                      <i class="el-icon-monitor" style="margin-right: 0"></i>
                      <span>Agent状态</span>
                      <el-badge
                        :value="onlineNum"
                        type="success"
                        style="margin-top: -4px; margin-left: 3px"
                      >
                      </el-badge>
                    </template>
                    <el-menu-item
                      v-for="agent in resourceList"
                      :key="agent.id"
                      @click="findByWebHost(agent)"
                    >
                      <div style="width: 360px">
                        <el-image
                          style="
                            width: 35px;
                            position: absolute;
                            top: 0px;
                            bottom: 0px;
                            margin: auto;
                          "
                          fit="contain"
                          :src="require('../../src/assets/img/agent.png')"
                        >
                        </el-image>
                        <span style="margin-left: 38px"
                          >{{ agent.agentName }}
                          <span
                            style="
                              color: #8492a6;
                              font-size: 10px;
                              font-style: italic;
                            "
                            >v{{ agent.version }}</span
                          ></span
                        >
                        <span style="position: absolute; right: 10px">
                          <span
                            style="
                              color: #8492a6;
                              font-size: 10px;
                              font-style: italic;
                            "
                            >IP：{{ agent.ip }}</span
                          >
                          <el-tag
                            size="small"
                            type="success"
                            style="margin-left: 7px"
                            v-if="agent.status === 'ONLINE'"
                            >在线</el-tag
                          >
                          <el-tag
                            size="small"
                            type="info"
                            style="margin-left: 7px"
                            v-if="agent.status === 'OFFLINE'"
                            >离线</el-tag
                          >
                        </span>
                      </div>
                    </el-menu-item>
                  </el-sub-menu> -->
            <el-menu-item
                index="3"
                @click="
                goToDevices(
                  route.params.projectId
                    ? '/' + route.params.projectId + '/Devices'
                    : '/Devices'
                )
              "
            ><i class="el-icon-mobile" style="margin-right: 0"></i>设备中心
            </el-menu-item>
          </el-menu>
          <el-menu mode="horizontal" class="el-menu-horizontal-demo">
            <el-sub-menu index="1">
              <template #title
              ><i class="el-icon-menu"></i
              >切换项目
              </template
              >
              <el-menu-item
                  v-for="project in projectData"
                  v-show="project.id != route.params.projectId"
                  :key="project.id"
                  @click="jump(project.id)"
              >
                <el-avatar
                    style="margin-right: 10px"
                    :size="32"
                    :src="project.projectImg"
                    shape="square"
                ></el-avatar
                >
                {{ project.projectName }}
              </el-menu-item
              >
            </el-sub-menu>
            <el-sub-menu index="2">
              <template #title
              ><i class="el-icon-user"></i
              >{{
                  store.state.userInfo.name
                }}
              </template
              >
              <div style="padding: 0 10px">
                <el-menu-item @click="dialogSelf = true">个人信息</el-menu-item>
                <el-divider
                ><span
                    style="font-size: 13px; color: #999; white-space: nowrap"
                    class="flex-center"
                ><img
                    style="margin-right: 5px"
                    width="20"
                    :src="logo"
                />关于Sonic</span
                ></el-divider
                >
                <el-menu-item
                    @click="goToUrl('https://github.com/ZhouYixun/sonic-server')"
                >Sonic官方网站
                </el-menu-item
                >
                <el-menu-item
                    @click="goToUrl('https://github.com/ZhouYixun/sonic-server')"
                >Sonic使用文档
                </el-menu-item
                >
                <el-menu-item
                    @click="goToUrl('https://github.com/ZhouYixun/sonic-server')"
                >Sonic手机助手
                </el-menu-item
                >
                <el-menu-item
                    @click="goToUrl('https://github.com/ZhouYixun/sonic-server')"
                >版本更新记录
                  <el-badge
                      value="New"
                      style="margin: 0 0 5px 5px"
                  ></el-badge
                  >
                </el-menu-item>
              </div>
              <div style="padding: 0 10px">
                <el-divider
                ><span style="font-size: 13px; color: #999; white-space: nowrap"
                >其他</span
                ></el-divider
                >
                <el-menu-item @click="goToUrl('http://localhost:8094/doc.html')">
                  REST API
                </el-menu-item>
                <el-menu-item @click="logout()"> 注销</el-menu-item>
              </div>
            </el-sub-menu>
          </el-menu>
        </el-header>

        <!-- <el-main>
              <router-view v-if="$route.params.projectId" />
              <router-view
                v-else-if="
                  $route.name === 'Devices' ||
                  $route.name === '404' ||
                  $route.name === '500'
                "
              />
              <div v-else>
                <el-alert
                  title="欢迎来到Sonic-UI自动化测试平台，请选择项目进入"
                  type="info"
                  center
                  :closable="false"
                >
                </el-alert>
                <el-row style="margin-top: 10px" justify="center" type="flex">
                  <el-col
                    v-for="project in projectData"
                    :key="project"
                    :xs="12"
                    :sm="8"
                    :md="8"
                    :lg="4"
                    :xl="3"
                  >
                    <div @click="jump(project.id)">
                      <el-card
                        style="margin: 10px 10px; cursor: pointer"
                        shadow="hover"
                      >
                        <div style="text-align: center">
                          <el-avatar
                            :src="project.projectImg"
                            :size="150"
                            shape="square"
                          ></el-avatar>
                        </div>
                        <el-form
                          label-position="left"
                          class="demo-table-expand"
                          style="margin-top: 10px"
                        >
                          <el-form-item style="text-align: center">
                            <strong style="font-size: 17px">{{
                              project.projectName
                            }}</strong>
                          </el-form-item>
                          <el-form-item>
                            <p
                              style="
                                text-indent: 2em;
                                line-height: 30px;
                                margin-top: 0px;
                              "
                            >
                              {{
                                project.projectDes.length > 30
                                  ? project.projectDes.substring(0, 30) + "..."
                                  : project.projectDes
                              }}
                            </p>
                          </el-form-item>
                        </el-form>
                      </el-card>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-main> -->
        <!-- </el-scrollbar> -->
      </div>
    </el-container>
  </el-container>
</template>

<style>
@import "./assets/common.css";
</style>

<script setup>
import './assets/light.css'
import './assets/dark.css'
import {ref, onMounted} from "vue";
import {useStore} from "vuex";
import {useRouter, useRoute} from "vue-router";
import logo from "./assets/logo.png";
// import axios from "../http/axios";
const store = useStore();
const router = useRouter();
const route = useRoute();
const projectData = ref([{"id": 1, "projectName": "test", "projectImg": "http://test.png"}])
const jump = (id) => {
  projectData.value[0].projectName = id
}
const toggleClass = (element, className) => {
  if (!element || !className) {
    return
  }
  localStorage.setItem('SonicTheme', className);
  element.className = className
}
onMounted(() => {
  toggleClass(document.body, localStorage.getItem('SonicTheme') ? localStorage.getItem('SonicTheme') : "light");
})
</script>
