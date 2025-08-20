import { useState } from "react";
import CropDashboard from "./CropDashboard";
import BeanAIConsultant from "./BeanAIConsultant";
import SamplingPage from "./SamplingPage";
import HistoricalPage from "./HistoricalPage";
import Login from "./Login";
import {
  BarChart3,
  Calendar,
  Brain,
  LogOut,
  Home,
  History,
  Sprout,
  Menu,
  X,
} from "lucide-react";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [view, setView] = useState("dashboard");
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderPage = () => {
    switch (view) {
      case "consultant":
        return <BeanAIConsultant />;
      case "sampling":
        return <SamplingPage />;
      case "historical":
        return <HistoricalPage />;
      default:
        return <CropDashboard />;
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "Inicio", icon: Home },
    { id: "consultant", label: "Agrónomo IA", icon: Brain },
    { id: "sampling", label: "Plan Fertilización", icon: Sprout },
    { id: "historical", label: "Historial", icon: History },
  ];

  const pageTitles = {
    dashboard: "Dashboard Principal",
    consultant: "Asistente Agrónomo IA",
    sampling: "Plan de Fertilización",
    historical: "Análisis Histórico",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner superior de navegación */}
      <header className="bg-gradient-to-r from-[#4A6B2A] to-[#3a5a20] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sprout size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold">AgroMAGU®</h1>
            </div>

            {/* Navegación para desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      view === item.id
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Usuario y acciones */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user ? user.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <span className="text-sm">Hola, {user}</span>
              </div>

              <button
                onClick={() => setUser(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>

              {/* Botón de menú móvil */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#3a5a20] py-4 px-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      view === item.id
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <div className="pt-2 mt-2 border-t border-white/20">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {user ? user.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <span className="text-sm">Conectado como {user}</span>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Título de la página */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#4A6B2A]">
            {pageTitles[view]}
          </h2>
          <p className="text-gray-600">
            {view === "dashboard" && "Monitoreo en tiempo real de tus cultivos"}
            {view === "consultant" &&
              "Asistencia inteligente para tus decisiones agrícolas"}
            {view === "sampling" &&
              "Planificación y seguimiento de fertilización"}
            {view === "historical" &&
              "Análisis de datos históricos y tendencias"}
          </p>
        </div>

        {renderPage()}
      </main>

      {/* Footer simplificado */}
      <footer className="bg-[#4A6B2A] text-white text-center py-4 mt-8">
        <p className="text-sm">
          AgroMAGU® - Sistema Inteligente de Gestión Agrícola
        </p>
      </footer>
    </div>
  );
}

export default App;
