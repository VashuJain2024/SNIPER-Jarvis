import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
require('dotenv').config();

const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function chatWithGPT(prompt) {
    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text(); // Ensure we extract text properly
    // console.log("AI Response:", responseText);
    return responseText;
}

function speak(text) {
    if (!text || typeof text !== "string") return; // Prevents speaking empty or invalid text

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1;
    utterance.volume = 1;
    utterance.pitch = 1;

    // Ensure speech starts only after user interaction
    if (synth.speaking) {
        synth.cancel(); // Stop ongoing speech before speaking new text
        setTimeout(() => {
            synth.speak(utterance);
        }, 500); // Small delay ensures proper functioning
    } else {
        synth.speak(utterance);
    }
}

window.addEventListener('click', () => {
    speak("        Initializing SNIPER...");
}, { once: true });

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();
});

async function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello')) {
        speak("Hello Vashu, How May I Help You?");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening YouTube...");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        speak("This is what I found on the internet regarding " + message);
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "").trim()}`, "_blank");
        speak("This is what I found on Wikipedia regarding " + message);
    } else if (message.includes('time')) {
        speak(`The current time is ${new Date().toLocaleTimeString()}`);
    } else if (message.includes('date')) {
        speak(`Today's date is ${new Date().toLocaleDateString()}`);
    } else if (message.includes('calculator')) {
        window.open('Calculator:///');
        speak("Opening Calculator");
    } else {
        const chatGPTResponse = await chatWithGPT(message);
        speak(chatGPTResponse);
    }
}
