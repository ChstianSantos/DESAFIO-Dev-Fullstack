import { useEffect, useState } from "react";
import {
  getAllMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  type Media,
} from "../api/mediaService";
import MediaForm from "../components/MediaForm";
import MediaList from "../components/MediaList";
import { message, Card } from "antd";

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [editing, setEditing] = useState<Media | null>(null);

  const loadMedia = async () => {
    const data = await getAllMedia();
    setMediaList(data);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleSubmit = async (media: Media) => {
    try {
      if (editing) {
        await updateMedia(editing.id!, media);
        message.success("Mídia atualizada!");
        setEditing(null);
      } else {
        await createMedia(media);
        message.success("Mídia criada!");
      }
      loadMedia();
    } catch {
      message.error("Erro ao salvar mídia");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMedia(id);
      message.success("Mídia excluída!");
      loadMedia();
    } catch {
      message.error("Erro ao excluir mídia");
    }
  };


  const MediaFormComponent: any = MediaForm;
  const MediaListComponent: any = MediaList;

  return (
    <Card style={{ margin: 20 }}>
      <h2>Gerenciar Mídias</h2>
      <MediaFormComponent initialValues={editing || undefined} onSubmit={handleSubmit} />
      <MediaListComponent data={mediaList} onEdit={setEditing} onDelete={handleDelete} />
    </Card>
  );
}
