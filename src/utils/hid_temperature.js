class SingletonTempUsb {
    constructor() {
        //首次使用构造器实例
        if (!SingletonTempUsb.instance) {
            // 硬件设备过滤参数 
            const filters = [{
                vendorId: 0x0C45,
                productId: 0x7702
            }];

            const CONNECTSTATE = {
                UNCONNECT: 1, //未连接
                CONNECTED: 2, //已经连接
            };

            //错误码定义
            const ERRORSTATE = {
                NOSELECET: {
                    code: -1,
                    message: "未选择串口"
                },

                REPETCONNECT: {
                    code: -2,
                    message: "串口重复连接"
                },

                BODYTEMPLOW: {
                    code: -3,
                    message: "体温低于34°C"
                },
                BODYTEMPHIGH: {
                    code: -4,
                    message: "体温高于42.9°C"
                },

                ENVIRHIGH: {
                    code: -5,
                    message: "环境温度高于 40°C"
                },

                ENVIRLOW: {
                    code: -6,
                    message: "环境温度低于 5°C"
                },
                SYSTEMERROR: {
                    code: -7,
                    message: "系统自检错误"
                },
                EPPOM: {
                    code: -8,
                    message: "读EPPOM错误"
                },
                OTHER: {
                    code: -9,
                    message: "其他错误"
                }

            };
            this.CONNECTSTATE = CONNECTSTATE;
            this.ERRORSTATE = ERRORSTATE;
            //当前设备连接状态标记
            let currentState = CONNECTSTATE.UNCONNECT;
            //hid句柄
            let hidDevice = null;
            //结果回调
            let mResultListener = null;
            //连接状态回调
            let mStateListener = null;
            //发生错误回调
            let mErrorListener = null;
            //数据拼接
            var resultData = [];

            /**
             * 判断浏览器是否支持hid通讯
             */
            this.isbrowserSupportHid = function () {
                return "hid" in navigator
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
             * 连接HID设备
             */
            this.connect = async function (stateListener, errorListener, resultListener) {
                //设置回调
                mStateListener = stateListener;
                mResultListener = resultListener;
                mErrorListener = errorListener;
                //设置拔出监听
                navigator.hid.addEventListener("disconnect", event => {
                    if (hidDevice) {
                        changeState(CONNECTSTATE.UNCONNECT)
                        hidDevice[0].close()
                        hidDevice = null
                    }
                });

                try {
                    //找到设备
                    hidDevice = await navigator.hid.requestDevice({
                        filters
                    });
                    //打开
                    await hidDevice[0].open()
                    //改变设备连接状态
                    changeState(CONNECTSTATE.CONNECTED)
                    //设置数据回调监听
                    hidDevice[0].addEventListener("inputreport", event => {
                        const {
                            data,
                            device,
                            reportId
                        } = event;
                        let tempdata = Array.prototype.map.call(new Uint8Array(data.buffer), (x) => ('00' + x.toString(16)).slice(-2));
                        resultData = resultData.concat(tempdata)
                        if (resultData.length == 16) {
                            paseResult(resultData)
                            resultData.length = 0
                        }

                    });
                } catch (error) {
                    changeState(CONNECTSTATE.UNCONNECT)
                    if ("No device selected." == error.message) {
                        callError(ERRORSTATE.NOSELECET)
                    } else if ("The device is already open." == error.message) {
                        callError(ERRORSTATE.REPETCONNECT)
                    }

                }

            }


            /**
             * 解析拿到的数据
             * 
             */
            function paseResult(data) {
                var mdada = data.slice(0, data.indexOf("0d") + 1)
                if (mdada.length == 9) { //表示这里发生了错误
                    var errordata = mdada.join("").slice(8, 16)
                    if ("54614c6f" == errordata) {
                        callError(ERRORSTATE.ENVIRLOW)
                    } else if ("54614869" == errordata) {
                        callError(ERRORSTATE.ENVIRHIGH)
                    } else if ("54624c6f" == errordata) {
                        callError(ERRORSTATE.BODYTEMPLOW)
                    } else if ("54624869" == errordata) {
                        callError(ERRORSTATE.BODYTEMPHIGH)
                    } else if ("45722e72" == errordata) {
                        callError(ERRORSTATE.SYSTEMERROR)
                    } else if ("45722e45" == errordata) {
                        callError(ERRORSTATE.EPPOM)
                    }
                } else if (mdada.length == 11) {
                    switch (mdada[3]) {
                        case "30": //这里测量的是body温度
                            if (mdada[9] == "43") { //表示单位是C
                                var temp = hexCharCodeToStr(mdada.slice(5, 9))
                                var unit = "C"
                            } else {
                                //说明是华氏温度，开头是0
                                var unit = "F"
                                if (mdada[4] == "30") {
                                    var temp = hexCharCodeToStr(mdada.slice(5, 9))
                                } else {
                                    //说明是华氏温度，开头不是0
                                    var temp = hexCharCodeToStr(mdada.slice(4, 9))
                                }
                            }
                            callResult({
                                "mode": 0,
                                "unit": unit,
                                "temp": temp
                            })
                            break
                        case "31": //这里是环境温度
                            if (mdada[9] == "43") { //表示单位是C
                                var temp = hexCharCodeToStr(mdada.slice(5, 9))
                                var unit = "C"
                            } else {
                                //说明是华氏温度，开头是0
                                var unit = "F"
                                if (mdada[4] == "30") {
                                    var temp = hexCharCodeToStr(mdada.slice(5, 9))
                                } else {
                                    //说明是华氏温度，开头不是0
                                    var temp = hexCharCodeToStr(mdada.slice(4, 9))
                                }
                            }
                            callResult({
                                "mode": 1,
                                "unit": unit,
                                "temp": temp
                            })
                            break
                    }

                } else {
                    callError(ERRORSTATE.OTHER)
                }


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
             * 结果回调
             */
            function callResult(result) {
                if (mResultListener) {
                    mResultListener(result);
                }

            }

            function hexCharCodeToStr(rawStr) {
                var curCharCode;
                var resultStr = [];
                for (var i = 0; i < rawStr.length; i++) {
                    curCharCode = parseInt(rawStr[i], 16);
                    resultStr.push(String.fromCharCode(curCharCode));
                }
                return resultStr.join("");
            }


            //将this挂载到SingletonTempUsb这个类的instance属性上
            SingletonTempUsb.instance = this;
        }
        return SingletonTempUsb.instance;
    }

}


export default new SingletonTempUsb()