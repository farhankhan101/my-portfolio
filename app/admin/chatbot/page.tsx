// app/admin/chatbot/page.tsx
import ChatTrainer from '@/components/admin/ChatTrainer'

export default function ChatbotTrainerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Assistant Trainer</h1>
        <p className="text-sm text-muted-foreground mt-1">Converse with the chatbot, correct bad responses, and manage vector knowledge blocks.</p>
      </div>
      <ChatTrainer />
    </div>
  )
}
