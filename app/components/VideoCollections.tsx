"use client";

import { useState, useEffect } from "react";
import { VideoHistoryItem } from "@/types";
import {
  VideoCollection,
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addVideoToCollection,
  removeVideoFromCollection,
  getVideosInCollection,
} from "@/lib/videoCollections";
import { getVideoHistory } from "@/lib/videoHistory";

interface VideoCollectionsProps {
  onSelectCollection?: (collection: VideoCollection) => void;
  onClose?: () => void;
}

export default function VideoCollections({
  onSelectCollection,
  onClose,
}: VideoCollectionsProps) {
  const [collections, setCollections] = useState<VideoCollection[]>([]);
  const [allVideos, setAllVideos] = useState<VideoHistoryItem[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<VideoCollection | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const all = getAllCollections();
    setCollections(all);
    const videos = getVideoHistory();
    setAllVideos(videos);
  };

  const handleCreate = () => {
    if (!newCollectionName.trim()) {
      alert("El nombre de la colección es obligatorio");
      return;
    }

    createCollection(
      newCollectionName.trim(),
      newCollectionDescription.trim() || undefined
    );
    setNewCollectionName("");
    setNewCollectionDescription("");
    setShowCreateForm(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta colección?")) {
      deleteCollection(id);
      loadData();
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
      }
    }
  };

  const handleSelectCollection = (collection: VideoCollection) => {
    setSelectedCollection(collection);
    if (onSelectCollection) {
      onSelectCollection(collection);
    }
  };

  const handleToggleVideo = (videoId: string) => {
    if (!selectedCollection) return;

    if (selectedCollection.videoIds.includes(videoId)) {
      removeVideoFromCollection(selectedCollection.id, videoId);
    } else {
      addVideoToCollection(selectedCollection.id, videoId);
    }
    loadData();
    // Update selected collection
    const updated = getCollectionById(selectedCollection.id);
    if (updated) {
      setSelectedCollection(updated);
    }
  };

  const collectionColors = [
    { name: "Morado", value: "purple", bg: "bg-purple-500", text: "text-purple-500" },
    { name: "Azul", value: "blue", bg: "bg-blue-500", text: "text-blue-500" },
    { name: "Verde", value: "green", bg: "bg-green-500", text: "text-green-500" },
    { name: "Rojo", value: "red", bg: "bg-red-500", text: "text-red-500" },
    { name: "Naranja", value: "orange", bg: "bg-orange-500", text: "text-orange-500" },
    { name: "Rosa", value: "pink", bg: "bg-pink-500", text: "text-pink-500" },
  ];

  const collectionIcons = ["📁", "📂", "🎬", "⭐", "🔥", "💎", "🎯", "🚀"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Colecciones de videos
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showCreateForm ? "✕ Cancelar" : "➕ Nueva colección"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Crear nueva colección
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la colección *
              </label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Presentaciones de productos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Breve descripción de la colección..."
              />
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collections List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Colecciones ({collections.length})
          </h3>
          {collections.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Aún no hay colecciones. Crea una nueva colección.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  onClick={() => handleSelectCollection(collection)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCollection?.id === collection.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{collection.icon || "📁"}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {collection.name}
                        </h4>
                        {collection.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {collection.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {collection.videoIds.length} video
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(collection.id);
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collection Videos */}
        {selectedCollection && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedCollection.name} - Videos
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allVideos.map((video) => {
                const isInCollection = selectedCollection.videoIds.includes(video.id);
                return (
                  <div
                    key={video.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isInCollection}
                        onChange={() => handleToggleVideo(video.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-1">
                          {video.text.substring(0, 60)}...
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(video.createdAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {allVideos.length === 0 && (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  Aún no hay videos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
