<script setup>
import './assets/light.css'
import './assets/dark.css'
import {ref, watch, computed} from 'vue'
import {useStore} from 'vuex'
import {getElementPlusLocale} from './locales/setupI18n'

const store = useStore();
const locale = ref(getElementPlusLocale())
const storelocale = computed(()=>{
	return store.getters.getLocale;
})
// 监听语言切换
watch(storelocale, () => {
  locale.value = getElementPlusLocale()
})
</script>
<template>
  <el-config-provider :locale="locale">
  <router-view/>
  </el-config-provider>
</template>

<style>
@import "./assets/common.css";
</style>