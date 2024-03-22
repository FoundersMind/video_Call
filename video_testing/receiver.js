
const webSocket = new WebSocket("ws://localhost:9000");


let localStream;
let peerConn;
let username; // Define username in a scope accessible to both functions

let remoteStream;
let localRecorder;
let remoteRecorder;
let isRecording = false;
// Function to start recording
function startRecording() {
    // Initialize local recorder
    localRecorder = RecordRTC([localStream], {
        type: 'video',
        mimeType: 'video/webm',
        bitsPerSecond: 128000, // Adjust as needed
    });

    // Start local recording
    localRecorder.startRecording();

    // Initialize remote recorder
    remoteRecorder = RecordRTC([remoteStream], {
        type: 'video',
        mimeType: 'video/webm',
        bitsPerSecond: 128000, // Adjust as needed
    });

    // Start remote recording
    remoteRecorder.startRecording();

    console.log('Recording started...');
    isRecording = true;
}

function stopRecording() {
    // Stop local recording
    localRecorder.stopRecording(function() {
        const localBlob = localRecorder.getBlob();
        
        // Stop remote recording
        remoteRecorder.stopRecording(function() {
            const remoteBlob = remoteRecorder.getBlob();

            // Combine local and remote blobs into a single blob
            const combinedBlob = new Blob([localBlob, remoteBlob], { type: 'video/webm' });

            // Create download link for the combined blob
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(combinedBlob);
            downloadLink.download = 'combined_video.webm';
            downloadLink.click();
        });
    });

    console.log('Recording stopped...');
    isRecording = false;
}


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
function sendData(data) {
    data.username = username;
    webSocket.send(JSON.stringify(data));
}
function joinCall() {
    
    username = document.getElementById("username-input").value;
    
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

        // Add tracks from localStream to peerConn
        localStream.getTracks().forEach(track => {
            peerConn.addTrack(track, localStream);
        });

        peerConn.ontrack = function(event) {
            // This event is triggered when a remote stream is added to the connection
            if (!remoteStream) {
                // Set the remote stream as the source for a video element
                remoteStream = event.streams[0];
                document.getElementById("remote-video").srcObject = remoteStream;
            }
        };

        peerConn.onicecandidate = function(event) {
            // Send ICE candidate to the remote peer
            if (event.candidate) {
                sendData({
                    type: "send_candidate",
                    candidate: event.candidate
                });
            }
        };
        
        sendData({
            type: "join_call",
           
        });
        var joinCallButton = document.getElementById("join-call-button");
    if (joinCallButton) {
        joinCallButton.style.display = "none";
    }
    
    })
    .catch(error => console.error("Error accessing user media:", error));
}

function handleSignallingData(data) {
    switch (data.type) {
        case "offer":
            peerConn.setRemoteDescription(data.offer)
                .then(() => createAndSendAnswer())
                .catch(error => console.error("Error setting remote description:", error));
            break;
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
                .catch(error => console.error("Error adding ICE candidate:", error));
            break;
    }
}

function createAndSendAnswer() {
    peerConn.createAnswer()
        .then(answer => {
            return peerConn.setLocalDescription(answer);
        })
        .then(() => {
            sendData({
                type: "send_answer",
                answer: peerConn.localDescription
            });
            // Start recording once the answer is created and sent
            startRecording();
        })
        .catch(error => console.error("Error creating or sending answer:", error));
}



function endCall() {
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

    // Stop recording if it's ongoing
    if (isRecording) {
        stopRecording();
    }

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
