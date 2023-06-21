type Cache<K, V> = {
  set: (key: K, value: V) => void;
  get: (key: K) => V | undefined;
  remove: (key: K) => void;
};

const createSimpleCache = <K, V>(
  maxSize: number,
  expirySeconds?: number
): Cache<K, V> => {
  const cache = new Map<K, { value: V; expiry?: number }>();

  return {
    set: (key: K, value: V) => {
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }

      const expiry =
        expirySeconds !== undefined
          ? Date.now() + expirySeconds * 1000
          : undefined;
      cache.set(key, { value, expiry });

      console.log(cache);
    },
    get: (key: K) => {
      const cached = cache.get(key);

      if (!cached) {
        return undefined;
      }

      if (cached.expiry !== undefined && Date.now() > cached.expiry) {
        cache.delete(key);
        return undefined;
      }

      return cached.value;
    },
    remove: (key: K) => {
      cache.delete(key);
    },
  };
};

export default createSimpleCache;
