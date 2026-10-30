'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { seedGreeting } from './engine';
import type { Answer, Block, Brief, ChatMessage } from './types';

const STORAGE_KEY = 'vibe-pm-session-v1';

interface StoredSession {
  messages: ChatMessage[];
  brief: Brief;
}

interface ChatResponse {
  blocks: Block[];
  brief: Brief;
  engine: string;
  brain?: string;
}

export type Phase = 'intake' | 'clarify' | 'done';

export function useSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [brief, setBrief] = useState<Brief>({});
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState('local');
  const [brain, setBrain] = useState('内置兜底规范');
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const messagesRef = useRef<ChatMessage[]>([]);
  const briefRef = useRef<Brief>({});
  const busyRef = useRef(false);

  messagesRef.current = messages;
  briefRef.current = brief;
  busyRef.current = busy;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as StoredSession) : null;
      if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        setMessages(parsed.messages);
        setBrief(parsed.brief ?? {});
      } else {
        setMessages([seedGreeting()]);
      }
    } catch {
      setMessages([seedGreeting()]);
    }
    setReady(true);

    fetch('/api/chat')
      .then((response) => response.json())
      .then((data: { engine?: string; brain?: string }) => {
        setEngine(data.engine || 'local');
        if (data.brain) setBrain(data.brain);
      })
      .catch(() => setEngine('local'));
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, brief }));
    } catch {
      // ignore quota errors in demo mode
    }
  }, [messages, brief, ready]);

  const send = useCallback(
    async (text: string, answers?: Answer[], intent?: 'chat' | 'generate') => {
      if (busyRef.current) return;
      const trimmed = text.trim();
      if (!trimmed && !(answers && answers.length > 0)) return;

      const userMessage: ChatMessage = {
        id: 'u-' + Date.now(),
        role: 'user',
        blocks: [{ kind: 'text', text: trimmed || '按以上选择继续' }],
        createdAt: Date.now(),
      };
      const nextMessages = [...messagesRef.current, userMessage];

      setMessages(nextMessages);
      setBusy(true);
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages,
            brief: briefRef.current,
            answers: answers ?? [],
            intent: intent ?? 'chat',
          }),
        });
        if (!response.ok) throw new Error('chat request failed');
        const data = (await response.json()) as ChatResponse;

        setMessages((prev) => [
          ...prev,
          {
            id: 'a-' + Date.now(),
            role: 'agent',
            blocks: data.blocks,
            createdAt: Date.now(),
          },
        ]);
        setBrief(data.brief ?? {});
        setEngine(data.engine ?? 'local');
        if (data.brain) setBrain(data.brain);
      } catch (requestError) {
        console.log('[chat] request failed:', (requestError as Error).message);
        setError('请求失败，请检查网络后重试。');
        setMessages((prev) => [
          ...prev,
          {
            id: 'e-' + Date.now(),
            role: 'agent',
            blocks: [{ kind: 'note', text: '服务暂时不可用，请重试一次。' }],
            createdAt: Date.now(),
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setMessages([seedGreeting()]);
    setBrief({});
    setError(null);
  }, []);

  const latestDoc = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const block = messages[index].blocks.find((item) => item.kind === 'doc');
      if (block && block.kind === 'doc') return block;
    }
    return null;
  }, [messages]);

  const phase: Phase = latestDoc ? 'done' : Object.keys(brief).length > 0 ? 'clarify' : 'intake';

  return {
    messages,
    brief,
    busy,
    engine,
    brain,
    error,
    ready,
    latestDoc,
    phase,
    send,
    reset,
  };
}
