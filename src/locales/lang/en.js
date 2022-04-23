/**
 * English language
 */
import en from 'element-plus/es/locale/lang/en'

const devices = {
    title:'',
    list: 'Device List',
    form: {
        model: 'Model',
        manufacturer: 'MFR',
        system:'System',
        battery:{
            level:'Level',
            temperature:'Temp'
        },
        agent:'Agent'
    },
    detail:{
        image:'Image',
        uploadImg:'Click to Upload',
        nickName:'NickName',
        nickPlaceholder:'Enter device nickname',
        name:'Name',
        model:'Model',
        udId:'UDID',
        size:'Screen Size',
        cpu:'CPU',
        pwd:'Password',
        pwdPlaceholder:'Default Sonic123456',
        operation:'Operation'
    },
    useRightNow:'Use Now',
    moreDetail:'More',
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
    save:'Save',
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
    confirm: "Confirm"
}
// 弹窗相关
const dialog = {
    suffixError: 'Incorrect file suffix!',
    projectInfo: "Project Information",
    myInfo: "My Information",
    changePassword: "Change Password",
    copy: {
        success: 'Copy Successful!',
        fail: 'Copy failed!'
    }
}

export default {
    message: {
        devices,
        layout,
        form,
        dialog,
        en
    }
}