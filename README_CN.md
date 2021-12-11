<p align="center">
  <img src="https://raw.githubusercontent.com/SonicCloudOrg/sonic-server/main/logo.png">
</p>
<p align="center">🎉Sonic云真机测试平台前端</p>
<p align="center">
  <a href="https://github.com/SonicCloudOrg/sonic-client-web/blob/main/README.md">  
    English
  </a>
  <span>| 简体中文</span>
</p>
<p align="center">
  <a href="#">  
    <img src="https://img.shields.io/badge/release-v1.2.0-orange">
  </a>
  <a href="#">  
    <img src="https://img.shields.io/badge/vue-3.2.14-success">
  </a>
  <a href="#">  
    <img src="https://img.shields.io/badge/elementPlus-1.1.0/beta.24-success">
  </a>
</p>
<p align="center">
  <a href="#">  
    <img src="https://img.shields.io/github/commit-activity/m/SonicCloudOrg/sonic-client-web">
  </a>
  <a href="https://hub.docker.com/repository/docker/sonicorg/sonic-client-web">  
    <img src="https://img.shields.io/docker/pulls/sonicorg/sonic-client-web">
  </a>
  <a href="https://github.com/SonicCloudOrg/sonic-server/blob/main/LICENSE">  
    <img src="https://img.shields.io/github/license/SonicCloudOrg/sonic-server?color=green&label=license&logo=license&logoColor=green">
  </a>
</p>

### 官方网站
[Sonic Official Website](http://sonic-cloud.gitee.io)
## 背景

#### 什么是Sonic？

> 如今，自动化测试、远程控制等技术已经逐渐成熟。其中 [Appium](https://github.com/appium/appium) 在自动化领域可以说是领头者，[STF](https://github.com/openstf/stf) 则是远程控制的始祖。很久前就开始有了一个想法，是否可以在一个平台上，提供解决所有客户端（Android、iOS、Windows、Mac、Web应用）的测试方案，于是，Sonic云真机测试平台由此诞生。

#### 愿景

> Sonic当前的愿景是能帮助中小型企业解决在客户端自动化或远控方面缺少工具和测试手段的问题。
>
>  如果你想参与其中，欢迎加入！💪
>
> 如果你想支持，可以给我一个star。⭐

## 打包方式

Install

```
npm install
```

dev开发

```
npm run dev
```

打包

```
npm run build
```

构建镜像

```
docker build -t sonicorg/sonic-client-web .
```

## 部署模式

### Docker模式（不推荐）

> 建议仅在测试的时候使用，镜像包含nginx服务器
>
> [Click Here!](https://hub.docker.com/repository/docker/sonicorg/sonic-client-web)

### dist 模式

> 直接将dist文件夹丢到nginx下面即可

## 开源许可协议

[MIT License](LICENSE)