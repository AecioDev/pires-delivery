
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground mt-2">
        Bem-vindo ao sistema de gestão Salgados.ai
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        <div className="p-6 bg-white rounded-xl border shadow-sm">
           <div className="text-sm font-medium text-muted-foreground">Vendas Hoje</div>
           <div className="text-2xl font-bold mt-2">R$ 0,00</div>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm">
           <div className="text-sm font-medium text-muted-foreground">Pedidos Pendentes</div>
           <div className="text-2xl font-bold mt-2">0</div>
        </div>
      </div>
    </div>
  )
}
