/**
 * ZH_TW language
 */

const agent = {
    hub:{
        manager:'機櫃管理'
    },
    newAgent: "新增Agent",
    clickToCopy:'點擊複製',
    status: {
        name:'狀態',
        online: '線上',
        offline: '離線'
    },
    system: '運行系統',
    version: '運行版本',
    operation: '快捷操作',
    shutdown: '終止運行',
    edit: {
        name: 'Agent名稱',
        rule: 'Agent名稱不能為空',
        namePlaceholder: '請輸入Agent名稱'
    }
}

const devices = {
    title: 'Sonic雲真機測試平臺 -',
    list: '設備清單',
    form: {
        model: '設備型號',
        manufacturer: '製造商',
        system: '設備系統',
        battery: {
            level: '電池電量',
            temperature: '電池溫度'
        },
        agent: '所在位置'
    },
    detail: {
        image: '設備圖片',
        uploadImg: '點擊上傳',
        nickName: '設備備註',
        nickPlaceholder: '輸入裝置備註信息',
        name: '設備名稱',
        model: '設備型號',
        udId: '設備序號',
        size: '螢幕解析度',
        cpu: 'CPU類型',
        pwd: '安裝密碼',
        pwdPlaceholder: '默認為Sonic123456',
        operation: '快捷操作',
        reboot: '重啟',
        rebootTips: '確定重啟該設備嗎？',
        deleteTips: '確定刪除該設備嗎？'
    },
    useRightNow: '馬上使用',
    moreDetail: '更多資訊',
    deviceCenter: '設備中心',
    agentCenter: 'Agent中心',
    status: {
        ONLINE: '空閒中',
        DEBUGGING: '佔用中',
        TESTING: '測試中',
        DISCONNECTED: '已斷開',
        OFFLINE: '已離線',
        UNAUTHORIZED: '未授權',
        ERROR: '異常中'
    },
    filter: {
        all: '全選',
        platform: {
            ANDROID: '安卓系統',
            IOS: 'iOS系統'
        },
        manufacturer: '設備製造商',
        cpu: 'CPU處理器',
        size: '螢幕解析度',
        agent: '所在位置',
        status: '設備狀態',
        placeholder: '請輸入要篩選的型號、設備名稱或設備序號',
        button: '高級篩選'
    },
    refresh: '自動刷新',
    avgTem: '當前平均電池溫度：'
}

// 佈局相關
const layout = {
    // header
    theme: '當前主題：',
    languages: '多語言',
    deviceCenter: '設備中心',
    myInfo: '我的信息',
    changePassword: '修改密碼',
    signOut: '註銷',
    aboutSonic: '關於Sonic',
    backHome: '回到首頁',
    welcomeSpeech: "歡迎來到Sonic雲真機測試平臺，請選擇項目進入",
    addProject: "新增項目",
    officialWebSite: 'Sonic官方網站',
    versionUpdateRecord: '版本更新記錄'
}
// 表單相關
const form = {
    save: '保存',
    unknown: '未知',
    notEmpty: "不能為空！",
    differentInput: "兩次輸入不一致！",
    username: "用戶名",
    role: "角色",
    testEngineer: "測試工程師",
    developmentEngineer: "開發工程師",
    oldPasswordNotEmpty: "舊密碼不能為空",
    oldPassword: "舊密碼",
    inputOldPassword: "請輸入舊密碼",
    newPasswordNotEmpty: "新密碼不能為空",
    newPassword: "新密碼",
    inputNewPassword: "請輸入新密碼",
    inputNewPasswordAgain: "請再次輸入新密碼",
    confirm: "確定",
    cancel: "取消"
}
// 彈出型視窗相關
const dialog = {
    suffixError: '檔案格式有誤！',
    projectInfo: "專案資訊",
    agentInfo: 'Agent信息',
    myInfo: "我的信息",
    changePassword: "修改密碼",
    copy: {
        success: '複製成功！',
        fail: '複製失敗！'
    }
}

//一般操作
const common = {
    delete: '刪除',
    edit: '編輯'
}

export default {
    message: {
        agent,
        common,
        devices,
        layout,
        form,
        dialog,
    }
}