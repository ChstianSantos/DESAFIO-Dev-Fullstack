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

const MediaList: React.FC = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    gallery: ""
  });

  const apiUrl = "http://localhost:5152/api/media";

  // Buscar mídias da API
  useEffect(() => {
    const fetchMedias = async () => {
      try {
        const response = await axios.get(apiUrl);
        setMedias(response.data);
      } catch (error) {
        console.error("Erro ao carregar mídias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedias();
  }, []);

  // Função para iniciar edição
  const startEdit = (media: Media) => {
    setEditingMedia(media);
    setEditForm({
      title: media.title,
      description: media.description || "",
      gallery: media.gallery || ""
    });
  };

  // Função para cancelar edição
  const cancelEdit = () => {
    setEditingMedia(null);
    setEditForm({ title: "", description: "", gallery: "" });
  };

  // Função para salvar edição
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMedia) return;

    try {
      const updatedMedia = {
        ...editingMedia,
        title: editForm.title,
        description: editForm.description,
        gallery: editForm.gallery
      };

      await axios.put(`${apiUrl}/${editingMedia.id}`, updatedMedia);
      
      // Atualizar lista local
      setMedias(prev => prev.map(m => 
        m.id === editingMedia.id ? updatedMedia : m
      ));
      
      alert("Mídia atualizada com sucesso!");
      cancelEdit();
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
      setMedias((prev) => prev.filter((m) => m.id !== id));
      alert("Mídia excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir mídia:", error);
      alert("Erro ao excluir a mídia.");
    }
  };

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

  if (medias.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Nenhuma mídia cadastrada.</p>
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
            Cadastrar Mídia
          </button>
        </Link>
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
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Lista de Mídias</h2>
      
      {/* Modal de Edição */}
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
            width: "90%"
          }}>
            <h3 style={{ marginBottom: "20px" }}>Editar Mídia</h3>
            
            <form onSubmit={handleEdit}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Título:
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Descrição:
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    boxSizing: "border-box",
                    minHeight: "80px",
                    resize: "vertical"
                  }}
                />
              </div>
              
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Galeria:
                </label>
                <input
                  type="text"
                  value={editForm.gallery}
                  onChange={(e) => setEditForm(prev => ({ ...prev, gallery: e.target.value }))}
                  placeholder="Nome da galeria..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1
                  }}
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderRadius: "10px",
            overflow: "hidden"
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px", 
                textAlign: "left",
                fontWeight: "bold",
                color: "#495057"
              }}>
                Título
              </th>
              <th style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px", 
                textAlign: "left",
                fontWeight: "bold",
                color: "#495057"
              }}>
                Descrição
              </th>
              <th style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px", 
                textAlign: "left",
                fontWeight: "bold",
                color: "#495057"
              }}>
                Galeria
              </th>
              <th style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px", 
                textAlign: "left",
                fontWeight: "bold",
                color: "#495057"
              }}>
                Arquivo
              </th>
              <th style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px", 
                textAlign: "center",
                fontWeight: "bold",
                color: "#495057"
              }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
          {medias.map((media) => (
            <tr key={media.id} style={{ borderBottom: "1px solid #dee2e6" }}>
              <td style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px",
                fontWeight: "500",
                color: "#333"  // Cor escura para o título
              }}>
                {media.title}
              </td>
              <td style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px",
                maxWidth: "300px",
                wordWrap: "break-word",
                color: "#333"  // Cor escura para a descrição
              }}>
                {media.description || "-"}
              </td>
              <td style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px",
                color: "#333"  // Cor escura para a galeria
              }}>
                {media.gallery ? (
                  <span style={{
                    backgroundColor: "#e7f3ff",
                    color: "#007bff",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    {media.gallery}
                  </span>
                ) : (
                  <span style={{ color: "#6c757d" }}>Sem galeria</span>
                )}
              </td>
              <td style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px",
                color: "#333"  // Cor escura para o arquivo
              }}>
                {media.filePath ? (
                  <a
                    href={`http://localhost:5152${media.filePath.startsWith('/') ? '' : '/'}${media.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#007bff",
                      textDecoration: "none",
                      fontWeight: "500"
                    }}
                  >
                    {media.fileName || "Ver arquivo"}
                  </a>
                ) : (
                  <span style={{ color: "#6c757d" }}>Sem arquivo</span>
                )}
              </td>
              <td style={{ 
                border: "1px solid #dee2e6", 
                padding: "12px",
                textAlign: "center"
              }}>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  <button
                    onClick={() => startEdit(media)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#ffc107",
                      color: "black",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(media.id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "20px 0"
      }}>
        <div style={{ color: "#6c757d", fontSize: "14px" }}>
          Total: {medias.length} mídia{medias.length !== 1 ? 's' : ''}
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/form">
            <button style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}>
              Cadastrar Nova Mídia
            </button>
          </Link>
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
    </div>
  );
};

export default MediaList;