import { createStore } from 'vuex'

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
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
            if (userInfo.token) {
                localStorage.setItem('SonicToken', userInfo.token);
            }
        },
        clear(state) {
            state.userInfo = { token: "" };
            localStorage.removeItem('SonicToken');
        }
    },
});