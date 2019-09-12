const local_video = document.getElementById('local-video')
const remote_video = document.getElementById('remote-video')
const mini_video = document.getElementById('mini-video')
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
    localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})    
    local_video.srcObject = localStream

    pc1 = new RTCPeerConnection()
    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e))
    pc2 = new RTCPeerConnection()
    pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e))
    pc2.addEventListener('track', (e) => {
        if (mini_video.srcObject !== e.streams[0]) {
            mini_video.srcObject = e.streams[0];
            mini_video.play()
            console.log('pc2 received remote stream');
        }
    });

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

    } catch (error) {
        
    }
}

async function onIceCandidate(pc, event) {
    try {
        console.log(getName(pc), event.candidate)
        await getOtherPc(pc).addIceCandidate(event.candidate)
    } catch (error) {
        console.error()
    }
}

start()