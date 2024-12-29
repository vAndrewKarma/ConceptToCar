import os from 'os'
const getPodIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1'; 
};

const podIP = getPodIP();
export default podIP

// TODO: test on multipe ports
// TODO: configure k8s to avoid port conflicts