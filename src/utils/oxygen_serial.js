class SingletonOxygenSerial {
    constructor() {
        //首次使用构造器实例
        if (!SingletonOxygenSerial.instance) {
            //端口对象
            let port = null;
            //读流
            let reader = null;
            //写流
            let writer = null;
            //连接状态回调
            let mStateListener = null;
            //发生错误回调
            let mErrorListener = null;
            //测量结果回调
            let mResultListener = null;
            //停止标识
            let keepReading = true;

            //硬件设备过滤参数
            const filters = [{
                usbVendorId: 0x67B,
                usbProductId: 0x2303
            }];

            //请求发送波形图数据
            const WAVE = new Uint8Array([
                0xAA, 0x55, 0x50, 0x03, 0x02, 0x01, 0x27,
            ]);

            //数据拼接
            let resultData = [];

            //连接状态定义
            const CONNECTSTATE = {
                UNCONNECT: 0, //未连接
                WORK: 1, //正常工作
            };
            //错误码定义
            const ERRORSTATE = {
                OPENFAIL: {
                    code: 0,
                    message: "打开失败，可能原因：1.浏览器不支持.2.设备与其他上机位已连接"
                },
                NOSELECET: {
                    code: 1,
                    message: "未选择串口"
                },
                CONNECTED: {
                    code: 2,
                    message: "已经连接"
                },
                EQUIFAIL: {
                    code: 3,
                    message: "检查探头 (探头故障或使用不当)"
                },
                FINGETR: {
                    code: 4,
                    message: "手指未插入"
                },
                PULSESRARCHING: {
                    code: 5,
                    message: "该作错误码并非是错误，而是手指插入到有数据的一个中间状态，如有需要可以在这里提示用户:手指已插入脉冲检索中"
                }
            };

            this.CONNECTSTATE = CONNECTSTATE;
            this.ERRORSTATE = ERRORSTATE;
            //当前设备连接状态标记
            let currentState = CONNECTSTATE.UNCONNECT;

            /**
             * 判断浏览器是否支持串口通讯
             */
            this.isbrowserSupportSerial = function () {
                return "serial" in navigator
            };

            /**
             * 
             * 获取设备状态
             */
            function getDeviceState() {
                return currentState
            };

            this.getDeviceState = getDeviceState;

            /**
             * 连接血氧设备
             */
            this.connectOxygen = async function (stateListener, errorListener, resultListener) {
                //设置回调
                mStateListener = stateListener;
                mErrorListener = errorListener;
                mResultListener = resultListener;
                if (currentState == CONNECTSTATE.UNCONNECT) {
                    //发送连接
                    try {
                        //获取串口对象
                        port = await navigator.serial.requestPort({
                            filters
                        });
                        //打开串口
                        await port.open({
                            baudRate: 38400,
                            dataBits: 8,
                            stopBits: 1,
                            parity: "none",
                            flowControl: "none",
                        });
                        //获取写入对象
                        writer = port.writable.getWriter();
                        //监听串口回执数据
                        readListener();
                        //请求发送波形图数据
                        writeCommand(WAVE)
                    } catch (error) {
                        //改变链接状态为未连接
                        changeState(CONNECTSTATE.UNCONNECT)
                        //发生异常向外告知异常
                        if (error.message == "Failed to open serial port." || error.message == "navigator.serial is undefined") {
                            callError(ERRORSTATE.OPENFAIL)
                        } else if (error.message == "No port selected by the user.") {
                            callError(ERRORSTATE.NOSELECET)
                        }
                    }
                } else {
                    callError(ERRORSTATE.CONNECTED)
                }
            }


            /**
             * 关闭串口连接，并销毁对象防止内存泄漏
             * 
             */
            this.destroy = async function () {
                //只有连接了才能断开连接
                if (currentState != CONNECTSTATE.UNCONNECT) {
                    changeState(CONNECTSTATE.UNCONNECT)
                    keepReading = false;
                    reader.cancel();
                }


            }
            /**
             * 监听串口回执数据
             */
            async function readListener() {
                while (port.readable && keepReading) {
                    reader = port.readable.getReader();
                    try {
                        while (true) {
                            const {
                                value,
                                done
                            } = await reader.read();
                            if (done) {
                                // 允许稍后关闭串口。
                                reader.releaseLock();
                                writer.releaseLock();
                                break;
                            }
                            if (value) {
                                //改变工作状态为正在工作
                                if (currentState == CONNECTSTATE.UNCONNECT) {
                                    changeState(CONNECTSTATE.WORK)
                                }
                                //unit8数组转成16进制数组
                                var tempvalue = Array.prototype.map.call(value, (x) => ('00' + x.toString(16)).slice(-2));
                                //数据做拼接
                                resultData = resultData.concat(tempvalue);
                                if (resultData[0] == "aa") {
                                    if (resultData.length >= 4) {
                                        //获取需要截取数据的下标位置
                                        var cutindex = hex2int(resultData[3]) + 4
                                        if (resultData.length >= cutindex) {
                                            //获取有效数据，然后判断数据是什么类型，进行对应的类型解析
                                            const cutdata = resultData.splice(0, cutindex);
                                            switch (cutdata[2]) {
                                                case "53": //拿到测量数据
                                                    let v0, v1, v2, v3, v4, v5, v6, v7;
                                                    v0 = (hex2int(cutdata[9]) & 0x01) == 0x01 ? 1 : 0;
                                                    v1 = (hex2int(cutdata[9]) & 0x02) == 0x02 ? 1 : 0;
                                                    v2 = (hex2int(cutdata[9]) & 0x04) == 0x04 ? 1 : 0;
                                                    v3 = (hex2int(cutdata[9]) & 0x08) == 0x08 ? 1 : 0;
                                                    v4 = (hex2int(cutdata[9]) & 0x10) == 0x10 ? 1 : 0;
                                                    v5 = (hex2int(cutdata[9]) & 0x20) == 0x20 ? 1 : 0;
                                                    v6 = (hex2int(cutdata[9]) & 0x40) == 0x40 ? 1 : 0;
                                                    v7 = (hex2int(cutdata[9]) & 0x80) == 0x80 ? 1 : 0;
                                                    //探头故障或使用不当
                                                    if (v3 == 1) {
                                                        callError(ERRORSTATE.EQUIFAIL)
                                                    }
                                                    //手指未插入脱落
                                                    if (v1 == 1) {
                                                        callError(ERRORSTATE.FINGETR)
                                                    }
                                                    //正在搜索
                                                    if (v2 == 1) {
                                                        callError(ERRORSTATE.PULSESRARCHING)
                                                    }
                                                    //血氧
                                                    var oxy = hex2int(cutdata[5])
                                                    //PR
                                                    var pr = hex2int(cutdata[7] + cutdata[6])
                                                    //PI
                                                    var pi = hex2int(cutdata[8]) / 10
                                                    if (oxy != 0) {
                                                        paseResult({
                                                            "oxy": oxy,
                                                            "pr": pr,
                                                            "pi": pi
                                                        }, null)
                                                    }
                                                    break
                                                case "51": //拿到状态数据
                                                    let n0, n1, n2, n3, n4, n5, n6, n7;
                                                    n0 = (hex2int(cutdata[5]) & 0x01) == 0x01 ? 1 : 0;
                                                    n1 = (hex2int(cutdata[5]) & 0x02) == 0x02 ? 1 : 0;
                                                    n2 = (hex2int(cutdata[5]) & 0x04) == 0x04 ? 1 : 0;
                                                    n3 = (hex2int(cutdata[5]) & 0x08) == 0x08 ? 1 : 0;
                                                    n4 = (hex2int(cutdata[5]) & 0x10) == 0x10 ? 1 : 0;
                                                    n5 = (hex2int(cutdata[5]) & 0x20) == 0x20 ? 1 : 0;
                                                    n6 = (hex2int(cutdata[5]) & 0x40) == 0x40 ? 1 : 0;
                                                    n7 = (hex2int(cutdata[5]) & 0x80) == 0x80 ? 1 : 0;
                                                    //探头故障或使用不当
                                                    if (n2 == 1) {
                                                        callError(ERRORSTATE.EQUIFAIL)
                                                    }
                                                    //手指未插入
                                                    if (n3 == 1) {
                                                        callError(ERRORSTATE.FINGETR)
                                                    }
                                                    //上行主动发送允许状态
                                                    if (n5 == 0) {
                                                        writeCommand(WAVE)
                                                    }
                                                    break
                                                case "52": //拿到wave数据
                                                    if (cutdata[5] != "00") {
                                                        let p0, p1, p2, p3, p4, p5, p6, p7;
                                                        p0 = (hex2int(cutdata[5]) & 0x01) == 0x01 ? 1 : 0;
                                                        p1 = (hex2int(cutdata[5]) & 0x02) == 0x02 ? 1 : 0;
                                                        p2 = (hex2int(cutdata[5]) & 0x04) == 0x04 ? 1 : 0;
                                                        p3 = (hex2int(cutdata[5]) & 0x08) == 0x08 ? 1 : 0;
                                                        p4 = (hex2int(cutdata[5]) & 0x10) == 0x10 ? 1 : 0;
                                                        p5 = (hex2int(cutdata[5]) & 0x20) == 0x20 ? 1 : 0;
                                                        p6 = (hex2int(cutdata[5]) & 0x40) == 0x40 ? 1 : 0;
                                                        p7 = (hex2int(cutdata[5]) & 0x80) == 0x80 ? 1 : 0;
                                                        //获取是否有脉搏搏动
                                                        let pause = p7 == 1
                                                        //脉动力量
                                                        let pausePower = 0
                                                        //获取波形数据
                                                        let wavePower = hex2int(cutdata[5]) & 0x7F
                                                        pausePower = wavePower / 8 > 15 ? 15 : wavePower / 8
                                                        paseResult(null, {
                                                            "pause": pause,
                                                            "pausePower": pausePower,
                                                            "wavePower": wavePower
                                                        })
                                                    }
                                                    break
                                            }
                                        }
                                    }
                                } else {
                                    //这里说明开头数据不是开始标识符，去掉开始不是标识符的数据
                                    resultData.splice(0, resultData.indexOf("aa"))
                                }

                            }

                        }
                    } catch (error) {
                        // TODO: 处理非致命的读错误。
                    } finally {
                        // 允许稍后关闭串口。
                        reader.releaseLock();
                    }
                    //关闭串口
                    resetData();
                }
            };


            /**
             * 数据恢复初始值
             */
            async function resetData() {
                try {
                    await port.close();
                } catch (error) {
                    //硬件设备物理按键关闭，这里做释放处理
                    reader.releaseLock();
                    writer.releaseLock();
                    changeState(CONNECTSTATE.UNCONNECT)
                    await port.close();
                }
                port = null;
                reader = null;
                writer = null;
                keepReading = true;
                resultData.length = 0;
            }

            /**
             * 
             * 串口写入命令
             */
            async function writeCommand(command) {
                if (writer) {
                    await writer.write(command);
                }
            };

            /**
             * 
             * 改变当前连接状态，对外部进行回调
             */
            function changeState(state) {
                currentState = state;
                //向外回调当前状态
                if (mStateListener) {
                    mStateListener(currentState);
                }

            }

            /**
             * 错误回调
             */
            function callError(errormessage) {
                if (mErrorListener) {
                    mErrorListener(errormessage);
                }
            }


            /**
             * 解析正确的结果
             */
            function paseResult(basics, wave) {
                if (mResultListener) {
                    mResultListener({
                        "basics": basics,
                        "wave": wave
                    })
                }
            }

            /**
             * 16进制字符串转换成10进制数
             */
            function hex2int(hex) {
                var len = hex.length,
                    a = new Array(len),
                    code;
                for (var i = 0; i < len; i++) {
                    code = hex.charCodeAt(i);
                    if (48 <= code && code < 58) {
                        code -= 48;
                    } else {
                        code = (code & 0xdf) - 65 + 10;
                    }
                    a[i] = code;
                }

                return a.reduce(function (acc, c) {
                    acc = 16 * acc + c;
                    return acc;
                }, 0);
            }


            //将this挂载到SingletonApple这个类的instance属性上
            SingletonOxygenSerial.instance = this;
        }
        return SingletonOxygenSerial.instance;
    }

}


export default new SingletonOxygenSerial()