<script setup>
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {onBeforeMount, onMounted, ref, watch} from "vue";
import axios from "../http/axios";
import logo from "./../assets/logo.png";
import {Fold, Expand} from "@element-plus/icons";
import ProjectUpdate from '../components/ProjectUpdate.vue'
import defaultLogo from '../assets/logo.png'
import {Cellphone, HomeFilled} from "@element-plus/icons";
import {ElMessage} from "element-plus";
import {localeList} from '@/config/locale'
import useLocale from '@/locales/useLocale'
import {useI18n} from 'vue-i18n'

const changePwdForm = ref(null)
const changePwd = ref({
  oldPwd: "",
  newPwd: "",
  newPwdSec: ""
})
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error($t('form.notEmpty')))
  } else {
    if (changePwd.value.newPwd !== changePwd.value.newPwdSec) {
      callback(new Error($t('form.differentInput')))
    }
    callback()
  }
}
const dialogChangePwd = ref(false)
watch(dialogChangePwd, (newValue, oldValue) => {
  if (!newValue) {
    changePwd.value = {
      oldPwd: "",
      newPwd: "",
      newPwdSec: ""
    }
  }
})
const changePwdSummit = () => {
  changePwdForm['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/users", {
        oldPwd: changePwd.value.oldPwd,
        newPwd: changePwd.value.newPwd
      }).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          dialogChangePwd.value = false
        }
      })
    }
  })
}
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

// 国际化设置
const {t: $t} = useI18n()
const changeLocaleHandler = function (val) {
  const {changeLocale} = useLocale(store)
  changeLocale(val.index)
}

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
        <el-tooltip :content="$t('layout.theme')+theme.toUpperCase()" placement="bottom">
          <el-switch v-model="theme" @change="toggleClass"
                     style="margin-left: 15px;"
                     :width="33"
                     active-value="light"
                     inactive-value="dark"
                     active-color="#C0C4CC" inactive-color="#ffffff"
                     active-icon-class="el-icon-sunny" inactive-icon-class="el-icon-moon"></el-switch>
        </el-tooltip>
        <el-menu :ellipsis="false" :background-color="store.state.menuBack" :text-color="store.state.menuText"
                 :active-text-color="store.state.menuActiveText" mode="horizontal" class="el-menu-horizontal-demo font">
          <el-sub-menu index="Language">
            <template #title>{{ $t('layout.languages') }}</template>
            <el-menu-item v-for="item in localeList" :key="item.event" :index="item.event"
                          @click="changeLocaleHandler">{{ item.text }}
              <el-badge
                  v-if="item.building"
                  type="primary"
                  value="building"
                  style="margin: 0 0 5px 5px"
              ></el-badge>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <div class="flex-center">

        <el-menu :ellipsis="false" :background-color="store.state.menuBack" :text-color="store.state.menuText"
                 :active-text-color="store.state.menuActiveText" mode="horizontal" class="el-menu-horizontal-demo font"
                 :default-active="route.path">
          <el-menu-item :index="route.params.projectId? '/Home/' + route.params.projectId + '/Devices':'/Index/Devices'"
                        @click="pushIndex(route.params.projectId? '/Home/' + route.params.projectId + '/Devices':'/Index/Devices')"
          >
            <el-icon :size="18" style="vertical-align: middle;margin-right: 5px">
              <Cellphone/>
            </el-icon>
            {{ $t('layout.deviceCenter') }}
          </el-menu-item>
          <el-menu-item index="/Index" @click="pushIndex('/Index')"
                        v-if="route.params.projectId|| route.fullPath==='/Index/Devices'">
            <el-icon :size="18" style="vertical-align: middle;margin-right: 5px">
              <HomeFilled/>
            </el-icon>
            {{ $t('layout.backHome') }}
          </el-menu-item>
          <el-sub-menu index="1">
            <template #title>
              <el-avatar size="medium" style="background: #409eff!important; margin-right: 5px">
                {{
                  (store.state.userInfo.userName && store.state.userInfo.userName.length > 1) ? store.state.userInfo.userName.substring(store.state.userInfo.userName.length - 2) : store.state.userInfo.userName
                }}
              </el-avatar>
              {{
                store.state.userInfo.userName
              }}
            </template>
            <el-menu-item index="1-1" @click="dialogUserInfo = true">{{ $t('layout.myInfo') }}</el-menu-item>
            <el-menu-item index="1-2" @click="dialogChangePwd = true">{{ $t('layout.changePassword') }}</el-menu-item>
            <el-menu-item index="1-3" @click="logout">{{ $t('layout.signOut') }}</el-menu-item>
            <el-sub-menu index="2">
              <template #title
              ><span
                  class="flex-center font title"
              ><img
                  style="margin-right: 5px"
                  width="20"
                  :src="logo"
              />{{ $t('layout.aboutSonic') }}</span
              >
              </template
              >
              <el-menu-item index="2-1"
                            @click="goToUrl('https://sonic-cloud.gitee.io/#/Home')"
              >{{ $t('layout.officialWebSite') }}
              </el-menu-item
              >
              <el-menu-item index="2-0"
                            @click="goToUrl('https://sonic-cloud.gitee.io/#/Document')"
              >使用文档
              </el-menu-item
              >
              <el-menu-item index="2-2"
                            @click="goToUrl('https://sonic-cloud.gitee.io/#/Version')"
              >{{ $t('layout.versionUpdateRecord') }}
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
          </el-sub-menu>
        </el-menu>
      </div>
    </el-header>
    <el-backtop :right="20" :bottom="20" target=".demo-tree-scrollbar .el-scrollbar__wrap"></el-backtop>
    <el-dialog v-model="dialogVisible" :title="$t('dialog.projectInfo')" width="600px">
      <project-update v-if="dialogVisible" :is-update="false" @flush="flush"/>
    </el-dialog>
    <el-dialog
        :title="$t('dialog.myInfo')"
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
        <el-form-item :label="$t('form.username')">
          <span>{{ store.state.userInfo.userName }}</span>
        </el-form-item>
        <el-form-item :label="$t('form.role')">
          <el-tag size="small">
            {{ store.state.userInfo.role === 2 ? $t('form.testEngineer') : $t('form.developmentEngineer') }}
          </el-tag>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
        :title="$t('dialog.changePassword')"
        v-model="dialogChangePwd"
        width="520px"
    >
      <el-form
          v-if="dialogChangePwd"
          ref="changePwdForm"
          label-position="left"
          class="demo-table-expand"
          label-width="70px"
          size="small"
          :model="changePwd"
      >
        <el-form-item :rules="{
          required: true,
          message: $t('form.oldPasswordNotEmpty'),
          trigger: 'blur',
        }" prop="oldPwd" :label="$t('form.oldPassword')">
          <el-input
              prefix-icon="el-icon-lock"
              type="password"
              show-password
              v-model="changePwd.oldPwd"
              :placeholder="$t('form.inputOldPassword')"
          ></el-input>
        </el-form-item>
        <el-form-item :rules="{
          required: true,
          message: $t('form.newPasswordNotEmpty'),
          trigger: 'blur',
        }" prop="newPwd" :label="$t('form.newPassword')">
          <el-input
              prefix-icon="el-icon-lock"
              type="password"
              show-password
              v-model="changePwd.newPwd"
              :placeholder="$t('form.inputNewPassword')"
          ></el-input>
        </el-form-item>
        <el-form-item prop="newPwdSec" :rules="{
          validator:validatePass,
          trigger: 'blur',
        }">
          <el-input
              prefix-icon="el-icon-lock"
              type="password"
              show-password
              v-model="changePwd.newPwdSec"
              :placeholder="$t('form.inputNewPasswordAgain')"
          ></el-input>
        </el-form-item>
      </el-form>
      <div style="text-align: center">
        <el-button size="small" type="primary" @click="changePwdSummit">{{ $t('form.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-scrollbar class="demo-tree-scrollbar" style="height: 100%">
      <el-main v-if="route.params.projectId || route.params.deviceId|| route.fullPath==='/Index/Devices'">
        <router-view/>
      </el-main>
      <el-main v-else>
        <el-alert
            :title="$t('layout.welcomeSpeech')"
            type="info"
            center
            :closable="false"
        >
        </el-alert>
        <div style="text-align: center">
          <el-button type="primary" size="small" style="margin-top: 15px" @click="dialogVisible = true">
            {{ $t('layout.addProject') }}
          </el-button>
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