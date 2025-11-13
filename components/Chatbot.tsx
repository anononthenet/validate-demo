import React, { useState, useEffect, useRef, FormEvent } from 'react';

// --- Types ---
interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- API Configuration ---
const API_URL = import.meta.env.VITE_LANGFLOW_API_URL || 'https://anything-langflow.rb9rje.easypanel.host/api/v1/run/1ee117e1-24fa-4da8-9807-7e65fbfb3c78';
const API_KEY = import.meta.env.VITE_LANGFLOW_API_KEY || 'YOUR_API_KEY_HERE';


// --- UI Components ---

const LoadingIndicator = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
    </div>
);

// FIX: Changed to React.FC to correctly handle the 'key' prop provided in lists.
const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isModel = message.role === 'model';
    const content = message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div
                className={`max-w-sm md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                    isModel ? 'bg-white text-slate-800 rounded-bl-none' : 'bg-orange-600 text-white rounded-br-none'
                }`}
            >
                {message.text === '...' ? (
                    <LoadingIndicator />
                ) : (
                    <pre
                        className="text-sm whitespace-pre-wrap font-sans"
                        dangerouslySetInnerHTML={{ __html: content }}
                    ></pre>
                )}
            </div>
        </div>
    );
};


// --- Main Chatbot Component ---

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(() => {
        // Try to get session ID from localStorage or generate a new one
        const savedSessionId = localStorage.getItem('chatSessionId');
        return savedSessionId || null;
    });
    const [messages, setMessages] = useState<Message[]>(() => {
        // Try to get messages from localStorage
        const savedMessages = localStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [input, setInput] = useState('');
    const [isReady, setIsReady] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize session only if we don't have one
        if (!sessionId) {
            const newSessionId = crypto.randomUUID();
            setSessionId(newSessionId);
            localStorage.setItem('chatSessionId', newSessionId);
        }
        
        // Set initial welcome message if no messages exist
        if (messages.length === 0) {
            const welcomeMessage = {
                role: 'model' as const, 
                text: '👋 Bienvenido al Asistente CAE de Validate.\n\nEstoy aquí para ayudarte a gestionar la Coordinación de Actividades Empresariales sin errores y en menos tiempo.\n\nPuedes preguntarme sobre:\n\t•\tAlta de trabajadores o contratas\n\t•\tDocumentación necesaria para acceder a un centro\n\t•\tQué hacer si una documentación es rechazada\n\nTambién puedo acompañarte paso a paso para:\n✅ Subir documentación\n✅ Asociar trabajadores a centros\n✅ Resolver incidencias CAE\n\nSolo dime qué necesitas y te guío.'
            };
            setMessages([welcomeMessage]);
            localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
        }
        
        setIsReady(true);
    }, [sessionId, messages.length]);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !sessionId || !isReady) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '...' }]);
        setInput('');

        try {
            const payload = {
                output_type: "chat",
                input_type: "chat",
                input_value: userMessage.text,
                session_id: sessionId
            };

            const headers: HeadersInit = {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                if (response.status === 403) {
                    errorMessage = 'Error de autenticación (403). Por favor, verifica que tu API key esté configurada correctamente en el archivo .env.local con la variable VITE_LANGFLOW_API_KEY';
                } else if (response.status === 401) {
                    errorMessage = 'Error de autenticación (401). La API key no es válida o ha expirado.';
                }
                // Try to get error details from response
                const contentType = response.headers.get('content-type');
                try {
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        if (errorData.message || errorData.error) {
                            errorMessage += `: ${errorData.message || errorData.error}`;
                        }
                    } else {
                        const errorText = await response.text();
                        if (errorText) {
                            errorMessage += `: ${errorText}`;
                        }
                    }
                } catch {
                    // Ignore if we can't read the response
                }
                throw new Error(errorMessage);
            }

            // Handle both JSON and plain text responses
            const contentType = response.headers.get('content-type');
            let responseText = '';
            
            if (contentType && contentType.includes('application/json')) {
                const responseData = await response.json();
                
                // Extract text from Langflow API response structure
                // Structure: outputs[0].outputs[0].results.message.data.text or outputs[0].messages[0].message
                if (typeof responseData === 'string') {
                    responseText = responseData;
                } else if (responseData.outputs && responseData.outputs.length > 0) {
                    const output = responseData.outputs[0];
                    
                    // First try: outputs[0].outputs[0] structure
                    if (output.outputs && output.outputs.length > 0) {
                        const innerOutput = output.outputs[0];
                        
                        // Path 1: results.message.data.text (most specific)
                        if (innerOutput.results?.message?.data?.text) {
                            responseText = innerOutput.results.message.data.text;
                        }
                        // Path 2: text (direct property)
                        else if (innerOutput.text && typeof innerOutput.text === 'string') {
                            responseText = innerOutput.text;
                        }
                        // Path 3: artifacts.message
                        else if (innerOutput.artifacts?.message && typeof innerOutput.artifacts.message === 'string') {
                            responseText = innerOutput.artifacts.message;
                        }
                    }
                    
                    // Second try: outputs[0].messages[0].message (if first try didn't work)
                    if (!responseText && output.messages && output.messages.length > 0) {
                        const message = output.messages[0];
                        if (message.message && typeof message.message === 'string') {
                            responseText = message.message;
                        }
                    }
                }
                // Fallback to other common patterns
                else if (responseData.output) {
                    responseText = typeof responseData.output === 'string' 
                        ? responseData.output 
                        : JSON.stringify(responseData.output);
                } else if (responseData.text) {
                    responseText = responseData.text;
                } else if (responseData.message) {
                    responseText = typeof responseData.message === 'string' 
                        ? responseData.message 
                        : responseData.message.message || JSON.stringify(responseData.message);
                }
                
                // If we still don't have text, show a formatted error
                if (!responseText) {
                    console.warn('Could not extract text from response:', responseData);
                    responseText = 'Lo siento, no pude procesar la respuesta del servidor.';
                }
            } else {
                // Plain text response
                responseText = await response.text();
            }

            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: responseText };
                return newMessages;
            });

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = error instanceof Error 
                ? `Lo siento, ha ocurrido un error: ${error.message}` 
                : "Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.";
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: errorMessage };
                return newMessages;
            });
        }
    };
    
    return (
        <>
            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-orange-600 text-white rounded-full p-4 shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    aria-label="Abrir chat de ayuda"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </button>
            </div>
            <div className={`fixed bottom-8 right-8 z-50 w-[calc(100%-4rem)] max-w-md h-[70vh] max-h-[600px] bg-slate-100 rounded-xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 bg-slate-800 text-white rounded-t-xl">
                    <h3 className="font-semibold text-lg">Asistente VALIDATE CAE</h3>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                const newSessionId = crypto.randomUUID();
                                setSessionId(newSessionId);
                                localStorage.setItem('chatSessionId', newSessionId);
                                const welcomeMessage = {
                                    role: 'model' as const, 
                                    text: '👋 Bienvenido al Asistente CAE de Validate.\n\nEstoy aquí para ayudarte a gestionar la Coordinación de Actividades Empresariales sin errores y en menos tiempo.\n\nPuedes preguntarme sobre:\n\t•\tAlta de trabajadores o contratas\n\t•\tDocumentación necesaria para acceder a un centro\n\t•\tQué hacer si una documentación es rechazada\n\nTambién puedo acompañarte paso a paso para:\n✅ Subir documentación\n✅ Asociar trabajadores a centros\n✅ Resolver incidencias CAE\n\nSolo dime qué necesitas y te guío.'
                                };
                                setMessages([welcomeMessage]);
                                localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
                            }} 
                            className="p-1 rounded-full hover:bg-slate-700 text-sm flex items-center" 
                            aria-label="Nueva conversación"
                            title="Nueva conversación"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-slate-700" aria-label="Cerrar chat">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </header>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 chatbot-messages">
                    {messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
                     <div ref={messagesEndRef} />
                </div>
                <footer className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu pregunta..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            disabled={!isReady}
                        />
                        <button
                            type="submit"
                            className="bg-orange-600 text-white rounded-full p-3 hover:bg-orange-700 disabled:bg-orange-300"
                            disabled={!input.trim() || !isReady}
                            aria-label="Enviar mensaje"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                    </form>
                </footer>
            </div>
        </>
    );
}