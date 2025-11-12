import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { User, SessionResult } from '../types';
import { createChatInstance } from '../utils/aiService';
import SecondaryButton from './ui/SecondaryButton';
import PrimaryButton from './ui/PrimaryButton';
import ProgressRing from './ui/ProgressRing';
import Spinner from './Spinner';
import { useFlow } from './FlowController';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface AiCoachPageProps {
  user: User;
}

const AiCoachPage: React.FC<AiCoachPageProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [confidence, setConfidence] = useState(30);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const chatInstanceRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { endSession } = useFlow();

  useEffect(() => {
    const systemInstruction = `You are an expert AI Coach for a GCSE English student in the UK. Your goal is to help them understand concepts like essay structure and literary devices.
    1.  Keep your responses concise, friendly, and encouraging.
    2.  After every response, you MUST estimate the student's confidence in the topic on a scale of 0-100 based on their last message.
    3.  Your entire output must be a single, valid JSON object with two keys: "response" (your text) and "confidence" (the number).
    
    Example valid response:
    {
      "response": "That's a great question! An essay's structure is like a skeleton...",
      "confidence": 45
    }`;
    
    chatInstanceRef.current = createChatInstance(user, systemInstruction);

    const introMessage = "Hi there! I'm your AI Coach for English. What topic, like essay structure or analysing poetry, shall we work on today?";
    setMessages([{ role: 'model', text: introMessage }]);
  }, [user]);
  
  const handleEndSession = () => {
    // A coach session is considered a positive interaction that boosts confidence
    const result: SessionResult = { correct: 1, total: 1, confidenceDelta: 3 };
    endSession('coach', 'English', result);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatInstanceRef.current || isReplying) return;

    const userMessage: ChatMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsReplying(true);

    try {
      const result = await chatInstanceRef.current.sendMessage({ message: messageToSend });
      
      let parsedResponse;
      try {
        // Find the start and end of the JSON object
        const jsonStart = result.text.indexOf('{');
        const jsonEnd = result.text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonString = result.text.substring(jsonStart, jsonEnd + 1);
            parsedResponse = JSON.parse(jsonString);
        } else {
            throw new Error("No JSON object found");
        }
      } catch (e) {
        console.warn("AI response was not valid JSON, using fallback.", result.text);
        parsedResponse = { response: result.text, confidence: confidence }; // Keep confidence the same
      }

      const modelMessage: ChatMessage = { role: 'model', text: parsedResponse.response };
      setMessages(prev => [...prev, modelMessage]);
      
      if (typeof parsedResponse.confidence === 'number') {
        setConfidence(parsedResponse.confidence);
      }

    } catch (error) {
      console.error("Error sending message to AI Coach:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered a problem. Could you try rephrasing your question?" }]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -my-12">
        <header className="flex-shrink-0 p-4 border-b border-white/10 flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary">AI Coach Session</h1>
            <SecondaryButton onClick={handleEndSession}>End Session</SecondaryButton>
        </header>

        <main ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 chat-container">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                        <p className="text-base leading-relaxed text-white">{msg.text}</p>
                    </div>
                </div>
            ))}
            {isReplying && (
                <div className="flex items-start gap-3 w-full justify-start">
                    <div className="chat-bubble chat-bubble-ai">
                        <Spinner />
                    </div>
                </div>
            )}
        </main>

        <footer className="relative flex-shrink-0 p-4">
             <div className={`confidence-ring-wrapper ${isInputFocused ? 'opacity-0 -translate-y-2' : 'opacity-100'}`}>
                <ProgressRing percentage={confidence} label={`${confidence}`} size={80} strokeWidth={8} color="var(--accent-green)"/>
                <p className="text-center text-xs text-secondary mt-1">Confidence</p>
             </div>
             <form onSubmit={handleSendMessage} className="chat-input-form flex items-center gap-3 bg-[var(--surface-color)] border border-[var(--surface-border-color)] p-2 shadow-lg">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    disabled={isReplying}
                    placeholder="Ask your coach anything..."
                    className="flex-grow bg-transparent text-primary placeholder:text-tertiary focus:outline-none px-4"
                />
                <PrimaryButton type="submit" disabled={isReplying || !inputValue.trim()} className="!py-3 !px-5">
                    Send
                </PrimaryButton>
             </form>
        </footer>
    </div>
  );
};

export default AiCoachPage;