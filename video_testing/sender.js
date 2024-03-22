
const webSocket = new WebSocket("ws://localhost:9000");

let localStream;
let peerConn;
let username; // Define username in a scope accessible to both functions

webSocket.onopen = function(event) {
    console.log("WebSocket connection opened.");
};

webSocket.onmessage = function(event) {
    handleSignallingData(JSON.parse(event.data));
};

webSocket.onerror = function(error) {
    console.error("WebSocket error:", error);
};

webSocket.onclose = function(event) {
    console.log("WebSocket connection closed.");
};

function startCall() {
    username = document.getElementById("username-input").value; // Define username here
   
    sendData({
        type: "store_user"
    })
    var startCallButton = document.getElementById("start-call-button");
    if (startCallButton) {
        startCallButton.style.display = "none";
    }
    document.getElementById("video-call-div").style.display = "inline";

    navigator.mediaDevices.getUserMedia({
        video: {
            frameRate: { ideal: 24 },
            width: { min: 480, ideal: 720, max: 1280 },
            aspectRatio: 1.33333
        },
        audio: true
    })
    .then(stream => {
        localStream = stream;
        document.getElementById("local-video").srcObject = localStream;

        let configuration = {
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        
                    ]
                }
            ]
        };

        peerConn = new RTCPeerConnection(configuration);
        peerConn.addStream(localStream);

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video").srcObject = e.stream;
        };

        peerConn.onicecandidate = (event) => {
            if (event.candidate) {
                sendData({
                    type: "store_candidate",
                    candidate: event.candidate
                });
            }
        };

        createAndSendOffer(); // Corrected function reference

        let receiverWindow = window.open("receiver.html", "_blank");
    })
    .catch(error => console.error("Error accessing user media:", error));
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
                .catch(error => console.error("Error setting remote description:", error));
            break;
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
                .catch(error => console.error("Error adding ICE candidate:", error));
            break;
    }
}

function sendData(data) {
    data.username = username;
    webSocket.send(JSON.stringify(data));
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
}
// In sender.js and receiver.js

function endCall() {
    // Stop local stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // Stop remote stream
    document.getElementById("remote-video").srcObject = null;

    // Close WebRTC connection
    if (peerConn) {
        peerConn.close();
    }

    // Close WebSocket connection
    if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.close();
    }

    // Additional cleanup tasks if any

    console.log("Call ended.");
}

let isAudio = true;
function muteAudio() {
    isAudio = !isAudio;
    localStream.getAudioTracks()[0].enabled = isAudio;
}

let isVideo = true;
function muteVideo() {
    isVideo = !isVideo;
    localStream.getVideoTracks()[0].enabled = isVideo;
}
