/**
 * ZH_TW language
 */
const robot = {
    robotType: '机器人类型',
    robotTypePlaceholder: '请选择机器人类型',
    robotToken: 'WebHook',
    robotTokenPlaceholder: '请输入群机器人的WebHook',
    robotSecret: 'Secret',
    robotSecretPlaceholder: '（可选）请输入群机器人的密钥'
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
    title: 'Sonic雲真機平臺',
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
            IOS: 'iOS系統',
            HARMONY: '鸿蒙系統'
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
    avgTem: '當前平均電池溫度：',
    hint: '設置演示'

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
    edit: '編輯',
    operate: "操作",
    copy: "复制",
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

const androidTestCase = {
    addCase: "添加用例",
}

const elements = {
    eleInfo: "控件元素信息",
    stepInfo: "步骤信息",
    warn: "警告！",
    warnInfo: "该控件已存在于以下步骤中,删除该控件将连同以下步骤一并删除！请前往对应步骤修改控件或确认对应步骤已废弃！",
    stepList: {
        stepId: "步骤Id",
        useCaseId: "所属用例Id",
        userCaseName:"所属用例名称",
        noCase: "无所属用例"
    },
    sureDelete: "确认删除",
    addElement: "添加控件元素",
    controlId: "控件id",
    inputNameSearch: "输入元素控件名称搜索",
    moduleName: "模块名称",
    targetingType: "定位类型",
    coordinate: "坐标",
    picture: "图片",
    notSpecified: "未指定",
    cEleValue: "控件元素值",
    inputKeySearch: "输入控件元素值搜索",
    sureDelInfo: "确定删除该控件元素吗?",

}
const globalParamsTs = {
    dialogVisible: {
        info: "全局参数信息",
        specialUse: "特殊使用",
        message: "如有多个参数值可以用 | 号隔开，分配设备时会随机分配，单次任务内参数值只会取同一个。【random】和【timestamp】参数已内置，可用作构造随机数据",
        keyName: "参数名",
        keyNameMessage: "参数名不能为空，建议使用英文",
        inputName: "请输入参数名",
        valueName: "参数值",
        valueNameMessage: "参数值不能为空，多个可以用 | 号隔开",
        inputValue: "请输入参数值，多个可以用 | 号隔开"
    },
    addGlobalParams: "添加全局参数",
    paramsList: {
        id: "参数id",
        name: "参数名",
        value: "参数值"
    },
    delMessage: "确定删除该全局参数吗?"
}

const homeTS = {
    projectOverview: "项目概况",
    testCaseManagement: "测试用例管理",
    testCase: {
        case: "测试用例",
        adCase: "安卓端测试用例",
        iosCase: "iOS端测试用例"
    },
    testSuite: "测试套件",
    testDataManagement: "测试数据管理",
    testResults: "测试结果分析",
    setting: "持续集成设置",
    package: {
        mange: "安装包管理",
        bulk: "批量装包",
    },
    crashReport: "崩溃上报",
    projectSetting: {
        setting: "项目相关设置",
        mange: "模块管理",
        update: "版本迭代",
    }
}

const jobsTS = {
    dialogVisible: {
        message: "定时任务信息",
        name: "任务名称",
        nameIsNull: "任务名称不能为空",
        inputName: "请输入任务名称",
        testSuiteIsNull: "测试套件不能为空",
        chooseTestSuite: "请选择测试套件",
        cron: "Cron表达式",
        cronIsNull: "Cron表达式不能为空",
        inputCron: "请输入Cron表达式"
    },
    addCron: "添加定时任务",
    whatCron: "什么是Cron表达式？",
    cronInfo: {
        one: "* 第一位，表示秒，取值 0-59",
        two: "* 第二位，表示分，取值 0-59",
        three: "* 第三位，表示小时，取值 0-23",
        four: "* 第四位，日期，取值 1-31",
        five: "* 第五位，月份，取值 1-12",
        six: "* 第六位，星期几，取值 1-7",
        seven: "* 第七位，年份，可以留空，取值 1970-2099",
        asterisk: "(*) 星号：可以理解为“每”的意思，每秒、每分",
        questionMark: "(?) 问号：只能出现在日期和星期这两个位置，表示这个位置的值不确定",
        bar: "(-) 表达一个范围，如在小时字段中使用 10-12 ，表示从10点到12点",
        comma: "(,) 逗号，表达一个列表值，如在星期字段中使用 1,2,4\n" +
            "，则表示星期一、星期二、星期四",
        slash: "(/) 斜杠，如 x/y ，x是开始值，y是步长，如在第一位(秒)使用\n" +
            "0/15，表示从0秒开始，每15秒",
        official: "官方解释：",
        demoOne: "0 0 3 * * ? 每天 3 点执行",
        demoTwo: "0 5 3 * * ? 每天 3 点 5 分执行",
        demoThree: "0 5 3 ? * * 每天 3 点 5 分执行",
        demoFour: "0 5/10 3 * * ? 每天 3 点 5 分，15 分，25 分，35 分，45 分，55\n" +
            "分这几个点执行",
        demoFive: "0 10 3 ? * 1 每周星期天的 3 点10 分执行，注：1 表示星期天",
        demoSix: "0 10 3 ? * 1#3 每个月的第三个星期的星期天 执行，#号只能出现在星期的位置",
        hint: "注：第六位(星期几)中的数字可能表达不太正确，可以使用英文缩写来表示，如：Sun"
    },
    taskId: "任务id",
    run: "立即运行",
    del: "确定删除该定时任务吗？"
}

const loginTS = {
    testPlatform: "一站式云真机测试平台",
    login: {
        message: "注册账号/LDAP域账号登录",
        register: "注册账号登录",
        LDAPLogin: "LDAP域账号登录",
    },
    user: {
        inputUserName: "请输入账户名",
        inputPassword: "请输入密码",
        longin: "登 入",
        register: "注 册",
    }
}

const modulesTS = {
    info: "模块信息",
    name: "模块名称",
    isNotNull: "模块名称不能为空",
    inputName: "请输入模块名称",
    sure: "确 定",
    add: "添加模块",
    del: "确定删除该模块吗?",
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
        setting,
        androidTestCase,
        elements,
        globalParamsTs,
        homeTS,
        jobsTS,
        loginTS,
        modulesTS
    }
}
