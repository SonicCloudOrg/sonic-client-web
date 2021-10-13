<script setup>
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {onBeforeMount, onMounted, ref} from "vue";
import axios from "../http/axios";
import logo from "./../assets/logo.png";
import {Fold, Expand} from "@element-plus/icons";
import ProjectUpdate from '../components/ProjectUpdate.vue'
import defaultLogo from '../assets/logo.png'
import {Cellphone, HomeFilled} from "@element-plus/icons";

const dialogUserInfo = ref(false)
const dialogVisible = ref(false)
const store = useStore();
const router = useRouter();
const route = useRoute();
const projectData = ref([])
const theme = ref("");
const flush = () => {
  dialogVisible.value = false
  getProjectList();
}
const getProjectList = () => {
  axios
      .get("/controller/projects/list").then((resp) => {
    projectData.value = resp.data;
    store.commit("saveProjectList", projectData.value);
  })
}
const jump = (project) => {
  store.commit("saveProject", project);
  router.push({
    path: "/Home/" + project.id + "/ProjectIndex"
  });
}
const pushIndex = (path) => {
  router.push({
    path
  });
}
const logout = () => {
  store.commit("clearAuth");
  router.replace({path: "/Login"})
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
      <div class="flex-center demo">
        <div style="margin:0 20px;cursor:pointer" @click="store.commit('changeCollapse')"
             v-if="route.params.projectId">
          <el-icon :size="20" style="vertical-align: middle;" v-if="store.state.isCollapse === false">
            <Fold/>
          </el-icon>
          <el-icon :size="20" style="vertical-align: middle;" v-else>
            <Expand/>
          </el-icon>
        </div>

        <el-tooltip :content="'当前主题: '+theme.toUpperCase()" placement="bottom">
          <el-switch v-model="theme" @change="toggleClass"
                     style="margin-left: 15px;"
                     :width="33"
                     active-value="light"
                     inactive-value="dark"
                     active-color="#C0C4CC" inactive-color="#ffffff"
                     active-icon-class="el-icon-sunny" inactive-icon-class="el-icon-moon"></el-switch>
        </el-tooltip>
      </div>
      <div class="flex-center">

        <el-menu :background-color="store.state.menuBack" :text-color="store.state.menuText"
                 :active-text-color="store.state.menuActiveText" mode="horizontal" class="el-menu-horizontal-demo font"
                 :default-active="route.path">
          <el-menu-item :index="route.params.projectId? '/Home/' + route.params.projectId + '/Devices':'/Index/Devices'"
                        @click="pushIndex(route.params.projectId? '/Home/' + route.params.projectId + '/Devices':'/Index/Devices')"
          >
            <el-icon :size="18" style="vertical-align: middle;margin-right: 5px">
              <Cellphone/>
            </el-icon>
            设备中心
          </el-menu-item>
          <el-menu-item index="/Index" @click="pushIndex('/Index')"
                        v-if="route.params.projectId|| route.fullPath==='/Index/Devices'"
          >
            <el-icon :size="18" style="vertical-align: middle;margin-right: 5px">
              <HomeFilled/>
            </el-icon>
            回到首页
          </el-menu-item>
          <el-sub-menu index="1">
            <template #title
            >
              <el-avatar size="medium"
                         style="background: #409eff!important; margin-right: 5px"
              >
                {{
                  (store.state.userInfo.userName && store.state.userInfo.userName.length > 1) ? store.state.userInfo.userName.substring(store.state.userInfo.userName.length - 2) : store.state.userInfo.userName
                }}
              </el-avatar
              >
              {{
                store.state.userInfo.userName
              }}
            </template
            >
            <el-menu-item index="1-1" @click="dialogUserInfo = true">我的信息</el-menu-item>
            <el-menu-item index="1-2">修改密码</el-menu-item>
            <el-menu-item index="1-3" @click="logout"> 注销</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title
            ><span
                class="flex-center font title"
            ><img
                style="margin-right: 5px"
                width="20"
                :src="logo"
            />关于Sonic</span
            >
            </template
            >
            <el-menu-item index="2-1"
                          @click="goToUrl('https://github.com/ZhouYixun/sonic-server')"
            >Sonic官方网站
            </el-menu-item
            >
            <el-menu-item index="2-2"
                          @click="goToUrl('https://github.com/ZhouYixun/sonic-server')"
            >版本更新记录
              <el-badge
                  value="New"
                  style="margin: 0 0 5px 5px"
              ></el-badge
              >
            </el-menu-item>
            <el-menu-item index="2-3"
                          @click="goToUrl(axios.defaults.baseURL.substring(0,axios.defaults.baseURL.length-4)+'/doc.html')">
              REST API
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </el-header>
    <el-backtop :right="20" :bottom="20" target=".demo-tree-scrollbar .el-scrollbar__wrap"></el-backtop>
    <el-dialog v-model="dialogVisible" title="项目信息" width="600px">
      <project-update v-if="dialogVisible" :is-update="false" @flush="flush"/>
    </el-dialog>
    <el-dialog
        title="我的信息"
        v-model="dialogUserInfo"
        width="420px"
        center
    >
      <el-form
          label-position="left"
          class="demo-table-expand"
          label-width="90px"
          style="margin-left: 10px; word-break: break-all"
      >
        <el-form-item label="用户名">
          <span>{{ store.state.userInfo.userName }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-tag size="small">{{ store.state.userInfo.role === 2 ? '测试工程师' : '开发工程师' }}</el-tag>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-scrollbar class="demo-tree-scrollbar" style="height: 100%">
      <el-main v-if="route.params.projectId || route.params.deviceId|| route.fullPath==='/Index/Devices'">
        <router-view/>
      </el-main>
      <el-main v-else>
        <el-alert
            title="欢迎来到Sonic云真机测试平台，请选择项目进入"
            type="info"
            center
            :closable="false"
        >
        </el-alert>
        <div style="text-align: center">
          <el-button type="primary" size="small" style="margin-top: 15px" @click="dialogVisible = true">新增项目</el-button>
        </div>
        <el-row style="margin-top: 10px" justify="center" type="flex" v-if="projectData&&projectData.length>0">
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
                      :src="project['projectImg'].length>0?project['projectImg']:defaultLogo"
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
                        project['projectName']
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
                        project['projectDes'].length > 30
                            ? project['projectDes'].substring(0, 30) + "..."
                            : project['projectDes']
                      }}
                    </p>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else :image-size="200"></el-empty>
      </el-main>
    </el-scrollbar>
  </el-container>
</template>