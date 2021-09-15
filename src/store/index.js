import {createStore} from 'vuex'

export default createStore({
    state() {
        return {
            userInfo: {
                token: localStorage.getItem('SonicToken') ? localStorage.getItem('SonicToken') : '',
            },
            isCollapse: false,
            project: {}
        }
    },
    mutations: {
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
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
            if (userInfo.token) {
                localStorage.setItem('SonicToken', userInfo.token);
            }
        },
        clear(state) {
            state.userInfo = {token: ""};
            localStorage.removeItem('SonicToken');
        }
    },
});