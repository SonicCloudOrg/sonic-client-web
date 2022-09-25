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

const packagesTS = {
    accessGuide: "接入指南",
    buildLink: "构建链接",
    platform: "平台",
    no: "未指定",
    packageName: "安装包名称",
    branch: "分支",
    inputName: "输入分支名称",
    downloadLink: "下载地址",
    copyUrl: "复制url",
    creatTime: "创建时间",

}

const projectIndexTS = {
    code: {
        lastWeek: "最近一周",
        lastMonth: "最近一个月",
        lastThreeMonth: "最近三个月",
        day: "天",
        hour: "小时",
        minute: "分",
        second: "秒",
        runInfo: "运行情况总览",
        unit: "单位(%)",
        passRate: "当天通过率",
        stateDis: "状态分布",
        other: "其他",
        pass: "通过",
        fail: "失败",
    },
    page: {
        to: "至",
        startTime: "开始日期",
        endTime: "结束日期",
        caseTop5: "用例运行时长排行榜（Top 5）",
        caseId: "用例id",
        caseName: "用例名称",
        timeLong: "时长",
        equipmentTop5: "设备运行时长排行榜（Top 5）",
        eqId: "设备型号",
        serialNumber: "序列号",
    }
}


const publicStepTS = {
    info: "公共步骤信息",
    add: "添加公共步骤",
    id: "公共步骤Id",
    name: "公共步骤名称",
    platform: "平台",
    android: "安卓",
    list: "步骤列表",
    stepId: "步骤Id",
    useCase: "所属用例",
    stepInfo: "步骤详情",
    viewSteps: "查看步骤",
    sureDel: "确定删除该公共步骤吗?",
}

const resultDetailTS = {
    memoryInfo: "内存详情",
    unit: "单位(KB)",
    battery: "电量详情",
    memoryShort: "内存数据不足",
    batteryShort: "电量数据不足",
    performance: "性能数据不足",
    caseRun: "用例运行状态分布",
    noStart: "未开始",
    runIng: "运行中",
    caseStatus: "用例状态",
    page: {
        reportInfo: "报告信息",
        resultId: "结果Id",
        executeUser: "执行用户",
        runStatus: "运行状态",
        testPass: "测试通过",
        testFail: "测试失败",
        testAlert: "测试告警",
        endTime: "结束时间",
        totalTime: "总耗时",
        runInfo: "运行信息",
        total: "耗时",
        runLog: "运行日志",
        performanceInfo: "性能信息",
        runRecording: "运行录像",
        onRecording: "暂无录像"
    }
}

const ResultsTS = {
    name: "测试套件名称",
    testReport: "测试报告",
    lookReport: "查看报告",
    interruptTest: "确定中断本次测试吗?",
    interrupt: "中断",
    del: "确定删除该测试报告吗?",
}

const stepListViewTS = {
    caseInfo: "用例详情",
    platformToBe: "所属平台",
    module: "模块",
    versionName: "版本名称",
    designer: "设计人",
    last: "最后修改日期",
    testMessage: "用例描述",
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
        modulesTS,
        packagesTS,
        projectIndexTS,
        publicStepTS,
        resultDetailTS,
        ResultsTS,
        stepListViewTS
    }
}

