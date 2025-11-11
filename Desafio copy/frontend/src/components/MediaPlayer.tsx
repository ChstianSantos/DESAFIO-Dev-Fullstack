import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Media {
  id: number;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  fileType: string;
  mediaType: string;
  gallery: string;
}

interface Gallery {
  name: string;
  medias: Media[];
}

const MediaPlayer: React.FC = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const apiUrl = "http://localhost:5152/api/media";
  const baseUrl = "http://localhost:5152";

  // Buscar galerias e mídias da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca todas as mídias
        const response = await axios.get(apiUrl);
        const allMedias = response.data.filter((media: Media) => 
          media.filePath && media.filePath !== "null"
        );

        // Agrupa mídias por galeria
        const galleryMap = new Map<string, Media[]>();
        
        allMedias.forEach((media: Media) => {
          const galleryName = media.gallery || "Sem Galeria";
          if (!galleryMap.has(galleryName)) {
            galleryMap.set(galleryName, []);
          }
          galleryMap.get(galleryName)!.push(media);
        });

        // Converte para array de galerias
        const galleryArray: Gallery[] = Array.from(galleryMap.entries()).map(([name, medias]) => ({
          name,
          medias
        }));

        setGalleries(galleryArray);

        // Seleciona automaticamente a primeira galeria se existir
        if (galleryArray.length > 0) {
          setSelectedGallery(galleryArray[0].name);
        }
      } catch (error) {
        console.error("Erro ao carregar mídias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Controle do slideshow
  useEffect(() => {
    const currentMedias = getCurrentGalleryMedias();
    
    if (isPlaying && currentMedias.length > 0) {
      const id = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % currentMedias.length);
      }, 5000); // Muda a cada 5 segundos
      setIntervalId(id);
    } else if (intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isPlaying, selectedGallery, galleries]);

  const getCurrentGallery = (): Gallery | null => {
    return galleries.find(g => g.name === selectedGallery) || null;
  };

  const getCurrentGalleryMedias = (): Media[] => {
    const gallery = getCurrentGallery();
    return gallery ? gallery.medias : [];
  };

  const getCurrentMedia = (): Media | null => {
    const medias = getCurrentGalleryMedias();
    return medias.length > 0 ? medias[currentIndex] : null;
  };

  const playPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextMedia = () => {
    const medias = getCurrentGalleryMedias();
    setCurrentIndex((prev) => (prev + 1) % medias.length);
  };

  const prevMedia = () => {
    const medias = getCurrentGalleryMedias();
    setCurrentIndex((prev) => (prev - 1 + medias.length) % medias.length);
  };

  const selectMedia = (index: number) => {
    setCurrentIndex(index);
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalId) {
        window.clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  };

  const selectGallery = (galleryName: string) => {
    setSelectedGallery(galleryName);
    setCurrentIndex(0);
    setIsPlaying(false);
    if (intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Função para construir a URL completa do arquivo
  const getMediaUrl = (media: Media) => {
    if (!media.filePath) return null;
    
    // Se já é uma URL completa, retorna como está
    if (media.filePath.startsWith('http')) {
      return media.filePath;
    }
    
    // Se é um caminho relativo, adiciona a base URL
    return `${baseUrl}/${media.filePath.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Carregando galerias...</p>
      </div>
    );
  }

  if (galleries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Nenhuma galeria com mídias encontrada.</p>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "10px" }}>
          Cadastre mídias organizadas em galerias para reproduzir.
        </p>
        <Link to="/form">
          <button style={{ marginRight: "10px", padding: "10px 15px", marginTop: "20px" }}>
            Cadastrar Mídia
          </button>
        </Link>
        <Link to="/">
          <button style={{ padding: "10px 15px", marginTop: "20px" }}>Voltar para Início</button>
        </Link>
      </div>
    );
  }

  const currentGallery = getCurrentGallery();
  const currentMedias = getCurrentGalleryMedias();
  const currentMedia = getCurrentMedia();
  const mediaUrl = currentMedia ? getMediaUrl(currentMedia) : null;
  
  const isVideo = currentMedia ? (
    currentMedia.mediaType === 'video' || 
    currentMedia.fileType?.includes('video') ||
    currentMedia.fileName?.match(/\.(mp4|webm|ogg|mov|avi)$/i)
  ) : false;
  
  const isImage = currentMedia ? (
    currentMedia.mediaType === 'image' || 
    currentMedia.fileType?.includes('image') ||
    currentMedia.fileName?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
  ) : false;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Reprodutor de Galerias</h2>
      
      {/* Seletor de Galerias */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px" }}>Selecionar Galeria</h3>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "20px"
        }}>
          {galleries.map((gallery) => (
            <button
              key={gallery.name}
              onClick={() => selectGallery(gallery.name)}
              style={{
                padding: "10px 15px",
                backgroundColor: selectedGallery === gallery.name ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: selectedGallery === gallery.name ? "bold" : "normal"
              }}
            >
              {gallery.name} ({gallery.medias.length})
            </button>
          ))}
        </div>
      </div>

      {currentGallery && currentMedia ? (
        <>
          {/* Informações da Galeria Atual */}
          <div style={{
            backgroundColor: "#e7f3ff",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #b3d9ff"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#004085" }}>
              📁 {currentGallery.name}
            </h3>
            <p style={{ margin: 0, color: "#004085" }}>
              <strong>{currentMedias.length}</strong> mídia(s) na galeria
            </p>
          </div>

          {/* Player Principal */}
          <div style={{
            backgroundColor: "#000",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
            minHeight: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
          }}>
            {mediaUrl ? (
              <div style={{ maxWidth: "100%", maxHeight: "450px", textAlign: "center" }}>
                {isVideo ? (
                  <video
                    controls
                    autoPlay={isPlaying}
                    style={{ 
                      maxWidth: "100%", 
                      maxHeight: "450px",
                      borderRadius: "5px"
                    }}
                    onEnded={nextMedia}
                  >
                    <source src={mediaUrl} type={currentMedia.fileType || "video/mp4"} />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                ) : isImage ? (
                  <img
                    src={mediaUrl}
                    alt={currentMedia.title}
                    style={{ 
                      maxWidth: "100%", 
                      maxHeight: "450px",
                      objectFit: "contain",
                      borderRadius: "5px"
                    }}
                    onError={(e) => {
                      console.error("Erro ao carregar imagem:", mediaUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ color: "white", textAlign: "center" }}>
                    <p>Tipo de arquivo não suportado para reprodução</p>
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#4da6ff" }}
                    >
                      Abrir arquivo
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: "white", textAlign: "center" }}>
                <p>Sem arquivo para reproduzir</p>
                <p style={{ fontSize: "14px", color: "#ccc" }}>
                  Esta mídia não possui um arquivo associado.
                </p>
              </div>
            )}
          </div>

          {/* Controles */}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <button 
              onClick={prevMedia}
              disabled={currentMedias.length <= 1}
              style={{ 
                marginRight: "10px", 
                padding: "10px 15px",
                backgroundColor: currentMedias.length <= 1 ? "#ccc" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: currentMedias.length <= 1 ? "not-allowed" : "pointer"
              }}
            >
              ⏮ Anterior
            </button>
            
            <button 
              onClick={playPause}
              disabled={currentMedias.length === 0}
              style={{ 
                marginRight: "10px", 
                padding: "10px 20px",
                backgroundColor: currentMedias.length === 0 ? "#ccc" : (isPlaying ? "#dc3545" : "#28a745"),
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: currentMedias.length === 0 ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              {isPlaying ? "⏸️ Pausar" : "▶️ Reproduzir"}
            </button>
            
            <button 
              onClick={nextMedia}
              disabled={currentMedias.length <= 1}
              style={{ 
                marginRight: "10px", 
                padding: "10px 15px",
                backgroundColor: currentMedias.length <= 1 ? "#ccc" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: currentMedias.length <= 1 ? "not-allowed" : "pointer"
              }}
            >
              Próximo ⏭
            </button>
          </div>

          {/* Informações da mídia atual */}
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #dee2e6"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
              {currentMedia.title} <span style={{ color: "#6c757d" }}>({currentIndex + 1}/{currentMedias.length})</span>
            </h3>
            <p style={{ margin: "0 0 10px 0", color: "#666" }}>{currentMedia.description}</p>
            <p style={{ margin: 0, color: "#6c757d" }}>
              <strong>Tipo:</strong> {isVideo ? "Vídeo" : isImage ? "Imagem" : "Arquivo"} | 
              <strong> Arquivo:</strong> {currentMedia.fileName || "Nenhum"}
            </p>
          </div>

          {/* Miniaturas da galeria atual */}
          <div>
            <h4 style={{ marginBottom: "10px" }}>
              Galeria: {currentGallery.name} ({currentMedias.length} mídias)
            </h4>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "10px",
              maxHeight: "200px",
              overflowY: "auto",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#fff"
            }}>
              {currentMedias.map((media, index) => {
                const thumbUrl = getMediaUrl(media);
                const isCurrent = index === currentIndex;
                
                return (
                  <div
                    key={media.id}
                    onClick={() => selectMedia(index)}
                    style={{
                      cursor: "pointer",
                      border: isCurrent ? "3px solid #007bff" : "1px solid #ddd",
                      borderRadius: "5px",
                      padding: "5px",
                      backgroundColor: isCurrent ? "#e7f3ff" : "white",
                      textAlign: "center",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {thumbUrl && (isImage || media.mediaType === 'image') ? (
                      <img
                        src={thumbUrl}
                        alt={media.title}
                        style={{
                          width: "100%",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "3px"
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60' viewBox='0 0 100 60'%3E%3Crect width='100' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%23999'%3E" + (media.mediaType === 'video' ? '🎬' : '📄') + "%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "60px",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "3px",
                        fontSize: "10px",
                        color: "#6c757d",
                        border: "1px dashed #dee2e6"
                      }}>
                        {media.mediaType === 'video' ? '🎬 Vídeo' : '📄 Arquivo'}
                      </div>
                    )}
                    <div style={{
                      fontSize: "10px",
                      marginTop: "5px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: isCurrent ? "bold" : "normal",
                      color: isCurrent ? "#007bff" : "#333"
                    }}>
                      {media.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Selecione uma galeria para começar a reprodução.</p>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to="/">
          <button style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Voltar para Início
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MediaPlayer;