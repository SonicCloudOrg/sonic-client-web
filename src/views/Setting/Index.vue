<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import Header from '@/components/Header.vue';
import defaultLogo from '@/assets/logo.png';

import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

const store = useStore();
const route = useRoute();
onMounted(() => {
  const windowWidth = document.body.clientWidth;
  if (windowWidth < 1200) {
    store.commit('autoChangeCollapse');
  }
});
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
        router
      >
        <div class="flex-center" style="margin-bottom: 10px">
          <el-avatar :size="40" :src="defaultLogo" shape="square"></el-avatar>
          <span v-if="!store.state.isCollapse" class="project-name">{{
            $t('settingIndexTS.center.background')
          }}</span>
        </div>
        <el-sub-menu index="5">
          <template #title>
            <i class="el-icon-lock"></i>
            <span>{{ $t('settingIndexTS.center.rights') }}</span>
          </template>
          <el-menu-item :index="'/Setting/Resources'">
            <i class="el-icon-notebook-1"></i
            >{{ $t('settingIndexTS.center.resource') }}
          </el-menu-item>
          <el-menu-item :index="'/Setting/Roles'">
            <i class="el-icon-place"></i
            >{{ $t('settingIndexTS.center.roleText') }}
          </el-menu-item>
          <el-menu-item :index="'/Setting/Users'">
            <i class="el-icon-user"></i
            >{{ $t('settingIndexTS.center.userCon') }}
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <i class="el-icon-setting"></i>
            <span>{{ $t('settingIndexTS.center.systemCon') }}</span>
          </template>
          <el-menu-item :index="'/Setting/SysJobs'">
            <i class="el-icon-time"></i
            >{{ $t('settingIndexTS.center.scheduled') }}
          </el-menu-item>
          <el-menu-item :index="'/Setting/RemoteSettings'">
            <i class="el-icon-mobile-phone"></i
            >{{ $t('settingIndexTS.center.remoteSettings') }}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <Header></Header>
  </el-container>
</template>
