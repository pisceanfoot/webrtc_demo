let pc = null
let channel = null

const socket = io('wss://sit-si.51uuabc.com/', {
    transports: ['websocket']
})
socket.on('connected', function () {
    console.log('connected')
    socket.emit('authenticate', 'a')
})

socket.on('authenticated', function () {
    socket.emit('join', {
        room_id: 'test', 
        user_id: 'hello' + Math.random(),
        role: 1
    })
})

socket.on('enterSuccess', function () {
    start()
})

socket.on('share', async function (data) {
    console.log('share', data)
    if(data.candidate){
        console.log(data.candidate)
        var candidate = new RTCIceCandidate(data.candidate);
        try {
            await pc.addIceCandidate(candidate)    
        } catch (error) {
            console.error(error)
        }
        
    }else if(data.desc) {
        console.log(data.desc)
        if(data.desc.type == 'offer'){
            await pc.setRemoteDescription(data.desc)
            const answer = await pc.createAnswer()
            console.log('answer', answer)
            await pc.setLocalDescription(answer)
            socket.eit('share', { desc: pc.localDescription })
        }
        else if(data.desc.type == 'answer'){
            await pc.setRemoteDescription(data.desc)
        }
    }
})

function start() {
    const configuration = {iceServers: IceServersHandler.getIceServers()}

    pc = new RTCPeerConnection(configuration)
    pc.onicecandidate = ({candidate}) => {
        console.log(candidate)
        socket.emit('share', {candidate: candidate})
    }

    pc.onnegotiationneeded = async ()=> {
        try {
            const offer = await pc.createOffer()
            console.log('offer', offer)
            await pc.setLocalDescription(offer)

            console.log('send local desc', pc.localDescription)
        } catch (error) {
            console.error('create offer', error)
        }
    }

    var dataChannelDict = { };
    channel = pc.createDataChannel('sctp-channel', dataChannelDict);

    pc.ontrack = (event) => {
        console.log('remote video')
        document.getElementById('remote-video').srcObject = event.streams[0]
    }

    // const stream = _getStream()
    // stream.getTracks().forEach( track => {
    //     pc.addTrack(track, stream)
    // })

    var constraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: true
        }
    };

    console.log('sdp-constraints', JSON.stringify(constraints.mandatory, null, '\t'));
}

function _getStream() {
    return document.getElementById('canvas').captureStream()
}

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

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();

