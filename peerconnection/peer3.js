const IP_REGEX = /((\b\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*\b)|(\b\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*\b))/gi

var IceServersHandler = (function() {
    function getIceServers() {
        // resiprocate: 3344+4433
        // pions: 7575
        var iceServers = [{
                'urls': [
                    'stun:webrtcweb.com:7788', // coTURN
                    'stun:webrtcweb.com:7788?transport=udp', // coTURN
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'turn:webrtcweb.com:7788', // coTURN 7788+8877
                    'turn:webrtcweb.com:4455?transport=udp', // restund udp

                    'turn:webrtcweb.com:8877?transport=udp', // coTURN udp
                    'turn:webrtcweb.com:8877?transport=tcp', // coTURN tcp
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    'stun:stun.l.google.com:19302?transport=udp',
                ]
            }
        ];

        if (typeof window.InstallTrigger !== 'undefined') {
            iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788',
                    'stun:webrtcweb.com:7788',
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            }];
        }

        return {iceServers:iceServers};
    }

    return {
        getIceServers: getIceServers
    };
})();


let localStream;
let pc1;
let pc2;

function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
}
function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}

async function start() {
    console.log('start')
    const local_video = document.getElementById('local-video')
    const canvas = document.createElement('canvas')
    console.log('get canvas')
    // const canvas = document.getElementById('canvas')
    localStream = canvas.captureStream()
    // localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
    // console.log(video1)
    // localStream = video1.captureStream()
    console.log('set local video')
    // localStream = video1.captureStream()
    local_video.srcObject = localStream

    pc1 = new RTCPeerConnection(IceServersHandler.getIceServers())
    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e))
    pc2 = new RTCPeerConnection(IceServersHandler.getIceServers())
    pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e))

    console.log('add track')
    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));

    try {
        console.log('create offer')
        const offer = await pc1.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        })

        console.log('set sdp')
        await pc1.setLocalDescription(offer)
        console.log('pc2 set remote sdp')
        await pc2.setRemoteDescription(offer)
        console.log('create answer')
        const answer = await pc2.createAnswer()
        console.log('pc2 set sdp')
        await pc2.setLocalDescription(answer)
        console.log('pc1 set remote sdp')
        await pc1.setRemoteDescription(answer)

        await pc1.close()
        await pc2.close()

    } catch (error) {
        
    }
}

async function onIceCandidate(pc, event) {
    try {
        console.log(getName(pc), event.candidate)
        // const candidate = new RTCIceCandidate({
        //     candidate: event.candidate.candidate.replace(IP_REGEX, ' 116.228.39.115 '),
        //     sdpMLineIndex: event.candidate.sdpMLineIndex,
        //     sdpMid: event.candidate.sdpMid,
        //     usernameFragment: event.candidate.usernameFragment
        // })
        // console.log('replace to', candidate)

        const debug = document.getElementById('debug')
        // debug.innerHTML = 1
        debug.innerText += getName(pc) + ' __ ' + event.candidate.candidate + '\n'

        await getOtherPc(pc).addIceCandidate(event.candidate)
    } catch (error) {
        console.error()
    }
}

start()
