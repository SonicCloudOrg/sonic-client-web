/**
 * EN language
 */
const robot = {
    robotType: 'Robot Type',
    robotTypePlaceholder: '请选择机器人类型',
    robotToken: 'WebHook',
    robotTokenPlaceholder: '请输入群机器人的WebHook',
    robotSecret: 'Secret',
    robotSecretPlaceholder: '请输入群机器人的密钥'
}
const agent = {
    cabinet: {
        label:'Cabinet',
        manager: 'Cabinet Management',
        newCabinet: 'New Cabinet',
        edit: {
            name: 'Name',
            rule: 'Cabinet name cannot be empty',
            namePlaceholder: 'Please enter the Cabinet name',
            size: 'Size',
            small: 'Small (5x2)',
            middle: 'Middle (10x4)',
            large: 'Large (10x8)',
            lowLevel: '低电量值',
            highGear: '高电流档位',
            highLevel: '高电量值',
            lowGear: '低电流档位',
            highTemp: '高温值',
            highTempTime: '高温超时',
            lowFormat: '档（推荐1档）',
            highFormat: '档（推荐14档）'
        },
        tips: {
            title: '设置提示',
            content: `<div>当设备电量≤<span style="color: #409EFF">低电量值</span>时，对应充电口会释放<span style="color: #67C23A">高电流档位</span>的电流。</div>
<div>当设备电量≥<span style="color: #409EFF">高电量值</span>时，对应充电口会释放<span style="color: #F56C6C">低电流档位</span>的电流。</div>
<div>当设备温度≥<span style="color: #409EFF">高温值</span>时（仅安卓），对应充电口会释放<span style="color: #F56C6C">低电流档位</span>的电流并通知机器人。</div>
<div>当<span style="color: #E6A23C">高温超时</span>时间内温度持续≥<span style="color: #409EFF">高温值</span>时（仅安卓），会通知机器人并<span
    style="color: #F56C6C">关机</span>。</div>`
        }
    },
    newAgent: "New Agent",
    clickToCopy: 'Copy Key',
    status: {
        name: 'Status',
        online: 'ONLINE',
        offline: 'OFFLINE'
    },
    system: 'System',
    version: 'Version',
    operation: 'Operation',
    shutdown: 'Shutdown',
    edit: {
        name: 'Name',
        rule: 'Agent name cannot be empty',
        namePlaceholder: 'Please enter the Agent name'
    }
}

const devices = {
    title: 'Sonic Cloud',
    list: 'Device List',
    form: {
        model: 'Model',
        manufacturer: 'MFR',
        system: 'System',
        battery: {
            level: 'Level',
            temperature: 'Temp'
        },
        agent: 'Agent'
    },
    detail: {
        image: 'Image',
        uploadImg: 'Click to Upload',
        nickName: 'NickName',
        nickPlaceholder: 'Enter device nickname',
        name: 'Name',
        model: 'Model',
        udId: 'UDID',
        size: 'Screen Size',
        cpu: 'CPU',
        pwd: 'Password',
        pwdPlaceholder: 'Default Sonic123456',
        operation: 'Operation',
        reboot: 'Reboot',
        rebootTips: 'Are you sure to reboot the device?',
        deleteTips: 'Are you sure to delete the device?'
    },
    useRightNow: 'Use Now',
    moreDetail: 'More',
    deviceCenter: 'Device Center',
    agentCenter: 'Agent Center',
    status: {
        ONLINE: 'ONLINE',
        DEBUGGING: 'DEBUGGING',
        TESTING: 'TESTING',
        DISCONNECTED: 'DISCONNECTED',
        OFFLINE: 'OFFLINE',
        UNAUTHORIZED: 'UNAUTHORIZED',
        ERROR: 'ERROR'
    },
    filter: {
        all: 'All',
        platform: {
            ANDROID: 'Android',
            IOS: 'iOS'
        },
        manufacturer: 'Manufacturer',
        cpu: 'CPU',
        size: 'Screen Size',
        agent: 'Agent',
        status: 'Status',
        placeholder: 'Please enter the model, name, or serialNumber',
        button: 'Filter'
    },
    refresh: 'Auto refresh',
    avgTem: 'Current average battery temperature: '
}

// 布局相关
const layout = {
    // header
    theme: 'Current theme: ',
    languages: 'Languages',
    deviceCenter: 'Device Center',
    myInfo: 'My Information',
    changePassword: 'Change Password',
    signOut: 'Sign Out',
    aboutSonic: 'About Sonic',
    backHome: 'Home',
    welcomeSpeech: "Welcome to Sonic cloud real machine testing platform. Please select the project to enter.",
    addProject: "New Project",
    officialWebSite: 'Sonic Official WebSite',
    versionUpdateRecord: 'Version Record'
}
// 表单相关
const form = {
    save: 'Save',
    unknown: 'Unknown',
    notEmpty: "Not Empty!",
    differentInput: "The twice inputs are inconsistent!",
    username: "User Name",
    role: "Role",
    testEngineer: "Test Engineer",
    developmentEngineer: "Development Engineer",
    oldPasswordNotEmpty: "Old password can't be empty",
    oldPassword: "Old Password",
    inputOldPassword: "Please enter your old password",
    newPasswordNotEmpty: "New password can't be empty",
    newPassword: "New Password",
    inputNewPassword: "Please enter your new password",
    inputNewPasswordAgain: "Please enter your new password again",
    confirm: "Confirm",
    cancel: "Cancel"
}
// 弹窗相关
const dialog = {
    suffixError: 'Incorrect file suffix!',
    cabinetInfo:'Cabinet Info',
    projectInfo: "Project Information",
    agentInfo: 'Agent Information',
    myInfo: "My Information",
    changePassword: "Change Password",
    copy: {
        success: 'Copy Successful!',
        fail: 'Copy failed!'
    }
}

//通用操作
const common = {
    null: 'Null',
    delete: 'Delete',
    edit: 'Edit'
}

// 路由
const routes = {
  login: "Login",
  home: "Home ",
  deviceCenter: "Device Center",
  remoteControl: "Remote Control",
  androidTestCase: "Android Test Case",
  iosTestCase: 'IOS Test Case',
  operateSteps: "Operating Steps",
  testSuite: "Test Suite",
  testResult: "Test Result",
  reportDetails: "Report Details",
  publicSteps: "Public Steps",
  controlElement: "Control Element",
  globalParameter: "Global Parameter",
  moduleManage: "Modules Management",
  versionIteration: "Version Iteration",
  timedTask: "Timed Task",
  projectSetting: "Project Setting",
  projectPage: "Project Home"
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
        routes
    }
}