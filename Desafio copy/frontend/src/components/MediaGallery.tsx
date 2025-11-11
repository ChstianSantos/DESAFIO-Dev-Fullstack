import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Media {
  id: number;
  title: string;
  description: string;
  filePath: string;
  fileName?: string;
  fileType?: string;
  mediaType?: string;
  gallery?: string;
}

interface Gallery {
  name: string;
  medias: Media[];
}

const MediaGallery: React.FC = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState<string>("all");
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);

  const apiUrl = "http://localhost:5152/api/media";

  // Buscar mídias da API
  useEffect(() => {
    const fetchMedias = async () => {
      try {
        const response = await axios.get(apiUrl);
        setMedias(response.data);
        organizeGalleries(response.data);
      } catch (error) {
        console.error("Erro ao carregar mídias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedias();
  }, []);

  // Organizar mídias em galerias
  const organizeGalleries = (mediaList: Media[]) => {
    const galleryMap = new Map<string, Media[]>();
    
    // Adicionar mídias às suas galerias
    mediaList.forEach(media => {
      const galleryName = media.gallery || "Sem Galeria";
      if (!galleryMap.has(galleryName)) {
        galleryMap.set(galleryName, []);
      }
      galleryMap.get(galleryName)!.push(media);
    });

    // Converter para array de galerias
    const galleryArray: Gallery[] = [];
    galleryMap.forEach((medias, name) => {
      galleryArray.push({ name, medias });
    });

    setGalleries(galleryArray);
  };

  // Função para excluir galeria (remove a galeria de todas as mídias)
  const deleteGallery = async (galleryName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a galeria "${galleryName}"?`)) return;

    try {
      // Remove a galeria de todas as mídias
      const mediasToUpdate = medias.filter(media => media.gallery === galleryName);
      
      const updatePromises = mediasToUpdate.map(media => 
        axios.put(`${apiUrl}/${media.id}`, { ...media, gallery: "" })
      );

      await Promise.all(updatePromises);
      
      // Atualiza a lista local
      const updatedMedias = medias.map(media => 
        media.gallery === galleryName ? { ...media, gallery: "" } : media
      );
      
      setMedias(updatedMedias);
      organizeGalleries(updatedMedias);
      
      // Se a galeria selecionada for a que está sendo excluída, voltar para "all"
      if (selectedGallery === galleryName) {
        setSelectedGallery("all");
      }

      alert(`Galeria "${galleryName}" excluída com sucesso!`);
    } catch (error) {
      console.error("Erro ao excluir galeria:", error);
      alert("Erro ao excluir a galeria.");
    }
  };

  // Função para adicionar mídia à galeria
  const addMediaToGallery = async (mediaId: number, galleryName: string) => {
    try {
      const mediaToUpdate = medias.find(m => m.id === mediaId);
      if (!mediaToUpdate) return;

      // Se for "Sem Galeria", define como string vazia
      const actualGalleryName = galleryName === "Sem Galeria" ? "" : galleryName;
      
      const updatedMedia = { 
        ...mediaToUpdate, 
        gallery: actualGalleryName
      };
      
      await axios.put(`${apiUrl}/${mediaId}`, updatedMedia);
      
      // Atualizar lista local
      const updatedMedias = medias.map(m => 
        m.id === mediaId ? updatedMedia : m
      );
      
      setMedias(updatedMedias);
      organizeGalleries(updatedMedias);
      setEditingMedia(null);
      
      alert(`Mídia adicionada à galeria "${galleryName}"!`);
    } catch (error) {
      console.error("Erro ao atualizar mídia:", error);
      alert("Erro ao atualizar a mídia.");
    }
  };

  // Função para excluir mídia
  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta mídia?")) return;

    try {
      await axios.delete(`${apiUrl}/${id}`);
      const updatedMedias = medias.filter(m => m.id !== id);
      setMedias(updatedMedias);
      organizeGalleries(updatedMedias);
      alert("Mídia excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir mídia:", error);
      alert("Erro ao excluir a mídia.");
    }
  };

  // Filtrar mídias pela galeria selecionada
  const filteredMedias = selectedGallery === "all" 
    ? medias 
    : medias.filter(media => 
        selectedGallery === "Sem Galeria" 
          ? !media.gallery || media.gallery === ""
          : media.gallery === selectedGallery
      );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #007bff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }}></div>
        <p>Carregando mídias...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Galeria de Mídias</h2>
      
      {/* Controles de Galeria */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "10px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "bold" }}>Filtrar por Galeria:</label>
          <select 
            value={selectedGallery} 
            onChange={(e) => setSelectedGallery(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              minWidth: "200px"
            }}
          >
            <option value="all">Todas as Mídias ({medias.length})</option>
            {galleries.map(gallery => (
              <option key={gallery.name} value={gallery.name}>
                {gallery.name} ({gallery.medias.length})
              </option>
            ))}
          </select>
        </div>

        
      </div>

      {/* Lista de Galerias */}
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "20px" }}>Galerias Disponíveis</h3>
        {galleries.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            border: "2px dashed #dee2e6"
          }}>
            <p style={{ color: "#6c757d", marginBottom: "20px" }}>
              Nenhuma galeria criada ainda.
            </p>
            <p style={{ color: "#6c757d", fontSize: "14px" }}>
              Crie uma galeria acima e depois adicione mídias a ela.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px"
          }}>
            {galleries.map(gallery => (
              <div key={gallery.name} style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px"
                }}>
                  <h4 style={{ margin: "0", color: "#333" }}>{gallery.name}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      fontSize: "12px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "10px"
                    }}>
                      {gallery.medias.length} mídia{gallery.medias.length !== 1 ? 's' : ''}
                    </span>
                    {gallery.name !== "Sem Galeria" && (
                      <button 
                        onClick={() => deleteGallery(gallery.name)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                          padding: "5px"
                        }}
                        title="Excluir galeria"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "5px",
                  marginBottom: "15px",
                  minHeight: "80px"
                }}>
                  {gallery.medias.slice(0, 4).map(media => (
                    <div key={media.id} style={{ aspectRatio: "1" }}>
                      {media.filePath ? (
                        <img 
                          src={`http://localhost:5152${media.filePath.startsWith('/') ? '' : '/'}${media.filePath}`}
                          alt={media.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "5px"
                          }}
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='8' fill='%23999'%3EMídia%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#f8f9fa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "5px",
                          border: "1px dashed #dee2e6",
                          fontSize: "12px",
                          color: "#6c757d"
                        }}>
                          📄
                        </div>
                      )}
                    </div>
                  ))}
                  {gallery.medias.length === 0 && (
                    <div style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      color: "#6c757d",
                      fontSize: "14px",
                      padding: "20px"
                    }}>
                      Nenhuma mídia nesta galeria
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedGallery(gallery.name)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Ver Galeria
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Mídias */}
      <div>
        <h3 style={{ marginBottom: "20px" }}>
          {selectedGallery === "all" 
            ? `Todas as Mídias (${filteredMedias.length})`
            : selectedGallery === "Sem Galeria"
            ? `Mídias sem Galeria (${filteredMedias.length})`
            : `Galeria: ${selectedGallery} (${filteredMedias.length} mídias)`
          }
        </h3>
        
        {filteredMedias.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "50px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            border: "2px dashed #dee2e6"
          }}>
            <p style={{ marginBottom: "20px", color: "#6c757d" }}>
              {selectedGallery === "all" 
                ? "Nenhuma mídia cadastrada."
                : "Nenhuma mídia encontrada nesta galeria."
              }
            </p>
            <Link to="/form">
              <button style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px"
              }}>
                Cadastrar Nova Mídia
              </button>
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {filteredMedias.map((media) => (
              <div key={media.id} style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                {media.filePath ? (
                  <div style={{ height: "200px", overflow: "hidden" }}>
                    <img 
                      src={`http://localhost:5152${media.filePath.startsWith('/') ? '' : '/'}${media.filePath}`}
                      alt={media.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3EArquivo de Mídia%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    height: "200px",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6c757d",
                    fontSize: "14px"
                  }}>
                    Sem arquivo
                  </div>
                )}
                
                <div style={{ padding: "15px" }}>
                  <h4 style={{ 
                    margin: "0 0 10px 0", 
                    fontSize: "16px",
                    color: "#333"
                  }}>
                    {media.title}
                  </h4>
                  <p style={{ 
                    margin: "0 0 10px 0", 
                    fontSize: "14px",
                    color: "#666",
                    minHeight: "40px"
                  }}>
                    {media.description}
                  </p>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#6c757d",
                    marginBottom: "15px"
                  }}>
                    <strong>Galeria:</strong> {media.gallery || "Sem Galeria"}
                  </div>
                </div>
                
                <div style={{
                  padding: "15px",
                  borderTop: "1px solid #eee",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap"
                }}>
                  {media.filePath && (
                    <a
                      href={`http://localhost:5152${media.filePath.startsWith('/') ? '' : '/'}${media.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "3px",
                        fontSize: "12px"
                      }}
                    >
                      Abrir
                    </a>
                  )}
                  
                  <button
                    onClick={() => setEditingMedia(media)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ffc107",
                      color: "black",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {media.gallery ? "Alterar Galeria" : "Adicionar à Galeria"}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(media.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      {editingMedia && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <h3 style={{ marginBottom: "20px" }}>
              Selecionar Galeria para: {editingMedia.title}
            </h3>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "20px"
            }}>
              {galleries.filter(g => g.name !== "Sem Galeria").map(gallery => (
                <button
                  key={gallery.name}
                  onClick={() => addMediaToGallery(editingMedia.id, gallery.name)}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  {gallery.name} ({gallery.medias.length} mídia{gallery.medias.length !== 1 ? 's' : ''})
                </button>
              ))}
              
              <button
                onClick={() => addMediaToGallery(editingMedia.id, "Sem Galeria")}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Remover da Galeria
              </button>
            </div>
            
            <button 
              onClick={() => setEditingMedia(null)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "40px" }}>
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

export default MediaGallery;