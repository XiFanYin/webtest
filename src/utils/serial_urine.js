class SingletonUrineSerial {
    constructor() {
        //首次使用构造器实例
        if (!SingletonUrineSerial.instance) {
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
            //记录获取的最后一条数据
            var lastTestData = ""
            //硬件设备过滤参数
            const filters = [{
                usbVendorId: 0x483,
                usbProductId: 0x5740,
            }];
            //获取最后一次测试数据
            const LASTData = new Uint8Array([
                0x93, 0x8e, 0x04, 0x00, 0x08, 0x04, 0x10
            ]);
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
                TESTERROR: {
                    code: 4,
                    message: "未放入试纸条或试纸条放入不完整"
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
            this.connect = async function (stateListener, errorListener, resultListener) {
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
                            baudRate: 19200,
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
                        //请求最后一条数据
                        writeCommand(LASTData)
                        looperTime()
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
                    lastTestData = ""
                    keepReading = false;
                    reader.cancel();
                }


            }

            function looperTime() {
                const a = setTimeout(() => {
                    if (lastTestData == "") {
                        writeCommand(LASTData)
                        looperTime()
                    }
                    clearTimeout(a)
                }, 500)

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
                                console.log(tempvalue)
                                if (tempvalue.length == 19) {
                                    if (lastTestData == "" || tempvalue[4] == "08" && tempvalue[5] == "04") {
                                        //连接后查询记录当前设备测试的最后一条数据
                                        lastTestData = tempvalue
                                    } else {
                                        //不是首次连接，判断和上次记录的数据是否相等
                                        if (hex2int(lastTestData[6] + lastTestData[7]) == hex2int(tempvalue[6] + tempvalue[7])) {
                                            //表示测量试纸条放入不正确或者未放入试纸     
                                            callError(ERRORSTATE.TESTERROR)
                                        } else {
                                            //这里说明本次测量有效，去解析数据即可
                                            parseData(tempvalue)
                                            lastTestData = tempvalue
                                        }
                                    }
                                } else if (tempvalue.length == 38) {
                                    parseData(tempvalue.slice(19, 38))
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
                if (writer) {
                    await writer.write(command);
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
             * 
             * 解析返回的数据 
             */
            function parseData(data) {
                let leumetadata = int2bin16(hex2int(data[12] + data[13])).substring(0, 5);
                let bldmetadata = int2bin16(hex2int(data[14] + data[15])).substring(1, 4);
                let phmetadata = int2bin16(hex2int(data[14] + data[15])).substring(4, 7);
                let prometadata = int2bin16(hex2int(data[14] + data[15])).substring(7, 10);
                let ubgmetadata = int2bin16(hex2int(data[14] + data[15])).substring(10, 13);
                let nitmetadata = int2bin16(hex2int(data[14] + data[15])).substring(13, 16);
                let vcmetadata = int2bin16(hex2int(data[16] + data[17])).substring(1, 4);
                let glumetadata = int2bin16(hex2int(data[16] + data[17])).substring(4, 7);
                let bilmetadata = int2bin16(hex2int(data[16] + data[17])).substring(7, 10);
                let ketmetadata = int2bin16(hex2int(data[16] + data[17])).substring(10, 13);
                let sgmetadata = int2bin16(hex2int(data[16] + data[17])).substring(13, 16);
                let leu = encodeOne(leumetadata);
                let bld = encodeOne(bldmetadata);
                let ph = encodePH(phmetadata);
                let pro = encodeOne(prometadata);
                let ubg = encodeTwo(ubgmetadata);
                let nit = encodenit(nitmetadata);
                let vc = encodeOne(vcmetadata);
                let glu = encodeOne(glumetadata);
                let bil = encodeTwo(bilmetadata);
                let ket = encodeOne(ketmetadata);
                let sg = encodesg(sgmetadata);
                if (mResultListener) {
                    mResultListener({
                        "leu": leu,
                        "bld": bld,
                        "ph": ph,
                        "pro": pro,
                        "ubg": ubg,
                        "nit": nit,
                        "vc": vc,
                        "glu": glu,
                        "bil": bil,
                        "ket": ket,
                        "sg": sg,
                    })
                }
            }


            /**
             * 
             * 解码leu、bld、pro、vc、glu、ket、 va的值
             */
            function encodeOne(data) {
                data = parseInt(data, 2)
                if (data == 0) {
                    return "-"
                } else if (data == 1) {
                    return "+-"
                } else {
                    return `+${data-1}`
                }
            }

            /**
             * ubg、 bil 、ma 、ca 、cr
             */
            function encodeTwo(data) {
                data = parseInt(data, 2)
                if (data == 0) {
                    return "-"
                } else {
                    return `+${data}`
                }
            }

            /**
             * 解析nit值
             */
            function encodenit(data) {
                data = parseInt(data, 2)
                if (data == 0) {
                    return "-"
                } else {
                    return "+"
                }
            }

            /**
             * 解析sg值
             */
            function encodesg(data) {
                data = parseInt(data, 2)
                return (data * 0.005 + 1)
            }

            /**
             * 
             * ph值解析
             */
            function encodePH(data) {
                data = parseInt(data, 2)
                let ph = ["5.0", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5"]
                if (data > 6 || data < 0) {
                    data = 0
                }
                return ph[data]
            }


            /**
             * 10进制转2进制字符串补齐16位
             */
            function int2bin16(inte) {
                inte = `0000000000000000${inte.toString(2)}`;
                return inte.substring(inte.length - 16, inte.length);
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
            SingletonUrineSerial.instance = this;
        }
        return SingletonUrineSerial.instance;
    }

}


export default new SingletonUrineSerial()