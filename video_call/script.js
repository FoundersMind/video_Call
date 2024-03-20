// Common variables
let peerConnection;
let localStream;
let isSender = false;
let recordedChunks = [];
let mediaRecorder;
// Common functions or utilities
async function getUserMedia() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
}
// Add a global variable to hold the recorded media




// Function to start recording
function startRecording() {
    recordedChunks = [];
    const options = { mimeType: 'video/webm' };
    mediaRecorder = new MediaRecorder(localStream, options);

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const recordingUrl = URL.createObjectURL(recordedBlob);

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = recordingUrl;
        downloadLink.download = 'recorded_video.webm';
        document.body.appendChild(downloadLink);

        // Automatically click the link to initiate download
        downloadLink.click();

        // Clean up after download
        URL.revokeObjectURL(recordingUrl);

        console.log('Recording stopped');
    };

    mediaRecorder.start();
    console.log('Recording started');
}

// Function to stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder = null; // Reset mediaRecorder after stopping
    }
}

async function startCall(senderNameInput) {
    try {
        const configuration = {};
        peerConnection = new RTCPeerConnection(configuration);

        localStream = await getUserMedia();
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Attach local stream to sender's video element
        if (isSender) {
            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = localStream;
        }

        // Attach remote stream to receiver's video element
        if (!isSender) {
            peerConnection.ontrack = event => {
                if (event.track.kind === 'video') {
                    const remoteVideo = document.getElementById('remoteVideo');
                    remoteVideo.srcObject = event.streams[0];
                }
            };
        }

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                if (!isSender && window.opener) {
                    window.opener.postMessage({ type: 'iceCandidate', candidate: event.candidate }, '*');
                } else {
                    console.log('ICE candidate:', event.candidate);
                }
            }
        };

        if (isSender) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            const offerObj = {
                type: offer.type,
                sdp: offer.sdp,
                name: senderNameInput.value
            };

            window.open('receiver.html', 'Receiver');
            console.log('Offer sent to receiver');
        }

        console.log('Call started');
        startRecording(); // Start recording here
    } catch (err) {
        console.error('Error starting call:', err);
    }
}

// Function to end the call
function endCall(mediaRecorder) {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        localStream.getTracks().forEach(track => track.stop());
        stopRecording(mediaRecorder);
        createDownloadLink(); // Create download link for recorded video
        
    }
}
function createDownloadLink() {
    const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    const recordingUrl = URL.createObjectURL(recordedBlob);

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = recordingUrl;
    downloadLink.download = 'recorded_video.webm';
    downloadLink.textContent = 'Download Recorded Video'; // Optional: Set link text
    document.getElementById('downloadLinkContainer').appendChild(downloadLink); // Append to the placeholder div

    // Clean up after download
    URL.revokeObjectURL(recordingUrl);

    console.log('Download link created');
}

// Function to handle ICE candidates and SDP messages
function handleMessage(event) {
    if (event.data.type === 'iceCandidate' && event.data.candidate) {
        try {
            peerConnection.addIceCandidate(event.data.candidate);
        } catch (err) {
            console.error('Error adding ICE candidate:', err);
        }
    } else if (event.data.type === 'offer' || event.data.type === 'answer') {
        const sessionDescription = new RTCSessionDescription(event.data.offer);
        peerConnection.setRemoteDescription(sessionDescription);
        if (event.data.type === 'offer') {
            peerConnection.createAnswer().then(answer => {
                peerConnection.setLocalDescription(answer);
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    isSender = path.includes('sender');

    if (isSender) {
        const startButton = document.getElementById('startCallButton');
        const senderNameInput = document.getElementById('senderName');
        const endbutton=document.getElementById("endCallButton");
        startButton.addEventListener('click', function() {
            startCall(senderNameInput);
        });
        endbutton.addEventListener('click', endCall);
    } else {
        const acceptButton = document.getElementById('acceptButton');
        const rejectButton = document.getElementById('rejectButton');
        acceptButton.addEventListener('click', function() {
            rejectButton.style.display = 'none';
            startCall(null);
        });
        rejectButton.addEventListener('click', function() {
            // Redirect to sender.html
            window.location.href = 'sender.html';
        });
    }
    window.addEventListener('message', handleMessage);
});
