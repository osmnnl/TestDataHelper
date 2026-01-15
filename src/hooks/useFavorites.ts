import { useState, useEffect, useCallback } from "react";
import type { FavoriteItem } from "../types";
import {
  getFavorites,
  addFavorite as addFav,
  removeFavorite as removeFav,
} from "../storage/favorites";

/**
 * Favori yönetimi hook'u
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // İlk yüklemede favorileri al
  useEffect(() => {
    getFavorites().then((favs) => {
      setFavorites(favs);
      setLoading(false);
    });
  }, []);

  const addFavorite = useCallback(async (id: string) => {
    const updated = await addFav(id);
    setFavorites(updated);
  }, []);

  const removeFavorite = useCallback(async (id: string) => {
    const updated = await removeFav(id);
    setFavorites(updated);
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const isFav = favorites.some((f) => f.id === id);
      if (isFav) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
