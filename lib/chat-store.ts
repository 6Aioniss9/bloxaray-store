export type Message = {
  id: string
  role: 'user' | 'bot' | 'agent'
  type: 'text' | 'image' | 'audio'
  content: string
  audioUrl?: string
  fileName?: string
  timestamp: number
}

export type Ticket = {
  id: string
  status: 'open' | 'closed' | 'resolved'
  userMessage: string
  botResponse: string
  createdAt: number
  resolvedAt?: number
}

export type Conversation = {
  id: string
  messages: Message[]
  ticket?: Ticket
  createdAt: number
  updatedAt: number
  unread: boolean
}

const CONV_ID_KEY = 'bloxaray-conv-id'

function getConvId(): string {
  let id = localStorage.getItem(CONV_ID_KEY)
  if (!id) {
    id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(CONV_ID_KEY, id)
  }
  return id
}

export async function getOrCreateConversation(): Promise<Conversation> {
  const id = getConvId()

  try {
    const res = await fetch(`/api/conversations/${id}`)
    if (res.ok) {
      const data = await res.json()
      return mapFromDb(data)
    }
  } catch {}

  try {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      const data = await res.json()
      return mapFromDb(data)
    }
  } catch {}

  return {
    id,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    unread: false,
  }
}

export async function addMessage(
  msg: Omit<Message, 'id' | 'timestamp'>,
): Promise<Message> {
  const id = getConvId()

  const msgBody: Record<string, string | undefined> = {
    role: msg.role,
    type: msg.type,
    content: msg.content,
    audioUrl: msg.audioUrl,
    fileName: msg.fileName,
  }

  try {
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgBody),
    })
    if (res.ok) return await res.json()
  } catch {}

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...msg,
    timestamp: Date.now(),
  }
}

export async function createTicket(
  userMessage: string,
  botResponse: string,
): Promise<Ticket | null> {
  const id = getConvId()

  try {
    const res = await fetch(`/api/conversations/${id}/ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, botResponse }),
    })
    if (res.ok) return await res.json()
  } catch {}

  return null
}

export async function resolveTicketWithApi(convId: string): Promise<void> {
  try {
    await fetch(`/api/conversations/${convId}/ticket`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    })
  } catch {}
}

export async function closeTicketWithApi(convId: string): Promise<void> {
  try {
    await fetch(`/api/conversations/${convId}/ticket`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    })
  } catch {}
}

export async function markRead(convId: string): Promise<void> {
  try {
    await fetch(`/api/conversations/${convId}/read`, { method: 'POST' })
  } catch {}
}

export function clearConversation() {
  localStorage.removeItem(CONV_ID_KEY)
}

export async function getAllConversations(): Promise<Conversation[]> {
  try {
    const res = await fetch('/api/conversations')
    if (res.ok) {
      const data = await res.json()
      return data.map(mapFromDb)
    }
  } catch {}
  return []
}

function mapFromDb(data: {
  id: string
  messages?: Array<{
    id: string
    role: string
    type: string
    content: string
    audioUrl?: string
    fileName?: string
    timestamp: string
  }>
  ticket?: {
    id: string
    status: string
    userMessage: string
    botResponse: string
    createdAt: string
    resolvedAt?: string
  } | null
  createdAt: string
  updatedAt: string
  unread: boolean
}): Conversation {
  return {
    id: data.id,
    messages: (data.messages ?? []).map((m) => ({
      id: m.id,
      role: m.role as Message['role'],
      type: m.type as Message['type'],
      content: m.content,
      audioUrl: m.audioUrl,
      fileName: m.fileName,
      timestamp: new Date(m.timestamp).getTime(),
    })),
    ticket: data.ticket
      ? {
          id: data.ticket.id,
          status: data.ticket.status as Ticket['status'],
          userMessage: data.ticket.userMessage,
          botResponse: data.ticket.botResponse,
          createdAt: new Date(data.ticket.createdAt).getTime(),
          resolvedAt: data.ticket.resolvedAt
            ? new Date(data.ticket.resolvedAt).getTime()
            : undefined,
        }
      : undefined,
    createdAt: new Date(data.createdAt).getTime(),
    updatedAt: new Date(data.updatedAt).getTime(),
    unread: data.unread,
  }
}
