import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { FeedbackItem, User } from '../types';
import { ICONS } from '../constants';
import Spinner from './Spinner';
import { createChatInstance } from '../utils/aiService';
import GlassCard from './ui/GlassCard';
import GlassInput from './ui/GlassInput';
import PrimaryButton from './ui/PrimaryButton';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface TutorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionItem: FeedbackItem | null;
  user: User;
}

const TutorChatModal: React.FC<TutorChatModalProps> = ({ isOpen, onClose, questionItem, user }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (isOpen && questionItem) {
      const systemInstruction = `You are a friendly GCSE Science tutor for a UK student. The student is asking about the following question they got wrong:\n\nQuestion: "${questionItem.questionText}"\nTheir Answer: "${questionItem.studentAnswer}"\nCorrect Answer guidance: "${questionItem.correctAnswer}"\n\nStart the conversation by asking them what they'd like to discuss about this question.`;
      
      chatInstanceRef.current = createChatInstance(user, systemInstruction);

      const introMessage = "Hi there! I see you had some trouble with this question. What part would you like to go over?";
      setMessages([{ role: 'model', text: introMessage }]);
      setInputValue('');
    }
  }, [isOpen, questionItem, user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatInstanceRef.current || isReplying) return;

    const userMessage: ChatMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsReplying(true);

    try {
      console.log(`🔒 Secure AI Proxy (Chat): User ${user.uid} sending message.`);
      await new Promise(res => setTimeout(res, 150));
      const result = await chatInstanceRef.current.sendMessage({ message: messageToSend });
      const modelMessage: ChatMessage = { role: 'model', text: result.text.replace(/\*/g, '') };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message to AI Tutor:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I had trouble connecting." }]);
    } finally {
      setIsReplying(false);
    }
  };

  if (!isOpen || !questionItem) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <GlassCard className="max-w-2xl w-full h-[90vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 pb-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-primary">AI Tutor</h2>
            <p className="text-sm text-secondary mt-1 truncate">Topic: {questionItem.topic}</p>
        </header>
        <main className="flex-grow my-4 overflow-y-auto pr-2 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-accent-blue text-white flex items-center justify-center flex-shrink-0">{ICONS.tutor}</div>}
                <div className={`max-w-prose p-3 rounded-xl ${msg.role === 'user' ? 'bg-accent-blue text-white' : 'bg-black/20 text-secondary'}`}>
                    <p className="text-base leading-relaxed">{msg.text}</p>
                </div>
            </div>
          ))}
          {isReplying && (
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue text-white flex items-center justify-center flex-shrink-0">{ICONS.tutor}</div>
                <div className="max-w-prose p-3 rounded-xl bg-black/20 text-secondary">
                   <Spinner />
                </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>
        <footer className="flex-shrink-0 pt-4 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <GlassInput type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isReplying} placeholder="Ask a follow-up question..." />
            <PrimaryButton type="submit" disabled={isReplying || !inputValue.trim()}>Send</PrimaryButton>
          </form>
        </footer>
      </GlassCard>
    </div>
  );
};

export default TutorChatModal;