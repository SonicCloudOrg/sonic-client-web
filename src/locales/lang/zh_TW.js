/**
 * ZH_TW language
 */
const robot = {
    robotType: '机器人类型',
    robotTypePlaceholder: '请选择机器人类型',
    robotToken: 'WebHook',
    robotTokenPlaceholder: '请输入群机器人的WebHook',
    robotSecret: 'Secret',
    robotSecretPlaceholder: '请输入群机器人的密钥'
}
const agent = {
    newAgent: "新增Agent",
    clickToCopy: '點擊複製',
    status: {
        name: '狀態',
        online: '線上',
        offline: '離線',
        s2ae: 'S2AE'
    },
    system: '運行系統',
    version: '運行版本',
    operation: '快捷操作',
    shutdown: '終止運行',
    edit: {
        name: 'Agent名稱',
        highTemp: "高温值",
        highTempTime: "高温超时",
        rule: 'Agent名稱不能為空',
        namePlaceholder: '請輸入Agent名稱'
    }
}

const devices = {
    title: 'Sonic雲真機測試平臺',
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
    permissionDenied: '當前用戶暫無許可權！',
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
    null: '無',
    delete: '刪除',
    edit: '編輯'
}

// 路由
const routes = {
    login: "登入",
    home: "首頁",
    deviceCenter: "設備中心",
    remoteControl: "遠程控制",
    androidTestCase: "安卓測試用例",
    iosTestCase: 'IOS測試用例',
    operateSteps: "運行步驟",
    testSuite: "測試套件",
    testResult: "測試結果",
    reportDetails: "報告詳情",
    publicSteps: "公共步驟",
    controlElement: "控制項元素",
    globalParameter: "全域參數",
    moduleManage: "模塊管理",
    versionIteration: "版本反覆運算",
    timedTask: "定時任務",
    projectSetting: "項目設定",
    projectPage: "項目首頁",
    resource: "",
    role: ""
}

const setting = {
    title: "Manage Center"
}

export default {
    message: {
        robot,
        agent,
        common,
        devices,
        layout,
        form,
        dialog,
        routes,
        setting
    }
}