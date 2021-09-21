<script setup>
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {onBeforeMount, onMounted, ref} from "vue";
import axios from "../http/axios";
import logo from "./../assets/logo.png";

const store = useStore();
const router = useRouter();
const route = useRoute();
const projectData = ref([])
const theme = ref("");
const getProjectList = () => {
  axios
      .get("/controller/projects/list").then((res) => {
    projectData.value = res.data.data;
    store.commit("saveProjectList", projectData.value);
  })
}
const jump = (project) => {
  store.commit("saveProject", project);
  router.push({
    path: "/Home/" + project.id + "/Test" +
        "",
  });
}
const logout = () => {
}
const goToUrl = (url) => {
  window.open(url, "_blank");
}
const toggleClass = (t) => {
  localStorage.setItem('SonicTheme', t);
  store.commit("saveTheme", theme.value);
  document.body.className = 'sonic-' + t
}
onBeforeMount(() => {
  theme.value = localStorage.getItem('SonicTheme') ? localStorage.getItem('SonicTheme') : "light"
})
onMounted(() => {
  toggleClass(theme.value);
  getProjectList();
})
</script>
<template>
  <el-container direction="vertical">
    <el-header>
      <div class="flex-center">
        <div style="margin:0 20px;font-size: 20px;cursor:pointer" @click="store.commit('changeCollapse')"
             v-if="route.params.projectId">
          <i v-if="store.state.isCollapse === false" class="el-icon-s-fold"></i>
          <i v-if="store.state.isCollapse === true" class="el-icon-s-unfold"></i>
        </div>
        <el-menu :background-color="store.state.menuBack" :text-color="store.state.menuText"
                 :active-text-color="store.state.menuActiveText" mode="horizontal" class="el-menu-horizontal-demo font"
                 :default-active="route.path" router>
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
              :index="route.params.projectId? '/Home/' + route.params.projectId + '/Devices':'/Index/Devices'"
          ><i class="el-icon-mobile" style="margin-right: 0"></i>设备中心
          </el-menu-item>
        </el-menu>
      </div>
      <div class="flex-center demo">
        <el-tooltip :content="'当前主题: '+theme.toUpperCase()" placement="bottom">
          <el-switch v-model="theme" @change="toggleClass"
                     style="margin-right: 10px;"
                     :width="33"
                     active-value="light"
                     inactive-value="dark"
                     active-color="#C0C4CC" inactive-color="#ffffff"
                     active-icon-class="el-icon-sunny" inactive-icon-class="el-icon-moon"></el-switch>
        </el-tooltip>
        <el-menu :background-color="store.state.menuBack" :text-color="store.state.menuText"
                 :active-text-color="store.state.menuActiveText" mode="horizontal" class="el-menu-horizontal-demo font"
                 default-active="0">
          <el-menu-item :index="'/Index'" v-if="route.params.projectId|| route.fullPath==='/Index/Devices'"
                        @click="router.push('/Index')"
          >回到首页
          </el-menu-item>
          <el-sub-menu index="1">
            <template #title
            ><i class="el-icon-user"></i
            >{{
                store.state.userInfo.name
              }}
            </template
            >
            <div style="padding: 0 10px">
<!--              <el-divider class="about"-->
<!--              ><span class="font title"-->
<!--              >个人中心</span-->
<!--              ></el-divider-->
<!--              >-->
              <el-menu-item>我的信息</el-menu-item>
              <el-divider class="about"
              ><span
                  class="flex-center font title"
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
              >版本更新记录
                <el-badge
                    value="New"
                    style="margin: 0 0 5px 5px"
                ></el-badge
                >
              </el-menu-item>
              <el-divider class="about"
              ><span class="font title"
              >其他</span
              ></el-divider
              >
              <el-menu-item @click="goToUrl('http://localhost:8094/doc.html')">
                REST API
              </el-menu-item>
              <el-menu-item @click="logout"> 注销</el-menu-item>
            </div>
          </el-sub-menu>
<!--          <el-sub-menu index="2">-->
<!--            <template #title-->
<!--            ><span-->
<!--                class="flex-center font title"-->
<!--            ><img-->
<!--                style="margin-right: 5px"-->
<!--                width="20"-->
<!--                :src="logo"-->
<!--            />关于Sonic</span-->
<!--            >-->
<!--            </template-->
<!--            >-->
<!--          </el-sub-menu>-->
<!--          <el-sub-menu index="3">-->
<!--            <template #title-->
<!--            ><span class="font title"-->
<!--            >其他</span-->
<!--            >-->
<!--            </template-->
<!--            >-->
<!--          </el-sub-menu>-->
        </el-menu>
      </div>
    </el-header>
    <el-backtop :right="20" :bottom="20" target=".demo-tree-scrollbar .el-scrollbar__wrap"></el-backtop>
    <el-scrollbar class="demo-tree-scrollbar" style="height: 100%">
      <el-main v-if="route.params.projectId || route.params.deviceId|| route.fullPath==='/Index/Devices'">
        <router-view/>
      </el-main>
      <el-main v-else>
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
            <div @click="jump(project)">
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
      </el-main>
    </el-scrollbar>
  </el-container>
</template>