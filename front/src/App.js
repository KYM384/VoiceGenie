import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import Wave from "./Wave";
import ASR from "./Recognition";
import SettingsModal from "./SettingsModal";
import TypingIndicator from './TypingIndicator';
import "./App.css";

import { FaTasks, FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaCog } from "react-icons/fa";


function App() {
  const [conversationLogs, setConversationLogs] = useState([]);
  const [isVoiceRecognitionOn, setIsVoiceRecognitionOn] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [textInput, setTextInput] = useState("");
  const chatAreaRef = useRef(null);
  const [speakerId, setSpeakerId] = useState(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const gifs = ["./hiyori/action_1.gif", "./hiyori/action_2.gif", "./hiyori/action_3.gif", "./hiyori/angry.gif", "./hiyori/in_trouble.gif", "./hiyori/laugh.gif", "./hiyori/normal.gif", "./hiyori/sad.gif", "./hiyori/surprised.gif"];
  const [currentGif, setCurrentGif] = useState(0);
  const [ContinuousGif, setContinuousGif] = useState(0);
  const gifUpdateInterval = useRef(null);

  const updateGif = (id=-1) => {
    // 1. angry 2. trouble 3. laugh 4. normal 5. sad 6. surprise
    var Index = currentGif;

    if (Index > 2 && ContinuousGif < 10) {
        // pass
    }else if (id === -1) {
        Index = Math.floor(Math.random() * 3);
        setContinuousGif(0);
    } else {
        Index = id + 2;
        setContinuousGif(0);
    }
    setCurrentGif(Index);
    setContinuousGif(ContinuousGif + 1);
  };

  useEffect(() => {
    gifUpdateInterval.current = setInterval(updateGif, 6000);
  
    return () => {
      clearInterval(gifUpdateInterval.current);
    };
  }, []);


  useEffect(() => {
    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(stream);
      } catch (error) {
        console.error("Error getting user media:", error);
      }
    };

    getMediaStream();
  }, []);

  const handleClick = () => {
    window.location.href = "https://www.google.com";
  };

  const speakResponse = async (text) => {
    try {
      const response = await fetch("https://voicegenie.net:5000/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({"text": text, "speaker": speakerId}),
      });

      const base64Audio = await response.json();
      const audioData = atob(base64Audio.output);
      const audioArray = new Uint8Array(audioData.length);
  
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
  
      const blob = new Blob([audioArray.buffer], { type: "audio/wav" });
      const audioURL = URL.createObjectURL(blob);
      const audio = new Audio(audioURL);
      audio.play();
    } catch (error) {
      console.error("Speech synthesis API call error:", error);
      addMessage("ai", "すみません、エラーで声が出ません！", true);
    }
  };

  const addMessage = (role, text, error=false) => {
    setConversationLogs((prevLogs) => [
      ...prevLogs,
      { role, text },
    ]);

    if (role === "ai" && !error) {
        speakResponse(text);
    }
  };

  const handleFinalTranscription = async (finalTranscription) => {
    addMessage("user", finalTranscription);
    setIsLoading(true);

    try {
        const response = await fetch("https://voicegenie.net:5000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({"input": finalTranscription}),
        });

        const result = await response.json();
        updateGif(result.emotion);
        addMessage("ai", result.output);
    } catch (error) {
        console.error("API call error:", error);
        addMessage("ai", "すみません、エラーで返事ができません！", true);
    } finally {
        setIsLoading(false);
    }
  };

  const toggleVoiceRecognition = () => {
    setIsVoiceRecognitionOn((prevIsOn) => !prevIsOn);
  };

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleSubmit = async () => {
    if (!textInput.trim()) return;

    handleFinalTranscription(textInput);
    setTextInput("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };
  
  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };
  
  const handleSelectSpeaker = (newSpeakerId) => {
    setSpeakerId(newSpeakerId);
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [conversationLogs]);


  return (
    <Router>
      <div className="app">
        <div className="left">
          <ul className="menu">
            <li className="menu-item" onClick={handleOpenSettingsModal}> <FaCog size={32} /> </li>
            <li className="menu-item" onClick={handleClick}> <FaTasks size={32} /> </li>
            {/* Add more menu items */}
          </ul>
        </div>

        <div className="avatar">
            <img src={gifs[currentGif]} height="800"></img>
        </div>

        <div className="right">
            <div className="chat-area" ref={chatAreaRef}>
              {conversationLogs
                .map((log, index) => (
                  <div key={index} className={`message ${log.role}`}>
                    {log.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant">
                    <TypingIndicator />
                  </div>
                )}
            </div>
            <div className="input-area">
                <input
                className="text-input"
                type="text"
                value={textInput}
                onChange={handleTextInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                />
                <button className="submit-button" onClick={handleSubmit}>
                    <FaPaperPlane size={20} color="white" />
                </button>
            </div>
        </div>

        <button className="voice-input" onClick={toggleVoiceRecognition}>
          {isVoiceRecognitionOn ? (
            <FaMicrophone size={26} color="black" />
          ) : (
            <FaMicrophoneSlash size={32} color="red" />
          )}
        </button>

        <Wave 
            mediaStream={mediaStream}
            isVoiceRecognitionOn={isVoiceRecognitionOn}
        />
        <ASR 
            onFinalTranscription={handleFinalTranscription}
            isVoiceRecognitionOn={isVoiceRecognitionOn}
            mediaStream={mediaStream}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={handleCloseSettingsModal}
          onSelectSpeaker={handleSelectSpeaker}
          speakerId={speakerId}
        />
      </div>
    </Router>
  );
}

export default App;
