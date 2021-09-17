<script setup>
import './assets/light.css'
import './assets/dark.css'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import {ref} from "vue";
const locale = ref(zhCn);
</script>
<template>
  <el-config-provider :locale="locale">
  <router-view/>
  </el-config-provider>
</template>

<style>
@import "./assets/common.css";
</style>