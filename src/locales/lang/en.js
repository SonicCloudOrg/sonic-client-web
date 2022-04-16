/**
 * English language
 */
import en from 'element-plus/es/locale/lang/en'

// 布局相关
const layout = {
  // header
  languages: 'Languages',
  deviceCenter: 'Device Center',
  myInfo: 'My Information',
  changePassword: 'Change Password',
  signOut: 'Sign Out',
  aboutSonic: 'About Sonic',
  backHome: 'Back Home',
  welcomeSpeech: "Welcome to Sonic cloud real machine testing platform. Please select the project to enter.",
  addProject: "New Project",
  officialWebSite: 'Sonic Official WebSite',
  versionUpdateRecord: 'Version Record'
}
// 表单相关
const form = {
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
  projectInfo: "Project Information",
  myInfo: "My Information",
  changePassword: "Change Password"
}

export default {
  message: {
    layout,
    form,
    dialog,
    en
  }
}