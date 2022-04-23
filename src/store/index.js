import {createStore} from 'vuex'

export default createStore({
    state() {
        return {
            userInfo: {},
            token: localStorage.getItem('SonicToken') ? localStorage.getItem('SonicToken') : '',
            isCollapse: false,
            project: {},
            projectList: [],
            menuBack: "",
            menuText: "",
            menuActiveText: ""
        }
    },
    mutations: {
        saveTheme(state, payload) {
            if (payload === 'light') {
                state.menuBack = "#ffffff"
                state.menuText = "#909399"
                state.menuActiveText = "#409EFF"
            } else {
                state.menuBack = "#545c64"
                state.menuText = "#ffffff"
                state.menuActiveText = "#ffd04b"
            }
        },
        saveProjectList(state, payload) {
            state.projectList = payload
        },
        saveProject(state, payload) {
            state.project = payload
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
        }
    },
});