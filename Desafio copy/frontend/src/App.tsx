import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MediaForm from "./components/MediaForm";
import MediaList from "./components/MediaList";
import MediaGallery from "./components/MediaGallery";
import MediaPlayer from "./components/MediaPlayer";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <h1>Administrador de Mídias</h1>

        {/* Botões de navegação modernos */}
        <div className="navigation-buttons">
          <Link to="/form" className="nav-button">
            <span>➕</span>
            Cadastrar Mídia
          </Link>
          <Link to="/list" className="nav-button">
            <span>📋</span>
            Listar Mídias
          </Link>
          <Link to="/gallery" className="nav-button">
            <span>🖼️</span>
            Galeria de Mídias
          </Link>
          <Link to="/player" className="nav-button">
            <span>🎬</span>
            Reprodutor
          </Link>
        </div>

        {/* Rotas */}
        <Routes>
          <Route path="/form" element={<MediaForm />} />
          <Route path="/list" element={<MediaList />} />
          <Route path="/gallery" element={<MediaGallery />} />
          <Route path="/player" element={<MediaPlayer />} />
          <Route path="/" element={
            <div className="welcome-container">
              <h2>Bem-vindo ao Gerenciador de Mídias</h2>
              <p>Escolha uma das opções acima para começar.</p>
              
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">🎬</span>
                  <h3>Reprodutor</h3>
                  <p>Visualize imagens e vídeos em sequência com nosso player moderno</p>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">🖼️</span>
                  <h3>Galeria</h3>
                  <p>Veja todas as mídias em formato de galeria interativa</p>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">📋</span>
                  <h3>Lista</h3>
                  <p>Visualize mídias em formato de tabela organizada</p>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">➕</span>
                  <h3>Cadastro</h3>
                  <p>Adicione novas mídias ao sistema de forma simples</p>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;