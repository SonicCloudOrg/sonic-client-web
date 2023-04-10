import { createStore } from 'vuex';
import { localeSetting } from '@/config/locale';
import { LOCALE_KEY } from '@/config/cache';
import { setLocal, getLocal } from '@/utils/cache/localStorage';

const debug = process.env.NODE_ENV !== 'production';

export default createStore({
  strict: debug,
  state() {
    return {
      userInfo: {},
      token: localStorage.getItem('SonicToken')
        ? localStorage.getItem('SonicToken')
        : '',
      isCollapse: false,
      project: {},
      projectList: [],
      menuBack: '',
      menuText: '',
      menuActiveText: '',
      currentTheme: 'light',
      localInfo: getLocal(LOCALE_KEY) || localeSetting,
    };
  },
  mutations: {
    saveTheme(state, payload) {
      state.currentTheme = payload;
      if (payload === 'light') {
        state.menuBack = '#ffffff';
        state.menuText = '#909399';
        state.menuActiveText = '#409EFF';
      } else {
        state.menuBack = '#545c64';
        state.menuText = '#ffffff';
        state.menuActiveText = '#ffd04b';
      }
    },
    saveProjectList(state, payload) {
      state.projectList = payload;
    },
    saveProject(state, payload) {
      state.project = payload;
    },
    changeCollapse(state) {
      state.isCollapse = !state.isCollapse;
    },
    autoChangeCollapse(state) {
      if (state.isCollapse === false) {
        state.isCollapse = !state.isCollapse;
      }
    },
    changeLogin(state, sonicToken) {
      state.token = sonicToken;
      localStorage.setItem('SonicToken', sonicToken);
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
    clearAuth(state) {
      state.token = '';
      state.userInfo = {};
      localStorage.removeItem('SonicToken');
    },
    setLocaleInfo(state, info) {
      state.localInfo = info;
    },
  },
  getters: {
    getLocale(state) {
      return state.localInfo?.locale ?? 'zh_CN';
    },
  },
  actions: {
    // 设置国际化相关信息
    changeLocaleInfo({ commit, state }, info) {
      const localInfo = { ...state.localInfo, ...info };
      commit('setLocaleInfo', localInfo);
      setLocal(LOCALE_KEY, localInfo);
    },
  },
});
