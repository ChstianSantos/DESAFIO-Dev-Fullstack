import React, { useState } from "react";
import axios from "axios";

const MediaForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // novo campo para o link

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (file) {
        // Se o usuário escolheu um arquivo → upload multipart
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);

        await axios.post("http://localhost:5152/api/media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (imageUrl.trim() !== "") {
        // Se o usuário informou um link → enviar JSON normal
        await axios.post("http://localhost:5152/api/media/link", {
          title,
          description,
          fileUrl: imageUrl,
        });
      } else {
        alert("Selecione um arquivo ou insira um link de imagem!");
        return;
      }

      alert("Mídia enviada com sucesso!");
      setTitle("");
      setDescription("");
      setFile(null);
      setImageUrl("");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar mídia! Possivelmente o arquivo nao é suportado.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Arquivo</label>
        <input
          type="file"
          accept="*/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0 file:text-sm
                    file:font-semibold file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700"
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Enviar
      </button>
    </form>
  );
};

export default MediaForm;
