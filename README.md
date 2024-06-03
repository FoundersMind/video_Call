# Video Call Web App

This project is a simple video call web application built using HTML, CSS, JavaScript, and WebRTC. The application allows users to initiate a video call with another user by sharing a unique link.

## Features

- Real-time video calling
- Simple and intuitive user interface
- Peer-to-peer connection using WebRTC
- Room-based video call links

## Technologies Used

- HTML5
- CSS3
- JavaScript
- WebRTC

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

You will need a web server to run this application. You can use any web server, but for simplicity, we recommend using the `http-server` npm package.

### Installation

1. Clone the repository

    ```sh
    git clone https://github.com/your-username/video-call-web-app.git
    ```

2. Navigate to the project directory

    ```sh
    cd video-call-web-app
    ```

3. Install `http-server` globally

    ```sh
    npm install -g http-server
    ```

4. Start the server

    ```sh
    http-server
    ```

5. Open your browser and navigate to `http://localhost:8080`

## Usage

1. When you open the application, you will see a unique URL in the address bar. Share this URL with the person you want to call.
2. When the other person opens the URL, the video call will be initiated automatically.

## File Structure

video-call-web-app/
├── css/
│ └── styles.css
├── js/
│ └── main.js
├── index.html
└── README.md 


### index.html

This is the main HTML file that contains the structure of the application.

### styles.css

This file contains the CSS styles for the application.

### main.js

This is the main JavaScript file that handles the WebRTC functionality and user interactions.

## WebRTC Implementation

The core functionality of this application relies on WebRTC for peer-to-peer communication. Here's a brief overview of how WebRTC is implemented in `main.js`:

1. **Getting User Media**: Access the user's camera and microphone using `navigator.mediaDevices.getUserMedia`.
2. **RTCPeerConnection**: Create a new `RTCPeerConnection` instance to manage the peer-to-peer connection.
3. **ICE Candidates**: Exchange ICE candidates between peers to establish the connection.
4. **SDP (Session Description Protocol)**: Exchange offer and answer SDP messages to agree on the connection parameters.
5. **Display Streams**: Display the local and remote video streams in the browser.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - Njbhandari4@gmail.com

Project Link: [https://github.com/Sakhtiman/video_call](https://github.com/Sakhtiman/video_call)
