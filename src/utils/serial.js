class SingletonSerial {
    constructor() {
        //首次使用构造器实例
        if (!SingletonSerial.instance) {
            //https://blog.csdn.net/weixin_43155762/article/details/116888996
            //https://blog.csdn.net/weixin_41231535/article/details/115218293
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
                usbVendorId: 0x67b,
                usbProductId: 0x23c3
            }];

            //连接命令
            const CONNECT = new Uint8Array([
                0xcc, 0x80, 0x03, 0x03, 0x01, 0x01, 0x00, 0x00,
            ]);
            //开始命令
            const START = new Uint8Array([
                0xcc, 0x80, 0x03, 0x03, 0x01, 0x02, 0x00, 0x03,
            ]);
            //停止命令
            const STOP = new Uint8Array([
                0xcc, 0x80, 0x03, 0x03, 0x01, 0x03, 0x00, 0x02,
            ]);
            //数据拼接
            let resultData = [];

            //连接状态定义
            const CONNECTSTATE = {
                UNCONNECT: 0, //未连接
                IDLE: 1, //闲置
                WORK: 2, //工作
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
                NOBOOT: {
                    code: 2,
                    message: "血压计未开机或正在放气"
                },
                REPEATMEASURE: {
                    code: 4,
                    message: "正在测量中，重复点击测量"
                },
                NOWORKING: {
                    code: 5,
                    message: "设备未工作，无需停止"
                },
                PRESSUREPROTECT: {
                    code: 6,
                    message: "压力保护"
                },
                AIRLEAKAGE: {
                    code: 7,
                    message: "信号检测错误或上游气囊漏气，请重新测量"
                },
                SENSOR: {
                    code: 8,
                    message: "信号检测错误或传感器错误请重新测量"
                },
                DEFLATE: {
                    code: 9,
                    message: "放气异常"
                },
                AIRLOUT: {
                    code: 10,
                    message: "系统漏气"
                },
                MOTOR: {
                    code: 11,
                    message: "电机错误"
                },
                OTHER: {
                    code: 12,
                    message: "其他错误"
                }
            };

            this.CONNECTSTATE = CONNECTSTATE;
            this.ERRORSTATE = ERRORSTATE;
            //当前设备连接状态标记
            let currentState = CONNECTSTATE.UNCONNECT;
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

            this.getDeviceState  = getDeviceState;

            /**
             * 创建连接对象
             */
            this.create = function (stateListener, errorListener, resultListener) {
                //设置回调
                mStateListener = stateListener;
                mErrorListener = errorListener;
                mResultListener = resultListener;
            }


            /**
             * 打开串口并且测量，如果已经打开串口，就调用测量即可
             */
            this.startMeasure = async function () {
                //如果未打开串口就去打开串口
                if (currentState == CONNECTSTATE.UNCONNECT) {
                    try {
                        //获取串口对象
                        port = await navigator.serial.requestPort({
                            filters
                        });
                        //打开串口
                        await port.open({
                            baudRate: 9600,
                            dataBits: 8,
                            stopBits: 1,
                            parity: "none",
                            flowControl: "none",
                        });
                        //获取写入对象
                        writer = port.writable.getWriter();
                        //监听串口回执数据
                        readListener();
                        //改变串口为连接状态
                        changeState(CONNECTSTATE.IDLE);
                        //去调用开始测量
                        start()
                    } catch (error) {
                        //发生异常向外告知异常
                        if (error.message == "Failed to open serial port."||error.message =="navigator.serial is undefined") {
                            callError(ERRORSTATE.OPENFAIL)
                        } else if (error.message == "No port selected by the user.") {
                            callError(ERRORSTATE.NOSELECET)
                        }
                    }
                } else {
                    //串口已经打开，去调用真正的测量
                    start()
                }


            };
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
                                resultData.push(Buffer.from(value).toString('hex'));
                                if (resultData.length > 5) {
                                    switch (resultData[5]) {
                                        case "02": { //开始测量回执
                                            if (resultData.length == 8) {
                                                //清空数据
                                                resultData.length = 0;
                                                //改变为测量状态
                                                changeState(CONNECTSTATE.WORK);
                                            }
                                            break
                                        }
                                        case "03": { //停止测量回执
                                            if (resultData.length == 8) {
                                                //清空数据
                                                resultData.length = 0;
                                                //改变为闲置状态
                                                changeState(CONNECTSTATE.IDLE);
                                            }
                                            break
                                        }
                                        case "06": { //返回测量结果回执
                                            if (resultData.length == 20) {
                                                //去解析结果
                                                parseResultData(resultData.concat());
                                                //清空数据
                                                resultData.length = 0;
                                                //改变为闲置状态
                                                changeState(CONNECTSTATE.IDLE);
                                            }
                                            break
                                        }
                                        case "07": { //发生错误回执
                                            if (resultData.length == 8) {
                                                parseErrorData(resultData.concat());
                                                //清空数据
                                                resultData.length = 0;
                                                //改变为闲置状态
                                                changeState(CONNECTSTATE.IDLE);
                                            }
                                            break
                                        }
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
             * 
             * 串口写入命令
             */
            async function writeCommand(command) {
                await writer.write(command);
            };


            /**
             *真正的测量方法
             */
            function start() {
                if (currentState == CONNECTSTATE.IDLE) {
                    //闲置状态有可能下几位为打开，也有可能已经打开
                    time = setTimeout(() => {
                        //如果一秒后状态还是未工作，判定为下机位为开机
                        if (getDeviceState() == CONNECTSTATE.IDLE) {
                            callError(ERRORSTATE.NOBOOT);
                        }
                    }, 1000);
                    //写入命令
                    writeCommand(START);
                } else if (currentState == CONNECTSTATE.WORK) {
                    //如果正在测量，再次点击测量
                    callError(ERRORSTATE.REPEATMEASURE);
                }
            };

            /**
             * 停止测量
             */
            this.stopMeasure = function () {
                clearTimeout(time)
                //只有正在测量的时候才能停止测量
                if (currentState == CONNECTSTATE.IDLE || currentState == CONNECTSTATE.UNCONNECT) {
                    callError(ERRORSTATE.NOWORKING);
                } else if (currentState == CONNECTSTATE.WORK) {
                    writeCommand(STOP);
                }
            };


            /**
             * 关闭串口连接，并销毁对象防止内存泄漏
             * 
             */
            this.destroy = async function () {
                //只有连接了才能断开连接
                if (currentState != CONNECTSTATE.UNCONNECT) {
                    //关闭串口时候，如果正在测量，就停止测量
                    if (currentState == CONNECTSTATE.WORK) {
                        this.stopMeasure();
                    }
                    keepReading = false;
                    reader.cancel();
                }


            }

            /**
             * 数据恢复初始值
             */
            async function resetData() {
                await port.close();
                port = null;
                reader = null;
                writer = null;
                mStateListener = null;
                mErrorListener = null;
                mResultListener = null;
                keepReading = true;
                resultData.length = 0;
                clearTimeout(time);
                time = null;
                //改变状态
                changeState(CONNECTSTATE.UNCONNECT);
            }


            /**
             * 错误解析
             */

            function parseErrorData(data) {
                switch (data[6]) {
                    case "01": {
                        callError(ERRORSTATE.PRESSUREPROTECT);
                        break
                    }
                    case "02": {
                        callError(ERRORSTATE.AIRLEAKAGE);
                        break
                    }
                    case "05": {
                        callError(ERRORSTATE.AIRLEAKAGE);
                        break
                    }
                    case "06": {
                        callError(ERRORSTATE.SENSOR);
                        break
                    }
                    case "09": {
                        callError(ERRORSTATE.DEFLATE);
                        break
                    }
                    case "0f": {
                        callError(ERRORSTATE.AIRLOUT);
                        break
                    }
                    case "10": {
                        callError(ERRORSTATE.MOTOR);
                        break
                    }
                    default: {
                        callError(ERRORSTATE.OTHER);
                    }
                }

            };

            /**
             * 测量结果解析
             */
            function parseResultData(data) {
                let H = hex2int(data[13]) * 256 + hex2int(data[14]);
                let D = hex2int(data[15]) * 256 + hex2int(data[16]);
                let m = hex2int(data[17]) * 256 + hex2int(data[18]);
                if (mResultListener) {
                    mResultListener({
                        "H": H,
                        "D": D,
                        "M": m
                    });
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
            SingletonSerial.instance = this;
        }
        return SingletonSerial.instance;
    }

}


export default new SingletonSerial()