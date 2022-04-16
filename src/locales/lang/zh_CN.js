/**
 * Chinese language
 */
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 布局相关
const layout = {
  // header
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
  projectInfo: "项目信息",
  myInfo: "我的信息",
  changePassword: "修改密码"
}

export default {
  message: {
    layout,
    form,
    dialog,
    zhCn
  }
}