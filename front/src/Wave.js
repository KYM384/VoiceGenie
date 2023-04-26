import React, { useEffect, useRef } from "react";
import "./App.css";

const Wave = ({ mediaStream, isVoiceRecognitionOn }) => {
    const canvasRef = useRef(null);
    const num_wave = 3;

    useEffect(() => {
        if (!mediaStream) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let frameId;

        const random = (min, max) => Math.random() * (max - min) + min;
        let freqs = [];
        for (let i = 0; i < num_wave; i++) {
            freqs.push([]);
            for (let j = 0; j < 4; j++) {
                freqs[i].push(random(30, 70));
            }
        }

        const audioContext = new AudioContext();
        const sourceNode = audioContext.createMediaStreamSource(mediaStream);
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 1024;
        sourceNode.connect(analyserNode);

        const dataArray = new Uint8Array(analyserNode.fftSize);
        let AmplitudeEMA = 0.0;

        const audioWave = () => {
            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            analyserNode.getByteTimeDomainData(dataArray);

            const sliceWidth = canvas.width * 1.0 / 1024;
            let Amplitude = 0.0;
            if (isVoiceRecognitionOn) {
                Amplitude = Math.max(...dataArray) - Math.min(...dataArray);
                Amplitude = Math.max(Amplitude / 512.0, 0.01);
            }
            AmplitudeEMA = AmplitudeEMA * 0.7 + Amplitude * (1-0.7);

            ctx.lineWidth = 2;
            ctx.strokeStyle = "#BABAFF";
            ctx.beginPath();

            ctx.shadowColor = "#DDDDFF";
            ctx.shadowBlur = 5;
            ctx.shadowOffsetY = 0;

            for (let n = 0; n < num_wave; n++) {
                let x = 0;
                const t = performance.now() / 1000 + 5;

                for (let i = 0; i < 1024; i++) {
                    const v1 = Math.sin(i / freqs[n][0] * (Math.sin(t / freqs[n][3])) + t);
                    const v2 = Math.sin(i / freqs[n][1] * (Math.sin(t / freqs[n][2])) + t * freqs[n][1] / 15);
                    const v3 = Math.sin(i / freqs[n][2] * (Math.sin(t / freqs[n][1])) + t * freqs[n][0] / 15);
                    const v4 = Math.sin(i / freqs[n][3] * (Math.sin(t / freqs[n][0])) + t * freqs[n][2] / 15);
                    const v = (v1 * 0.4 + v2 * 0.3 + v3 * 0.2 + v4 * 0.1) * AmplitudeEMA;
                    const y = v * canvas.height + canvas.height * 0.6;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                    x += sliceWidth;
                }

            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            frameId = requestAnimationFrame(audioWave);
        };

        audioWave();

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [mediaStream, isVoiceRecognitionOn]);

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            className="wave-canvas"
        ></canvas>
    );
};

export default Wave;
