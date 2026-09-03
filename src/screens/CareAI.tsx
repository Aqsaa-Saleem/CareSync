import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/useTranslation';
import { Send, Bot, User, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';

const suggestedQuestions = [
  'What activities can I do today?',
  "My child isn't responding to sounds.",
  'How can I encourage communication?',
  'What should I practice with my child?',
  'Find speech therapists near me.',
];

function generateAIResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase();

  if (msg.includes('activit') || msg.includes('what can i do') || msg.includes('today')) {
    return `Here's a simple activity to try today:\n\n**Picture Naming** (5 minutes)\n\n1. Choose 3 familiar objects (cup, ball, spoon).\n2. Show one object to your child.\n3. Say its name clearly.\n4. Give your child time to respond.\n5. Praise any attempt to communicate.\n\nThis builds vocabulary and word-object association.\n\nWould you like more activities, or shall I find a specialist near you?`;
  }

  if (msg.includes('sound') || msg.includes('hear') || msg.includes('respond')) {
    return `It's understandable to feel concerned. Here are some things you can try:\n\n1. **Sound Hunt**: Use a bell or rattle from different directions and see if your child turns toward the sound.\n2. **Musical Direction Game**: Play music from different spots and encourage your child to move toward it.\n3. Observe if your child responds to loud or sudden sounds.\n\nIf you haven't already, consider scheduling a hearing assessment with an audiologist. Early detection can make a big difference.\n\nWould you like me to help find an audiologist near you?`;
  }

  if (msg.includes('communicat') || msg.includes('speak') || msg.includes('talk') || msg.includes('word')) {
    return `Here are some ways to encourage communication:\n\n1. **Bubble Blowing**: Blow bubbles and wait for your child to say "more" or "pop."\n2. **Choice Game**: Hold up two items and wait for them to indicate which one they want.\n3. **Animal Sounds**: Show animal pictures and make sounds together.\n\nKey tips:\n• Follow your child's lead and interests\n• Give plenty of time to respond\n• Praise any attempt to communicate\n• Keep it fun and low-pressure\n\nWould you like a step-by-step guide for any of these?`;
  }

  if (msg.includes('therapist') || msg.includes('doctor') || msg.includes('specialist') || msg.includes('find')) {
    return `I can help you find the right professional. You can browse our directory of verified specialists by going to the **Find a Specialist** section.\n\nYou can filter by:\n• Specialization (Speech Therapist, Child Psychologist, etc.)\n• City and Province\n• Support area\n\nWould you like me to take you there, or would you prefer to search for a therapy centre instead?`;
  }

  if (msg.includes('progress') || msg.includes('improv') || msg.includes('milestone')) {
    return `Every child develops at their own pace. Here are some positive signs to look for:\n\n• **Increased eye contact** during activities\n• **Attempting new sounds** or words\n• **Showing interest** in activities they didn't before\n• **Responding** to their name more consistently\n\nYou can track your child's progress in the **Progress** section of the app. Small, consistent steps often lead to meaningful improvements.\n\nRemember: CareSync provides educational guidance — for developmental concerns, always consult with a qualified professional.`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! I'm Care AI, your everyday support companion.\n\nI can help you with:\n• Activity recommendations\n• Tips for supporting your child's development\n• Finding specialists and centres\n• Answering questions about developmental support\n\nWhat would you like to know today?`;
  }

  if (msg.includes('thank')) {
    return `You're welcome! Remember, every small step counts. If you have more questions anytime, I'm here to help.\n\nKeep up the wonderful work you're doing for your child!`;
  }

  return `That's a great question. Here's what I'd suggest:\n\n1. Start with short, 5-minute activities that match your child's interests.\n2. Be consistent — even a little practice every day helps.\n3. Celebrate every attempt your child makes.\n4. Don't hesitate to reach out to a professional for personalized guidance.\n\nYou can browse our **Activities** section for specific exercises, or check the **Centres** section to find support near you.\n\nIs there something specific you'd like help with?`;
}

export function CareAIScreen() {
  const { state, dispatch, navigate, goBack } = useApp();
  const { t, isRTL } = useTranslation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [state.chatMessages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      text: text.trim(),
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_CHAT_MESSAGE', message: userMsg });
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(text);
      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'ai' as const,
        text: response,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: aiMsg });
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const hasMessages = state.chatMessages.length > 0;

  return (
    <div className="screen" style={{ background: 'var(--color-background)', display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', maxWidth: 'none', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, margin: 0, padding: 0 }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        background: 'linear-gradient(135deg, #4B3FDB 0%, #6D5DFB 100%)',
        color: '#fff',
        position: 'relative',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <button
            onClick={goBack}
            aria-label="Back"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} color="#fff" style={{ transform: isRTL ? 'scaleX(-1)' : undefined }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flex: 1, minWidth: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 44,
              height: 44,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src="/careai-robot.png"
                alt="Care AI"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div style={{ textAlign: isRTL ? 'right' : 'left', flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2, color: '#fff', margin: 0, padding: 0 }}>{t('careAI')}</h1>
              <p style={{ fontSize: 11, lineHeight: 1.4, color: 'rgba(255,255,255,0.85)', margin: '2px 0 0 0', padding: 0 }}>{t('careAISubtitle')}</p>
            </div>
          </div>
          <div style={{ width: 36, flexShrink: 0 }} />
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: 'var(--color-warning-bg)',
        padding: '10px 20px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
        <AlertCircle size={14} color="var(--color-warm-accent)" />
        <p style={{ fontSize: 11, color: 'var(--color-warning-text)', textAlign: isRTL ? 'right' : 'left' }}>
          {t('careAIDisclaimer')}
        </p>
      </div>

      {/* Chat Area */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {!hasMessages && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Welcome */}
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{
                background: 'var(--color-card)',
                borderRadius: '18px 18px 18px 4px',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-card)',
                maxWidth: '85%',
              }}>
                <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6, textAlign: isRTL ? 'right' : 'left' }}>
                  {t('welcome')}
                </p>
              </div>
            </div>

            {/* Suggested Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: isRTL ? 0 : 48, paddingRight: isRTL ? 48 : 0 }}>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 700, textAlign: isRTL ? 'right' : 'left' }}>{t('suggestedQuestions')}</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-button)',
                    background: 'var(--color-card)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: 13,
                    color: 'var(--color-primary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: isRTL ? 'right' : 'left',
                    transition: 'all 0.2s',
                    minHeight: 44,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}
                >
                  <span style={{ flex: 1 }}>{q}</span>
                  <ChevronRight size={14} color="var(--color-text-secondary)" style={{ transform: isRTL ? 'scaleX(-1)' : undefined }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {state.chatMessages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? (isRTL ? 'row' : 'row-reverse') : (isRTL ? 'row-reverse' : 'row'),
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              background: msg.role === 'ai' ? 'var(--color-primary)' : 'var(--color-soft-lavender)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {msg.role === 'ai' ? <Bot size={18} color="#fff" /> : <User size={18} color="var(--color-primary)" />}
            </div>
            <div style={{
              background: msg.role === 'ai' ? 'var(--color-card)' : 'var(--color-primary)',
              color: msg.role === 'ai' ? 'var(--color-text)' : '#fff',
              borderRadius: msg.role === 'ai' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
              padding: '14px 16px',
              boxShadow: msg.role === 'ai' ? 'var(--shadow-card)' : 'none',
              maxWidth: '80%',
            }}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  marginBottom: line.trim() === '' ? 8 : 2,
                  fontWeight: line.startsWith('**') ? 700 : 400,
                  textAlign: isRTL ? 'right' : 'left',
                }}>
                  {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={20} color="#fff" />
            </div>
            <div style={{
              background: 'var(--color-card)',
              borderRadius: '18px 18px 18px 4px',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              gap: 6,
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-secondary)',
                  animation: 'typing 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* AI response action buttons */}
        {state.chatMessages.length > 0 && state.chatMessages[state.chatMessages.length - 1].role === 'ai' && !isTyping && (
          <div style={{ display: 'flex', gap: 8, paddingLeft: isRTL ? 0 : 42, paddingRight: isRTL ? 42 : 0, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <button
              onClick={() => navigate('activities')}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-button)',
                background: 'var(--color-soft-lavender)',
                color: 'var(--color-primary)',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                minHeight: 44,
              }}
            >
              {t('moreActivities')}
            </button>
            <button
              onClick={() => navigate('professionals')}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-button)',
                background: 'var(--color-warning-bg)',
                color: 'var(--color-warning-text)',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                minHeight: 44,
              }}
            >
              {t('findASpecialist')}
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '12px 20px calc(12px + var(--safe-bottom))',
        background: 'var(--color-card)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder={t('askCareAI')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 25,
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-input-bg)',
            fontSize: 14,
            outline: 'none',
            color: 'var(--color-text)',
            textAlign: isRTL ? 'right' : 'left',
          }}
          aria-label="Type your message"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: input.trim() && !isTyping ? 'var(--color-primary)' : 'var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: input.trim() && !isTyping ? 'pointer' : 'default',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          aria-label="Send message"
        >
          <Send size={18} color="#fff" style={{ transform: isRTL ? 'scaleX(-1)' : undefined }} />
        </button>
      </div>
    </div>
  );
}
