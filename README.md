<p align="center">
  <img src="https://raw.githubusercontent.com/ZhouYixun/sonic-server/main/logo.png">
</p>
<p align="center">🎉Front end of Sonic cloud real machine testing platform</p>
<p align="center">
  <span>English |</span>
  <a href="https://github.com/ZhouYixun/sonic-client-web/blob/main/README_CN.md">  
     简体中文
  </a>
</p>
<p align="center">
  <a href="#">  
    <img src="https://img.shields.io/badge/release-v1.0.0-orange">
  </a>
  <a href="#">  
    <img src="https://img.shields.io/badge/vue-3.2.14-success">
  </a>
  <a href="#">  
    <img src="https://img.shields.io/badge/elementPlus-1.1.0/beta.20-success">
  </a>
</p>
<p align="center">
  <a href="#">  
    <img src="https://img.shields.io/github/commit-activity/m/ZhouYixun/sonic-client-web">
  </a>
  <a href="https://hub.docker.com/repository/docker/zhouyixun/sonic-client-web">  
    <img src="https://img.shields.io/docker/pulls/zhouyixun/sonic-client-web">
  </a>
  <a href="https://github.com/ZhouYixun/sonic-server/blob/main/LICENSE">  
    <img src="https://img.shields.io/github/license/ZhouYiXun/sonic-server?color=green&label=license&logo=license&logoColor=green">
  </a>
</p>

## Background

#### What is sonic ?

> Nowadays, automatic testing, remote control and other technologies have gradually matured. [Appium](https://github.com/appium/appium) can be said to be the leader in the field of automation, and [STF](https://github.com/openstf/stf) is the ancestor of remote control. A long time ago, I began to have an idea about whether to provide test solutions for all clients (Android, IOS, windows, MAC and web applications) on one platform. Therefore, sonic cloud real machine testing platform was born.

#### Vision

> Sonic's vision is to help small and medium-sized enterprises solve the problem of lack of tools and testing means in client automation or remote control.
>
>If you want to participate, welcome to join! 💪
>
>If you want to support, you can give me a star. ⭐

## How to package

Install

```
npm install
```

Dev

```
npm run dev
```

Package

```
npm run build
```

Build image

```
docker build -t zhouyixun/sonic-client-web .
```

## Deployment mode

### Docker Mode (NO RECOMMENDED)

> I recommend that docker mode be used only for testing
>
> [Click Here!](https://hub.docker.com/repository/docker/zhouyixun/sonic-agent-linux)

### dist Mode

> put /dist into nginx

## LICENSE

[MIT License](LICENSE)
