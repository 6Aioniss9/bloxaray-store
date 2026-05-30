'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, X, Send, Paperclip, Smile, Mic, Square,
} from 'lucide-react'
import { DISCORD_URL } from '@/lib/fruits'
import { getBotResponse } from '@/lib/support-bot'
import {
  getOrCreateConversation,
  addMessage,
  createTicket,
  markRead,
  clearConversation,
  type Message,
  type Conversation,
} from '@/lib/chat-store'

const EMOJIS = ['😀', '😎', '🔥', '✅', '💸', '🍇', '🐉', '⭐', '⚡', '❤️', '👋', '🎮', '🛒', '📦', '💬', '🚀']
const ALLOWED_FILES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain', 'application/zip']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export function SupportChat() {
  const [conv, setConv] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [fileError, setFileError] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioUnsupported, setAudioUnsupported] = useState(false)
  const [ticketCreated, setTicketCreated] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    getOrCreateConversation().then((c) => {
      setConv(c)
      setLoading(false)
    })
  }, [])

  const unreadCount = conv?.unread && !isOpen ? 1 : 0

  useEffect(() => {
    scrollToBottom()
  }, [conv?.messages, isTyping])

  useEffect(() => {
    if (isOpen && conv?.id) {
      markRead(conv.id)
      setConv((prev) => prev ? { ...prev, unread: false } : prev)
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [isOpen, conv?.id])

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.mediaDevices) {
      setAudioUnsupported(true)
    }
  }, [])

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
      }
    })
  }

  const addBotMessage = useCallback(async (text: string) => {
    const msg = await addMessage({ role: 'bot', type: 'text', content: text })
    setConv((prev) => prev ? { ...prev, messages: [...prev.messages, msg], updatedAt: Date.now() } : prev)
  }, [])

  const simulateTyping = useCallback(
    (text: string) => {
      setIsTyping(true)
      const delay = 600 + Math.random() * 300
      setTimeout(() => {
        setIsTyping(false)
        addBotMessage(text)
      }, delay)
    },
    [addBotMessage],
  )

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setShowEmojis(false)
    setTicketCreated(false)

    const userMsg = await addMessage({ role: 'user', type: 'text', content: text })
    setConv((prev) => prev ? { ...prev, messages: [...prev.messages, userMsg], updatedAt: Date.now() } : prev)

    const result = getBotResponse(text)
    if (result.requiresHuman) {
      setIsTyping(true)
      const delay = 600 + Math.random() * 300
      setTimeout(async () => {
        setIsTyping(false)
        await createTicket(text, result.response)
        setTicketCreated(true)
        const botMsg = await addMessage({ role: 'bot', type: 'text', content: result.response })
        setConv((prev) => prev ? { ...prev, messages: [...prev.messages, botMsg], updatedAt: Date.now() } : prev)
      }, delay)
    } else {
      simulateTyping(result.response)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_FILES.includes(file.type)) {
      setFileError('Formato no soportado. Usa PNG, JPG, WEBP, PDF, TXT o ZIP.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('El archivo supera los 5MB.')
      return
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string
        const msg = await addMessage({ role: 'user', type: 'image', content: dataUrl, fileName: file.name })
        setConv((prev) => prev ? { ...prev, messages: [...prev.messages, msg], updatedAt: Date.now() } : prev)
        simulateTyping('Gracias por compartir la imagen. Si quieres comprar esa fruta, dime su nombre.')
      }
      reader.readAsDataURL(file)
    } else {
      const msg = await addMessage({ role: 'user', type: 'text', content: `📎 ${file.name}` })
      setConv((prev) => prev ? { ...prev, messages: [...prev.messages, msg], updatedAt: Date.now() } : prev)
      simulateTyping('He recibido tu archivo. ¿En qué más puedo ayudarte?')
    }
    e.target.value = ''
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const msg = await addMessage({ role: 'user', type: 'audio', content: '🎤 Mensaje de voz', audioUrl: url })
        setConv((prev) => prev ? { ...prev, messages: [...prev.messages, msg], updatedAt: Date.now() } : prev)
        stream.getTracks().forEach((t) => t.stop())
        simulateTyping('He recibido tu mensaje de voz. Cuéntame, ¿en qué puedo ayudarte?')
      }
      recorder.start()
      setRecording(true)
    } catch {
      setAudioUnsupported(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleNewChat = () => {
    clearConversation()
    setConv(null)
    setTicketCreated(false)
    setLoading(true)
    getOrCreateConversation().then((c) => {
      setConv(c)
      setLoading(false)
    })
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.zip"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Floating button */}
      <motion.button
        onClick={() => (isOpen ? setIsOpen(false) : setIsOpen(true))}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full border border-red-500/30 bg-[#ef233c] text-white shadow-[0_0_24px_-6px_rgba(239,35,60,0.5)] transition-shadow duration-300 hover:shadow-[0_0_32px_-4px_rgba(239,35,60,0.7)]"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        animate={{
          boxShadow: [
            '0 0 24px -6px rgba(239,35,60,0.5)',
            '0 0 32px -4px rgba(239,35,60,0.7)',
            '0 0 24px -6px rgba(239,35,60,0.5)',
          ],
        }}
        transition={{ boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
        aria-label="Abrir chat de soporte"
      >
        {isOpen ? (
          <X className="size-5" />
        ) : (
          <>
            <MessageCircle className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,35,60,0.6)]">
                1
              </span>
            )}
          </>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 flex w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0d12] shadow-[0_0_48px_-12px_rgba(0,0,0,0.8)] sm:w-[380px]"
            style={{ maxHeight: 'min(580px, calc(100vh - 140px))' }}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header — Crisp style */}
            <div className="shrink-0 bg-[#0d0d12] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex size-8 items-center justify-center rounded-lg bg-red-500/15">
                    <MessageCircle className="size-4 text-red-400" />
                    <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]">
                      <span className="absolute inset-0 size-full animate-ping rounded-full bg-green-500/60" />
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                      BLOXARAY
                    </p>
                    <p className="text-[10px] text-zinc-500">Normalmente respondemos en minutos</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="flex size-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
                    aria-label="Nueva conversación"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex size-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
                    aria-label="Cerrar chat"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto bg-[#0d0d12] scroll-smooth"
              ref={messagesEndRef}
            >
              <div className="flex flex-col px-4 py-3">
                {loading && (
                  <div className="py-6 text-center">
                    <p className="text-sm text-zinc-500">Cargando...</p>
                  </div>
                )}

                {!loading && conv && conv.messages.length === 0 && (
                  <div className="py-6 text-center">
                    <p className="text-sm text-zinc-500">Inicia una conversación con BLOXARAY</p>
                  </div>
                )}

                {conv?.messages.map((msg, i) => {
                  const prev = conv.messages[i - 1]
                  const isFirstBot = msg.role === 'bot' && (i === 0 || prev?.role !== 'bot')

                  return (
                    <motion.div
                      key={msg.id}
                      className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {msg.role !== 'user' && isFirstBot && (
                          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                            <MessageCircle className="size-3 text-red-400" />
                          </div>
                        )}
                        {msg.role !== 'user' && !isFirstBot && <div className="w-6 shrink-0" />}

                        <div>
                          {msg.type === 'text' ? (
                            <div
                              className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                                msg.role === 'user'
                                  ? 'rounded-br-sm bg-[#ef233c] text-white'
                                  : 'rounded-bl-sm border border-white/[0.06] bg-white/[0.04] text-zinc-200'
                              }`}
                            >
                              {msg.content}
                            </div>
                          ) : msg.type === 'image' ? (
                            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                              <img
                                src={msg.content}
                                alt={msg.fileName || 'Imagen'}
                                className="max-h-40 w-full object-cover"
                              />
                              {msg.fileName && (
                                <p className="border-t border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] text-zinc-500">
                                  {msg.fileName}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-2xl rounded-br-sm bg-[#ef233c] px-3.5 py-2">
                              <p className="mb-1 text-[12px] text-white/70">{msg.content}</p>
                              {msg.audioUrl && (
                                <audio controls className="h-7 w-36">
                                  <source src={msg.audioUrl} type="audio/webm" />
                                </audio>
                              )}
                            </div>
                          )}

                          <p className={`mt-0.5 text-[9px] text-zinc-600 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Ticket created notice */}
                {ticketCreated && (
                  <motion.div
                    className="my-2 rounded-lg border border-red-500/15 bg-red-500/5 px-3.5 py-2.5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-[12px] font-medium text-red-400" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                      Ticket creado
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      Tu consulta fue enviada a soporte. Te responderemos por Discord.
                    </p>
                    <a
                      href={DISCORD_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 px-3 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <MessageCircle className="size-3" />
                      Ir a Discord
                    </a>
                  </motion.div>
                )}

                {/* File error */}
                {fileError && (
                  <motion.p
                    className="mb-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-[11px] text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {fileError}
                  </motion.p>
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    className="mb-2 flex items-start gap-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-full bg-red-500/20">
                      <MessageCircle className="size-3 text-red-400" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500">escribiendo</span>
                        <span className="flex gap-0.5">
                          <span className="size-1 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '0ms' }} />
                          <span className="size-1 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '150ms' }} />
                          <span className="size-1 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '300ms' }} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="h-2" />
              </div>
            </div>

            {/* Input bar — Crisp style */}
            <div className="shrink-0 border-t border-white/[0.06] bg-[#0d0d12] px-3 py-2.5">
              <AnimatePresence>
                {showEmojis && (
                  <motion.div
                    className="mb-2 flex flex-wrap gap-1 rounded-lg border border-white/[0.06] bg-[#121218] p-2"
                    initial={{ opacity: 0, y: 6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 6, height: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="flex size-7 items-center justify-center rounded-md text-base transition-colors hover:bg-white/10"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                className="flex items-center gap-1"
              >
                <button
                  type="button"
                  onClick={() => setShowEmojis((v) => !v)}
                  className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
                  aria-label="Emojis"
                >
                  <Smile className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
                  aria-label="Adjuntar archivo"
                >
                  <Paperclip className="size-3.5" />
                </button>
                {!audioUnsupported && (
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    className={`flex size-8 items-center justify-center rounded-lg transition-all ${
                      recording
                        ? 'bg-red-500/20 text-red-400 shadow-[0_0_10px_-4px_rgba(239,35,60,0.3)]'
                        : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                    }`}
                    aria-label={recording ? 'Detener' : 'Grabar audio'}
                  >
                    {recording ? <Square className="size-3" /> : <Mic className="size-3.5" />}
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  className="h-8 flex-1 rounded-lg border border-white/[0.06] bg-black/40 px-3 text-[13px] text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-red-500/30 focus:shadow-[0_0_12px_-6px_rgba(239,35,60,0.2)]"
                />
                <motion.button
                  type="submit"
                  className="flex size-8 items-center justify-center rounded-lg bg-[#ef233c] text-white disabled:opacity-40"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.93 }}
                  disabled={!input.trim()}
                  aria-label="Enviar"
                >
                  <Send className="size-3.5" />
                </motion.button>
              </form>

              <p className="mt-1.5 text-[9px] text-zinc-600 text-center">
                Usa el botón de Discord para soporte humano
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
