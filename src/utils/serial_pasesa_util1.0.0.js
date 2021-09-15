class SingletonPasesaSerial {
    constructor() {
        //首次使用构造器实例
        if (!SingletonPasesaSerial.instance) {
            //硬件设备过滤参数
            const filters = [{
                usbVendorId: 0x2e8b,
                usbProductId: 0x2000
            }];
            //连接命令
            const CONNECT = new Uint8Array([
                0x40, 0x01, 0x02, 0x00, 0xFF, 0x42,
            ]);
            //断开连接
            const DISCONNECT = new Uint8Array([
                0x40, 0x02, 0x02, 0x00, 0xFF, 0x43,
            ]);
            //请求连接状态
            const STATE = new Uint8Array([
                0x40, 0x51, 0x02, 0x00, 0xFF, 0x92,
            ]);


            //测量指令初始值
            var MEASURE = [0x40, 0x52, 0x06, 0x00, 0xFF, 0x00];
            //停止测量指令初始值
            var STOPMEASURE = [0x40, 0x52, 0x06, 0x00, 0xFF, 0xFF];
            //连接状态定义
            const CONNECTSTATE = {
                UNCONNECT: 0, //未连接
                CONNECTING: 1, //连接中
                IDLE: 2, //闲置
                WORK: 3, //工作
                STOPWORKING: 4//正在停止中
            };

            //错误码定义
            const ERRORSTATE = {
                OPENFAIL: {
                    code: 0,
                    message: "打开失败，可能原因：1.浏览器不支持.2.设备与其他上机位已连接"
                },
                NOSELECET: {
                    code: -1,
                    message: "未选择串口"
                },
                CONNECTFAIL: {
                    code: -2,
                    message: "连接失败"
                },
                REPEATCONNECT: {
                    code: -3,
                    message: "已连接，无需重复连接"
                },
                FRISTCONNECT: {
                    code: -4,
                    message: "请先连接串口"
                },
                BPBUSY: {
                    code: -5,
                    message: "BP设备忙"
                },
                MEASUREFAIL: {
                    code: -6,
                    message: "开始测量失败"
                },
                NOWORK: {
                    code: -7,
                    message: "没有在测量，无需停止"
                },

            };

            this.CONNECTSTATE = CONNECTSTATE;
            this.ERRORSTATE = ERRORSTATE;
            //当前设备连接状态标记
            let currentState = CONNECTSTATE.UNCONNECT;

            //端口对象
            let port = null;
            //读流
            let reader = null;
            //写流
            let writer = null;
            //停止标识
            let keepReading = true;
            //连接状态回调
            let mStateListener = null;
            //发生错误回调
            let mErrorListener = null;
            //测量结果回调
            let mResultListener = null;
            var sex = 0
            var age = 0x12
            //数据拼接
            var resultData = [];
            //定时器
            let time = null;
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
             * 设置全局回调函数
             */
            this.setListener = function (stateListener, errorListener, resultListener) {
                //设置回调
                mStateListener = stateListener;
                mErrorListener = errorListener;
                mResultListener = resultListener;
            }


            /**
             * 打开串口，同时发送connect命令
             */
            this.connectSerial = async function () {
                if (currentState == CONNECTSTATE.UNCONNECT) {
                    //改变链接状态为连接中
                    changeState(CONNECTSTATE.CONNECTING)
                    try {
                        //获取串口对象
                        port = await navigator.serial.requestPort({ filters });
                        //打开串口
                        await port.open({
                            baudRate: 115200,
                            dataBits: 8,
                            stopBits: 1,
                            parity: "none",
                            flowControl: "none",
                        });
                        //获取写入对象
                        writer = port.writable.getWriter();
                        //监听串口回执数据
                        readListener();
                        //发送连接命令
                        sendConnectCmd()
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
                    //如果连接中
                    sendConnectCmd()
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
                                //转换成16进制数组
                                var tempdata = uint8Array(value)
                                //数据做拼接
                                resultData = resultData.concat(tempdata)
                                //长度等于7.表示是命令的回执
                                if (resultData.length == 7) {
                                    switch (resultData[1]) {
                                        case "01": {
                                            //改变设备连接状态
                                            changeState(CONNECTSTATE.IDLE)
                                            //清空数据
                                            resultData.length = 0;
                                            break
                                        }
                                        case "02": {
                                            //改变设备连接状态
                                            changeState(CONNECTSTATE.UNCONNECT)
                                            //清空数据
                                            resultData.length = 0;
                                            keepReading = false;
                                            reader.cancel();
                                        }

                                        case "51": {
                                            if (resultData[5] == "00" || resultData[5] == "01") {
                                                //写入测量命令
                                                writeCommand(new Uint8Array(MEASURE))
                                                //清空数据
                                                resultData.length = 0;
                                            } else if (resultData[5] == "FF") {
                                                //清空数据
                                                resultData.length = 0
                                                //开始测量失败
                                                callError(ERRORSTATE.MEASUREFAIL)
                                            }
                                            break
                                        }
                                        case "52": {
                                            if (resultData[5] == "00") {
                                                changeState(CONNECTSTATE.WORK)
                                                //清空数据
                                                resultData.length = 0
                                            } else if (resultData[5] == "ff") {
                                                changeState(CONNECTSTATE.STOPWORKING)
                                                //清空数据
                                                resultData.length = 0
                                            }
                                            break
                                        }
                                    }

                                }
                                //长度是33表示是结果回执     
                                if (resultData.length == 33) {
                                    //这里做返回结果的解析
                                    if (resultData[5] == "80") {
                                        //命令停止后，响应是80
                                        changeState(CONNECTSTATE.IDLE)
                                        resultData.length = 0
                                    } else if (resultData[5] == "00") {
                                        //正常测量结束，返回值
                                        changeState(CONNECTSTATE.IDLE)
                                        //解析正常值
                                        paseResult(resultData)
                                        resultData.length = 0
                                    } else if (resultData[5] == "ff") {
                                        changeState(CONNECTSTATE.IDLE)
                                        resultData.length = 0
                                    } else {
                                        changeState(CONNECTSTATE.IDLE)
                                        //发生错误返回值。
                                        resultData
                                        callError({
                                            code: hex2int(resultData[5]),
                                            message: "BP设备发生错误，错误原因请使用对应错误码查找"
                                        })
                                        resultData.length = 0
                                    }
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
             * 解析正确的结果
             */
            function paseResult(data) {
                if (mResultListener) {
                    mResultListener({
                        "H": hex2int(data[7] + data[6]),
                        "D": hex2int(data[9] + data[8]),
                        "M": hex2int(data[11] + data[10]),
                        "V": hex2int(data[13] + data[12]) / 10,
                        "P": hex2int(data[15] + data[14]) / 10
                    })
                }
            }

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
                clearTimeout(time);
                time = null;

            }

            /**
             * 发送connect命令
             * 
             */
            function sendConnectCmd() {
                if (currentState == CONNECTSTATE.CONNECTING) {
                    //闲置状态有可能下几位为打开，也有可能已经打开
                    time = setTimeout(() => {
                        //如果一秒后,状态没有改变，认为通讯失败，回调给外部
                        if (getDeviceState() == CONNECTSTATE.CONNECTING) {
                            changeState(CONNECTSTATE.UNCONNECT);
                            callError(ERRORSTATE.CONNECTFAIL);
                        }
                    }, 1000);
                    //写入连接命令
                    writeCommand(CONNECT)
                } else if (currentState == CONNECTSTATE.IDLE || currentState == CONNECTSTATE.WORK || currentState == CONNECTSTATE.STOPWORKING) {
                    //如果正在测量，再次点击测量
                    callError(ERRORSTATE.REPEATCONNECT);
                }
            }

            /**
             * 开始测量，首先去看看设备处于什么状态
             */
            this.startMeasure = function (age, sex) {
                this.age = age
                this.sex = sex
                //请求确认状态
                if (currentState == CONNECTSTATE.IDLE) {
                    //重置测量命令
                    MEASURE = [0x40, 0x52, 0x06, 0x00, 0xFF, 0x00];
                    MEASURE.push(age)
                    MEASURE.push(sex)
                    MEASURE.push(0x00)
                    //转换开始命令
                    MEASURE = getCMD(MEASURE)
                    //请求状态
                    writeCommand(STATE)
                } else {
                    //非闲置状态爆出对应错误
                    if (currentState == CONNECTSTATE.UNCONNECT) {
                        callError(ERRORSTATE.FRISTCONNECT)
                    } else {
                        callError(ERRORSTATE.BPBUSY)
                    }

                }
            }
            /**
             * 
             * 停止测量
             */
            this.stopMeasure = function () {
                if (currentState == CONNECTSTATE.WORK) {
                    STOPMEASURE = [0x40, 0x52, 0x06, 0x00, 0xFF, 0xFF];
                    STOPMEASURE.push(age)
                    STOPMEASURE.push(sex)
                    STOPMEASURE.push(0x00)
                    //转换开始命令
                    STOPMEASURE = getCMD(STOPMEASURE)
                    //发送停止测量命令
                    writeCommand(new Uint8Array(STOPMEASURE))
                } else {
                    //没有工作，无需停止
                    callError(ERRORSTATE.NOWORK)
                }
            }

            this.disconnectSerial = async function () {

                //只有连接了才能断开连接
                if (currentState != CONNECTSTATE.UNCONNECT) {
                    //关闭串口时候，如果正在测量，就停止测量
                    if (currentState == CONNECTSTATE.WORK) {
                        this.stopMeasure()
                    }
                    setTimeout(() => {
                        writeCommand(DISCONNECT)
                    }, 500);

                } else {
                    callError(ERRORSTATE.FRISTCONNECT)
                }


            }

            /**
            * 
            * 串口写入命令
            */
            async function writeCommand(command) {
                await writer.write(command);
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
             * Uint8Array 数组类型转化为16进制字符串
             */
            function uint8Array(uint8Array) {
                return Array.prototype.map
                    .call(uint8Array, (x) => ('00' + x.toString(16)).slice(-2));
            }
            /**
             * 返回CMD命令
             */
            function getCMD(tempCMD) {
                //数组求和
                const sum = eval(tempCMD.join("+")).toString(16)
                //截取后两位获取校验值
                const cs = sum.substring(sum.length - 2)
                //放入数组
                tempCMD.push("0x" + cs)
                return tempCMD
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
            SingletonPasesaSerial.instance = this;
        }
        return SingletonPasesaSerial.instance;
    }

}


export default new SingletonPasesaSerial()