import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Phone, 
  Navigation, 
  MapPin, 
  Clock, 
  CheckCheck, 
  ArrowLeft,
  Paperclip,
  Smile
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { messageService } from '../services/messageService';
import { Message } from '../types';

export const ChatPage: React.FC = () => {
  const { currentUser, professionals, requests } = useApp();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRequest = requests[0];
  const pro = professionals[0];
  const [messages, setMessages] = useState<Message[]>(messageService.getMessages());
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = messageService.sendMessage(
      'conv-service-1',
      currentUser.id,
      inputText
    );
    setMessages([...messageService.getMessages()]);
    setInputText('');

    // Simulate natural professional reply after 1.5 seconds if sent by client
    if (currentUser.role === 'CLIENTE') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyPool = [
          'Perfeito, já estou com todas as ferramentas e manômetro no carro.',
          'Pode deixar, chego aí em menos de 10 minutos! Qualquer coisa pode me ligar.',
          'Entendido! Vou levar também o capacitor novo para testar.',
          'Cheguei na portaria, estou subindo!',
        ];
        const randomReply = replyPool[Math.floor(Math.random() * replyPool.length)];
        messageService.sendMessage('conv-service-1', pro.id, randomReply);
        setMessages([...messageService.getMessages()]);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-2 sm:p-4">
        {/* Chat Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <img
                src={pro?.profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={pro?.profile?.full_name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-orange-500"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
            </div>

            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{pro?.profile?.full_name || 'João Silva'}</span>
                <span className="text-amber-400 text-xs">★ {pro?.rating.toFixed(1)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeRequest?.title || 'Manutenção de Ar-Condicionado'} • Juçara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cliente')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Mapa</span>
            </button>

            <a
              href="tel:99991234567"
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md shadow-emerald-600/20"
              title="Ligar para o técnico"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto my-3 p-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl space-y-3 min-h-[400px]">
          {/* Security Notice */}
          <div className="text-center py-2">
            <span className="text-[10px] bg-slate-800/80 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60 inline-flex items-center gap-1">
              🛡️ Conversa protegida pelo sistema Quem Resolve. Não compartilhe senhas.
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p>{msg.message}</p>
                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                      isMe ? 'text-slate-900/80' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-slate-900" />}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-2xl w-fit">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] ml-1">{pro?.profile?.full_name?.split(' ')[0]} está digitando...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 shadow-lg"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite uma mensagem para o profissional..."
            className="flex-1 bg-transparent text-white text-xs sm:text-sm px-3 py-2 focus:outline-none placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-950 font-bold transition shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
