/**
 * Chinese language
 */
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const devices = {
    list:'设备列表',
    form: {
        model: '设备型号',
        manufacturer: '制造商',
        system:'设备系统',
        battery:{
            level:'电池电量',
            temperature:'电池温度'
        },
        agent:'所在位置'
    },
    detail:{
        image:'设备图片',
        uploadImg:'点击上传',
        nickName:'设备备注',
        nickPlaceholder:'输入设备备注信息',
        name:'设备名称',
        model:'设备型号',
        udId:'设备序列号',
        size:'屏幕分辨率',
        cpu:'CPU类型',
        pwd:'安装密码',
        pwdPlaceholder:'默认为Sonic123456',
        operation:'快捷操作'
    },
    useRightNow:'马上使用',
    moreDetail:'更多信息',
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
        all:'全选',
        platform: {
            ANDROID: '安卓系统',
            IOS:'iOS系统'
        },
        manufacturer: '设备制造商',
        cpu:'CPU处理器',
        size:'屏幕分辨率',
        agent:'所在位置',
        status:'设备状态',
        placeholder:'请输入要筛选的型号、设备名称或设备序列号',
        button:'高级筛选'
    },
    refresh:'自动刷新',
    avgTem:'当前平均电池温度：'
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
    save:'保存',
    unknown:'未知',
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
    confirm: "确 定"
}
// 弹窗相关
const dialog = {
    suffixError:'文件格式有误！',
    projectInfo: "项目信息",
    myInfo: "我的信息",
    changePassword: "修改密码",
    copy:{
        success:'复制成功！',
        fail:'复制失败！'
    }
}

export default {
    message: {
        devices,
        layout,
        form,
        dialog,
        zhCn
    }
}