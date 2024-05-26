document.addEventListener('DOMContentLoaded', async () => {
    const img = document.getElementById('originalImg');
    const canvas = document.getElementById('reflay');
    const canvasCtx = canvas.getContext('2d');

    const loadModels = async () => {
        const MODEL_URL = './models'; // Ensure this points to the correct location
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    const detectFaces = async () => {
        // Draw the original image on the canvas
        canvas.width = img.width;
        canvas.height = img.height;
        canvasCtx.drawImage(img, 0, 0);

        // Detect faces and draw them on the canvas
        let faceDescriptions = await faceapi
            .detectAllFaces(img)
            .withFaceLandmarks();

        // Iterate through detected faces
        faceDescriptions.forEach(faceDescription => {
            const box = faceDescription.detection.box;
            const { x, y, width, height } = box;

            // Define corner coordinates with a slight offset inwards
            const cornerSize = 20; // Adjust corner size as needed
            const topLeftX = x;
            const topLeftY = y;
            const topRightX = x + width - cornerSize;
            const topRightY = y;
            const bottomLeftX = x;
            const bottomLeftY = y + height - cornerSize;
            const bottomRightX = x + width - cornerSize;
            const bottomRightY = y + height - cornerSize;

            // Draw corner lines in the provided shape
            canvasCtx.strokeStyle = 'yellow'; // Change color as desired
            canvasCtx.lineWidth = 4;
            canvasCtx.beginPath();
            canvasCtx.moveTo(topLeftX, topLeftY + cornerSize);
            canvasCtx.lineTo(topLeftX, topLeftY);
            canvasCtx.lineTo(topLeftX + cornerSize, topLeftY);
            canvasCtx.stroke();
            canvasCtx.beginPath();
            canvasCtx.moveTo(topRightX - cornerSize, topRightY);
            canvasCtx.lineTo(topRightX, topRightY);
            canvasCtx.lineTo(topRightX, topRightY + cornerSize);
            canvasCtx.stroke();
            canvasCtx.beginPath();
            canvasCtx.moveTo(bottomLeftX, bottomLeftY - cornerSize);
            canvasCtx.lineTo(bottomLeftX, bottomLeftY);
            canvasCtx.lineTo(bottomLeftX + cornerSize, bottomLeftY);
            canvasCtx.stroke();
            canvasCtx.beginPath();
            canvasCtx.moveTo(bottomRightX - cornerSize, bottomRightY);
            canvasCtx.lineTo(bottomRightX, bottomRightY);
            canvasCtx.lineTo(bottomRightX, bottomRightY - cornerSize);
            canvasCtx.stroke();

            // Draw landmark dots
            const landmarks = faceDescription.landmarks;
            canvasCtx.fillStyle = 'green'; // Change color as desired
            const dotSize = 2; // Adjust dot size as needed

            for (let j = 0; j < landmarks.positions.length; j++) {
                const x = landmarks.positions[j].x;
                const y = landmarks.positions[j].y;
                canvasCtx.beginPath();
                canvasCtx.arc(x, y, dotSize, 0, 2 * Math.PI);
                canvasCtx.fill();
            }
        });
    };

    await loadModels();
    await detectFaces();
});
