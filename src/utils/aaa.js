var port = null;
var reader = null;
var writer = null;
var mStateListener = null;
var mErrorListener = null;
var mResultListener = null;
let keepReading = true;
const filters = [{
    usbVendorId: 0x67b,
    usbProductId: 0x23c3
}];
const CONNECT = new Uint8Array([0xcc, 0x80, 0x03, 0x03, 0x01, 0x01, 0x00, 0x00, ]);
const START = new Uint8Array([0xcc, 0x80, 0x03, 0x03, 0x01, 0x02, 0x00, 0x03, ]);
const STOP = new Uint8Array([0xcc, 0x80, 0x03, 0x03, 0x01, 0x03, 0x00, 0x02, ]);
var resultData = [];
const CONNECTSTATE = {
    UNCONNECT: 0,
    IDLE: 1,
    WORK: 2,
};
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
};
var currentState = CONNECTSTATE.UNCONNECT;

function isbrowserSupportSerial() {
    return "serial" in navigator
};

function getDeviceState() {
    return currentState
};
async function connectBloodPress(stateListener, errorListener, resultListener) {
    mStateListener = stateListener;
    mErrorListener = errorListener;
    mResultListener = resultListener;
    if (currentState == CONNECTSTATE.UNCONNECT) {
        try {
            port = await navigator.serial.requestPort({
                filters
            });
            await port.open({
                baudRate: 9600,
                dataBits: 8,
                stopBits: 1,
                parity: "none",
                flowControl: "none",
            });
            writer = port.writable.getWriter();
            readListener();
            writeCommand(CONNECT)
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
                    reader.releaseLock();
                    writer.releaseLock();
                    break
                }
                if (value) {
                    resultData.push(Buffer.from(value).toString('hex'));
                    if (resultData.length > 5) {
                        switch (resultData[5]) {
                            case "01": {
                                if (resultData.length == 8) {
                                    resultData.length = 0;
                                    changeState(CONNECTSTATE.IDLE)
                                }
                                break
                            }
                            case "02": {
                                if (resultData.length == 8) {
                                    resultData.length = 0;
                                    changeState(CONNECTSTATE.WORK)
                                }
                                break
                            }
                            case "03": {
                                if (resultData.length == 8) {
                                    resultData.length = 0;
                                    changeState(CONNECTSTATE.IDLE)
                                }
                                break
                            }
                            case "06": {
                                if (resultData.length == 20) {
                                    parseResultData(resultData.concat());
                                    resultData.length = 0;
                                    changeState(CONNECTSTATE.IDLE)
                                }
                                break
                            }
                            case "07": {
                                if (resultData.length == 8) {
                                    parseErrorData(resultData.concat());
                                    resultData.length = 0;
                                    changeState(CONNECTSTATE.IDLE)
                                }
                                break
                            }
                        }
                    }
                }
            }
        } catch (error) {} finally {
            reader.releaseLock()
        }
        resetData()
    }
};
async function writeCommand(command) {
    await writer.write(command)
};

function startMeasure() {
    if (currentState == CONNECTSTATE.IDLE) {
        writeCommand(START)
    } else if (currentState == CONNECTSTATE.UNCONNECT) {
        callError(ERRORSTATE.DISCONNECT)
    } else if (currentState == CONNECTSTATE.WORK) {
        callError(ERRORSTATE.REPEATMEASURE)
    }
};

function stopMeasure() {
    if (currentState == CONNECTSTATE.IDLE) {
        callError(ERRORSTATE.NOWORKING)
    } else if (currentState == CONNECTSTATE.UNCONNECT) {
        callError(ERRORSTATE.DISCONNECT)
    } else if (currentState == CONNECTSTATE.WORK) {
        writeCommand(STOP)
    }
};
async function disConnect() {
    if (currentState != CONNECTSTATE.UNCONNECT) {
        if (currentState == CONNECTSTATE.WORK) {
            stopMeasure()
        }
        keepReading = false;
        reader.cancel()
    }
}
async function resetData() {
    await port.close();
    changeState(CONNECTSTATE.UNCONNECT) port = null;
    reader = null;
    writer = null;
    mStateListener = null;
    mErrorListener = null;
    keepReading = true;
    resultData.length = 0
}

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
            callError(ERRORSTATE.OTHER)
        }
    }
};

function parseResultData(data) {
    let H = hex2int(data[13]) * 256 + hex2int(data[14]);
    let D = hex2int(data[15]) * 256 + hex2int(data[16]);
    let m = hex2int(data[17]) * 256 + hex2int(data[18]);
    if (mResultListener) {
        mResultListener({
            "H": H,
            "D": D,
            "M": m
        })
    }
};

function changeState(state) {
    currentState = state;
    if (mStateListener) {
        mStateListener(currentState)
    }
}

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
            code -= 48
        } else {
            code = (code & 0xdf) - 65 + 10
        }
        a[i] = code
    }
    return a.reduce(function (acc, c) {
        acc = 16 * acc + c;
        return acc
    }, 0)
}
export default {
    isbrowserSupportSerial,
    getDeviceState,
    connectBloodPress,
    startMeasure,
    stopMeasure,
    disConnect,
    ERRORSTATE,
    CONNECTSTATE
}