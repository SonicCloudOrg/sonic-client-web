/*
 *   sonic-client-web  Front end of Sonic cloud real machine platform.
 *   Copyright (C) 2022 SonicCloudOrg
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * WebSocket 封装
 * 主要功能：
 * 1. 自动重连；
 */
export default class Socket {
  // WebSocket 实例
  ws;

  // 相关配置项
  options;

  // 错误消息队列
  errorStack = [];

  // 是否正在重连
  isReconnectLoading = false;

  // 定时器超时重连 ID
  timeId = null;

  constructor(options) {
    /**
     * options 支持传入参数
     * url websocket请求地址
     * node: 'player',
     * mode: 'audio',
     * debug: true,
     * flushingTime: 0,
     * reconnectDelay: 3000,
     * onopen,
     * onmessage,
     * onerror,
     * onclose
     */
    this.options = {
      isErrorReconnect: true,
      ...options,
    };
    this.init();
  }

  /**
   * 初始化 WebSocket
   */
  init() {
    if ('WebSocket' in window) {
      this.ws = new WebSocket(this.options.url);
      this.ws.binaryType = this.options.binaryType;
      this.onOpen(this.options.onopen);
      this.onMessage(this.options.onmessage);
      this.onError(this.options.onerror);
      this.onClose(this.options.onclose);
    } else {
      console.error('该浏览器不支持WebSocket!');
    }
  }

  // 获取 WebSocket 实例
  get getWebSocket() {
    return this.ws;
  }

  /**
   * 设置连接成功后的回调函数
   * @param {*} cb
   */
  onOpen(cb) {
    this.ws.onopen = () => {
      console.log('websocket >>>> onOpen 连接成功!');
      // 发送成功连接之前所发送失败的消息
      this.errorStack.forEach((message) => {
        this.send(message);
      });
      cb && cb();
      this.errorStack = [];
      this.isReconnectLoading = false;
    };
  }

  /**
   * 设置接收 WebSocket 消息的回调函数
   * @param {*} cb
   */
  onMessage(cb) {
    try {
      this.ws.onmessage = cb;
    } catch (e) {
      console.error('error: ', e);
    }
  }

  /**
   * 设置连接失败后的回调函数
   * @param {*} cb
   */
  onError(cb) {
    this.ws.onerror = (err) => {
      console.error(err, 'websocket >>>> onError 连接异常!');
      cb && cb(err);
      if (!this.options.isErrorReconnect) return;
      this.onReconnection();
      this.isReconnectLoading = false;
    };
  }

  /**
   * 设置连接关闭后的回调函数
   * @param {*} cb
   */
  onClose(cb) {
    this.ws.onclose = () => {
      console.log('websocket >>>> onClose 关闭连接!');
      // 用户手动关闭的不重连
      if (this.isCustomClose) return;
      cb && cb();
      this.onReconnection();
      this.isReconnectionLoading = false;
    };
  }

  /**
   * 请求连接异常重连
   * @returns
   */
  onReconnection() {
    // 重连请求延时
    const delay = this.options.reconnectDelay || 3000;
    // 防止重复请求
    if (this.isReconnectionLoading) {
      console.log('websocket >>>> onReconnection 请勿重复请求连接!');
      return;
    }
    console.log('websocket >>>> onReconnection 正在重连!');
    this.isReconnectionLoading = true;
    clearTimeout(this.timeId);
    this.timeId = setTimeout(() => {
      this.init();
    }, delay);
  }

  /**
   * 手动发送请求
   * @param {*} message
   * @returns
   */
  handleSend(message) {
    // 连接失败时的处理
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error('websocket >>>> handleSend 请求发送失败!');
      this.errorStack.push(message);
      return;
    }
    this.ws.send(message);
  }

  /**
   * 手动关闭连接
   */
  handleClose() {
    this.isCustomClose = true;
    this.ws.close();
  }

  /**
   * 手动开启连接
   */
  handleStart() {
    this.isCustomClose = false;
    this.onReconnection();
  }

  /**
   * 手动销毁连接实例
   */
  handleDestroy() {
    this.handleClose();
    this.ws = null;
    this.errorStack = null;
    console.log('websocket >>>> handleDestroy 实例已销毁!');
  }
}
