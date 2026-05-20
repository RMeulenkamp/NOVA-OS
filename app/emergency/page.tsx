'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { saveEmergencyEvent, generateId } from '@/lib/storage'
import { getFriends, addFriend, removeFriend, buildSMSLink, buildWhatsAppLink, CO_REGULATION_MESSAGE, type Friend } from '@/lib/friends'
import { TopBar, BottomNav } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { EmergencyEventType, AIEmergencyResponse, EmergencyEvent } from '@/lib/types'
import { Zap, Shield, Clock, AlertTriangle, Users, Plus, Trash2, MessageCircle, Phone, X } from 'lucide-react'

type PageState = 'trigger' | 'intensity' | 'result'

const eventOptions: { value: EmergencyEventType; label: string; emoji: string }[] = [
  { value: 'crashing', label: "I'm crashing", emoji: '📉' },
  { value: 'sugar_craving', label: 'I want sugar / food', emoji: '🍬' },
  { value: 'cant_focus', label: "I can't focus", emoji: '🌫️' },
  { value: 'anxious', label: 'I feel anxious', emoji: '💢' },
  { value: 'emotionally_overwhelmed', label: 'Emotionally overwhelmed', emoji: '🌊' },
  { value: 'doom_scrolling', label: 'Doom scrolling', emoji: '📱' },
  { value: 'frozen_shutdown', label: 'Frozen / shut down', emoji: '🧊' },
  { value: 'tired_but_wired', label: 'Tired but wired', emoji: '⚡' },
  { value: 'irritated', label: 'I feel irritated', emoji: '🔥' },
  { value: 'want_caffeine', label: 'I want caffeine', emoji: '☕' },
  { value: 'want_to_give_up', label: 'I want to give up', emoji: '🏳️' },
]

export default function EmergencyPage() {
  const { user } = useAuth()
  const [pageState, setPageState] = useState<PageState>('trigger')
  const [selectedEvent, setSelectedEvent] = useState<EmergencyEventType | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [triggerText, setTriggerText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AIEmergencyResponse | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [showFriendsManager, setShowFriendsManager] = useState(false)
  const [newFriendName, setNewFriendName] = useState('')
  const [newFriendPhone, setNewFriendPhone] = useState('')
  const [sentTo, setSentTo] = useState<string[]>([])

  useEffect(() => { setFriends(getFriends()) }, [])

  async function handleGetSupport() {
    if (!user || !selectedEvent) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: selectedEvent, intensity, triggerText, user }),
      })
      const data = await res.json()
      const aiResult: AIEmergencyResponse = data.result
      const event: EmergencyEvent = {
        id: generateId(), userId: user.id,
        date: new Date().toISOString().split('T')[0],
        eventType: selectedEvent, intensity,
        triggerText: triggerText || undefined,
        aiPattern: aiResult.patternInterpretation, aiResponse: aiResult,
        createdAt: new Date().toISOString(),
      }
      saveEmergencyEvent(event)
      setResult(aiResult)
      setPageState('result')
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  function handleAddFriend(e: React.FormEvent) {
    e.preventDefault()
    if (!newFriendName.trim() || !newFriendPhone.trim()) return
    const f = addFriend({ name: newFriendName.trim(), phone: newFriendPhone.trim() })
    setFriends(prev => [...prev, f])
    setNewFriendName('')
    setNewFriendPhone('')
  }

  function handleRemoveFriend(id: string) {
    removeFriend(id)
    setFriends(prev => prev.filter(f => f.id !== id))
  }

  function handleReset() {
    setPageState('trigger'); setSelectedEvent(null)
    setIntensity(5); setTriggerText(''); setResult(null); setSentTo([])
  }

  const showCoRegulationSection = intensity >= 8

  return (
    <div className="min-h-screen pb-24">
      <TopBar title="Emergency Reset" subtitle="Real-time support, right now" showBack
        rightAction={
          <button onClick={() => setShowFriendsManager(true)}
            className="w-8 h-8 rounded-lg bg-nova-surface border border-nova-border flex items-center justify-center text-nova-dim hover:text-nova-accent transition-colors">
            <Users className="w-3.5 h-3.5" />
          </button>
        }
      />

      {/* Friends manager overlay */}
      {showFriendsManager && (
        <div className="fixed inset-0 z-50 bg-nova-bg/90 backdrop-blur-xl overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-nova-text-bright">Support network</h2>
                <p className="text-xs text-nova-muted mt-0.5">Add people to reach when you need co-regulation</p>
              </div>
              <button onClick={() => setShowFriendsManager(false)}
                className="w-8 h-8 rounded-lg bg-nova-surface border border-nova-border flex items-center justify-center text-nova-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add friend form */}
            <Card>
              <p className="nova-label">Add a support person</p>
              <form onSubmit={handleAddFriend} className="space-y-3">
                <input type="text" value={newFriendName} onChange={e => setNewFriendName(e.target.value)}
                  placeholder="Name (e.g. Lea)" className="nova-input text-sm" required />
                <input type="tel" value={newFriendPhone} onChange={e => setNewFriendPhone(e.target.value)}
                  placeholder="Phone (+31612345678)" className="nova-input text-sm" required />
                <Button type="submit" variant="secondary" className="w-full" size="sm">
                  <Plus className="w-4 h-4" /> Add person
                </Button>
              </form>
            </Card>

            {/* Existing friends */}
            {friends.length > 0 && (
              <div className="space-y-2">
                <p className="nova-label">Your support network</p>
                {friends.map(f => (
                  <Card key={f.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-nova-text-bright">{f.name}</p>
                        <p className="text-xs text-nova-dim">{f.phone}</p>
                      </div>
                      <button onClick={() => handleRemoveFriend(f.id)}
                        className="w-7 h-7 rounded-lg bg-nova-surface flex items-center justify-center text-nova-dim hover:text-nova-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Card className="border-nova-border/50">
              <p className="text-xs text-nova-muted leading-relaxed">
                When you rate your intensity 8 or higher, NOVA will suggest reaching out to one of these people for co-regulation support. A message or call from someone safe can significantly reduce nervous system activation.
              </p>
            </Card>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Trigger selection */}
        {pageState === 'trigger' && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center emergency-glow">
                <Zap className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-nova-text-bright">What's happening right now?</h2>
              <p className="text-sm text-nova-muted">No judgment. Select what's most true.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {eventOptions.map(opt => (
                <button key={opt.value} onClick={() => setSelectedEvent(opt.value)}
                  className={cn(
                    'p-3.5 rounded-xl border text-left transition-all duration-200',
                    selectedEvent === opt.value
                      ? 'bg-red-500/15 border-red-500/40 text-red-300'
                      : 'bg-nova-surface border-nova-border text-nova-text hover:border-nova-accent/30'
                  )}>
                  <div className="text-lg mb-1">{opt.emoji}</div>
                  <div className="text-xs font-medium leading-tight">{opt.label}</div>
                </button>
              ))}
            </div>

            <Button onClick={() => selectedEvent && setPageState('intensity')} disabled={!selectedEvent} className="w-full" size="lg">
              Continue →
            </Button>
          </div>
        )}

        {/* Intensity */}
        {pageState === 'intensity' && (
          <div className="space-y-6 animate-slide-up">
            <button onClick={() => setPageState('trigger')} className="text-nova-dim text-sm hover:text-nova-muted transition-colors block">← Back</button>
            <div>
              <h2 className="text-xl font-semibold text-nova-text-bright mb-1">How intense is it?</h2>
              <p className="text-sm text-nova-muted">1 = barely noticeable · 10 = overwhelming</p>
            </div>

            <Card>
              <div className="text-center mb-6">
                <span className={cn('text-5xl font-bold',
                  intensity >= 8 ? 'text-red-400' : intensity >= 5 ? 'text-nova-warning' : 'text-nova-success')}>
                  {intensity}
                </span>
                <div className="text-sm text-nova-muted mt-1">
                  {intensity >= 8 ? 'High intensity' : intensity >= 5 ? 'Moderate' : 'Mild'}
                </div>
              </div>
              <input type="range" min={1} max={10} value={intensity}
                onChange={e => setIntensity(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${intensity >= 8 ? '#ef4444' : intensity >= 5 ? '#f5a623' : '#4de8a0'} 0%, ${intensity >= 8 ? '#ef4444' : intensity >= 5 ? '#f5a623' : '#4de8a0'} ${((intensity - 1) / 9) * 100}%, #1e1e5a ${((intensity - 1) / 9) * 100}%, #1e1e5a 100%)`
                }} />
            </Card>

            {/* Co-regulation suggestion for 8+ */}
            {showCoRegulationSection && friends.length > 0 && (
              <Card className="border-nova-mint/25 bg-nova-mint/5 animate-slide-up">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-nova-mint/15 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-nova-mint" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-nova-text-bright mb-0.5">
                      This feels intense — you don't have to do this alone
                    </p>
                    <p className="text-xs text-nova-muted leading-relaxed mb-3">
                      At this level, co-regulation with a safe person is one of the most powerful things you can do. A message or short call from someone who cares can significantly reduce nervous system activation.
                    </p>
                    <div className="space-y-2">
                      {friends.map(f => (
                        <div key={f.id} className="flex gap-2">
                          <a href={buildSMSLink(f.phone, CO_REGULATION_MESSAGE)}
                            onClick={() => setSentTo(p => [...p, f.id])}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border transition-all',
                              sentTo.includes(f.id)
                                ? 'bg-nova-success/10 border-nova-success/30 text-nova-success'
                                : 'bg-nova-surface border-nova-border text-nova-text hover:border-nova-mint/40'
                            )}>
                            <MessageCircle className="w-3.5 h-3.5" />
                            {sentTo.includes(f.id) ? `Sent to ${f.name} ✓` : `Message ${f.name}`}
                          </a>
                          <a href={buildWhatsAppLink(f.phone, CO_REGULATION_MESSAGE)}
                            target="_blank" rel="noopener noreferrer"
                            className="w-10 flex items-center justify-center rounded-xl bg-nova-surface border border-nova-border text-nova-muted hover:border-nova-mint/40 hover:text-nova-mint transition-all">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {showCoRegulationSection && friends.length === 0 && (
              <Card className="border-nova-mint/25 bg-nova-mint/5">
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-nova-mint mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-nova-text-bright mb-0.5">You don't have to do this alone</p>
                    <p className="text-xs text-nova-muted leading-relaxed mb-2">
                      At this intensity, reaching out to a safe person is powerful. Add support people using the <Users className="w-3 h-3 inline" /> icon above.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div>
              <label className="nova-label">What triggered it? (optional)</label>
              <textarea value={triggerText} onChange={e => setTriggerText(e.target.value)}
                placeholder="e.g. had a difficult conversation, skipped lunch, received bad news…"
                rows={3} className="nova-input resize-none text-sm" />
            </div>

            <Button onClick={handleGetSupport} loading={isLoading} className="w-full" size="lg">
              {isLoading ? 'NOVA is preparing support…' : 'Get support now →'}
            </Button>
          </div>
        )}

        {/* Result */}
        {pageState === 'result' && result && (
          <div className="space-y-4 animate-slide-up">
            <Card className="bg-nova-accent/5 border-nova-accent/30">
              <p className="text-sm text-nova-text leading-relaxed">{result.immediateValidation}</p>
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-nova-mint/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-nova-mint" />
                </div>
                <div>
                  <p className="text-xs text-nova-muted uppercase tracking-wider mb-1.5">What this looks like</p>
                  <p className="text-sm text-nova-text leading-relaxed">{result.patternInterpretation}</p>
                </div>
              </div>
            </Card>

            <Card className="border-nova-success/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-nova-success/15 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-nova-success" />
                </div>
                <span className="text-xs text-nova-success font-medium uppercase tracking-wider">60-second reset</span>
              </div>
              <p className="text-sm text-nova-text leading-relaxed whitespace-pre-line">{result.sixtySecondReset}</p>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-nova-accent/15 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-nova-accent" />
                </div>
                <span className="text-xs text-nova-accent font-medium uppercase tracking-wider">3-minute next step</span>
              </div>
              <p className="text-sm text-nova-text leading-relaxed">{result.threeMinuteNextStep}</p>
            </Card>

            <Card className="border-nova-warning/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-nova-warning/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-nova-warning text-sm font-bold">✕</span>
                </div>
                <div>
                  <p className="text-xs text-nova-muted uppercase tracking-wider mb-1.5">Don't do this</p>
                  <p className="text-sm text-nova-text leading-relaxed">{result.whatNotToDo}</p>
                </div>
              </div>
            </Card>

            {/* Co-regulation reminder in result too */}
            {intensity >= 8 && friends.length > 0 && (
              <Card className="border-nova-mint/25 bg-nova-mint/5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-nova-mint" />
                  <p className="text-xs text-nova-mint uppercase tracking-wider font-medium">Reach out for co-regulation</p>
                </div>
                <p className="text-xs text-nova-muted mb-3 leading-relaxed">A message from someone safe can shift your nervous system faster than any solo technique.</p>
                <div className="space-y-2">
                  {friends.map(f => (
                    <a key={f.id} href={buildSMSLink(f.phone, CO_REGULATION_MESSAGE)}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-nova-surface border border-nova-border hover:border-nova-mint/40 transition-all">
                      <span className="text-sm text-nova-text">{f.name}</span>
                      <span className="text-xs text-nova-mint flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Message</span>
                    </a>
                  ))}
                </div>
              </Card>
            )}

            <Card className="bg-nova-card">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-nova-accent/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-nova-accent" />
                </div>
                <div>
                  <p className="text-xs text-nova-muted uppercase tracking-wider mb-1.5">Say this</p>
                  <p className="text-base font-medium text-nova-text-bright italic leading-relaxed">"{result.groundingSentence}"</p>
                </div>
              </div>
            </Card>

            <div className="pt-2">
              <Button variant="secondary" onClick={handleReset} className="w-full">I need support again</Button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
