class SingletonBeneCheckSerial {
    constructor() {
        //首次使用构造器实例
        if (!SingletonBeneCheckSerial.instance) {
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
            let mResultGUIListener = null;
            let mResultCHOLListener = null;
            let mResultUAListener = null;
            //停止标识
            let keepReading = true;
            //硬件设备过滤参数
            const filters = [{
                usbVendorId: 0x67B,
                usbProductId: 0x2303,
            }];

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
                ERROR1: {
                    code: 3,
                    message: "试纸使用错误，错误可能原因：1编码卡错误;2试纸没插好3;试纸可能有问题"
                },
                ERROR2: {
                    code: 4,
                    message: "设备电量低，请更换电池"
                },
                ERROR3: {
                    code: 5,
                    message: "使用错误或者损坏的编码卡或者编码卡未正确插入"
                },
                ERROR4: {
                    code: 6,
                    message: "温度超过系统操作的温度限制"
                },
                ERROR5: {
                    code: 7,
                    message: "使用过的试纸或试纸受潮"
                },
                ERROR6: {
                    code: 8,
                    message: "试纸可能在进血时被移除"
                },
                ERROR7: {
                    code: 9,
                    message: "试纸错误"
                },
                ERROR7: {
                    code: 10,
                    message: "其他错误"
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
            this.connect = async function (stateListener, errorListener, resultGUIListener, resultUAListener, resultCHOLListener) {
                //设置回调
                mStateListener = stateListener;
                mErrorListener = errorListener;
                mResultGUIListener = resultGUIListener;
                mResultCHOLListener = resultCHOLListener;
                mResultUAListener = resultUAListener;
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
                        //改变连接状态未已连接
                        changeState(CONNECTSTATE.WORK)
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
                                //unit8数组转成16进制数组
                                var tempvalue = Array.prototype.map.call(value, (x) => ('00' + x.toString(16)).slice(-2));
                                if (resultData.length < 20) {
                                    resultData = resultData.concat(tempvalue);
                                    //数据做拼接
                                    if (resultData.length >= 5) {
                                        switch (resultData[4]) {
                                            case "41":
                                                if (resultData.length == 20) {
                                                    var glu = to4_5(hex2int(resultData[18] + resultData[17]) / 18.0, 1) //  单位是：mmol/L
                                                    if (mResultGUIListener) {
                                                        mResultGUIListener(glu)
                                                    }
                                                    resultData.length = 0
                                                }
                                                break
                                            case "51":
                                                if (resultData.length == 20) {
                                                    var ua = to4_5(hex2int(resultData[18] + resultData[17]) / 0.1681, 0) //  单位是：umol/L
                                                    if (mResultUAListener) {
                                                        mResultUAListener(ua)
                                                    }
                                                    resultData.length = 0
                                                }
                                                break
                                            case "61":
                                                if (resultData.length == 20) {
                                                    var chol = to4_5(hex2int(resultData[18] + resultData[17]) / 38.66, 2) //  单位是：mmol/L
                                                    if (mResultCHOLListener) {
                                                        mResultCHOLListener(chol)
                                                    }
                                                    resultData.length = 0
                                                }
                                                break
                                            case "d0": //发生了错误
                                                if (resultData.length == 11) {
                                                    switch (resultData[6]) {
                                                        case "01":
                                                            callError(ERRORSTATE.ERROR1)
                                                            break
                                                        case "02":
                                                            callError(ERRORSTATE.ERROR2)
                                                            break
                                                        case "03":
                                                            callError(ERRORSTATE.ERROR3)
                                                            break
                                                        case "04":
                                                            callError(ERRORSTATE.ERROR4)
                                                            break
                                                        case "05":
                                                            callError(ERRORSTATE.ERROR5)
                                                            break
                                                        case "06":
                                                            callError(ERRORSTATE.ERROR6)
                                                            break
                                                        case "07":
                                                            callError(ERRORSTATE.ERROR7)
                                                            break
                                                        default:
                                                            callError(ERRORSTATE.ERROR8)
                                                            break
                                                    }
                                                    resultData.length = 0
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
             * 四色五入
             */

            function to4_5(number, eee) {
                return (number + 3e-16).toFixed(eee);
            };


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
            SingletonBeneCheckSerial.instance = this;
        }
        return SingletonBeneCheckSerial.instance;
    }

}


export default new SingletonBeneCheckSerial()