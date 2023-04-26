import React from "react";
import "./App.css";


function SettingsModal({ isOpen, onClose, onSelectSpeaker, speakerId }) {
    const speakerNames = ["四国めたん", "ずんだもん", "春日部つむぎ", "雨晴はう", "波音リツ", "玄野武宏", "白上虎太郎", "青山龍星", "冥鳴ひまり", "九州そら"];

    if (!isOpen) {
        return null;
    }

    return (
        <div className="settings-modal">
            <div className="settings-modal-content">
                <h2>Select Speaker</h2>
                <div className="speaker-selection">
                    {speakerNames.map((name, index) => (
                        <button
                            key={index}
                            className={`speaker-button ${speakerId === index ? "selected" : ""}`}
                            onClick={() => onSelectSpeaker(index)}
                        >
                            {name}
                        </button>
                    ))}
                </div>
                <h3>声: VOICEVOX https://voicevox.hiroshiba.jp/ </h3>
                <button className="close-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default SettingsModal;
