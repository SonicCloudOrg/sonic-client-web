/**
 * JP language
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
    title: 'Sonicクラウドデバイスプラットフォーム',
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
            IOS: 'IOS',
            HARMONY: 'Harmony'
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
    avgTem: '現在平均バッテリー温度:',
    hint: 'リマインダーを設定する'

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
    edit: '编辑',
    operate: "操作",
    copy: "复制",
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
const androidTestCase = {
    addCase: "ユースケースを追加",
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
        homeTS
    }
}
