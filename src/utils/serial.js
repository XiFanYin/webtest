//https://blog.csdn.net/weixin_43155762/article/details/116888996
//端口对象
var port = null;
//读流
var reader = null;
//写流
var writer = null;
//连接状态回调
var mStateListener = null
//发生错误回调
var mErrorListener = null
//测量结果回调
var mResultListener = null
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
var resultData = []

//连接状态定义
const STATE = {
    UNCONNECT: 0, //未连接
    IDLE: 1, //闲置
    WORK: 2, //工作
}
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
    REPEATCONNECT: {
        code: 2,
        message: "串口重复连接"
    },
    DISCONNECT: {
        code: 3,
        message: "测量设备未连接"
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
}

//当前设备连接状态标记
var currentState = STATE.UNCONNECT


/**
 * 判断浏览器是否支持串口通讯
 */
function isbrowserSupportSerial() {
    return "serial" in navigator
};


/**
 * 
 * 获取设备状态
 */
function getDeviceState() {
    return currentState
}


/**
 * 连接血压计
 */
async function connectBloodPress(stateListener, errorListener,resultListener) {
    //设置回调
    mStateListener = stateListener
    mErrorListener = errorListener
    mResultListener = resultListener
    if (currentState == STATE.UNCONNECT) {
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
            //写入连接指令
            writeCommand(CONNECT);
        } catch (error) {
            if (error.message == "Failed to open serial port.") {
                callError(ERRORSTATE.OPENFAIL)
            } else if (error.message == "No port selected by the user.") {
                callError(ERRORSTATE.NOSELECET)
            }
        }
    } else {
        callError(ERRORSTATE.REPEATCONNECT)
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
                    resultData.push(Buffer.from(value).toString('hex'))
                    if (resultData.length > 5) {
                        switch (resultData[5]) {
                            case "01": { //连接回执
                                if (resultData.length == 8) {
                                    //清空数据
                                    resultData.length = 0
                                    changeState(STATE.IDLE)
                                }
                                break
                            }
                            case "02": { //开始测量回执
                                if (resultData.length == 8) {
                                    //清空数据
                                    resultData.length = 0
                                    changeState(STATE.WORK)
                                }
                                break
                            }
                            case "03": { //停止测量回执
                                if (resultData.length == 8) {
                                    //清空数据
                                    resultData.length = 0
                                    changeState(STATE.IDLE)
                                }
                                break
                            }
                            case "06": { //返回测量结果回执
                                if (resultData.length == 20) {
                                    //去解析结果
                                    parseResultData(resultData.concat())
                                    //清空数据
                                    resultData.length = 0
                                    changeState(STATE.IDLE)
                                }
                                break
                            }
                            case "07": { //发生错误回执
                                if (resultData.length == 8) {
                                    parseErrorData(resultData.concat())
                                    //清空数据
                                    resultData.length = 0
                                    changeState(STATE.IDLE)
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
        resetData()
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
 *开始测量
 */
function startMeasure() {
    if (currentState == STATE.IDLE) {
        writeCommand(START);
    } else if (currentState == STATE.UNCONNECT) {
        callError(ERRORSTATE.DISCONNECT)
    } else if (currentState == STATE.WORK) {
        callError(ERRORSTATE.REPEATMEASURE)
    }
};

/**
 * 停止测量
 */
function stopMeasure() {
    if (currentState == STATE.IDLE) {
        callError(ERRORSTATE.NOWORKING)
    } else if (currentState == STATE.UNCONNECT) {
        callError(ERRORSTATE.DISCONNECT)
    } else if (currentState == STATE.WORK) {
        writeCommand(STOP);
    }
};


/**
 * 关闭串口连接
 * 
 */
async function disConnect() {
    if (currentState != STATE.UNCONNECT) {
        if (currentState == STATE.WORK) {
            stopMeasure()
        }
        keepReading = false
        reader.cancel();
    }
}

/**
 * 数据恢复初始值
 */
async function resetData() {
    await port.close();
    changeState(STATE.UNCONNECT)
    port = null;
    reader = null;
    writer = null;
    mStateListener = null
    mErrorListener = null
    keepReading = true;
    resultData.length = 0
}


/**
 * 错误解析
 */

function parseErrorData(data) {
    switch (data[6]) {
        case "01": {
            callError(ERRORSTATE.PRESSUREPROTECT)
            break
        }
        case "02": {
            callError(ERRORSTATE.AIRLEAKAGE)
            break
        }
        case "05": {
            callError(ERRORSTATE.AIRLEAKAGE)
            break
        }
        case "06": {
            callError(ERRORSTATE.SENSOR)
            break
        }
        case "09": {
            callError(ERRORSTATE.DEFLATE)
            break
        }
        case "0f": {
            callError(ERRORSTATE.AIRLOUT)
            break
        }
        case "10": {
            callError(ERRORSTATE.MOTOR)
            break
        }
        default: {
            callError(ERRORSTATE.OTHER)
        }
    }

};

/**
 * 测量结果解析
 */
function parseResultData(data) {
    console.log("parseResultData" + data)
    let H = hex2int(data[13]) * 256 + hex2int(data[14])
    let D = hex2int(data[15]) * 256 + hex2int(data[16])
    let m = hex2int(data[17]) * 256 + hex2int(data[18])
    if(mResultListener){
        mResultListener({"H":H,"D":D,"M":m})
    }
};

/**
 * 
 * 改变当前连接状态，对外部进行回调
 */
function changeState(state) {
    currentState = state
    //向外回调当前状态
    if (mStateListener) {
        mStateListener(currentState)
    }

}
/**
 * 错误回调
 */
function callError(errormessage) {
    if (mErrorListener) {
        mErrorListener(errormessage)
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


export default {
    isbrowserSupportSerial,
    getDeviceState,
    connectBloodPress,
    startMeasure,
    stopMeasure,
    disConnect
}