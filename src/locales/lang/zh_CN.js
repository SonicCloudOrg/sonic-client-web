/**
 * ZH_CN language
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
    clickToCopy: '点击复制',
    status: {
        name: '状态',
        online: '在线',
        offline: '离线',
        s2ae: 'S2AE'
    },
    system: '运行系统',
    version: '运行版本',
    operation: '快捷操作',
    shutdown: '终止运行',
    edit: {
        name: 'Agent名称',
        highTemp: "高温值",
        highTempTime: "高温超时",
        rule: 'Agent名称不能为空',
        namePlaceholder: '请输入Agent名称'
    }
}

const devices = {
    title: 'Sonic云真机测试平台',
    list: '设备列表',
    form: {
        model: '设备型号',
        manufacturer: '制造商',
        system: '设备系统',
        battery: {
            level: '电池电量',
            temperature: '电池温度'
        },
        agent: '所在位置'
    },
    detail: {
        image: '设备图片',
        uploadImg: '点击上传',
        nickName: '设备备注',
        nickPlaceholder: '输入设备备注信息',
        name: '设备名称',
        model: '设备型号',
        udId: '设备序列号',
        size: '屏幕分辨率',
        cpu: 'CPU类型',
        pwd: '安装密码',
        pwdPlaceholder: '默认为Sonic123456',
        operation: '快捷操作',
        reboot: '重启',
        rebootTips: '确定重启该设备吗？',
        deleteTips: '确定删除该设备吗？'
    },
    useRightNow: '马上使用',
    moreDetail: '更多信息',
    deviceCenter: '设备中心',
    agentCenter: 'Agent中心',
    status: {
        ONLINE: '空闲中',
        DEBUGGING: '占用中',
        TESTING: '测试中',
        DISCONNECTED: '已断开',
        OFFLINE: '已离线',
        UNAUTHORIZED: '未授权',
        ERROR: '异常中'
    },
    filter: {
        all: '全选',
        platform: {
            ANDROID: '安卓系统',
            IOS: 'iOS系统'
        },
        manufacturer: '设备制造商',
        cpu: 'CPU处理器',
        size: '屏幕分辨率',
        agent: '所在位置',
        status: '设备状态',
        placeholder: '请输入要筛选的型号、设备名称或设备序列号',
        button: '高级筛选'
    },
    refresh: '自动刷新',
    avgTem: '当前平均电池温度：'
}

// 布局相关
const layout = {
    // header
    theme: '当前主题：',
    languages: '多语言',
    deviceCenter: '设备中心',
    myInfo: '我的信息',
    changePassword: '修改密码',
    signOut: '注销',
    aboutSonic: '关于Sonic',
    backHome: '回到首页',
    welcomeSpeech: "欢迎来到Sonic云真机测试平台，请选择项目进入",
    addProject: "新增项目",
    officialWebSite: 'Sonic官方网站',
    versionUpdateRecord: '版本更新记录'
}
// 表单相关
const form = {
    save: '保存',
    unknown: '未知',
    notEmpty: "不能为空！",
    differentInput: "两次输入不一致！",
    username: "用户名",
    role: "角色",
    testEngineer: "测试工程师",
    developmentEngineer: "开发工程师",
    oldPasswordNotEmpty: "旧密码不能为空",
    oldPassword: "旧密码",
    inputOldPassword: "请输入旧密码",
    newPasswordNotEmpty: "新密码不能为空",
    newPassword: "新密码",
    inputNewPassword: "请输入新密码",
    inputNewPasswordAgain: "请再次输入新密码",
    confirm: "确定",
    cancel: "取消"
}
// 弹窗相关
const dialog = {
    permissionDenied: '当前用户暂无权限！',
    suffixError: '文件格式有误！',
    projectInfo: "项目信息",
    agentInfo: 'Agent信息',
    myInfo: "我的信息",
    changePassword: "修改密码",
    copy: {
        success: '复制成功！',
        fail: '复制失败！'
    }
}

//通用操作
const common = {
    null: '无',
    delete: '删除',
    edit: '编辑'
}

// 路由
const routes = {
    login: "登录",
    home: "首页",
    deviceCenter: "设备中心",
    remoteControl: "远程控制",
    androidTestCase: "安卓测试用例",
    iosTestCase: 'IOS测试用例',
    operateSteps: "运行步骤",
    testSuite: "测试套件",
    testResult: "测试结果",
    reportDetails: "报告详情",
    publicSteps: "公共步骤",
    controlElement: "控件元素",
    globalParameter: "全局参数",
    moduleManage: "模块管理",
    versionIteration: "版本迭代",
    timedTask: "定时任务",
    projectSetting: "项目设置",
    projectPage: "项目首页",
    resource: "",
    role: ""
}

const setting = {
    title: "后台管理中心"
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