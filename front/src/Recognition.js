import React, { useEffect, useState } from 'react';


function ASR({ onFinalTranscription, isVoiceRecognitionOn, mediaStream }) {
    const [audioContext, setAudioContext] = useState(null);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if (!mediaStream) return;

        const init = async () => {
            // Web Audio APIのコンテキストを作成
            const audioContext = new AudioContext();
            setAudioContext(audioContext);

            // SpeechRecognition APIを初期化
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'ja-JP'; // 日本語に設定
            setRecognition(recognition);

            // MediaStreamをSourceNodeに接続
            const sourceNode = audioContext.createMediaStreamSource(mediaStream);

            // SpeechRecognition APIをマイクからの音声に接続
            recognition.onresult = event => {
                let finalTranscription = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscription = event.results[i][0].transcript;
                        onFinalTranscription(finalTranscription);
                    }
                }
            };
            // sourceNode.connect(audioContext.destination);
        };

        init();

        // コンポーネントのアンマウント時にSpeechRecognitionを停止
        return () => {
            // recognition.stop();
        };
    }, [mediaStream]);

    useEffect(() => {
        if (isVoiceRecognitionOn && recognition) {
          recognition.start();
        } else if (!isVoiceRecognitionOn && recognition) {
          recognition.stop();
        }
    }, [isVoiceRecognitionOn, recognition]);

    return;
}

export default ASR;