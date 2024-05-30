document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('reflay');
    const canvasCtx = canvas.getContext('2d');

    const loadModels = async () => {
        const MODEL_URL = './models'; // Ensure this points to the correct location
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                };
            })
            .catch(err => console.error('Error accessing webcam: ', err));
    };

    const detectFaces = async () => {
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            const drawnLines = new Set();

            resizedDetections.forEach(detection => {
                const landmarks = detection.landmarks.positions;
                canvasCtx.strokeStyle = 'rgba(0, 255, 0, 0.5)';

                for (let i = 0; i < landmarks.length; i++) {
                    const pointA = landmarks[i];

                    let closestPoints = landmarks
                        .map((point, index) => ({
                            index,
                            distance: Math.sqrt(
                                Math.pow(pointA.x - point.x, 2) +
                                Math.pow(pointA.y - point.y, 2)
                            )
                        }))
                        .sort((a, b) => a.distance - b.distance)
                        .slice(1, 5);

                    closestPoints.forEach(point => {
                        const pointB = landmarks[point.index];
                        const lineKey = `${pointA.x},${pointA.y}-${pointB.x},${pointB.y}`;
                        const reverseLineKey = `${pointB.x},${pointB.y}-${pointA.x},${pointA.y}`;

                        if (!drawnLines.has(lineKey) && !drawnLines.has(reverseLineKey)) {
                            canvasCtx.beginPath();
                            canvasCtx.moveTo(pointA.x, pointA.y);
                            canvasCtx.lineTo(pointB.x, pointB.y);
                            canvasCtx.stroke();

                            drawnLines.add(lineKey);
                            drawnLines.add(reverseLineKey);
                        }
                    });
                }
            });
        }, 100);
    };

    await loadModels();
    startVideo();
    video.addEventListener('play', detectFaces);
});
