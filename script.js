const paper = document.querySelector("#paper");
const pen = paper.getContext("2d");

const audioCtx = new AudioContext();

let startTime = new Date().getTime();

const draw = () => {
    const oneFullLoop = 2 * Math.PI;
    const maxAngle = 2 * Math.PI;
    const maxLoops = 30;
    const duration = 300;

    const calculateNextImpactTime = (currentImpactTime, velocity) => {
        return currentImpactTime + (Math.PI / velocity) * 1000;
    }

    const arcs = [
        "#e81ece",
        "#d742e7",
        "#c15bff",
        "#a46fff",
        "#7c81ff",
        "#3890ff",
        "#009eff",
        "#00abff",
        "#00b6ff",
        "#00c0ff",
        "#00c9ff",
        "#00d1ff",
        "#00d8ff",
        "#00dfff",
        "#00e5ff",
        "#00ebfe",
        "#00f0ec",
        "#00f4db",
        "#00f8c9",
        "#00fcb8",
        "#00ffa8"
    ].map((color, index) => {
    
        const numberOfLoops = oneFullLoop * (maxLoops - index)
        const velocity = numberOfLoops / duration;
        

        return {
            color,
            nextImpactTime: calculateNextImpactTime(startTime, velocity),
            velocity
        }
    });

    paper.width = paper.clientWidth;
    paper.height = paper.clientHeight;

    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime) / 1000;

    const start = {
        x: paper.width * 0.1,
        y: paper.height * 0.9
    }

    const end = {
        x: paper.width * 0.9,
        y: paper.height * 0.9
    }

    const center = {
        x: paper.width * 0.5,
        y: paper.height * 0.9
    }

    const length = end.x - start.x;
    const initialArcRadius = length * 0.05
    const spacing = (length / 2 - initialArcRadius) / arcs.length;

    pen.strokeStyle = "black";
    pen.lineWidth = 6;

    // Create the initial line
    pen.beginPath();
    pen.moveTo(start.x, start.y);
    pen.lineTo(end.x, end.y);
    pen.stroke();

    // Create each arc
    arcs.forEach((arc, index) => {
        const arcRadius = initialArcRadius + (index * spacing);
        const velocity = oneFullLoop * (maxLoops - index) / duration;
        const distance = Math.PI + (elapsedTime * velocity);
        const modDistance = distance % maxAngle;
        const adjustedDistance = modDistance >= Math.PI ? modDistance : maxAngle - modDistance;
        const x = center.x + arcRadius * Math.cos(adjustedDistance), 
            y = center.y + arcRadius * Math.sin(adjustedDistance);
        

        // Create arc
        pen.beginPath();
        pen.strokeStyle = arc.color
        pen.arc(center.x, center.y, arcRadius, Math.PI, 2 * Math.PI);
        pen.stroke();

        // Create circle that will be on arc
        pen.strokeStyle = "black";
        pen.fillStyle = "black";
        pen.beginPath();
        pen.arc(x, y, length * 0.0065, 0, 2 * Math.PI);
        pen.fill();
        pen.stroke();

        let soundEnabled = false;
        document.onvisibilitychange = () => soundEnabled = false;

        paper.onclick = () => soundEnabled = !soundEnabled;

        // AUDIO ISN'T WORKING. NEED TO FIND BUG

        if (currentTime >= arc.nextImpactTime) {
            if (soundEnabled) {
                var audio = new Audio('tone0.wav');
                audio.play();
            }

            arc.nextImpactTime = calculateNextImpactTime(arc.nextImpactTime, index);
        }
    });

    requestAnimationFrame(draw);
}

function playAudioWithPitchShift(index) {
    // Create an audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
    // Load the audio file
    const audioFile = 'tone0.mp3'; // Replace with the path to your audio file
    const request = new XMLHttpRequest();
    request.open('GET', audioFile, true);
    request.responseType = 'arraybuffer';
  
    request.onload = function() {
        audioContext.decodeAudioData(request.response, function(buffer) {
            // Create a pitch shifter node
            const pitchShifter = audioContext.createScriptProcessor(4096, 1, 1);
            const semitones = index;
    
            pitchShifter.onaudioprocess = function(event) {
                const inputBuffer = event.inputBuffer.getChannelData(0);
                const outputBuffer = event.outputBuffer.getChannelData(0);
    
                for (let i = 0; i < inputBuffer.length; i++) {
                    const currentSample = inputBuffer[i];
                    const newIndex = Math.floor(i * Math.pow(2, semitones / 12));
                    outputBuffer[newIndex] = currentSample;
                }
            };
    
            // Connect the pitch shifter to the audio context destination
            pitchShifter.connect(audioContext.destination);
    
            // Play the audio file
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(pitchShifter);
            source.start();
        });
    };
  
    request.send();
}
  

draw();