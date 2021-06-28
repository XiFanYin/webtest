var port = null;
var reader = null;
var writer = null;
var resultcallback = null

const CONNECT = new Uint8Array([
    0xcc, 0x80, 0x03, 0x03, 0x01, 0x01, 0x00, 0x00,
]);

const START = new Uint8Array([
    0xcc, 0x80, 0x03, 0x03, 0x01, 0x02, 0x00, 0x03,
]);

const STOP = new Uint8Array([
    0xcc, 0x80, 0x03, 0x03, 0x01, 0x03, 0x00, 0x02,
]);

const resultData = []

const STATE = {
    RESULT: 0,
    ERROR: 1
}


/**
 * 判断浏览器是否支持串口通讯
 */
function isbrowserSupportSerial() {
    return "serial" in navigator
};


/**
 * 连接血压计
 */
async function connectBloodPress(callback) {
    //设置回调
    resultcallback = callback
    //硬件设备过滤参数
    const filters = [{
        usbVendorId: 0x67b,
        usbProductId: 0x23c3
    }];
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
};
/**
 * 监听串口回执数据
 */
async function readListener() {
    while (port.readable) {
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
                    break;
                }
                if (value) {
                    resultData.push(Buffer.from(value).toString('hex'))
                    if(resultData.length==8){
                      console.log(resultData)
                    }
                }
            }
        } catch (error) {
            // TODO: 处理非致命的读错误。
        }
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
    writeCommand(START);
};

/**
 * 停止测量
 */
function stopMeasure() {
    writeCommand(STOP);
};






export default {
    isbrowserSupportSerial,
    connectBloodPress,
    startMeasure,
    stopMeasure,
}