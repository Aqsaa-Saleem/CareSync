import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { AppState } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import {
  Send,
  Bot,
  User,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const suggestedQuestions = [
  'What activities can I do today?',
  "My child isn't responding to sounds.",
  'How can I encourage communication?',
  'What should I practice with my child?',
  'Find speech therapists near me.',
];

function generateAIResponse(userMsg: string, state: AppState): string {
  const msg = userMsg.toLowerCase().trim();
  const child = state.childProfile;

  // ChildProfile uses supportNeed in this project.
  const focus = child?.supportNeed?.toLowerCase() || '';

  if (/^(hi|hello|hey|salam|assalamualaikum)\b/.test(msg)) {
    return `Hello! I'm Care AI, your CareSync support companion. 🌷

I can help you with activities, communication, progress, daily routines, and finding the right support.

${
  child
    ? `I'm currently helping with ${child.name}'s profile${
        focus ? `, focusing on ${child.supportNeed}` : ''
      }.`
    : 'Once you create a child profile, I can personalize my suggestions for your child.'
}

What would you like help with today?`;
  }

  if (msg.includes('thank')) {
    return `You're welcome! 💜

Every small step matters. If you'd like, you can also tell me what you're noticing about your child and I'll help you think through some practical next steps.`;
  }

  if (
    msg.includes('activity') ||
    msg.includes('activities') ||
    msg.includes('practice') ||
    msg.includes('exercise')
  ) {
    const completed = state.completedActivities.length;

    if (focus.includes('speech') || focus.includes('communication')) {
      return `Since the current focus is ${
        child?.supportNeed || 'communication'
      }, try a short communication activity today:

**Choice Game** (5–10 minutes)

1. Offer your child two familiar objects.
2. Hold them where your child can see both.
3. Name each object slowly.
4. Wait several seconds for a response.
5. Accept pointing, looking, reaching, sounds, or words as communication.
6. Praise the attempt without pressuring your child.

Keep the activity short and playful.

You've completed ${completed} activities so far. Try something new today if your child is ready.`;
    }

    if (
      focus.includes('hearing') ||
      focus.includes('visual') ||
      focus.includes('motor') ||
      focus.includes('physical') ||
      focus.includes('autism')
    ) {
      return `For ${
        child?.supportNeed || "your child's current focus area"
      }, choose an activity that is simple, predictable, and comfortable for your child.

Try this:

**Follow-the-Lead Game** (5 minutes)

1. Choose something your child already enjoys.
2. Join their play instead of immediately directing it.
3. Copy what they do.
4. Pause and give them a chance to respond.
5. Celebrate any attempt to interact.

Watch your child's reactions and stop if they seem overwhelmed.

If you tell me what your child enjoys most, I can suggest a more specific activity.`;
    }

    return `Here is a simple activity you can try today:

**Object Hunt** (5–10 minutes)

1. Choose 3 familiar objects.
2. Place them where your child can see them.
3. Ask your child to find one.
4. Give them plenty of time to respond.
5. Celebrate any successful attempt.
6. Repeat with another object.

${
  child
    ? `For ${child.name}, keep it playful and adjust the difficulty to their ability.`
    : 'Adjust the activity to your child’s age and ability.'
}

If you tell me your child's current focus, I can give you a more targeted activity.`;
  }

  if (
    msg.includes('speak') ||
    msg.includes('talk') ||
    msg.includes('word') ||
    msg.includes('language') ||
    msg.includes('communication') ||
    msg.includes('communicat')
  ) {
    return `To encourage communication, focus on creating opportunities rather than demanding words.

Try this:

**Pause & Respond**

• Get down to your child's level.
• Follow something they're interested in.
• Use short, simple words.
• Pause after speaking so they have time to respond.
• Treat gestures, eye contact, sounds, pointing, and words as meaningful attempts.
• Praise communication without forcing repetition.

${
  child?.supportNeed
    ? `This can be especially useful alongside your child's ${child.supportNeed} support activities.`
    : ''
}

If you're concerned about your child's speech or communication development, a qualified speech-language professional can provide an individual assessment.`;
  }

  if (
    msg.includes('sound') ||
    msg.includes('hear') ||
    msg.includes('hearing') ||
    msg.includes('noise') ||
    msg.includes('respond to my name')
  ) {
    return `If your child isn't consistently responding to sounds or their name, it's worth paying attention to the pattern rather than testing them repeatedly.

At home, you can gently observe:

• Whether they respond to familiar voices.
• Whether they notice everyday sounds.
• Whether they turn toward sounds from different directions.
• Whether their response changes depending on how loud or familiar the sound is.

Avoid very loud sounds close to your child's ears.

If you're concerned about hearing, an audiologist or pediatric healthcare professional can properly assess your child's hearing. Home activities cannot replace a hearing assessment.`;
  }

  if (
    msg.includes('eye contact') ||
    msg.includes('looking at me') ||
    msg.includes('look at me')
  ) {
    return `If your child doesn't make much eye contact, try not to turn it into a requirement.

Instead:

1. Join an activity your child already enjoys.
2. Position yourself naturally within their view.
3. Use an interesting toy or sound to invite attention.
4. Pause during the activity and give them time to respond.
5. Celebrate interaction in whatever form feels comfortable for them.

Eye contact by itself doesn't tell you everything about a child's development. If you're noticing several developmental concerns together, discussing them with a qualified professional is a good next step.`;
  }

  if (
    msg.includes('autism') ||
    msg.includes('sensory') ||
    msg.includes('overwhelmed') ||
    msg.includes('meltdown')
  ) {
    return `If you're supporting a child with autism or sensory differences, predictability and low-pressure activities can help.

You can try:

• Keeping activities short.
• Using the same simple routine.
• Offering choices instead of demands.
• Reducing unnecessary noise or distractions.
• Watching for signs that your child needs a break.
• Following their interests when possible.

There isn't one strategy that works for every child. If you tell me what happens before your child becomes overwhelmed, I can help you think through some practical options.`;
  }

  if (
    msg.includes('motor') ||
    msg.includes('walking') ||
    msg.includes('movement') ||
    msg.includes('physical') ||
    msg.includes('fine motor') ||
    msg.includes('grip')
  ) {
    return `For motor development, simple everyday play can provide useful practice.

Try **Reach & Place**:

1. Put a few safe objects within easy reach.
2. Encourage your child to pick one up.
3. Ask them to place it into a container.
4. Repeat with different objects.
5. Let them work at their own pace.

Choose objects appropriate for your child's age and supervise closely.

If your child is having difficulty with movement or losing skills they previously had, discuss it with a qualified pediatric or therapy professional.`;
  }

  if (
    msg.includes('progress') ||
    msg.includes('improve') ||
    msg.includes('milestone') ||
    msg.includes('completed')
  ) {
    const completed = state.completedActivities.length;
    const saved = state.savedActivities.length;

    return `Here's what I can see from your CareSync activity data:

• Activities completed: ${completed}
• Activities saved: ${saved}
• Current streak: ${state.streak} day${
      state.streak === 1 ? '' : 's'
    }

Progress isn't only about numbers. You can also look for changes in how comfortably your child participates, communicates, interacts, or completes an activity.

If you tell me what change you've noticed recently, I can help you think about what it might mean and what you could practice next.`;
  }

  if (
    msg.includes('therapist') ||
    msg.includes('doctor') ||
    msg.includes('specialist') ||
    msg.includes('professional') ||
    msg.includes('centre') ||
    msg.includes('center') ||
    msg.includes('find')
  ) {
    return `I can help you decide what type of professional may be relevant.

For example:

• Speech or language concerns → Speech-Language Therapist
• Hearing concerns → Audiologist
• Movement or motor concerns → Physiotherapist / Occupational Therapist
• Broader developmental concerns → Pediatric or developmental professional

You can use CareSync's **Find a Specialist** section to browse available professionals and centres.

If you tell me the specific concern and your city, I can also help you figure out what type of support to look for.`;
  }

  if (
    msg.includes('what should i do') ||
    msg.includes('help me') ||
    msg.includes('worried') ||
    msg.includes('concerned') ||
    msg.includes('problem')
  ) {
    return `Let's break it down into something manageable.

First, tell me:

1. What exactly are you noticing?
2. How old is your child?
3. When did you first notice it?
4. Does it happen all the time or only in certain situations?

${
  child
    ? `I already have ${child.name}'s profile, so you don't need to repeat information that's already in CareSync.`
    : ''
}

I'll help you think through practical next steps, while keeping in mind that Care AI isn't a replacement for a qualified professional.`;
  }

  return `I can help you with your child's daily activities, communication, development, progress, and finding appropriate support.

${
  child
    ? `For context, I'm currently using ${child.name}'s CareSync profile${
        focus ? ` with a focus on ${child.supportNeed}` : ''
      }.`
    : ''
}

I didn't quite understand what you need yet.

Try telling me something specific, such as:

• "My child doesn't respond when I call their name."
• "Give me an activity for communication."
• "My child avoids eye contact."
• "How can I track progress?"
• "What type of therapist should I look for?"

You can also simply describe what you're noticing in your own words.`;
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
    if (!text.trim() || isTyping) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      text: text.trim(),
      timestamp: new Date(),
    };

    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      message: userMsg,
    });

    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(text, state);

      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'ai' as const,
        text: response,
        timestamp: new Date(),
      };

      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        message: aiMsg,
      });

      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const hasMessages = state.chatMessages.length > 0;

  return (
    <div
      className="screen"
      style={{
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100vw',
        maxWidth: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        margin: 0,
        padding: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #4B3FDB 0%, #6D5DFB 100%)',
          color: '#fff',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
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
            <ArrowLeft
              size={20}
              color="#fff"
              style={{
                transform: isRTL ? 'scaleX(-1)' : undefined,
              }}
            />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flex: 1,
              minWidth: 0,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/careai-robot.png"
                alt="Care AI"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>

            <div
              style={{
                textAlign: isRTL ? 'right' : 'left',
                flex: 1,
                minWidth: 0,
              }}
            >
              <h1
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: '#fff',
                  margin: 0,
                  padding: 0,
                }}
              >
                {t('careAI')}
              </h1>

              <p
                style={{
                  fontSize: 11,
                  lineHeight: 1.4,
                  color: 'rgba(255,255,255,0.85)',
                  margin: '2px 0 0 0',
                  padding: 0,
                }}
              >
                {t('careAISubtitle')}
              </p>
            </div>
          </div>

          <div
            style={{
              width: 36,
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          background: 'var(--color-warning-bg)',
          padding: '10px 20px',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border)',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}
      >
        <AlertCircle
          size={14}
          color="var(--color-warm-accent)"
          style={{ flexShrink: 0 }}
        />

        <p
          style={{
            fontSize: 11,
            color: 'var(--color-warning-text)',
            textAlign: isRTL ? 'right' : 'left',
            margin: 0,
          }}
        >
          {t('careAIDisclaimer')}
        </p>
      </div>

      {/* Chat Area */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          minHeight: 0,
        }}
      >
        {!hasMessages && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Welcome */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 12,
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={18} color="#fff" />
              </div>

              <div
                style={{
                  background: 'var(--color-card)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '14px 16px',
                  boxShadow: 'var(--shadow-card)',
                  maxWidth: '85%',
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--color-text)',
                    lineHeight: 1.6,
                    textAlign: isRTL ? 'right' : 'left',
                    margin: 0,
                  }}
                >
                  {t('welcome')}
                </p>
              </div>
            </div>

            {/* Suggested Questions */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                paddingLeft: isRTL ? 0 : 42,
                paddingRight: isRTL ? 42 : 0,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  fontWeight: 700,
                  textAlign: isRTL ? 'right' : 'left',
                  margin: 0,
                }}
              >
                {t('suggestedQuestions')}
              </p>

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

                  <ChevronRight
                    size={14}
                    color="var(--color-text-secondary)"
                    style={{
                      transform: isRTL ? 'scaleX(-1)' : undefined,
                      flexShrink: 0,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {state.chatMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className="animate-fade-in"
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',

                // IMPORTANT:
                // User group starts from the RIGHT.
                // AI group starts from the LEFT.
                justifyContent: isUser ? 'flex-start' : 'flex-start',

                // User: avatar on RIGHT, message on LEFT of avatar.
                // AI: avatar on LEFT, message on RIGHT of avatar.
                flexDirection: isUser ? 'row-reverse' : 'row',

                width: '100%',
                maxWidth: '100%',
                alignSelf: 'stretch',
                boxSizing: 'border-box',

                // This is what keeps the user group itself on the right.
                marginLeft: isUser ? 'auto' : 0,
                marginRight: isUser ? 0 : 'auto',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  borderRadius: 12,
                  background: isUser
                    ? 'var(--color-soft-lavender)'
                    : 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isUser ? (
                  <User
                    size={18}
                    color="var(--color-primary)"
                  />
                ) : (
                  <Bot size={18} color="#fff" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  background: isUser
                    ? 'var(--color-primary)'
                    : 'var(--color-card)',
                  color: isUser
                    ? '#fff'
                    : 'var(--color-text)',

                  borderRadius: isUser
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',

                  padding: '14px 16px',

                  boxShadow: isUser
                    ? 'none'
                    : 'var(--shadow-card)',

                  // Prevent the bubble from pushing outside the screen.
                  maxWidth: 'calc(100% - 42px)',
                  width: 'fit-content',
                  minWidth: 0,

                  boxSizing: 'border-box',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {msg.text.split('\n').map((line, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: i === msg.text.split('\n').length - 1 ? 0 : 2,
                      fontWeight: line.startsWith('**') ? 700 : 400,
                      textAlign: isRTL ? 'right' : 'left',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                ))}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 14,
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={20} color="#fff" />
            </div>

            <div
              style={{
                background: 'var(--color-card)',
                borderRadius: '18px 18px 18px 4px',
                padding: '16px 20px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                gap: 6,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-secondary)',
                    animation:
                      'typing 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Response Action Buttons */}
        {state.chatMessages.length > 0 &&
          state.chatMessages[state.chatMessages.length - 1].role ===
            'ai' &&
          !isTyping && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                paddingLeft: isRTL ? 0 : 42,
                paddingRight: isRTL ? 42 : 0,
                flexWrap: 'wrap',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}
            >
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
      <div
        style={{
          padding: '12px 20px calc(12px + var(--safe-bottom))',
          background: 'var(--color-card)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexDirection: isRTL ? 'row-reverse' : 'row',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage(input);
            }
          }}
          placeholder={t('askCareAI')}
          style={{
            flex: 1,
            minWidth: 0,
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
            background:
              input.trim() && !isTyping
                ? 'var(--color-primary)'
                : 'var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor:
              input.trim() && !isTyping
                ? 'pointer'
                : 'default',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          aria-label="Send message"
        >
          <Send
            size={18}
            color="#fff"
            style={{
              transform: isRTL ? 'scaleX(-1)' : undefined,
            }}
          />
        </button>
      </div>
    </div>
  );
}