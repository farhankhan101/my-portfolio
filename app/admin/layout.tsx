// app/admin/layout.tsx
import Sidebar from '@/components/admin/Sidebar'

export const metadata = {
  title: 'Admin Console | Farhan Ahmed Portfolio',
  description: 'Manage projects, experiences, skills, configurations, and train AI chatbot.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      {/* Collapsible Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto mt-12 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
