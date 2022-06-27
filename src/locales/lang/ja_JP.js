/**
 * JP language
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
    newAgent: "エージェント追加",
    clickToCopy: 'クリックしてコピー',
    status: {
        name: 'Status',
        online: 'オンライン',
        offline: 'オフライン',
        s2ae: 'S2AE'
    },
    system: 'OS',
    version: 'バージョン',
    operation: 'ショートカット',
    shutdown: 'ダウン',
    edit: {
        name: 'エージェント名称',
        highTemp: "高温值",
        highTempTime: "高温超时",
        rule: 'エージェント名称が必要です',
        namePlaceholder: 'エージェント名称を入力してください'
    }
}

const devices = {
    title: 'Sonicクラウドデバイステストプラットフォーム',
    list: 'デバイスリスト',
    form: {
        model: 'モデル',
        manufacturer: 'メーカー',
        system: 'OS',
        battery: {
            level: 'バッテリ',
            temperature: 'おんど'
        },
        agent: '位置'
    },
    detail: {
        image: '画像',
        uploadImg: 'アップロード',
        nickName: '備考',
        nickPlaceholder: 'デバイス備考を入力',
        name: '名称',
        model: 'モデル',
        udId: 'udId',
        size: '画面解析度',
        cpu: 'CPU',
        pwd: 'パスワード',
        pwdPlaceholder: 'デフォルトはSonic123456',
        operation: '操作',
        reboot: 'リブート',
        rebootTips: 'リブートしますか？',
        deleteTips: '削除しますか？'
    },
    useRightNow: 'すぐ使う',
    moreDetail: '詳細',
    deviceCenter: 'デバイスセンター',
    agentCenter: 'エージェントセンター',
    status: {
        ONLINE: '利用可能',
        DEBUGGING: '利用中',
        TESTING: 'テスト中',
        DISCONNECTED: '切断されました',
        OFFLINE: 'オフライン',
        UNAUTHORIZED: '無許可',
        ERROR: '異常中'
    },
    filter: {
        all: '全選択',
        platform: {
            ANDROID: 'アンドロイド',
            IOS: 'IOS'
        },
        manufacturer: 'メーカー',
        cpu: 'CPU',
        size: '画面解析度',
        agent: '位置',
        status: 'ステータス',
        placeholder: 'デバイスモデル、デバイス名称またはデバイスUIDを入力してください',
        button: 'フィルター'
    },
    refresh: '自動リフレッシュ',
    avgTem: '現在平均バッテリー温度:'
}

// 布局相关
const layout = {
    // header
    theme: '現在のテーマ:',
    languages: '他言語',
    deviceCenter: 'デバイスセンター',
    myInfo: '個人情報',
    changePassword: 'パスワード変更',
    signOut: 'サインアウト',
    aboutSonic: 'Sonicについて',
    backHome: 'ホームページに戻る',
    welcomeSpeech: "Sonicクラウドデバイステストプラットフォームへようこそ、プロジェクトを選んでください",
    addProject: "プロジェクト追加",
    officialWebSite: 'Sonic公式サイト',
    versionUpdateRecord: '更新履歴'
}
// 表单相关
const form = {
    save: '保存',
    unknown: '未知',
    notEmpty: "必ず入力してください",
    differentInput: "入力内容が一致しません",
    username: "ユーザID",
    role: "ロール",
    testEngineer: "テストエンジニア",
    developmentEngineer: "開発エンジニア",
    oldPasswordNotEmpty: "旧パスワードを入力してください",
    oldPassword: "旧パスワード",
    inputOldPassword: "旧パスワードを入力してください",
    newPasswordNotEmpty: "新パスワードを入力してください",
    newPassword: "新パスワード",
    inputNewPassword: "新パスワードを入力してください",
    inputNewPasswordAgain: "新パスワードを再度入力してください",
    confirm: "確定",
    cancel: "キャンセル"
}
// 弹窗相关
const dialog = {
    permissionDenied: '現在のユーザーには権限がありません！',
    suffixError: 'ファイルフォーマットが間違っています!',
    projectInfo: "プロジェクト情報",
    agentInfo: 'エージェント情報',
    myInfo: "個人情報",
    changePassword: "パスワード変更",
    copy: {
        success: 'コピー成功!',
        fail: 'コピー失敗!'
    }
}

//通用操作
const common = {
    null: 'なし',
    delete: '删除',
    edit: '编辑'
}

// 路由
const routes = {
    login: "ログイン",
    home: "トップページ",
    deviceCenter: "設備センター",
    remoteControl: "リモートコントロール",
    androidTestCase: "Androidテストケース",
    iosTestCase: 'IOSテストケース',
    operateSteps: "ステップの実行",
    testSuite: "テストキット",
    testResult: "テスト結果",
    reportDetails: "詳細のレポート",
    publicSteps: "共通の手順",
    controlElement: "コントロール要素",
    globalParameter: "グローバルパラメータ",
    moduleManage: "モジュール管理",
    versionIteration: "バージョン反復",
    timedTask: "タイミングタスク",
    projectSetting: "プロジェクトの設定",
    projectPage: "プロジェクトのトップページ",
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